import setup from './setup'
import { createTables, deleteTables, start, stop } from './db'

await setup(process.env.VITEST_DYNALITER_CONFIG_DIRECTORY || '.')

beforeAll(start)
beforeEach(createTables)
afterEach(deleteTables)
afterAll(stop)
