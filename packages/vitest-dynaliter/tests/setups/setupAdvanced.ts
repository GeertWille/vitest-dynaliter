import { join } from 'path'
import { setup } from '../../src'

// Setup with the root config
setup(join(__dirname, '../'))

vi.resetModules()
vi.mock('aws-sdk', () => {
  throw new Error('should not import this')
})
