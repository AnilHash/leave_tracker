import { PrismaClient, Prisma } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DB_PRISMA_DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const orgData: Prisma.OrganizationCreateInput[] = [
  {
    name: "Org 1",
  },
];

export async function main() {
  for (const org of orgData) {
    await prisma.organization.create({ data: org });
  }
}
main();
