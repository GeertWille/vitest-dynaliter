import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const ddb = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
    region: "local",
  })
);

module.exports = {
  getItem: async (byId) => {
    const { Item } = await ddb.send(
      new GetCommand({ TableName: "keys", Key: { id: byId } })
    );

    return Item && Item.value;
  },
  putItem: (id, value) =>
    ddb.send(new PutCommand({ TableName: "keys", Item: { id, value } })),
};
