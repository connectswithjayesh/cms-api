import { Request, Response } from "express";
import { RxDB } from "../../../../services/common/DBService";
import { sendResponse } from "../../../../services/common/ResponseUtil";
import { mxOrderBy } from "../../../../services/common/DBHelper";

export default class AdminMasterController {
  constructor() {}

  /**
   * @param desc return organization list
   * @param req
   * @param res
   */
  public async organizationList(req: Request, res: Response) {
    const response: any = {
      res,
      msg: "No organizations found.",
      status: true,
      data: [],
      code: 200,
    };

    try {
      const queryParams = req.query;

      // Set default status
      const status = queryParams["status"] ? Number(queryParams["status"]) : 1;
      const whrVals = [status];
      const whrTypes = "i";
      const whrClause = "status = ?";

      const DB = new RxDB();
      DB.vals = whrVals;
      DB.types = whrTypes;
      DB.sql = `SELECT orgID AS id, orgName AS value FROM ${DB.pre}x_organization WHERE ${whrClause}`;
      await DB.dbQuery();
      const orgList = DB.rows;

      response["data"] = orgList;
      response["status"] = true;
      response["code"] = 200;
      response["msg"] =
        DB.numRows > 0
          ? "Organization list fetched successfully."
          : "No organizations found.";

      sendResponse(response);
    } catch (error: any) {
      response["msg"] = error?.message;
      response["code"] = 400;
      response["status"] = false;
      sendResponse(response);
    }
  }

  /**
   * @param desc return admin role list
   * @param req
   * @param res
   */
  public async roleList(req: Request, res: Response) {
    const response: any = {
      res,
      msg: "No Admin Role found.",
      status: true,
      data: [],
      code: 200,
    };

    try {
      const queryParams = req.query;

      // Set default status
      const status = queryParams["status"] ? Number(queryParams["status"]) : 1;
      const whrVals = [status];
      const whrTypes = "i";
      const whrClause = "status = ?";

      const DB = new RxDB();
      DB.vals = whrVals;
      DB.types = whrTypes;
      DB.sql = `SELECT roleID AS id, roleName AS value FROM ${DB.pre}x_admin_role WHERE ${whrClause}`;
      await DB.dbQuery();
      const orgList = DB.rows;

      response["data"] = orgList;
      response["status"] = true;
      response["code"] = 200;
      response["msg"] =
        DB.numRows > 0
          ? "Admin Role list fetched successfully."
          : "No admin role found.";

      sendResponse(response);
    } catch (error: any) {
      response["msg"] = error?.message;
      response["code"] = 400;
      response["status"] = false;
      sendResponse(response);
    }
  }

  public async menuDropDown(req: Request, res: Response) {
    const response: any = {
      res,
      msg: "No Menu found.",
      status: true,
      data: [],
      code: 200,
    };
    try {
      const status = 1;
      const whrVals = [status];
      const whrClause = "status = ?";

      const DB1 = new RxDB();
      DB1.vals = whrVals;
      const d: any = await mxOrderBy(req, "xOrder ASC");

      DB1.sql = `SELECT CAST(adminMenuID AS CHAR) as adminMenuID,menuType,menuTitle,seoUri,parentID,params,forceNav,hideMenu,xOrder FROM ${
        DB1.pre + "x_admin_menu"
      } WHERE ${whrClause} ${d}`;
      await DB1.dbRows();

      response["data"] = DB1.rows;
      response["status"] = true;
      response["code"] = 200;
      response["msg"] =
        DB1.numRows > 0 ? "Menu list fetched successfully." : "No menu found.";
    } catch (error: any) {
      response["msg"] = error?.message;
      response["code"] = 400;
      response["status"] = false;
    }
    sendResponse(response);
  }
}
