import { Router } from 'express';
import * as tenantController from '../controllers/tenant.controller';
import * as adminUserController from '../controllers/admin.user.controller';
import * as authController from '../controllers/auth.controller';

const router = Router();

// Tenant Management Routes
// POST /api/admin/tenants - Create a new tenant
// GET /api/admin/tenants - Get all tenants
// GET /api/admin/tenants/:id - Get a tenant by id
// PUT /api/admin/tenants/:id - Update a tenant
// DELETE /api/admin/tenants/:id - Delete a tenant
router.post('/tenants', tenantController.createTenant);
router.get('/tenants', tenantController.getAllTenants);
router.get('/tenants/:id', tenantController.getTenantById);
router.put('/tenants/:id', tenantController.updateTenant);
router.delete('/tenants/:id', tenantController.deleteTenant);

// AdminUser Management Routes
// POST /api/admin/users - Create a new admin user
// GET /api/admin/users - Get all admin users
// GET /api/admin/users/:id - Get an admin user by id
// PUT /api/admin/users/:id - Update an admin user
// DELETE /api/admin/users/:id - Delete an admin user
router.post('/users', adminUserController.createAdminUser);
router.get('/users', adminUserController.getAllAdminUsers);
router.get('/users/:id', adminUserController.getAdminUserById);
router.put('/users/:id', adminUserController.updateAdminUser);
router.delete('/users/:id', adminUserController.deleteAdminUser);

// Auth Routes
// POST /api/admin/auth/login - Admin user login
router.post('/auth/login', authController.login);

export default router; 