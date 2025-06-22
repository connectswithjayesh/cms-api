import { Request, Response } from "express";
import { RxDB } from "../../../../services/common/DBService";
import { sendResponse } from "../../../../services/common/ResponseUtil";
import { HttpResp } from "../../../../types/http.type";
import { mxOrderBy } from "../../../../services/common/DBHelper";
import { z } from "zod";
import { handleZodErrorCombined } from "../../../../services/common/ZodHelper";

export default class OrganizationController {
  constructor() {}

  public async view(req: Request, res: Response) {
    const response: any = {
      res,
      msg: "Record not found!",
      status: false,
      data: {},
      code: 400,
    };
    try {
      const orgID = Number(req?.params?.orgID) || 0;
      if (!orgID) {
        throw new Error("orgID is required.");
      }
      const DB = new RxDB();
      DB.vals = [orgID, 1];
      DB.types = "ii";
      DB.sql = `SELECT * FROM ${DB.pre}x_organization AS O WHERE O.orgID = ? AND O.status = ?`;
      await DB.dbRow();
      if (DB.numRows > 0) {
        response["data"] = DB.row;
        response["code"] = 200;
        response["msg"] = "Organization fetch successfully";
        response["status"] = true;
      }
      sendResponse(response);
    } catch (error: any) {
      response["msg"] = error?.message;
      response["code"] = 400;
      response["status"] = false;
      sendResponse(response);
    }
  }

  public async list(req: Request, res: Response) {
    const response: any = {
      res,
      msg: "Record not found!",
      status: true,
      data: [],
      code: 200,
    };
    try {
      const queryParams: any = req.query;
      const status = queryParams["status"] ? Number(queryParams["status"]) : 1;
      let whrVals = [status];
      let whrTypes = "i";
      let whrClause = "O.status = ?";

      const offset: any = queryParams?.offset ?? 0;
      const showRecord: any = queryParams?.show ?? 20;

      if (queryParams?.orgID) {
        whrVals.push(Number(queryParams?.orgID));
        whrTypes += "i";
        whrClause += " AND O.orgID=?";
      }

      if (queryParams?.orgName) {
        whrVals.push(queryParams?.orgName);
        whrTypes += "s";
        whrClause += ' AND O.orgName LIKE CONCAT("%",?,"%")';
      }

      if (queryParams?.orgEmail) {
        whrVals.push(queryParams?.orgEmail);
        whrTypes += "s";
        whrClause += ' AND O.orgEmail LIKE CONCAT("%",?,"%")';
      }

      if (queryParams?.orgDomain) {
        whrVals.push(queryParams?.orgDomain);
        whrTypes += "s";
        whrClause += ' AND O.orgDomain LIKE CONCAT("%",?,"%")';
      }

      // step 1 : Get record count
      const DB = new RxDB();
      DB.vals = whrVals;
      DB.types = whrTypes;

      DB.sql = `SELECT O.orgID FROM ${DB.pre}x_organization AS O
                WHERE ${whrClause}`;
      await DB.dbQuery();

      const totRec = DB.numRows;

      // step 2 : Get Record
      DB.vals = whrVals;
      DB.types = whrTypes;
      const d: any = await mxOrderBy(req, "orgID DESC");
      const limit = ` LIMIT ${offset},${showRecord}`;

      DB.sql = `SELECT O.orgID, O.orgName, O.orgEmail, O.orgDomain FROM ${DB.pre}x_organization AS O
                WHERE  ${whrClause} ${d} ${limit}`;
      await DB.dbRows();

      if (DB.numRows > 0) {
        response["count"] = totRec;
        response["msg"] = "Organization fetch successfully";
        response["data"] = DB.rows;
      }
      sendResponse(response);
    } catch (error: any) {
      response["msg"] = error?.message;
      response["code"] = 400;
      response["status"] = false;
      sendResponse(response);
    }
  }

  public async add(req: Request, res: Response) {
    const response: HttpResp = {
      res,
      msg: "Fail to add organization",
      status: false,
      data: {},
      code: 400,
    };

    try {
      const validatedData = req?.body || {};
      // const validatedData: adminUserAddSchemaT =
      //   adminUserAddSchema?.parse(reqBody);

      const DB = new RxDB();
      DB.data = validatedData;
      DB.table = `${DB.pre}x_organization`;
      if (await DB.dbInsert()) {
        validatedData["orgID"] = DB.insertID;
        response["data"] = validatedData;
        response["msg"] = "Organization added successfully.";
        response["code"] = 200;
        response["status"] = true;
      }

      sendResponse(response);
    } catch (error: any) {
      response["status"] = false;
      response["code"] = 400;
      if (error instanceof z.ZodError) {
        response["msg"] = await handleZodErrorCombined(error);
        // sendResponse(response);
      }
      response["msg"] = error?.message;
      sendResponse(response);
    }
  }

  public async update(req: Request, res: Response) {
    const response: any = {
      res,
      msg: "Fail to update organization.",
      status: false,
      data: {},
      code: 400,
    };
    try {
      const orgID = Number(req?.params?.orgID) || 0;
      if (!orgID) {
        throw new Error("orgID is required.");
      }

      const DB = new RxDB();

      const reqBody = req?.body || {};
      DB.data = reqBody;
      DB.table = `${DB.pre}x_organization`;
      await DB.dbUpdate("orgID=?", "i", [orgID]);
      if (DB.numRows > 0) {
        response["data"] = reqBody;
        response["msg"] = "Organization updated successfully.";
        response["code"] = 200;
        response["status"] = true;
      }
      sendResponse(response);
    } catch (error: any) {
      response["status"] = false;
      response["code"] = 400;
      if (error instanceof z.ZodError) {
        response["msg"] = handleZodErrorCombined(error);
        sendResponse(response);
      }
      response["msg"] = error?.message;
      sendResponse(response);
    }
  }
}
