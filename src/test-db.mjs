// test-db.mjs
// Run this with: node test-db.mjs

import { PrismaClient } from "@prisma/client";

async function testConnection() {
  console.log("🔍 Testing database connection...\n");

  // Log environment variables (without showing password)
  console.log("Environment Check:");
  console.log("- NODE_ENV:", process.env.NODE_ENV);
  console.log("- DATABASE_URL exists:", !!process.env.DATABASE_URL);
  console.log("- DIRECT_URL exists:", !!process.env.DIRECT_URL);

  if (process.env.DATABASE_URL) {
    const urlParts = process.env.DATABASE_URL.match(
      /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/,
    );
    if (urlParts) {
      console.log("\nConnection String Details:");
      console.log("- User:", urlParts[1]);
      console.log("- Password length:", urlParts[2]?.length, "chars");
      console.log("- Host:", urlParts[3]);
      console.log("- Port:", urlParts[4]);
      console.log("- Database:", urlParts[5]);
    }
  }

  console.log("\n" + "=".repeat(50) + "\n");

  const prisma = new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });

  try {
    console.log("Test 1: Raw query (SELECT 1)...");
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("✅ Raw query successful:", result);
    console.log();

    console.log("Test 2: Database connection...");
    await prisma.$connect();
    console.log("✅ Prisma connected successfully");
    console.log();

    console.log("Test 3: Checking Profile table...");
    const profileCount = await prisma.profile.count();
    console.log("✅ Profile table accessible. Count:", profileCount);
    console.log();

    console.log("Test 4: Listing all tables...");
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    console.log("✅ Tables found:", tables);
    console.log();

    console.log("🎉 All tests passed! Database connection is working.");
  } catch (error) {
    console.error("\n❌ Connection test failed:");

    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    } else {
      console.error("Unknown error:", error);
    }

    console.log("\n🔧 Troubleshooting tips:");
    console.log("1. Verify your DATABASE_URL is correct");
    console.log(
      "2. Check if your password has special characters (encode them)",
    );
    console.log("3. Ensure your IP is not blocked by Supabase");
    console.log("4. Try using DIRECT_URL instead of DATABASE_URL");
    console.log("5. Run: npx prisma generate");
    console.log("6. Check if your Supabase project is paused");

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void testConnection();
