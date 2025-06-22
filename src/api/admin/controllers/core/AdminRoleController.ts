import { Request, Response } from "express";
import { RxDB } from "../../../../services/common/DBService";
import { sendResponse } from "../../../../services/common/ResponseUtil";
import { hashPassword } from "../../../../services/common/hash";
import { HttpResp } from "../../../../types/http.type";
import {
  checkDublicate,
  mxOrderBy,
} from "../../../../services/common/DBHelper";
import { z } from "zod";
import { handleZodErrorCombined } from "../../../../services/common/ZodHelper";

export default class AdminRoleController {
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
      const roleID = Number(req?.params?.roleID) || 0;
      if (!roleID) {
        throw new Error("roleID is required.");
      }
      const DB = new RxDB();
      DB.vals = [roleID, 1];
      DB.types = "ii";
      DB.sql = `SELECT AR.roleID, AR.roleName, AR.roleEmail, AR.rolePage, AR.roleKey, AR.status, AR.xOrder, AR.parentID, AR.orgID FROM ${DB.pre}x_admin_role AS AR WHERE AR.roleID = ? AND AR.status= ?`;
      await DB.dbRow();
      if (DB.numRows > 0) {
        let roleData = DB.row;
        roleData["access"] = await this.getAccessM(roleData["roleID"]);
        response["data"] = roleData;
        response["code"] = 200;
        response["msg"] = "role fetch successfully";
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
      let whrClause = "AR.status = ?";

      const offset: any = queryParams?.offset ?? 0;
      const showRecord: any = queryParams?.show ?? 20;

      if (queryParams?.roleID) {
        whrVals.push(Number(queryParams?.roleID));
        whrTypes += "i";
        whrClause += " AND AR.roleID=?";
      }

      if (queryParams?.roleName) {
        whrVals.push(queryParams?.roleName);
        whrTypes += "s";
        whrClause += ' AND AR.roleName LIKE CONCAT("%",?,"%")';
      }

      if (queryParams?.roleKey) {
        whrVals.push(queryParams?.roleKey);
        whrTypes += "s";
        whrClause += ' AND AR.roleKey LIKE CONCAT("%",?,"%")';
      }

      // step 1 : Get record count
      const DB = new RxDB();
      DB.vals = whrVals;
      DB.types = whrTypes;

      DB.sql = `SELECT AR.roleID FROM ${DB.pre}x_admin_role AS AR WHERE ${whrClause}`;
      await DB.dbQuery();

      const totRec = DB.numRows;

      // step 2 : Get Record
      DB.vals = whrVals;
      DB.types = whrTypes;
      const d: any = await mxOrderBy(req, "roleID DESC");
      const limit = ` LIMIT ${offset},${showRecord}`;

      DB.sql = `SELECT AR.roleID , AR.orgID, AR.roleName, AR.roleEmail, AR.rolePage, AR.roleKey, AR.status, AR.xOrder, AR.parentID 
                FROM ${DB.pre}x_admin_role AS AR WHERE ${whrClause} ${d} ${limit}`;
      await DB.dbRows();

      if (DB.numRows > 0) {
        response["count"] = totRec;
        response["msg"] = "Admin Role fetch successfully";
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

  public async menu(req: Request, res: Response) {
    const response: any = {
      res,
      msg: "Record not found!",
      status: true,
      data: [],
      code: 200,
    };

    try {
      let whrVals = [1];
      let whrTypes = "i";
      let whrClause = "AM.status = ?";

      const DB = new RxDB();
      DB.vals = whrVals;
      DB.types = whrTypes;

      DB.sql = `SELECT AM.adminMenuID, AM.menuTitle, AM.seoUri, AM.hideMenu, AM.forceNav, AM.status, AM.xOrder, AM.params, AM.menuType FROM ${DB.pre}x_admin_menu AS AM WHERE ${whrClause}`;
      await DB.dbRows();

      response["msg"] = "Menu fetch successfully";
      response["data"] = DB.rows;
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
      msg: "Fail to add Role.",
      status: false,
      data: {},
      code: 400,
    };

    try {
      const validatedData = req?.body || {};
      const DB = new RxDB();
      const adminRoleData: any = {
        orgID: validatedData?.orgID,
        parentID: validatedData?.parentID || "",
        roleName: validatedData?.roleName || "",
        roleEmail: validatedData?.roleEmail || "",
        roleKey: validatedData?.roleKey || "",
      };

      DB.data = adminRoleData;
      DB.table = `${DB.pre}x_admin_role`;
      if (await DB.dbInsert()) {
        validatedData["roleID"] = DB.insertID;
        if (validatedData?.access) {
          this.addUserAccessM(validatedData["roleID"], validatedData["access"]);
        }

        response["data"] = validatedData;
        response["msg"] = "Role added successfully.";
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
      msg: "Fail to update admin user.",
      status: false,
      data: {},
      code: 400,
    };
    try {
      const roleID = Number(req?.params?.roleID) || 0;
      if (!roleID) {
        throw new Error("roleID is required.");
      }
      const validatedData = req?.body || {};
      const DB = new RxDB();
      const adminRoleData: any = {
        orgID: validatedData?.orgID,
        parentID: validatedData?.parentID || "",
        roleName: validatedData?.roleName || "",
        roleEmail: validatedData?.roleEmail || "",
        roleKey: validatedData?.roleKey || "",
      };

      DB.table = `${DB.pre}x_admin_role`;
      DB.data = adminRoleData;
      await DB.dbUpdate("roleID=?", "i", [roleID]);

      if (DB.numRows > 0) {
        await this.deleteRoleAccessM(roleID);
        if (validatedData?.access) {
          await this.addUserAccessM(roleID, validatedData["access"]);
          response["data"] = validatedData;
          response["msg"] = "Role updated successfully.";
          response["code"] = 200;
          response["status"] = true;
        }
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

  public async addUserAccessM(roleID = 0, roleAccessArr: any = []) {
    for (const [adminMenuID, v] of Object?.entries(roleAccessArr)) {
      if (Array?.isArray(v) && v?.length > 0) {
        const data = {
          roleID: roleID,
          adminMenuID: adminMenuID,
          accessType: JSON.stringify(v),
        };
        const DB = new RxDB();
        DB.table = DB.pre + "x_admin_role_access";
        DB.data = data;
        await DB.dbInsert();
      }
    }
    return;
  }

  public async getAccessM(roleID = 0) {
    const arr: any = {};
    if (roleID) {
      const DB = new RxDB();
      DB.vals = [roleID];
      DB.sql = `SELECT * FROM ${DB.pre}x_admin_role_access WHERE roleID = ?`;
      const s: any[] = await DB.dbRows();
      for (const el of s) {
        arr[el.adminMenuID] = JSON.parse(el.accessType);
      }
    }
    return arr;
  }

  public async deleteRoleAccessM(roleID: number) {
    try {
      const DB = new RxDB();
      DB.vals = [1, roleID];
      DB.sql = `DELETE FROM ${DB.pre}x_admin_role_access WHERE status = ? AND roleID = ?`;
      await DB.dbQuery();
      return;
    } catch (err: any) {
      throw new Error(err?.message);
    }
  }
}
