import * as uuid from 'uuid'
import { TodoAccess } from '../dataLayer/todoAccess'
import { getAttachementUrl, getUploadUrlS3 } from "../dataLayer/s3uitls"
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'


const todoAccess = new TodoAccess()


export async function getAllTodosForUser(userId: string): Promise<TodoItem[]> {
  return await todoAccess.getAllTodosForUser(userId)
}

export async function createTodo(
  newTodo: TodoItem,
  userId: string
): Promise<TodoItem> {
  newTodo.createdAt = new Date().toString()
  newTodo.done = false
  newTodo.todoId = uuid.v4()
  newTodo.userId = userId

  return await todoAccess.createTodo(newTodo)
}

export async function deleteTodo(todoId: string): Promise<void> {
  return await todoAccess.deleteTodo(todoId)
}

export async function updateTodo(todoId: string, todoUpdate: TodoUpdate): Promise<void> {
  return await todoAccess.updateTodo(todoId, todoUpdate)
}

export async function getUploadUrl(todoId: string): Promise<string> {
  const attachmentUrl = getAttachementUrl(todoId)
  const uploadUrl = getUploadUrlS3(todoId)

  await todoAccess.updateAttachementUrl(todoId, attachmentUrl)

  return uploadUrl
}
