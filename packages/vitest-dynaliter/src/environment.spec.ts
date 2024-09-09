import { join } from 'path'
import Environment from './environment'
import { dynaliteInstance } from './db'

vi.mock('dynalite', () => ({
  default: () => {
    let listening = false
    return {
      get listening() {
        return listening
      },
      listen: (_: void, resolve: () => void) => {
        listening = true
        resolve()
      },
      close: (resolve: () => void) => {
        listening = false
        resolve()
      }
    }
  }
}))

describe('Environment', () => {
  it('should throw an error if config file could not be located', async () => {
    expect(
      async () =>
        await Environment.setup(
          {
            projectConfig: { rootDir: 'somebaddirectory' }
          },
          {}
        )
    ).rejects.toThrowErrorMatchingSnapshot()
  })

  it('should not throw an error if a valid config directory is given', () => {
    expect(
      async () =>
        await Environment.setup(
          {
            projectConfig: { rootDir: join(__dirname, '__testdir__') }
          },
          {}
        )
    ).not.toThrowError()
  })

  it("should start the database when 'setup' is called and stop the db when 'teardown' is called", async () => {
    const environment = await Environment.setup(
      {
        projectConfig: { rootDir: join(__dirname, '__testdir__') }
      },
      {}
    )

    expect(dynaliteInstance.listening).toBeTruthy()

    await environment.teardown({})
    expect(dynaliteInstance.listening).toBeFalsy()
  })
})
