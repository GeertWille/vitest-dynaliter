import fs from 'fs'
import { Config } from './types'
import { getDynalitePort, setConfigDir } from './config'
import { Mock } from 'vitest'
import path from 'path'

// Hoist variables to the top of the module scope
const { BASE_PORT, configPath, configPathWithoutPort } = vi.hoisted(() => {
  return {
    BASE_PORT: 8443,
    configPath: '/fakepath/dynalite.config.js',
    configPathWithoutPort: '/withoutport/dynalite.config.js'
  }
})

const mockedConfig = vi.fn((): Config => ({ basePort: BASE_PORT }))

vi.mock('fs')
;(fs.existsSync as Mock).mockReturnValue(true)

const resolveSpy = vi.spyOn(path, 'resolve').mockReturnValue(configPath)

vi.mock(configPath, () => mockedConfig())
vi.mock(configPathWithoutPort, () => ({
  default: {}
}))

describe('Config', () => {
  beforeAll(() => {
    setConfigDir('/whatever')
  })

  test('a different port is returned for each worker', async () => {
    const expectedPort = BASE_PORT + parseInt(process.env.VITEST_POOL_ID as string, 10)

    expect(await getDynalitePort()).toBe(expectedPort)
  })

  test('should return dynalite port even there is no VITEST_POOL_ID', async () => {
    const workerId = process.env.ir
    delete process.env.VITEST_POOL_ID

    const port = await getDynalitePort()

    expect(port).not.toBeNaN()
    expect(port).toBe(BASE_PORT + 1)

    process.env.VITEST_POOL_ID = workerId
  })

  test('if basePort is not defined then port 8001 will be used as a default', async () => {
    const workerId = process.env.VITEST_POOL_ID
    delete process.env.VITEST_POOL_ID
    vi.resetModules()
    resolveSpy.mockReturnValueOnce(configPathWithoutPort)

    expect(await getDynalitePort()).toBe(8001)

    process.env.VITEST_POOL_ID = workerId
  })

  test('should throw an error if basePort in config file is invalid', async () => {
    vi.resetModules()
    // @ts-expect-error -- we explicitly test for this case
    mockedConfig.mockReturnValue({ basePort: 'this is not a number' })

    expect(await getDynalitePort()).toThrowError(TypeError)
  })
})
