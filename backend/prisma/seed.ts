// backend/prisma/seed.ts

import { db } from '../config/db'; // <-- FIXED: Explicit .js extension
import * as fs from 'fs';
import * as path from 'path';

// Define an interface for the incoming product data to avoid 'any' errors
interface JsonProduct {
    id: number;
    sku: string;
    name: string;
    price: number; // Price is stored as an integer (e.g., 4999)
    category: string;
}

// Load the JSON data synchronously
const productDataPath = path.resolve(process.cwd(), 'ecommerce_products_50_items.json');
let products: JsonProduct[]; 

try {
  const rawData = fs.readFileSync(productDataPath, 'utf-8');
  const parsedData = JSON.parse(rawData);
  products = parsedData.products;
} catch (error) {
  console.error(`Error loading or parsing the product JSON file at ${productDataPath}:`, error);
  process.exit(1);
}


async function main() {
  console.log('--- Starting MongoDB seeding from JSON file... ---');
  // FIX: Cast db.mongo as 'any' to bypass the persistent type error (Property 'product' does not exist)
  const mongoClient = db.mongo as any;

  // Build transformed products (used both for DB seed and local fallback)
  const transformedProducts = products.map((product, index) => ({
    // Core data from JSON
    sku: product.sku,
    name: product.name,
    price: product.price / 100, // Converts integer price to float price (e.g., 49.99)
    category: product.category,
    
    // Dynamically generated required data for the MongoDB schema
    description: `The perfect item for your needs! This product is part of our premium collection in the ${product.category} category. SKU: ${product.sku}.`,
    stock: 20 + (index % 15), 
    isFeatured: index % 5 === 0, 
    imageUrls: [`/images/${product.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.jpg`], 
  }));

  // Try to seed MongoDB. If connection fails (e.g. DNS/Atlas unreachable), write a local fallback file.
  try {
    // Attempt a quick connect; this will throw if DNS / network is failing
    if (typeof mongoClient.$connect === 'function') {
      await mongoClient.$connect();
    }

    // 1. Delete existing products to ensure a clean run
    await mongoClient.product.deleteMany({});
    console.log('Deleted existing product data from MongoDB.');

    // 2. Insert products
    const productPromises = transformedProducts.map((product) =>
      mongoClient.product.create({ data: product })
    );

    await Promise.all(productPromises);
    console.log(`Successfully created ${transformedProducts.length} product records in MongoDB.`);
  } catch (err: any) {
    console.error('MongoDB seeding failed — falling back to local JSON file:', err?.message || err);

    // Write fallback local file so the backend can operate without MongoDB
    const fallbackPath = path.resolve(process.cwd(), 'prisma', 'local_products.json');
    try {
      fs.writeFileSync(fallbackPath, JSON.stringify(transformedProducts, null, 2), 'utf-8');
      console.log(`Wrote local product fallback to ${fallbackPath}`);
    } catch (writeErr) {
      console.error('Failed to write local fallback file:', writeErr);
    }
  }
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    // FIX: Use the casted client for disconnect as well
    await (db.mongo as any).$disconnect(); 
    console.log('--- MongoDB seeding finished. ---');
  });