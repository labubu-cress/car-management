import { Request, Response } from 'express';
import { CarService } from '../services/car.service';
import { z } from 'zod';

const carSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  img: z.string().url(),
});

const partialCarSchema = carSchema.partial();

export class CarController {
  private carService: CarService;

  constructor() {
    this.carService = new CarService();
  }

  async createCar(req: Request, res: Response) {
    try {
      const validatedData = carSchema.parse(req.body);
      const car = await this.carService.createCar(validatedData);
      res.status(201).json(car);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create car' });
      }
    }
  }

  async getAllCars(req: Request, res: Response) {
    try {
      const cars = await this.carService.getAllCars();
      res.status(200).json(cars);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get cars' });
    }
  }

  async getCarById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const car = await this.carService.getCarById(id);
      if (car) {
        res.status(200).json(car);
      } else {
        res.status(404).json({ message: 'Car not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to get car' });
    }
  }

  async updateCar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = partialCarSchema.parse(req.body);
      const car = await this.carService.updateCar(id, validatedData);
      if (car) {
        res.status(200).json(car);
      } else {
        res.status(404).json({ message: 'Car not found' });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to update car' });
      }
    }
  }

  async deleteCar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.carService.deleteCar(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete car' });
    }
  }
} 