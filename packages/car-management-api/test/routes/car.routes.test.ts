import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index'; // 导入修改后的 app
import { testPrisma } from '../setup';


// 禁用并发执行，确保测试隔离
describe('/api/cars', () => {

  describe('POST /api/cars', () => {
    it('should create a new car and return 201 status', async () => {
      const newCar = {
        name: 'Tesla Model S',
        price: 79990,
        img: 'https://example.com/tesla-model-s.jpg',
      };
      const response = await request(app).post('/api/cars').send(newCar);
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(newCar);
      expect(response.body.id).toBeDefined();
    });

    it('should return 400 if required fields are missing', async () => {
      const newCar = {
        name: 'Tesla Model S', // price and img are missing
      };
      const response = await request(app).post('/api/cars').send(newCar);
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/cars', () => {
    it('should return all cars and 200 status', async () => {
      // 首先创建一些汽车数据以便测试 GET
      await testPrisma.car.createMany({
        data: [
          { name: 'Toyota Corolla', price: 22000, img: 'https://example.com/toyota-corolla.jpg' },
          { name: 'Honda Civic', price: 23000, img: 'https://example.com/honda-civic.jpg' },
        ],
      });

      const response = await request(app).get('/api/cars');
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2); // 精确匹配，因为我们知道只创建了2条记录
      expect(response.body[0].name).toBe('Toyota Corolla');
      expect(response.body[1].name).toBe('Honda Civic');
    });

    it('should return empty array when no cars exist', async () => {
      // 测试空数据库情况
      const response = await request(app).get('/api/cars');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });
}); 