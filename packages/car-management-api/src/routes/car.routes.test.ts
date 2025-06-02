import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../index'; // 导入修改后的 app
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('/api/cars', () => {
  beforeAll(async () => {
    // 可选：在所有测试开始前，清空测试数据库或执行其他设置
    await prisma.car.deleteMany({}); // 清空 car 表
  });

  afterAll(async () => {
    // 可选：在所有测试结束后，断开数据库连接或执行清理
    await prisma.car.deleteMany({}); // 清空 car 表，确保下次测试是干净的
    await prisma.$disconnect();
  });

  describe('POST /api/cars', () => {
    it('should create a new car and return 201 status', async () => {
      const newCar = {
        make: 'Tesla',
        model: 'Model S',
        year: 2024,
        color: 'Red',
        price: 79990,
      };
      const response = await request(app).post('/api/cars').send(newCar);
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(newCar);
      expect(response.body.id).toBeDefined();
    });

    it('should return 400 if required fields are missing', async () => {
      const newCar = {
        make: 'Tesla', // model is missing
        year: 2024,
      };
      const response = await request(app).post('/api/cars').send(newCar);
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/cars', () => {
    it('should return all cars and 200 status', async () => {
      // 首先创建一些汽车数据以便测试 GET
      await prisma.car.createMany({
        data: [
          { make: 'Toyota', model: 'Corolla', year: 2022, color: 'Blue', price: 22000 },
          { make: 'Honda', model: 'Civic', year: 2023, color: 'Black', price: 23000 },
        ],
      });

      const response = await request(app).get('/api/cars');
      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      expect(response.body[0].make).toBe('Toyota');
      expect(response.body[1].make).toBe('Honda');
    });
  });
}); 