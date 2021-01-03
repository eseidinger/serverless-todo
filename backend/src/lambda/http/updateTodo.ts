import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

import * as AWS from 'aws-sdk'

import { createLogger } from '../../utils/logger'

const logger = createLogger('updateTodo')

const docClient = new AWS.DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  // TODO: (done) Update a TODO item with the provided id using values in the "updatedTodo" object
  logger.info(`Processing event: ${JSON.stringify(event)}`)

  const result = await docClient.get({
    TableName: todosTable,
    Key: {
      todoId
    }
  }).promise()

  const updatedItem = { ...result.Item, ...updatedTodo}

  await docClient.put({
    TableName: todosTable,
    Item: updatedItem
  }).promise()

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item: updatedItem
    })
  }

}
