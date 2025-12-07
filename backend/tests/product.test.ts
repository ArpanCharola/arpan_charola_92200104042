
import request from 'supertest';
import express from 'express';
import productRoutes from '../routes/productRoutes';
import cors from 'cors';

// Mock the ProductModel to avoid database dependency in this specific test or use a test DB.
// For integration testing, usually we want to test the whole flow. 
// However, since I don't have a test database setup in the plan, I will mock the model responses 
// to verify the API layer (Controller + Router) logic.
// If the user wanted end-to-end with DB, I'd need a separate test DB setup.
// Given the prompt "Include at least one automated test", mocking is a safer and faster start 
// to prove the architecture works.

// Actually, the user asked for "automated test (unit or integration)". 
// A true integration test hits the DB. A unit test mocks it.
// I'll try to mock the model functions to make this robust without needing a running DB.

import * as ProductModel from '../models/Product.model';

// Create a simple express app for testing
const app = express();
app.use(express.json());
app.use('/api/products', productRoutes);

// Mock the methods
jest.mock('../models/Product.model');

describe('Product API Integration Tests', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('GET /api/products should return a list of products', async () => {
        const mockProducts = [
            { id: '1', name: 'Test Product 1', price: 100 },
            { id: '2', name: 'Test Product 2', price: 200 }
        ];

        (ProductModel.findAllProducts as jest.Mock).mockResolvedValue({
            count: 2,
            data: mockProducts
        });

        const response = await request(app).get('/api/products');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Products fetched successfully');
        expect(response.body.count).toBe(2);
        expect(response.body.data).toHaveLength(2);
        expect(response.body.data[0].name).toBe('Test Product 1');
    });

    it('GET /api/products should handle sorting', async () => {
        // We just verify that the controller calls the model with the correct sort params
        (ProductModel.findAllProducts as jest.Mock).mockResolvedValue({
            count: 0,
            data: []
        });

        await request(app).get('/api/products?sortBy=price&sortOrder=desc');

        expect(ProductModel.findAllProducts).toHaveBeenCalledWith(expect.objectContaining({
            sortBy: 'price',
            sortOrder: 'desc'
        }));
    });

    it('GET /api/products/:id should return a single product', async () => {
        const mockProduct = { id: '1', name: 'Test Product 1', price: 100 };

        (ProductModel.findProductById as jest.Mock).mockResolvedValue(mockProduct);

        const response = await request(app).get('/api/products/1');

        expect(response.status).toBe(200);
        expect(response.body.data.name).toBe('Test Product 1');
    });

    it('GET /api/products/:id should return 404 if not found', async () => {
        (ProductModel.findProductById as jest.Mock).mockResolvedValue(null);

        const response = await request(app).get('/api/products/999');

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Product not found.');
    });
});
