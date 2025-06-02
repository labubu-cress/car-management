import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class CarService {
  async createCar(data: Prisma.CarCreateInput) {
    return prisma.car.create({
      data,
    });
  }

  async getAllCars() {
    return prisma.car.findMany();
  }

  async getCarById(id: string) {
    return prisma.car.findUnique({
      where: { id },
    });
  }

  async updateCar(id: string, data: Prisma.CarUpdateInput) {
    return prisma.car.update({
      where: { id },
      data,
    });
  }

  async deleteCar(id: string) {
    return prisma.car.delete({
      where: { id },
    });
  }
} 