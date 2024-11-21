import { describe, it, expect } from 'vitest'
import { createDirectus, rest, staticToken, readExtensions, uploadFiles, readFile } from "@directus/sdk";
import { name } from '../package.json'
import { readFile as readFileFs } from 'node:fs/promises'
import { mockServerClient } from 'mockserver-client';

describe('extension', () => {
  const client = createDirectus(process.env.PUBLIC_URL as string)
    .with(rest())
    .with(staticToken(process.env.ADMIN_TOKEN as string))

  const mockClient = mockServerClient('localhost', 1080)

  it('register correctly in directus', async () => {
    const extensions = await client.request(readExtensions())

    expect(extensions).toBeDefined()
    expect(extensions.map(extension => extension.schema?.name)).toContain(name)
  })

  /*
  it('triggers when image is uploaded', async () => {
    const data = new FormData()
    const paris = await readFileFs(`${import.meta.dirname}/paris.jpeg`)
    data.append('file', new Blob([paris], { type: 'image/jpeg' }))

    const files = await client.request(uploadFiles(data))
    expect(files).toBeDefined()

    console.log(files)
    await new Promise(resolve => setTimeout(resolve, 1000))

    const mockTags = await mockClient.verify({ path: '/uploads' });

    const file = await client.request(readFile(files.id))
    expect(file).toBeDefined()

    console.log(file)
  }, {
    timeout: 100_000
  })
   */
})
