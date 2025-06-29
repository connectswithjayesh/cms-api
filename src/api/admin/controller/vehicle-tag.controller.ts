import { Request, Response } from "express";
import {
  createVehicleTagM,
  getVehicleTagM,
  listVehicleTagM,
  trashRestoreVehicleTagM,
  updateVehicleTagM,
} from "../model/vehicle-tag.model";
import { sendResponse } from "../../../services/common/ResponseUtil";

export const listVehicleTag = async (req: Request, res: Response) => {
  const response: any = {
    res,
    msg: "Fail to fetch vehicle tag",
    status: true,
    data: {},
    code: 200,
  };
  try {
    const reqQuery = req?.query;
    const { count, data } = await listVehicleTagM(reqQuery);
    response["data"] = data;
    response["count"] = count;
    response["msg"] = "vehicle tag fetch successfully.";
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

export const createVehicleTag = async (req: Request, res: Response) => {
  const response: any = {
    res,
    msg: "Fail to add vehicle tag",
    status: true,
    data: {},
    code: 400,
  };

  try {
    let reqBody: any = req?.body || {};
    const vehicleData: any = await createVehicleTagM(reqBody);
    response["data"] = vehicleData;
    response["msg"] = "vehicle tag added successfully.";
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

export const updateVehicleTag = async (req: Request, res: Response) => {
  const response: any = {
    res,
    msg: "Fail to updated vehicle tag",
    status: true,
    data: {},
    code: 400,
  };
  try {
    const vehicleTagID = Number(req?.params?.vehicleTagID) || 0;
    let reqBody: any = req?.body || {};
    const vehicleData: any = await updateVehicleTagM(vehicleTagID, reqBody);
    response["data"] = vehicleData;
    response["msg"] = "vehicle tag updated successfully.";
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

export const getVehicleTag = async (req: Request, res: Response) => {
  const response: any = {
    res,
    msg: "Fail to get vehicle tag",
    status: true,
    data: {},
    code: 400,
  };
  try {
    const vehicleTagID = Number(req?.params?.vehicleTagID) || 0;

    const vehicleTagData: any = await getVehicleTagM(vehicleTagID);
    response["data"] = vehicleTagData;
    response["msg"] = "vehicle tag fetch successfully.";
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

export const trashRestoreVehicleTag = async (req: Request, res: Response) => {
  const response: any = {
    res,
    msg: "Fail to trash or restore record",
    status: true,
    data: {},
    code: 400,
  };
  const reqBody = req?.body || {};

  try {
    await trashRestoreVehicleTagM(reqBody);
    response["data"] = reqBody;
    response["msg"] = `Vehicle Tag ${req.body.action} successfully.`;
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
