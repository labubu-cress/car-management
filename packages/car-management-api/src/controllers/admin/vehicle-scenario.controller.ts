import type { Request, Response } from "express";
import * as vehicleScenarioService from "../../services/vehicle-scenario.service";
import { tenantIdFromRequest } from "../../utils/tenant-id";

// GET /api/v1/admin/vehicle-scenarios
export const getAllVehicleScenarios = async (req: Request, res: Response) => {
  try {
    const tenantId = tenantIdFromRequest(req);
    const vehicleScenarios = await vehicleScenarioService.getAllVehicleScenarios(tenantId);
    res.json(vehicleScenarios);
  } catch (error) {
    res.status(500).json({ message: "Error fetching vehicle scenarios" });
  }
};

// GET /api/v1/admin/vehicle-scenarios/:id
export const getVehicleScenarioById = async (req: Request, res: Response) => {
  try {
    const tenantId = tenantIdFromRequest(req);
    const { id } = req.params;
    const vehicleScenario = await vehicleScenarioService.getVehicleScenarioById(tenantId, id);
    if (vehicleScenario) {
      res.json(vehicleScenario);
    } else {
      res.status(404).json({ message: "Vehicle scenario not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching vehicle scenario" });
  }
};

// POST /api/v1/admin/vehicle-scenarios
export const createVehicleScenario = async (req: Request, res: Response) => {
  try {
    const tenantId = tenantIdFromRequest(req);
    const newVehicleScenario = await vehicleScenarioService.createVehicleScenario(tenantId, req.body);
    res.status(201).json(newVehicleScenario);
  } catch (error) {
    res.status(500).json({ message: "Error creating vehicle scenario" });
  }
};

// PUT /api/v1/admin/vehicle-scenarios/:id
export const updateVehicleScenario = async (req: Request, res: Response) => {
  try {
    const tenantId = tenantIdFromRequest(req);
    const { id } = req.params;
    const updatedVehicleScenario = await vehicleScenarioService.updateVehicleScenario(tenantId, id, req.body);
    if (updatedVehicleScenario) {
      res.json(updatedVehicleScenario);
    } else {
      res.status(404).json({ message: "Vehicle scenario not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating vehicle scenario" });
  }
};

// DELETE /api/v1/admin/vehicle-scenarios/:id
export const deleteVehicleScenario = async (req: Request, res: Response) => {
  try {
    const tenantId = tenantIdFromRequest(req);
    const { id } = req.params;
    await vehicleScenarioService.deleteVehicleScenario(tenantId, id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Error deleting vehicle scenario" });
  }
};
