import { Request, Response } from 'express';
import * as carCategoryService from '../services/car-category.service';
import { tenantIdFromRequest } from '../utils/tenant-id';

// GET /api/admin/car-categories
export const getAllCarCategories = async (req: Request, res: Response) => {
  try {
    const tenantId = tenantIdFromRequest(req);
    const carCategories = await carCategoryService.getAllCarCategories(tenantId);
    res.json(carCategories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching car categories' });
  }
};

// GET /api/admin/car-categories/:id
export const getCarCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const carCategory = await carCategoryService.getCarCategoryById(id);
    if (carCategory) {
      res.json(carCategory);
    } else {
      res.status(404).json({ message: 'Car category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching car category' });
  }
};

// POST /api/admin/car-categories
export const createCarCategory = async (req: Request, res: Response) => {
  try {
    const tenantId = tenantIdFromRequest(req);
    const newCarCategory = await carCategoryService.createCarCategory({ ...req.body, tenant: { connect: { id: tenantId } } });
    res.status(201).json(newCarCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error creating car category' });
  }
};

// PUT /api/admin/car-categories/:id
export const updateCarCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedCarCategory = await carCategoryService.updateCarCategory(id, req.body);
    if (updatedCarCategory) {
      res.json(updatedCarCategory);
    } else {
      res.status(404).json({ message: 'Car category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating car category' });
  }
};

// DELETE /api/admin/car-categories/:id
export const deleteCarCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await carCategoryService.deleteCarCategory(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting car category' });
  }
}; 