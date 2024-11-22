import { useEnv } from '@directus/env'
import { defineHook } from '@directus/extensions-sdk'
import { AssetsService, FilesService } from '@directus/api/services/index'
import axios from 'axios'
import FormData from 'form-data'

/**
 * Imagga API response base
 */
interface ApiResponse {
  status: {
    // depending on whether the request was processed successfully
    type: 'success' | 'error'
    // human-readable reason why the processing was unsuccessful
    text: string
  }
}

/**
 * Imagga API /upload response
 */
interface UploadResponse extends ApiResponse {
  result: {
    // the id of the uploaded file
    upload_id: string
  }
}

/**
 * Imagga API /tags response
 */
interface TagsResponse extends ApiResponse {
  result: {
    // an array of all the tags the API has suggested for this image
    tags: {
      // a number representing a percentage from 0 to 100 where 100 means that the API is absolutely sure this tag must be relevant
      // and confidence < 30 means that there is a higher chance that the tag might not be such
      confidence: number
      // the tag itself which could be an object, concept, color, etc. describing something from the photo scene
      tag: Record<string, string>
    }[]
  }
}

/**
 * Imagga API color item
 */
interface ColorData {
  // red
  r: number
  // green
  g: number
  // blue
  b: number
  // hex code
  html_code: string
  // what part of the image is in this color
  percent: number
}

/**
 * Imagga API /colors response
 */
interface ColorsResponse extends ApiResponse {
  result: {
    // contains the information about the color analysis of the photo
    colors: {
      // an array with up to 3 color results
      background_colors: ColorData[]
      // an array containing up to 3 color results
      foreground_colors: ColorData[]
      // an array containing up to 5 color results
      image_colors: ColorData[]
    }
  }
}

function mapColorData(input: ColorData[]) {
  return input.map(({ r, g, b, html_code, percent }) => ({
    r,
    g,
    b,
    html_code,
    percent,
  }))
}

export default defineHook(({ action }, { services, logger }) => {
  const environment = useEnv()

  /**
   * Imagga API endpoint
   */
  const IMAGGA_API = (environment['IMAGGA_API'] as string) ?? 'https://api.imagga.com/v2'

  /**
   * Imagga API key
   */
  const IMAGGA_KEY = (environment['IMAGGA_KEY'] as string) ?? ''

  /**
   * Imagga API secret
   */
  const IMAGGA_SECRET = (environment['IMAGGA_SECRET'] as string) ?? ''

  /**
   * Retrieve tags
   */
  const IMAGGA_TAGS_ENABLE = environment['IMAGGA_TAGS_ENABLE'] as boolean

  /**
   * If you’d like to get a translation of the tags in other languages, you should use the language parameter.
   * Specify the languages you want to receive your results in, separated by comma.
   */
  const IMAGGA_TAGS_LANGUAGE = environment['IMAGGA_TAGS_LANGUAGE'] as string ?? 'en'

  /**
   * Limits the number of tags in the result to the number you set.
   */
  const IMAGGA_TAGS_LIMIT = (environment['IMAGGA_TAGS_LIMIT'] as string) ?? '-1'

  /**
   * Thresholds the confidence of tags in the result to the number you set.
   * By default, all tags with confidence above 7 are being returned, and you cannot go lower than that.
   */
  const IMAGGA_TAGS_THRESHOLD = (environment['IMAGGA_TAGS_THRESHOLD'] as string) ?? '0.0'

  /**
   * Extract colors
   */
  const IMAGGA_COLORS_ENABLE = environment['IMAGGA_COLORS_ENABLE'] as boolean

  const auth = { username: IMAGGA_KEY, password: IMAGGA_SECRET }

  action('files.upload', async ({ payload, key }, context) => {
    if (payload.type.startsWith('image/')) {
      // retrieve asset resized to API best pratices as a readable stream
      // @see https://docs.imagga.com/#best-practices
      const assets: AssetsService = new services.AssetsService(context)
      const { stream } = await assets.getAsset(key, {
        transformationParams: {
          key: 'imagga',
          format: 'jpeg',
          width: 300,
          height: 300,
          fit: 'outside',
          withoutEnlargement: true,
        },
      })

      // upload asset to imagga upload service
      const uploadData = new FormData()
      uploadData.append('image', stream)
      const uploadResponse = await axios.post<UploadResponse>(IMAGGA_API + '/uploads', uploadData, {
        auth,
      })
      logger.debug(uploadResponse.data)
      if (uploadResponse.data.status.type !== 'success') {
        logger.error(uploadResponse.data.status.text)
        return
      }
      const upload_id = uploadResponse.data.result.upload_id

      // retrieve tags
      let tags: string[] = []
      if (IMAGGA_TAGS_ENABLE) {
        const response = await axios.get<TagsResponse>(IMAGGA_API + '/tags', {
          params: {
            image_upload_id: upload_id,
            language: IMAGGA_TAGS_LANGUAGE,
            limit: IMAGGA_TAGS_LIMIT,
            threshold: IMAGGA_TAGS_THRESHOLD,
          },
          auth,
        })
        logger.debug(response.data)
        if (response.data.status.type !== 'success') {
          logger.error(response.data.status.text)
          return
        }
        tags = response.data.result.tags.map(tag => tag.tag[IMAGGA_TAGS_LANGUAGE] ?? '')
      }

      // retrieve colors
      let colors: object | undefined
      if (IMAGGA_COLORS_ENABLE) {
        // wait 1 second to avoid rate limiting
        if (IMAGGA_TAGS_ENABLE) await new Promise(resolve => setTimeout(resolve, 1000))

        // imagga api call
        const response = await axios.get<ColorsResponse>(IMAGGA_API + '/colors', {
          params: {
            image_upload_id: upload_id,
          },
          auth,
        })
        logger.debug(response.data)
        if (response.data.status.type !== 'success') {
          logger.error(response.data.status.text)
          return
        }
        const colorsData = response.data.result.colors
        colors = {
          background: mapColorData(colorsData.background_colors),
          foreground: mapColorData(colorsData.foreground_colors),
          image: mapColorData(colorsData.image_colors),
        }
      }

      // update file data
      const files: FilesService = new services.FilesService(context)
      const payloadTags: string[] = payload.tags ?? []
      const payloadMetadata = payload.metadata ?? {}
      await files.updateOne(
        key,
        { tags: [...payloadTags, ...tags], metadata: { ...payloadMetadata, colors } },
        { emitEvents: false },
      )

      // delete uploaded file to imagga
      await axios.delete(IMAGGA_API + '/uploads/' + upload_id, {
        auth,
      })
    }
  })
})
