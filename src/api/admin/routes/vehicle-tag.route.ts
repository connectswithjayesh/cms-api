import { Router, Application } from "express";
import { createVehicleTag, getVehicleTag, listVehicleTag, trashRestoreVehicleTag, updateVehicleTag } from "../controller/vehicle-tag.controller";
import { validateRequest } from "../middleware/validateRequest";
import { vehicleTagSchema } from "../schemas/vehicle-tag.schema";

const router = Router();

router.get("/", listVehicleTag);
router.get("/:vehicleTagID", getVehicleTag);
router.post("/", validateRequest(vehicleTagSchema, "body"), createVehicleTag);
router.post("/trashRestore", trashRestoreVehicleTag);
router.put("/:vehicleTagID", validateRequest(vehicleTagSchema, "body"), updateVehicleTag);




export default (app: Application) =>
  app.use(`${process.env.BASE_URL}/vehicle-tag`, router);
