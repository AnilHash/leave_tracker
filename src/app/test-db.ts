import { prisma } from "../lib/prisma";

async function testConnection() {
  try {
    console.log("Testing database connection...");

    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("Connection successful:", result);

    const orgs = await prisma.organization.findMany({ take: 1 });
    console.log("Can query organizations table");
  } catch (error) {
    console.error("Connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
