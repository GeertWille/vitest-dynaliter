import {
  CreateTableCommand,
  DeleteTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
  ResourceNotFoundException
} from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { TableConfig } from '../types'
import { runWithRealTimers, sleep } from '../utils'

type Connection = {
  // dynamoDB: DynamoDBClient;
  documentClient: DynamoDBDocumentClient
}

let connection: Connection | undefined

const dbConnection = (port: number): Connection => {
  if (connection) {
    return connection
  }
  const options = {
    endpoint: `http://localhost:${port}`,
    sslEnabled: false,
    region: 'local',
    credentials: {
      accessKeyId: 'accessKeyId',
      secretAccessKey: 'secretAccessKey'
    }
  }

  connection = {
    // dynamoDB: new DynamoDBClient(options),
    documentClient: DynamoDBDocumentClient.from(new DynamoDBClient(options))
  }

  return connection
}

const waitForTable = async (client: DynamoDBDocumentClient, tableName: string): Promise<void> => {
  while (true) {
    const details = await client
      .send(new DescribeTableCommand({ TableName: tableName }))
      .catch(() => undefined)

    if (details?.Table?.TableStatus === 'ACTIVE') {
      // await sleep(1) // Might need to put this back later
      break
    }
    // await sleep(2) // Might need to put this back later
  }
}

/**
 * Poll the tables list to ensure that the given list of tables exists
 */
const waitForDeleted = async (client: DynamoDBDocumentClient, tableName: string): Promise<void> => {
  let delay = 1
  while (true) {
    try {
      await client.send(new DescribeTableCommand({ TableName: tableName }))
    } catch (e) {
      if (e instanceof ResourceNotFoundException) {
        break
      }
    }
    await sleep(delay)
    delay = Math.min(delay * 2, 2) // Exponential backoff, max 2 seconds
  }
}

export const deleteTables = (tableNames: string[], port: number): Promise<void> =>
  runWithRealTimers(async () => {
    const { documentClient } = dbConnection(port)
    await Promise.all(
      tableNames.map(async (table) => {
        await documentClient.send(new DeleteTableCommand({ TableName: table })).catch(() => {})
        await waitForDeleted(documentClient, table)
      })
    )
  })

export const createTables = (tables: TableConfig[], port: number): Promise<void> =>
  runWithRealTimers(async () => {
    const { documentClient } = dbConnection(port)

    await Promise.all(
      tables.map(async ({ data, ...rest }) => {
        await documentClient.send(new CreateTableCommand({ ...rest } as any))
        await waitForTable(documentClient, rest.TableName)
        if (!data) {
          return
        }
        await Promise.all(
          data.map(async (row) => {
            return documentClient
              .send(
                new PutCommand({
                  TableName: rest.TableName,
                  Item: row
                })
              )
              .catch((e) => {
                throw new Error(
                  `Could not add ${JSON.stringify(row)} to "${rest.TableName}": ${e.message}`
                )
              })
          })
        )
      })
    )
  })

export const killConnection = (): void => {
  connection?.documentClient.destroy()
}
