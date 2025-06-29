import { Request, Response } from "express";
import { RxDB } from "../../../../services/common/DBService";
import { sendResponse } from "../../../../services/common/ResponseUtil";
import { HttpResp } from "../../../../types/http.type";
import {
  checkDublicate,
  mxOrderBy,
} from "../../../../services/common/DBHelper";
import { handleZodErrorCombined } from "../../../../services/common/ZodHelper";
import { z } from "zod";
import { seoUri } from "../../../../services/common/setting";

export default class AdminMenuController {
  constructor() {}

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
      let whrClause = "AM.status = ?";

      const offset: any = queryParams?.offset ?? 0;
      const showRecord: any = queryParams?.show ?? 20;

      // step 1 : Get record count
      const DB = new RxDB();
      DB.vals = whrVals;
      DB.types = whrTypes;

      DB.sql = `SELECT adminMenuID FROM ${DB.pre}x_admin_menu AS AM WHERE ${whrClause}`;
      await DB.dbQuery();

      const totRec = DB.numRows;

      // step 2 : Get Record
      DB.vals = whrVals;
      DB.types = whrTypes;
      const d: any = await mxOrderBy(req?.query, "adminMenuID DESC");
      const limit = ` LIMIT ${offset},${showRecord}`;

      DB.sql = `SELECT adminMenuID, menuType, menuTitle, seoUri, parentID, params, forceNav, hideMenu, xOrder FROM ${DB.pre}x_admin_menu AS AM WHERE ${whrClause} ${d} ${limit}`;
      await DB.dbRows();

      if (DB.numRows > 0) {
        response["count"] = totRec;
        response["msg"] = "Admin Menu fetch successfully";
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

  public async sidebarMenu(req: Request, res: Response) {
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
      const d: any = await mxOrderBy(req?.query, "xOrder ASC");

      DB.sql = `SELECT CAST(adminMenuID AS CHAR) as adminMenuID,menuType,menuTitle,seoUri,parentID,params,forceNav,hideMenu,xOrder FROM ${DB.pre}x_admin_menu WHERE ${whrClause} ${d}`;
      await DB.dbRows();

      const arrMenu = await this.getArrTree(
        DB.rows || [],
        "adminMenuID",
        "parentID",
        0
      );
      response["data"] = arrMenu;
      response["status"] = true;
      response["code"] = 200;
      response["msg"] =
        DB.numRows > 0
          ? "Sidebar Menus fetch successfully"
          : "No Sidebar Menus found.";

      sendResponse(response);
    } catch (error: any) {
      response["msg"] = error?.message;
      response["code"] = 400;
      response["status"] = false;
      sendResponse(response);
    }
  }

  public async getArrTree(
    arr: any,
    nmID = "adminMenuID",
    nmParent = "parentID",
    id = 0
  ) {
    const result: any[] = [];
    for (const item of arr) {
      if (id == item[nmParent]) {
        item.childs = await this.getArrTree(arr, nmID, nmParent, item[nmID]);
        result.push(item);
      }
    }

    return result;
  }

  public async add(req: Request, res: Response) {
    const response: HttpResp = {
      res,
      msg: "Fail to add menu",
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
      DB.table = `${DB.pre}x_admin_menu`;
      if (await DB.dbInsert()) {
        validatedData["adminMenuID"] = DB.insertID;
        response["data"] = validatedData;
        response["msg"] = "Menu added successfully.";
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

  public async view(req: Request, res: Response) {
    const response: any = {
      res,
      msg: "Record not found!",
      status: false,
      data: {},
      code: 400,
    };
    try {
      const adminMenuID = Number(req?.params?.adminMenuID) || 0;
      if (!adminMenuID) {
        throw new Error("adminMenuID is required.");
      }
      const DB = new RxDB();
      DB.vals = [adminMenuID];
      DB.types = "i";
      DB.sql = `SELECT adminMenuID, menuTitle, seoUri, hideMenu, forceNav,status,xOrder,params,menuType, parentID
              FROM ${DB.pre}x_admin_menu WHERE adminMenuID = ?`;
      await DB.dbRow();
      if (DB.numRows > 0) {
        response["data"] = DB.row;
        response["code"] = 200;
        response["msg"] = "Admin user fetch successfully";
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

  public async update(req: Request, res: Response) {
    const response: any = {
      res,
      msg: "Fail to update menu.",
      status: false,
      data: {},
      code: 400,
    };
    try {
      const adminMenuID = Number(req?.params?.adminMenuID) || 0;
      if (!adminMenuID) {
        throw new Error("adminMenuID is required.");
      }
      const DB = new RxDB();
      const reqBody = req?.body || {};
      DB.data = reqBody;
      DB.table = `${DB.pre}x_admin_menu`;
      await DB.dbUpdate("adminMenuID=?", "i", [adminMenuID]);
      if (DB.numRows > 0) {
        response["data"] = reqBody;
        response["msg"] = "Menu updated successfully.";
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

  public async reCreateMenu(req: Request, res: Response) {
    const response: any = {
      res,
      msg: "Fail to update menu.",
      status: false,
      data: {},
      code: 400,
    };
    try {
      const arrFModules = seoUri;
      let addCnt = 0;
      let delCnt = 0;
      if (Array.isArray(arrFModules) && arrFModules.length > 0) {
        const seoUri = "'" + arrFModules.join("','") + "'";
        const DB = new RxDB();
        DB.vals = arrFModules;
        const placeholders = Array(arrFModules.length).fill("?").join(",");
        DB.sql = `DELETE FROM ${DB.pre}x_admin_role_access WHERE adminMenuID IN(SELECT DISTINCT(adminMenuID) FROM ${DB.pre}x_admin_menu WHERE seoUri NOT IN(${placeholders}))`;
        await DB.dbQuery();

        const DB1 = new RxDB();
        DB1.sql = `DELETE FROM ${DB1.pre}x_admin_menu WHERE seoUri NOT IN(${seoUri}) AND menuType=0`;
        if (await DB1.dbQuery()) {
          delCnt = delCnt + DB.affectedRows;
        }

        const DB2 = new RxDB();
        DB2.vals = [0];
        DB2.sql = `SELECT DISTINCT(parentID) AS parentID FROM ${DB2.pre}x_admin_menu WHERE menuType=?`;
        await DB2.dbRows();
        if (DB2.numRows > 0) {
          let arrPID: any[] = [];
          for (const d of DB2.rows) {
            // Assuming that accessing d.parentID or some processing here is asynchronous
            arrPID.push(d.parentID);
          }
          if (arrPID.length > 0) {
            let d = arrPID.join(",");
            const DB3 = new RxDB();
            DB3.sql = `DELETE FROM ${DB3.pre}x_admin_menu WHERE menuType=1 AND adminMenuID NOT IN (${d})`;
            if (await DB3.dbQuery()) {
              delCnt = delCnt + DB3.affectedRows;
            }
          }
        }

        let arrAModules: any[] = [];
        const DB4 = new RxDB();
        DB4.sql = `SELECT seoUri FROM ${DB4.pre}x_admin_menu`;

        await DB4.dbRows();
        if (DB4.rows.length > 0) {
          for (const d of DB4.rows) {
            arrAModules.push(d.seoUri);
          }
        }

        let arrInsert;
        if (arrAModules.length > 0) {
          arrInsert = arrFModules.filter(
            (module) => !arrAModules.includes(module)
          );
        } else {
          arrInsert = arrFModules;
        }

        if (arrInsert && arrInsert.length > 0) {
          await this.resetAutoIncreament(
            DB4.pre + "x_admin_menu",
            "adminMenuID"
          );
          for (const m of arrInsert) {
            const DB5 = new RxDB();
            DB5.data = {
              menuType: "0",
              menuTitle: m
                ?.replace(/-/g, " ")
                .replace(/^./, (str: any) => str.toUpperCase()),
              parentID: "0",
              seoUri: m,
              status: "1",
            };

            DB5.table = DB5.pre + "x_admin_menu";
            if (await DB5.dbInsert()) {
              addCnt++;
            }
          }
        }
        response["data"] = [];
        response["code"] = 200;
        response["msg"] = "Admin menu reset successfully.";
        response["status"] = true;
      }
    } catch (error: any) {
      response["msg"] = error?.message;
      response["code"] = 400;
      response["status"] = false;
    }
    sendResponse(response);
  }

  public async resetAutoIncreament(tbl = "", pk = "") {
    if (tbl !== "" && pk !== "") {
      const DB = new RxDB();
      let maxVal: any = "1";
      DB.sql = `SELECT MAX(${pk}) AS maxVal FROM ${tbl}`;
      await DB.dbRow();
      if (DB.row?.["maxVal"]) {
        maxVal = DB.row?.["maxVal"] + 1;
      }

      const DB1 = new RxDB();
      DB1.sql = `ALTER TABLE ${tbl} AUTO_INCREMENT = ${maxVal}`;
      await DB1.dbQuery();
    }
    return;
  }
}
