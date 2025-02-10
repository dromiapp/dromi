export { prisma } from './client' // exports instance of prisma
export * from "../generated/client" // exports generated types from prisma
export * as Typebox from "../generated/typebox/barrel" // exports generated types from prisma

export enum permissionFlag {
  NONE = 0,
  VIEW = 1,
  EDIT = 2,
  CREATE = 4,
  DELETE = 8,
  MANAGE = 16,
}