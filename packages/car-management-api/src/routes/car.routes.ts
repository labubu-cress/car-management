import { Router } from 'express';
import { CarController } from '../controllers/car.controller';

const router = Router();
const carController = new CarController();

router.post('/', carController.createCar.bind(carController));
router.get('/', carController.getAllCars.bind(carController));
router.get('/:id', carController.getCarById.bind(carController));
router.put('/:id', carController.updateCar.bind(carController));
router.delete('/:id', carController.deleteCar.bind(carController));

export default router; 