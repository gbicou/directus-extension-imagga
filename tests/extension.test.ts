import { describe, it, expect } from 'vitest'
import { createDirectus, rest, staticToken, readExtensions, uploadFiles, readFile } from '@directus/sdk'
import package_ from '../package.json'
import { readFile as readFileFs } from 'node:fs/promises'
import { WireMock } from 'wiremock-captain'

describe('extension', () => {
  // directus client
  const directus = createDirectus(process.env.PUBLIC_URL as string)
    .with(rest())
    .with(staticToken(process.env.ADMIN_TOKEN as string))

  // imagga mock server
  const mock = new WireMock('http://127.0.0.1:8080')

  it('register correctly in directus', async () => {
    const extensions = await directus.request(readExtensions())

    expect(extensions).toBeDefined()
    expect(extensions.map(extension => extension.schema?.name)).toContain(package_.name)
  })

  it('tags image with imagga api', { timeout: 10_000 }, async () => {
    await mock.clearAllExceptDefault()

    // upload image
    const data = new FormData()
    const paris = await readFileFs(`${import.meta.dirname}/paris.jpeg`)
    data.append('file', new Blob([paris], { type: 'image/jpeg' }))
    const upload = await directus.request(uploadFiles(data))

    expect(upload.id).toBeDefined()

    let apiUploads: unknown[] = []
    let retry = 0
    while (retry < 5 && !(apiUploads?.length === 1)) {
      apiUploads = await mock.getRequestsForAPI('POST', '/uploads')
      if (!(apiUploads?.length === 1)) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      retry++
    }

    expect(apiUploads).toHaveLength(1)

    // check if the image is tagged with api results
    const file = await directus.request(readFile(upload.id))
    expect(file).toBeDefined()
    expect(file.tags).toEqual(['mountain', 'landscape'])
  })
})
