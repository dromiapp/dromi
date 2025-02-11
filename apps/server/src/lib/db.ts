import { prisma } from "@repo/db";
import { v7 as uuidv7 } from 'uuid';

function generateId(): string {
  return uuidv7();
}

export { prisma, generateId };
