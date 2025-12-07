// backend/config/db.ts

import { PrismaClient as SqlPrismaClient } from '@prisma/client';
// The MongoDB Prisma client is generated to `node_modules/@prisma/client-mongo`.
// Import dynamically at runtime so TypeScript/ts-node doesn't fail when the generated
// package is not present (e.g., before running `prisma generate`).
let MongoPrismaClient: any = null;
try {
    // Use require so TypeScript doesn't attempt to resolve the module at compile time
    // if it does not yet exist in node_modules.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require('@prisma/client-mongo') as any;
    MongoPrismaClient = pkg?.PrismaClient ?? pkg?.default ?? null;
} catch (e) {
    MongoPrismaClient = null;
}

// ----------------------------------------------------
// Type Safety Check for Environment Variables
// ----------------------------------------------------
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be defined in the .env file for MongoDB connection.");
}
if (!process.env.SQL_DATABASE_URL) {
    throw new Error("SQL_DATABASE_URL must be defined in the .env file for MySQL connection.");
}

// 1. Initialize the MySQL Client (Default client - users, orders)
const sqlClient = new SqlPrismaClient({
    datasources: {
        db: {
            url: process.env.SQL_DATABASE_URL,
        },
    },
    log: ['warn', 'error'],
});

// 2. Initialize the MongoDB Client (Product Catalog)
let mongoClient: any;
if (MongoPrismaClient) {
    mongoClient = new MongoPrismaClient({
        datasources: {
            db: { url: process.env.DATABASE_URL },
        },
        log: ['warn', 'error'],
    });
} else {
    // Create a minimal stub so other modules can import `db.mongo` safely.
    mongoClient = {
        // $connect will throw to indicate the real client is missing when used.
        async $connect() {
            throw new Error("@prisma/client-mongo not found. Run `npx prisma generate --schema=prisma/product.prisma`.");
        },
        async $disconnect() {},
    } as any;
}


// Export both clients in an object for easy access
export const db = {
    sql: sqlClient,      // Contains User, Order, OrderItem models (MySQL)
    mongo: mongoClient,  // Contains Product model (MongoDB)
};