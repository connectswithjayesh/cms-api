import { Router, Application } from "express";
import { validateRequest } from "../middleware/validateRequest";
import { fuelTypeSchema } from "../schemas/fuel-type.schema";
import { createFuelType, getFuelType, listFuelType, trashRestoreFuelType, updateFuelType } from "../controller/fuel-type.controller";

const router = Router();

router.get("/", listFuelType);
router.get("/:fuelTypeID", getFuelType);
router.post("/", validateRequest(fuelTypeSchema, "body"), createFuelType);
router.post("/trashRestore", trashRestoreFuelType);
router.put("/:fuelTypeID", validateRequest(fuelTypeSchema, "body"), updateFuelType);

export default (app: Application) =>
  app.use(`${process.env.BASE_URL}/fuel-type`, router);
