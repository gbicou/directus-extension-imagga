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

Configure the extension with environment variables :

### Authorization

- `IMAGGA_KEY`: Imagga API key on your user dashboard
- `IMAGGA_SECRET`: Imagga API secret on your user dashboard

### Configuration

- `IMAGGA_LIMIT`: limits the number of tags in the result
- `IMAGGA_THRESHOLD`: thresholds the confidence of tags in the result
- `IMAGGA_LANGUAGE`: get a translation of the tags in other languages

Please refer to [Imagga API documentation](https://docs.imagga.com/#tags) for more information.

## Demo

An example of an image uploaded in the file library of Directus whose tags are automatically filled in :

[screencast](https://user-images.githubusercontent.com/174636/230939020-6f8871fb-ba9b-4ebf-bfc0-779b8c730741.webm)

## License

This extension is released under the MIT license. See the LICENSE file for more details.

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@bicou/directus-extension-imagga/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@bicou/directus-extension-imagga
[npm-downloads-src]: https://img.shields.io/npm/dm/@bicou/directus-extension-imagga.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@bicou/directus-extension-imagga
[license-src]: https://img.shields.io/npm/l/@bicou/directus-extension-imagga.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/@bicou/directus-extension-imagga
