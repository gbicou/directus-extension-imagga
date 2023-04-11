# Imagga for Directus

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]

This is a [Directus](https://directus.io/) hook for file uploads to automatically tag images with [Imagga API](https://imagga.com/).

- npm package : `@bicou/directus-extension-imagga`
- [✨ &nbsp;Release Notes](/CHANGELOG.md)

## Requirements

This extension requires Directus 9 or higher to be installed.

## Installation

Add `@bicou/directus-extension-imagga` dependency to your directus project.

```bash
# Using pnpm
pnpm add @bicou/directus-extension-imagga
# Using yarn
yarn add @bicou/directus-extension-imagga
# Using npm
npm install @bicou/directus-extension-imagga
```

## Usage

Configure the extension with environment variables (in a .env file for example) :

### Authorization

The credentials are available in [your Imagga user dashboard](https://imagga.com/profile/dashboard).

| Key             | Description                              |
| --------------- | ---------------------------------------- |
| `IMAGGA_KEY`    | Imagga API key on your user dashboard    |
| `IMAGGA_SECRET` | Imagga API secret on your user dashboard |

### Configuration

#### Tags service

Automatically suggest textual tags from images.

| Key                     | Description                                      | Default       |
| ----------------------- | ------------------------------------------------ | ------------- |
| `IMAGGA_TAGS_ENABLE`    | enables auto tagging                             | true          |
| `IMAGGA_TAGS_LIMIT`     | limits the number of tags in the result          | -1 (no limit) |
| `IMAGGA_TAGS_THRESHOLD` | thresholds the confidence of tags in the result  | 0.0           |
| `IMAGGA_TAGS_LANGUAGE`  | get a translation of the tags in other languages | en            |

Please refer to [Imagga Tags API documentation](https://docs.imagga.com/#tags) for more information.

#### Colors service

Analyse and extract the predominant colors from images.

| Key                    | Description               | Default |
| ---------------------- | ------------------------- | ------- |
| `IMAGGA_COLORS_ENABLE` | enables colors extraction | false   |

Please refer to [Imagga Colors API documentation](https://docs.imagga.com/#colors) for more information.

## Demo

An example of an image uploaded in the file library of Directus whose tags are automatically filled in :

[Play screencast video](https://user-images.githubusercontent.com/174636/230939020-6f8871fb-ba9b-4ebf-bfc0-779b8c730741.webm)

## Results

### Tags

The result is stored as an array of strings in the `directus_files.tags` field.

```json5
{
  "tags": ["lake", "boathouse", "lakeside", "mountain", "shore", /*...*/]
}
```

### Colors

The result is stored under the `colors` key of the `directus_files.metadata` field.

```json5
{
  "colors": {
    "background": [
      { "r": 25, "g": 40, "b": 36, "html_code": "#192824", "percent": 55.2785682678223 }, // ...
    ],
    "foreground": [
      { "r": 92, "g": 88, "b": 92, "html_code": "#5c585c", "percent": 41.5135154724121 }, // ...
    ],
    "image": [
      { "r": 24, "g": 36, "b": 34, "html_code": "#182422", "percent": 43.4364776611328 }, // ...
    ]
  }
}
```

## License

This extension is released under the MIT license. See the LICENSE file for more details.

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@bicou/directus-extension-imagga/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@bicou/directus-extension-imagga
[npm-downloads-src]: https://img.shields.io/npm/dm/@bicou/directus-extension-imagga.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@bicou/directus-extension-imagga
[license-src]: https://img.shields.io/npm/l/@bicou/directus-extension-imagga.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/@bicou/directus-extension-imagga
