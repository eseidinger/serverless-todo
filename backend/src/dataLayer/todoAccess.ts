import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { createLogger } from '../utils/logger'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)


const logger = createLogger('todoAccess')

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE) {
  }

  async getAllTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info(`Getting all todo items for user ${userId}`)

    const result = await this.docClient.query({
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()
  
    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(newTodo: TodoItem): Promise<TodoItem> {
  
    await this.docClient.put({
      TableName: this.todosTable,
      Item: newTodo
    }).promise()
  
    logger.info(`Created todo item: ${JSON.stringify(newTodo)}`)

    return newTodo
  }

  async deleteTodo(todoId: string, userId: string): Promise<void> {
    await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
        todoId,
        userId
      }
    }).promise()

    logger.info(`Deleted todo item: ${JSON.stringify(todoId)}`)
  }

  async updateTodo(todoId: string, userId: string, todoUpdate: TodoUpdate): Promise<void> {
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        todoId,
        userId
      },
      UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeNames: {
        "#name": "name"
      },
      ExpressionAttributeValues: {
        ":name": todoUpdate.name,
        ":dueDate": todoUpdate.dueDate,
        ":done": todoUpdate.done
      }
    }).promise()

    logger.info(`Updated todo item: ${JSON.stringify(todoId)}`)
  }

  async updateAttachementUrl(todoId: string, userId: string, attachmentUrl: string): Promise<void> {
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        todoId,
        userId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      }
    }).promise()

    logger.info(`Updated attachement URL of todo item: ${JSON.stringify(todoId)}`)
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
