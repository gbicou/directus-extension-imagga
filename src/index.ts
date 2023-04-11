import { defineHook } from "@directus/extensions-sdk";
import type { FilesService, AssetsService } from "directus";
import axios from "axios";
import FormData from "form-data";

/**
 * Imagga API endpoint
 */
const IMAGGA_API = "https://api.imagga.com/v2";

/**
 * Imagga API key
 */
const IMAGGA_KEY = process.env.IMAGGA_KEY ?? "";

/**
 * Imagga API secret
 */
const IMAGGA_SECRET = process.env.IMAGGA_SECRET ?? "";

/**
 * If you’d like to get a translation of the tags in other languages, you should use the language parameter.
 * Specify the languages you want to receive your results in, separated by comma.
 */
const IMAGGA_LANGUAGE = process.env.IMAGGA_LANGUAGE ?? "en";

/**
 * Limits the number of tags in the result to the number you set.
 */
const IMAGGA_LIMIT = process.env.IMAGGA_LIMIT ?? "-1";

/**
 * Thresholds the confidence of tags in the result to the number you set.
 * By default, all tags with confidence above 7 are being returned, and you cannot go lower than that.
 */
const IMAGGA_THRESHOLD = process.env.IMAGGA_THRESHOLD ?? "0.0";

/**
 * Imagga API response base
 */
type ApiResponse = {
  status: {
    // depending on whether the request was processed successfully
    type: "success" | "error";
    // human-readable reason why the processing was unsuccessful
    text: string;
  };
};

/**
 * Imagga API /upload response
 */
type UploadResponse = ApiResponse & {
  result: {
    // the id of the uploaded file
    upload_id: string;
  };
};

/**
 * Imagga API /tags response
 */
type TagsResponse = ApiResponse & {
  result: {
    // an array of all the tags the API has suggested for this image
    tags: {
      // a number representing a percentage from 0 to 100 where 100 means that the API is absolutely sure this tag must be relevant
      // and confidence < 30 means that there is a higher chance that the tag might not be such
      confidence: number;
      // the tag itself which could be an object, concept, color, etc. describing something from the photo scene
      tag: Record<string, string>;
    }[];
  };
};

export default defineHook(({ action }, { services, logger }) => {
  const auth = { username: IMAGGA_KEY, password: IMAGGA_SECRET };

  action("files.upload", async (meta, context) => {
    if (meta.payload.type.startsWith("image/")) {
      // retrieve asset resized to API best pratices as a readable stream
      // @see https://docs.imagga.com/#best-practices
      const assets: AssetsService = new services.AssetsService(context);
      const { stream } = await assets.getAsset(meta.key, {
        key: "imagga",
        format: "jpeg",
        width: 300,
        height: 300,
        fit: "outside",
        withoutEnlargement: true,
      });

      // upload asset to imagga upload service
      const uploadData = new FormData();
      uploadData.append("image", stream);
      const uploadResponse = await axios.post<UploadResponse>(IMAGGA_API + "/uploads", uploadData, {
        auth,
      });
      logger.debug(uploadResponse.data);
      if (uploadResponse.data.status.type !== "success") {
        logger.error(uploadResponse.data.status.text);
        return;
      }
      const upload_id = uploadResponse.data.result.upload_id;

      // retrieve tags
      const tagsResponse = await axios.get<TagsResponse>(IMAGGA_API + "/tags", {
        params: {
          image_upload_id: upload_id,
          language: IMAGGA_LANGUAGE,
          limit: IMAGGA_LIMIT,
          threshold: IMAGGA_THRESHOLD,
        },
        auth,
      });
      logger.debug(tagsResponse.data);
      if (tagsResponse.data.status.type !== "success") {
        logger.error(tagsResponse.data.status.text);
        return;
      }
      const tags = tagsResponse.data.result.tags.map((tag) => tag.tag[IMAGGA_LANGUAGE]);

      // update file tags
      const files: FilesService = new services.FilesService(context);
      const tagsMeta: string[] = meta.tags ?? [];
      await files.updateOne(meta.key, { tags: [...tagsMeta, ...tags] }, { emitEvents: false });

      // delete uploaded file to imagga
      await axios.delete(IMAGGA_API + "/uploads/" + upload_id, {
        auth,
      });
    }
  });
});
