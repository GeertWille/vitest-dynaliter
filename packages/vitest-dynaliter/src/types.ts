export type TableConfig = {
  data?: Record<string, unknown>[]
  TableName: string
  KeySchema: [{ AttributeName: string; KeyType: string }]
  AttributeDefinitions: [{ AttributeName: string; AttributeType: string }]
  ProvisionedThroughput: { ReadCapacityUnits: number; WriteCapacityUnits: number }
}

export type Config = {
  tables?: TableConfig[] | (() => TableConfig[] | Promise<TableConfig[]>)
  basePort?: number
}
