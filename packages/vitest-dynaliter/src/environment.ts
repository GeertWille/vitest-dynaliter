import setup from './setup'
import { start, stop } from './db'
import {
  CONFIG_FILE_NAME,
  CONFIG_FILE_NAME_CJS,
  CONFIG_FILE_NAME_TS,
  NotFoundError
} from './config'
import { Environment, builtinEnvironments } from 'vitest/environments'

export default <Environment>{
  ...builtinEnvironments.node,
  name: 'dynaliter',
  async setup(global, { dynalite: { rootDir } }) {
    const env = builtinEnvironments['node']
    const envReturn = await env.setup(global, {})

    console.log('Dynalite environment setup is starting...')
    try {
      await setup(rootDir)
    } catch (e) {
      if (e instanceof NotFoundError) {
        throw new Error(`
vitest-dynaliter could not find "${CONFIG_FILE_NAME}" or "${CONFIG_FILE_NAME_CJS}" or "${CONFIG_FILE_NAME_TS}" in the vitest <rootDir> (${rootDir}).

If you didn't intend to be using this directory for the config, please specify a custom
directory using VITEST_DYNALITER_CONFIG_DIRECTORY

For more information, please see https://github.com/geertwille/vitest-dynaliter/#breaking-changes.
      `)
      }
      throw e
    }

    await start()

    return {
      async teardown(global) {
        await stop()
        await envReturn.teardown(global)
      }
    }
  }
}
