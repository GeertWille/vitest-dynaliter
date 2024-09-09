import { DeleteCommand, DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

const ddb = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    // convertEmptyValues: true,
    endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
    // sslEnabled: false,
    region: 'local'
  })
)

it('should contain table data provided in config', async () => {
  {
    const { Item } = await ddb.send(
      new GetCommand({
        TableName: 'images',
        Key: { url: 'https://something.com/something/image.jpg' }
      })
    )

    expect(Item).toEqual({
      url: 'https://something.com/something/image.jpg',

      width: 100,
      height: 200
    })
  }
  {
    const { Item } = await ddb.send(
      new GetCommand({
        TableName: 'images',
        Key: { url: 'https://something.com/something/image2.jpg' }
      })
    )

    expect(Item).toEqual({
      url: 'https://something.com/something/image2.jpg',
      width: 150,
      height: 250
    })
  }
})

it('should ensure that data is recreated after each test', async () => {
  await ddb.send(
    new DeleteCommand({
      TableName: 'images',
      Key: { url: 'https://something.com/something/image2.jpg' }
    })
  )
})

// This test must follow the previous
it('post should ensure that data is recreated after each test', async () => {
  const { Item } = await ddb.send(
    new GetCommand({
      TableName: 'images',
      Key: { url: 'https://something.com/something/image2.jpg' }
    })
  )

  expect(Item).toEqual({
    url: 'https://something.com/something/image2.jpg',
    width: 150,
    height: 250
  })
})
