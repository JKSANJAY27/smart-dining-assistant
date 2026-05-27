// Prisma 7 config file
// Connection URLs are defined here (not in schema.prisma)
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"] as string,
    // directUrl is for direct connections (bypassing PgBouncer pooler)
    // directUrl: process.env["DIRECT_URL"] as string,
  },
});
