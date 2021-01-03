import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import * as AWS  from 'aws-sdk'

import { createLogger } from '../../utils/logger'
import { TodoItem } from '../../models/TodoItem'

const logger = createLogger('generateUploadUrl')

const docClient = new AWS.DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE

const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

const bucketName = process.env.UPLOAD_S3_BUCKET
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  // TODO: (done) Return a presigned URL to upload a file for a TODO item with the provided id
  logger.info(`Processing event: ${JSON.stringify(event)}`)

  const result = await docClient.get({
    TableName: todosTable,
    Key: {
      todoId
    }
  }).promise()

  const todoItem = result.Item as TodoItem

  todoItem.attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`
  const uploadUrl = getUploadUrl(todoId)

  await docClient.put({
    TableName: todosTable,
    Item: todoItem
  }).promise()

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadUrl
    })
  }
}

function getUploadUrl(todoId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  })
}
