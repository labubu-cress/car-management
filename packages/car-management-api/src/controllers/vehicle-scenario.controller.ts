import { Request, Response } from 'express';
import * as vehicleScenarioService from '../services/vehicle-scenario.service';
import { tenantIdFromRequest } from '../utils/tenant-id';

// GET /api/admin/vehicle-scenarios
export const getAllVehicleScenarios = async (req: Request, res: Response) => {
  try {
    const tenantId = tenantIdFromRequest(req);
    const vehicleScenarios = await vehicleScenarioService.getAllVehicleScenarios(tenantId);
    res.json(vehicleScenarios);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vehicle scenarios' });
  }
};

// GET /api/admin/vehicle-scenarios/:id
export const getVehicleScenarioById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vehicleScenario = await vehicleScenarioService.getVehicleScenarioById(id);
    if (vehicleScenario) {
      res.json(vehicleScenario);
    } else {
      res.status(404).json({ message: 'Vehicle scenario not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vehicle scenario' });
  }
};

// POST /api/admin/vehicle-scenarios
export const createVehicleScenario = async (req: Request, res: Response) => {
  try {
    const tenantId = tenantIdFromRequest(req);
    const newVehicleScenario = await vehicleScenarioService.createVehicleScenario({ ...req.body, tenantId });
    res.status(201).json(newVehicleScenario);
  } catch (error) {
    res.status(500).json({ message: 'Error creating vehicle scenario' });
  }
};

// PUT /api/admin/vehicle-scenarios/:id
export const updateVehicleScenario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedVehicleScenario = await vehicleScenarioService.updateVehicleScenario(id, req.body);
    if (updatedVehicleScenario) {
      res.json(updatedVehicleScenario);
    } else {
      res.status(404).json({ message: 'Vehicle scenario not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating vehicle scenario' });
  }
};

// DELETE /api/admin/vehicle-scenarios/:id
export const deleteVehicleScenario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await vehicleScenarioService.deleteVehicleScenario(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting vehicle scenario' });
  }
}; 