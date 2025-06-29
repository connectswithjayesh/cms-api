import { Request, Response } from "express";
import {
  createFuelTypeM,
  getFuelTypeM,
  listFuelTypeM,
  trashRestoreFuelTypeM,
  updateFuelTypeM,
} from "../model/fuel-type.model";
import { sendResponse } from "../../../services/common/ResponseUtil";

export const listFuelType = async (req: Request, res: Response) => {
  const response: any = {
    res,
    msg: "Fail to fetch fuel type",
    status: true,
    data: {},
    code: 200,
  };
  try {
    const reqQuery = req?.query;
    const { count, data } = await listFuelTypeM(reqQuery);
    response["data"] = data;
    response["count"] = count;
    response["msg"] = "fuel type fetch successfully.";
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

export const createFuelType = async (req: Request, res: Response) => {
  const response: any = {
    res,
    msg: "Fail to add fuel type",
    status: true,
    data: {},
    code: 400,
  };

  try {
    let reqBody: any = req?.body || {};
    const vehicleData: any = await createFuelTypeM(reqBody);
    response["data"] = vehicleData;
    response["msg"] = "fuel type added successfully.";
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

export const updateFuelType = async (req: Request, res: Response) => {
  const response: any = {
    res,
    msg: "Fail to updated vehicle tag",
    status: true,
    data: {},
    code: 400,
  };
  try {
    const fuelTypeID = Number(req?.params?.fuelTypeID) || 0;
    let reqBody: any = req?.body || {};
    const fuelData: any = await updateFuelTypeM(fuelTypeID, reqBody);
    response["data"] = fuelData;
    response["msg"] = "fuel type updated successfully.";
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

export const getFuelType = async (req: Request, res: Response) => {
  const response: any = {
    res,
    msg: "Fail to get vehicle tag",
    status: true,
    data: {},
    code: 400,
  };
  try {
    const fuelTypeID = Number(req?.params?.fuelTypeID) || 0;

    const fuelTypeData: any = await getFuelTypeM(fuelTypeID);
    response["data"] = fuelTypeData;
    response["msg"] = "fuel type fetch successfully.";
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

export const trashRestoreFuelType = async (req: Request, res: Response) => {
  const response: any = {
    res,
    msg: "Fail to trash or restore record",
    status: true,
    data: {},
    code: 400,
  };
  const reqBody = req?.body || {};

  try {
    await trashRestoreFuelTypeM(reqBody);
    response["data"] = reqBody;
    response["msg"] = `fuel type ${req.body.action} successfully.`;
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
