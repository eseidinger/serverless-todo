import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

import * as AWS  from 'aws-sdk'

import * as uuid from 'uuid'
import { TodoItem } from '../../models/TodoItem'

import { createLogger } from '../../utils/logger'

const logger = createLogger('createTodo')

const docClient = new AWS.DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  // TODO: (done) Implement creating a new TODO item
  logger.info(`Processing event: ${JSON.stringify(event)}`)

  const toDoItem = newTodo as TodoItem
  toDoItem.createdAt = new Date().toString()
  toDoItem.done = false
  toDoItem.todoId = uuid.v4()
  toDoItem.userId = event.requestContext.authorizer.principalId

  await docClient.put({
    TableName: todosTable,
    Item: toDoItem
  }).promise()

  logger.info(`Created todo item: ${JSON.stringify(toDoItem)}`)
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item: toDoItem
    })
  }

}
