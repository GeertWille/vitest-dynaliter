import {
  CreateTableCommand,
  DeleteTableCommand,
  DescribeTableCommand,
  DynamoDBClient
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
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const details = await client
      .send(new DescribeTableCommand({ TableName: tableName }))
      .catch(() => undefined)

    if (details?.Table?.TableStatus === 'ACTIVE') {
      // eslint-disable-next-line no-await-in-loop
      await sleep(10)
      break
    }
    // eslint-disable-next-line no-await-in-loop
    await sleep(10)
  }
}

/**
 * Poll the tables list to ensure that the given list of tables exists
 */
const waitForDeleted = async (client: DynamoDBDocumentClient, tableName: string): Promise<void> => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const details = await client
      .send(new DescribeTableCommand({ TableName: tableName }))
      .catch((e) => e.name === 'ResourceInUseException')

    // eslint-disable-next-line no-await-in-loop
    await sleep(100)

    if (!details) {
      break
    }
  }
}

export const deleteTables = (tableNames: string[], port: number): Promise<void> =>
  runWithRealTimers(async () => {
    const { documentClient } = dbConnection(port)
    await Promise.all(
      tableNames.map((table) =>
        documentClient.send(new DeleteTableCommand({ TableName: table })).catch(() => {})
      )
    )
    await Promise.all(tableNames.map((table) => waitForDeleted(documentClient, table)))
  })

export const createTables = (tables: TableConfig[], port: number): Promise<void> =>
  runWithRealTimers(async () => {
    const { documentClient } = dbConnection(port)

    await Promise.all(
      tables.map(({ data, ...rest }) => {
        return documentClient.send(new CreateTableCommand({ ...rest } as any))
      })
    )

    await Promise.all(tables.map((table) => waitForTable(documentClient, table.TableName)))
    await Promise.all(
      tables.map(
        (table) =>
          table.data &&
          Promise.all(
            table.data.map(async (row) => {
              return documentClient
                .send(
                  new PutCommand({
                    TableName: table.TableName,
                    Item: row
                  })
                )
                .catch((e) => {
                  throw new Error(
                    `Could not add ${JSON.stringify(row)} to "${table.TableName}": ${e.message}`
                  )
                })
            })
          )
      )
    )
  })

export const killConnection = (): void => {
  connection?.documentClient.destroy()
}
