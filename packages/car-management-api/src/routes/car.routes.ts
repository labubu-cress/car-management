import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as vehicleScenarioController from '../controllers/vehicle-scenario.controller';
import * as carCategoryController from '../controllers/car-category.controller';
import * as carTrimController from '../controllers/car-trim.controller';

const router = Router();

// Apply authentication middleware to all routes in this file
router.use(authenticate);

// VehicleScenario Routes
router.post('/vehicle-scenarios', vehicleScenarioController.createVehicleScenario);
router.get('/vehicle-scenarios', vehicleScenarioController.getAllVehicleScenarios);
router.get('/vehicle-scenarios/:id', vehicleScenarioController.getVehicleScenarioById);
router.put('/vehicle-scenarios/:id', vehicleScenarioController.updateVehicleScenario);
router.delete('/vehicle-scenarios/:id', vehicleScenarioController.deleteVehicleScenario);

// CarCategory Routes
router.post('/car-categories', carCategoryController.createCarCategory);
router.get('/car-categories', carCategoryController.getAllCarCategories);
router.get('/car-categories/:id', carCategoryController.getCarCategoryById);
router.put('/car-categories/:id', carCategoryController.updateCarCategory);
router.delete('/car-categories/:id', carCategoryController.deleteCarCategory);

// CarTrim Routes
router.post('/car-categories/:categoryId/trims', carTrimController.createCarTrim);
router.get('/car-categories/:categoryId/trims', carTrimController.getAllCarTrims);
router.get('/car-trims/:id', carTrimController.getCarTrimById);
router.put('/car-trims/:id', carTrimController.updateCarTrim);
router.delete('/car-trims/:id', carTrimController.deleteCarTrim);

export default router; 