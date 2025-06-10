import { Router } from 'express';
import { authenticate } from '../middleware/admin-auth.middleware';
import * as vehicleScenarioController from '../controllers/admin/vehicle-scenario.controller';
import * as carCategoryController from '../controllers/admin/car-category.controller';
import * as carTrimController from '../controllers/admin/car-trim.controller';
import * as tenantController from '../controllers/admin/tenant.controller';
import * as adminUserController from '../controllers/admin/admin-user.controller';
import * as authController from '../controllers/admin/auth.controller';

const router = Router();

// Auth Routes
// POST /api/admin/auth/login - Admin user login
router.post('/auth/login', authController.login);

// Apply authentication middleware to all routes below
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

// Tenant Management Routes
router.post('/tenants', tenantController.createTenant);
router.get('/tenants', tenantController.getAllTenants);
router.get('/tenants/:id', tenantController.getTenantById);
router.put('/tenants/:id', tenantController.updateTenant);
router.delete('/tenants/:id', tenantController.deleteTenant);

// AdminUser Management Routes
router.post('/admin-users', adminUserController.createAdminUser);
router.get('/admin-users', adminUserController.getAllAdminUsers);
router.get('/admin-users/:id', adminUserController.getAdminUserById);
router.put('/admin-users/:id', adminUserController.updateAdminUser);
router.delete('/admin-users/:id', adminUserController.deleteAdminUser);

export default router; 