import { Request, Response } from "express";
import {
  createVehicleCategoryM,
  getVehicleCategoryM,
  listVehicleCategoryM,
  trashRestoreVehicleCategoryM,
  updateVehicleCategoryM,
} from "../model/vehicle-category.model";
import { sendResponse } from "../../../services/common/ResponseUtil";

export const listVehicleCategory = async (req: Request, res: Response) => {
  const response: any = {
    res,
    msg: "Fail to fetch vehicle category",
    status: true,
    data: {},
    code: 200,
  };
  try {
    const reqQuery = req?.query;
    const { count, data } = await listVehicleCategoryM(reqQuery);
    response["data"] = data;
    response["count"] = count;
    response["msg"] = "vehicle category fetch successfully.";
    response["code"] = 200;
    response["status"] = true;
    return sendResponse(response);
  } catch (error: any) {
    response["status"] = false;
    response["code"] = 400;
    response["msg"] = error?.message;
    return sendResponse(response);
  }
};

export const createVehicleCategory = async (req: Request, res: Response) => {
  const response: any = {
    res,
    msg: "Fail to add vehicle category",
    status: true,
    data: {},
    code: 400,
  };

  try {
    let reqBody: any = req?.body || {};
    const vehicleData: any = await createVehicleCategoryM(reqBody);
    response["data"] = vehicleData;
    response["msg"] = "vehicle category added successfully.";
    response["code"] = 200;
    response["status"] = true;
    return sendResponse(response);
  } catch (error: any) {
    response["status"] = false;
    response["code"] = 400;
    response["msg"] = error?.message;
    return sendResponse(response);
  }
};

export const updateVehicleCategory = async (req: Request, res: Response) => {
  const response: any = {
    res,
    msg: "Fail to updated vehicle category",
    status: true,
    data: {},
    code: 400,
  };
  try {
    const vehicleCatID = Number(req?.params?.vehicleCatID) || 0;
    let reqBody: any = req?.body || {};
    const vehicleData: any = await updateVehicleCategoryM(
      vehicleCatID,
      reqBody
    );
    response["data"] = vehicleData;
    response["msg"] = "vehicle category updated successfully.";
    response["code"] = 200;
    response["status"] = true;
    return sendResponse(response);
  } catch (error: any) {
    response["status"] = false;
    response["code"] = 400;
    response["msg"] = error?.message;
    return sendResponse(response);
  }
};

export const getVehicleCategory = async (req: Request, res: Response) => {
  const response: any = {
    res,
    msg: "Fail to get vehicle category",
    status: true,
    data: {},
    code: 400,
  };
  try {
    const vehicleCatID = Number(req?.params?.vehicleCatID) || 0;

    const vehicleCatData: any = await getVehicleCategoryM(vehicleCatID);
    response["data"] = vehicleCatData;
    response["msg"] = "vehicle category fetch successfully.";
    response["code"] = 200;
    response["status"] = true;
    return sendResponse(response);
  } catch (error: any) {
    response["status"] = false;
    response["code"] = 400;
    response["msg"] = error?.message;
    return sendResponse(response);
  }
};

export const trashRestoreVehicleCategory = async (
  req: Request,
  res: Response
) => {
  const response: any = {
    res,
    msg: "Fail to trash or restore record",
    status: true,
    data: {},
    code: 400,
  };
  const reqBody = req?.body || {};

  try {
    await trashRestoreVehicleCategoryM(reqBody);
    response["data"] = reqBody;
    response["msg"] = `vehicle category ${req.body.action} successfully.`;
    response["code"] = 200;
    response["status"] = true;
    return sendResponse(response);
  } catch (error: any) {
    response["status"] = false;
    response["code"] = 400;
    response["msg"] = error?.message;
    return sendResponse(response);
  }
};
