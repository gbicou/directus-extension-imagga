import { describe, it, expect } from 'vitest'
import { createDirectus, rest, staticToken, readExtensions, uploadFiles, readFile } from '@directus/sdk'
import { name } from '../package.json'
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
    expect(extensions.map(extension => extension.schema?.name)).toContain(name)
  })

  it('tags image with imagga api', async () => {
    await mock.clearAllExceptDefault()

    // upload image
    const data = new FormData()
    const paris = await readFileFs(`${import.meta.dirname}/paris.jpeg`)
    data.append('file', new Blob([paris], { type: 'image/jpeg' }))
    const upload = await directus.request(uploadFiles(data))

    expect(upload.id).toBeDefined()

    // need to wait
    await new Promise(resolve => setTimeout(resolve, 5000))

    const apiUploads = await mock.getRequestsForAPI('POST', '/uploads')
    expect(apiUploads).toHaveLength(1)

    // check if image is tagged with api results
    const file = await directus.request(readFile(upload.id))
    expect(file).toBeDefined()
    expect(file.tags).toEqual(['mountain', 'landscape'])
  }, {
    timeout: 10_000,
  })
})
