import { Request, Response } from 'express';
import * as tenantService from '../../services/tenant.service';

// TODO: Implement the following functions

// GET /api/admin/tenants
export const getAllTenants = async (req: Request, res: Response) => {
  try {
    const tenants = await tenantService.getAllTenants();
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tenants' });
  }
};

// GET /api/admin/tenants/:id
export const getTenantById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenant = await tenantService.getTenantById(id);
    if (tenant) {
      res.json(tenant);
    } else {
      res.status(404).json({ message: 'Tenant not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tenant' });
  }
};

// POST /api/admin/tenants
export const createTenant = async (req: Request, res: Response) => {
  try {
    const newTenant = await tenantService.createTenant(req.body);
    res.status(201).json(newTenant);
  } catch (error) {
    res.status(500).json({ message: 'Error creating tenant' });
  }
};

// PUT /api/admin/tenants/:id
export const updateTenant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedTenant = await tenantService.updateTenant(id, req.body);
    if (updatedTenant) {
      res.json(updatedTenant);
    } else {
      res.status(404).json({ message: 'Tenant not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating tenant' });
  }
};

// DELETE /api/admin/tenants/:id
export const deleteTenant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await tenantService.deleteTenant(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting tenant' });
  }
}; 