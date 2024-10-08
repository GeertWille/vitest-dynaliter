// setimmediate polyfill must be imported first as `dynalite` depends on it
import 'setimmediate'
import dynalite from 'dynalite'
import { getTables, getDynalitePort } from './config'
import * as dynamodbV3 from './dynamodb/v3'

export const dynaliteInstance = dynalite({
  createTableMs: 0,
  deleteTableMs: 0,
  updateTableMs: 0
})

const listen = async () => {
  await new Promise<void>((resolve, reject) => {
    dynaliteInstance.once('error', reject)
    dynaliteInstance.listen(process.env.MOCK_DYNAMODB_PORT, resolve)
  })
}
const close = async () => {
  await new Promise<void>((resolve) =>
    dynaliteInstance.close((err: unknown) => {
      if (err) {
        console.error(err)
      }
      resolve()
    })
  )
}

export const start = async (): Promise<void> => {
  if (!dynaliteInstance.listening) {
    await listen()
  }
}

export const stop = async (): Promise<void> => {
  // v3 does something to prevent dynalite
  // from shutting down until we have
  // killed the dynamodb connection
  dynamodbV3.killConnection()

  if (dynaliteInstance.listening) {
    await close()
  }
}

export const deleteTables = async (): Promise<void> => {
  const tablesNames = (await getTables()).map((table) => table.TableName)
  await dynamodbV3.deleteTables(tablesNames, await getDynalitePort())
}

export const createTables = async (): Promise<void> => {
  const tables = await getTables()
  await dynamodbV3.createTables(tables, await getDynalitePort())
}
