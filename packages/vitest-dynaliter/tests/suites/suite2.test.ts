import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

const ddb = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    // convertEmptyValues: true,
    endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
    // sslEnabled: false,
    region: 'local'
  })
)

it('should insert item into table', async () => {
  await ddb.send(new PutCommand({ TableName: 'files', Item: { id: '1', hello: 'world' } }))

  const { Item } = await ddb.send(new GetCommand({ TableName: 'files', Key: { id: '1' } }))

  expect(Item).toEqual({
    id: '1',
    hello: 'world'
  })
})

it('clears tables between tests', async () => {
  const { Item } = await ddb.send(new GetCommand({ TableName: 'files', Key: { id: '1' } }))

  expect(Item).not.toEqual({
    id: '1',
    hello: 'world'
  })
})
