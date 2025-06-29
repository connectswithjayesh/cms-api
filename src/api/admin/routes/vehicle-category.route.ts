import { Router, Application } from "express";
import { validateRequest } from "../middleware/validateRequest";
import { createVehicleCategory, getVehicleCategory, listVehicleCategory, trashRestoreVehicleCategory, updateVehicleCategory } from "../controller/vehicle-category.controller";
import { vehicleCategorySchema } from "../schemas/vehicle-category.schema";

const router = Router();

router.get("/", listVehicleCategory);
router.get("/:vehicleCatID", getVehicleCategory);
router.post("/", validateRequest(vehicleCategorySchema, "body"), createVehicleCategory);
router.post("/trashRestore", trashRestoreVehicleCategory);
router.put("/:vehicleCatID", validateRequest(vehicleCategorySchema, "body"), updateVehicleCategory);

export default (app: Application) =>
  app.use(`${process.env.BASE_URL}/vehicle-category`, router);
