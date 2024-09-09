import { createTables, deleteTables } from './db'

beforeEach(createTables)
afterEach(deleteTables)
