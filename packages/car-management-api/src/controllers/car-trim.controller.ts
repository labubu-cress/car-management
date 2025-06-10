import { Request, Response } from 'express';
import * as carTrimService from '../services/car-trim.service';
import { tenantIdFromRequest } from '../utils/tenant-id';

// GET /api/admin/car-categories/:categoryId/trims
export const getAllCarTrims = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const carTrims = await carTrimService.getAllCarTrims(categoryId);
    res.json(carTrims);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching car trims' });
  }
};

// GET /api/admin/car-trims/:id
export const getCarTrimById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const carTrim = await carTrimService.getCarTrimById(id);
    if (carTrim) {
      res.json(carTrim);
    } else {
      res.status(404).json({ message: 'Car trim not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching car trim' });
  }
};

// POST /api/admin/car-categories/:categoryId/trims
export const createCarTrim = async (req: Request, res: Response) => {
  try {
    const tenantId = tenantIdFromRequest(req);
    const { categoryId } = req.params;
    const newCarTrim = await carTrimService.createCarTrim({ 
      ...req.body, 
      tenant: { connect: { id: tenantId } },
      category: { connect: { id: categoryId } }
    });
    res.status(201).json(newCarTrim);
  } catch (error) {
    res.status(500).json({ message: 'Error creating car trim' });
  }
};

// PUT /api/admin/car-trims/:id
export const updateCarTrim = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedCarTrim = await carTrimService.updateCarTrim(id, req.body);
    if (updatedCarTrim) {
      res.json(updatedCarTrim);
    } else {
      res.status(404).json({ message: 'Car trim not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating car trim' });
  }
};

// DELETE /api/admin/car-trims/:id
export const deleteCarTrim = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await carTrimService.deleteCarTrim(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting car trim' });
  }
}; 