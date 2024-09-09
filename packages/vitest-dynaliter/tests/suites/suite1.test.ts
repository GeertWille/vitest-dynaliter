import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

const ddb = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    // convertEmptyValues: true,
    endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
    // sslEnabled: false,
    region: 'local'
  })
)

it('should not share data between test suites', async () => {
  const { Item } = await ddb.send(new GetCommand({ TableName: 'files', Key: { id: '1' } }))

  expect(Item).not.toBeDefined()
})

it('should allow the environment variable to be deleted', () => {
  delete process.env.MOCK_DYNAMODB_ENDPOINT
})
