import { Request, Response } from 'express';
import * as adminUserService from '../services/admin.user.service';

// GET /api/admin/users
export const getAllAdminUsers = async (req: Request, res: Response) => {
  try {
    const users = await adminUserService.getAllAdminUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin users' });
  }
};

// GET /api/admin/users/:id
export const getAdminUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await adminUserService.getAdminUserById(id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'Admin user not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin user' });
  }
};

// POST /api/admin/users
export const createAdminUser = async (req: Request, res: Response) => {
  try {
    const newUser = await adminUserService.createAdminUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin user' });
  }
};

// PUT /api/admin/users/:id
export const updateAdminUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedUser = await adminUserService.updateAdminUser(id, req.body);
    if (updatedUser) {
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'Admin user not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating admin user' });
  }
};

// DELETE /api/admin/users/:id
export const deleteAdminUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await adminUserService.deleteAdminUser(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting admin user' });
  }
}; 