import { Request, Response } from "express";
import { RxDB } from "../../../../services/common/DBService";
import { sendResponse } from "../../../../services/common/ResponseUtil";
import { hashPassword, verifyPassword } from "../../../../services/common/hash";
import { HttpResp } from "../../../../types/http.type";
import {
  checkDublicate,
  mxOrderBy,
} from "../../../../services/common/DBHelper";
import { z } from "zod";
import { handleZodErrorCombined } from "../../../../services/common/ZodHelper";
import {
  MXACCESS,
  MXADMINMENU,
} from "../../../../services/common/setting copy";
import {
  adminUserLoginSchema,
  adminUserLoginSchemaT,
} from "../../schemas/core/admin-user.schema";
import JwtService from "../../../../services/common/JwtService";
import { format } from "date-fns/format";

export default class AdminUserController {
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
      const userID = Number(req?.params?.userID) || 0;
      if (!userID) {
        throw new Error("userID is required.");
      }
      const DB = new RxDB();
      DB.vals = [userID, 1];
      DB.types = "ii";
      DB.sql = `SELECT AU.userID,AU.imageName,AU.displayName,AU.userName,AU.userEmail,AU.userMobile, AU.orgID, AU.roleID 
                FROM ${DB.pre}x_admin_user AS AU WHERE AU.userID = ? AND AU.status = ?`;
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
      let whrClause = "AU.status = ?";

      const offset: any = queryParams?.offset ?? 0;
      const showRecord: any = queryParams?.show ?? 20;

      if (queryParams?.userID) {
        whrVals.push(Number(queryParams?.userID));
        whrTypes += "i";
        whrClause += " AND AU.userID=?";
      }

      if (queryParams?.displayName) {
        whrVals.push(queryParams?.displayName);
        whrTypes += "s";
        whrClause += ' AND AU.displayName LIKE CONCAT("%",?,"%")';
      }

      if (queryParams?.userName) {
        whrVals.push(queryParams?.userName);
        whrTypes += "s";
        whrClause += ' AND AU.userName LIKE CONCAT("%",?,"%")';
      }

      if (queryParams?.userEmail) {
        whrVals.push(queryParams?.userEmail);
        whrTypes += "s";
        whrClause += ' AND AU.userEmail LIKE CONCAT("%",?,"%")';
      }

      if (queryParams?.userMobile) {
        whrVals.push(queryParams?.userMobile);
        whrTypes += "s";
        whrClause += " AND AU.userMobile=?";
      }

      // step 1 : Get record count
      const DB = new RxDB();
      DB.vals = whrVals;
      DB.types = whrTypes;

      DB.sql = `SELECT AU.userID FROM ${DB.pre}x_admin_user AS AU
                INNER JOIN ${DB.pre}x_admin_role AS AR ON AU.roleID = AR.roleID
                WHERE ${whrClause}`;
      await DB.dbQuery();

      const totRec = DB.numRows;

      // step 2 : Get Record
      DB.vals = whrVals;
      DB.types = whrTypes;
      const d: any = await mxOrderBy(req, "userID DESC");
      const limit = ` LIMIT ${offset},${showRecord}`;

      DB.sql = `SELECT AU.userID, AU.imageName, AU.displayName, AU.userName, AU.userEmail, AU.userMobile, AR.roleName, AU.dateLogin FROM ${DB.pre}x_admin_user AS AU
                INNER JOIN ${DB.pre}x_admin_role AS AR ON AU.roleID = AR.roleID
                WHERE  ${whrClause} ${d} ${limit}`;
      await DB.dbRows();

      if (DB.numRows > 0) {
        response["count"] = totRec;
        response["msg"] = "Admin User fetch successfully";
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
      msg: "Fail to add admin user.",
      status: false,
      data: {},
      code: 400,
    };

    try {
      const validatedData = req?.body || {};
      // const validatedData: adminUserAddSchemaT =
      //   adminUserAddSchema?.parse(reqBody);

      const DB = new RxDB();

      // check userName is duplicate
      let params = {
        tbl: `${DB.pre}x_admin_user`,
        pk: "userID",
        type: "s",
        fld: "userName",
        val: validatedData["userName"],
        title: "Login Name",
      };

      const validateUserName: any = await checkDublicate(params);
      if (!validateUserName?.status) {
        throw new Error(validateUserName?.msg);
      }

      validatedData.userPass = await hashPassword(validatedData["userPass"]);
      DB.data = validatedData;
      DB.table = `${DB.pre}x_admin_user`;
      if (await DB.dbInsert()) {
        validatedData["userID"] = DB.insertID;
        response["data"] = validatedData;
        response["msg"] = "Admin User added successfully.";
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
      const userID = Number(req?.params?.userID) || 0;
      if (!userID) {
        throw new Error("userID is required.");
      }

      const DB = new RxDB();

      const reqBody = req?.body || {};
      // const validatedData: adminUserUpdateSchemaT =
      //   adminUserUpdateSchema?.parse(reqBody);

      if (reqBody?.userPass && reqBody.userPass?.length) {
        try {
          reqBody.userPass = await hashPassword(reqBody["userPass"]);
        } catch (err: any) {
          throw new Error(err?.message);
        }
      } else {
        delete reqBody.userPass;
      }

      DB.data = reqBody;
      DB.table = `${DB.pre}x_admin_user`;

      // check userName is duplicate
      let params = {
        tbl: `${DB.pre}x_admin_user`,
        pid: userID,
        pk: "userID",
        type: "s",
        fld: "userName",
        val: reqBody["userName"],
        title: "Login Name",
      };
      const validateUserName: any = await checkDublicate(params);
      if (!validateUserName?.status) {
        throw new Error(validateUserName?.msg);
      }

      await DB.dbUpdate("userID=?", "i", [userID]);
      if (DB.numRows > 0) {
        response["data"] = reqBody;
        response["msg"] = "Admin User updated successfully.";
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

  public async login(req: Request, res: Response) {
    const response: any = {
      res,
      msg: "Please Login with valid userName and Password.",
      status: false,
      data: {},
      code: 400,
    };

    try {
      const reqBody = req?.body || {};
      const validatedData: adminUserLoginSchemaT =
        adminUserLoginSchema?.parse(reqBody);
      const { userName, password } = validatedData;
      if (userName === "xadmin" && password == "xadmin") {
        const userData = await this.getAdminSession("SUPER", []);
        const jwtData = {
          MXROLECENTERS: userData["MXROLECENTERS"],
          ORGIDS: userData["ORGIDS"],
          MXID: userData["MXID"],
          MXNAME: userData["MXNAME"],
          MXEMAIL: userData["MXEMAIL"],
          MXROLEKEY: userData["MXROLEKEY"],
          ORGID: userData["ORGID"],
          LOGOLIGHT: userData["LOGOLIGHT"],
          LOGOMODERATE: userData["LOGOMODERATE"],
          LOGODARK: userData["LOGODARK"],
          FAVICON: userData["FAVICON"],
          LOADERIMAGE: userData["LOADERIMAGE"],
          COLORMODERATE: userData["COLORMODERATE"],
          COLORDARK: userData["COLORDARK"],
          COLORLIGHT: userData["COLORLIGHT"],
          THEMEMODE: userData["THEMEMODE"],
          THEMETYPE: userData["THEMETYPE"],
        };
        try {
          const JWT = new JwtService();
          userData["TOKEN"] = await JWT.generateJwtToken(jwtData);
        } catch (e) {
          throw new Error("Fail to generate JWT token");
        }
        response["msg"] = "Login successfully.";
        response["code"] = 200;
        response["status"] = true;
        response["data"] = userData;
      } else {
        const DB = new RxDB();
        DB.vals = [userName, 1, 1];
        DB.types = "sii";
        DB.sql = `SELECT AU.displayName,AU.userEmail,AU.userID,AU.userPass,AU.roleID,AR.rolePage,AR.roleKey,roleKeyP,AR.parentID,AU.orgID,AR.roleKey
                      FROM ${DB.pre}x_admin_user AS AU
                      LEFT JOIN ${DB.pre}x_admin_role AS AR ON AU.roleID = AR.roleID
                      WHERE AU.userName=? AND AU.status=? AND AR.status=?`;
        const arrUsr = await DB.dbRow();
        if (DB.numRows > 0) {
          // verify password
          const isVerify = await verifyPassword(password, arrUsr["userPass"]);
          if (!isVerify) {
            throw new Error("Please Login with valid userName and Password.");
          }
          const userData = await this.getAdminSession(arrUsr["userID"], arrUsr);
          const jwtData = {
            MXROLECENTERS: userData["MXROLECENTERS"],
            ORGIDS: userData["ORGIDS"],
            MXID: userData["MXID"],
            MXNAME: userData["MXNAME"],
            MXEMAIL: userData["MXEMAIL"],
            MXROLEKEY: userData["MXROLEKEY"],
            ORGID: userData["ORGID"],
            LOGOLIGHT: userData["LOGOLIGHT"],
            LOGOMODERATE: userData["LOGOMODERATE"],
            LOGODARK: userData["LOGODARK"],
            FAVICON: userData["FAVICON"],
            LOADERIMAGE: userData["LOADERIMAGE"],
            COLORMODERATE: userData["COLORMODERATE"],
            COLORDARK: userData["COLORDARK"],
            COLORLIGHT: userData["COLORLIGHT"],
            THEMEMODE: userData["THEMEMODE"],
            THEMETYPE: userData["THEMETYPE"],
          };
          try {
            const JWT = new JwtService();
            userData["TOKEN"] = await JWT.generateJwtToken(jwtData);
          } catch (e) {
            throw new Error("Fail to generate JWT token");
          }
          const currentDate: string = format(new Date(), "yyyy-MM-dd HH:mm:ss");
          const DB = new RxDB();
          DB.vals = [currentDate, userData.MXID];
          DB.types = "si";
          DB.sql =
            "UPDATE " + DB.pre + "x_admin_user SET dateLogin=? WHERE userID=?";
          await DB.dbQuery();
          response["msg"] = "Login successfully.";
          response["code"] = 200;
          response["status"] = true;
          response["data"] = userData;
        }
      }

      // response.data = validatedData;
      sendResponse(response);
    } catch (error: any) {
      console.log(error);
      response["status"] = false;
      response["code"] = 400;
      if (error instanceof z.ZodError) {
        response["msg"] = handleZodErrorCombined(error);
        // sendResponse(response);
      }
      response["msg"] = error?.message;
      // console.log(response)
      sendResponse(response);
    }
  }

  public async getAdminSession(userID = "", userData: any = {}) {
    const userArr: any = {};
    if (userID == "SUPER") {
      userArr["LOGINTYPE"] = "backend";
      userArr["MXID"] = "SUPER";
      userArr["MXNAME"] = "Refurbedge Pvt Ltd";
      userArr["MXROLE"] = "SUPER";
      userArr["MXEMAIL"] = "it@refurbedge.com";
      const accArr = await this.getAccess("SUPER");
      userArr["MXACCESS"] = accArr["access"];
      userArr["MXMENU"] = accArr["menus"];
      userArr["MXCOREMENU"] = accArr["coremenus"];
      userArr["DEFAULTPAGE"] = "dashboard";
      userArr["ORGID"] = 0;
      const mxSet = await this.getSetting("", 0);
      userArr["THEMEMODE"] = "light";
      userArr["THEMETYPE"] = "compact";
      userArr["FONT"] = "small";
      userArr["PAGETITLE"] = mxSet["PAGETITLE"];
      userArr["COLORMODERATE"] = mxSet["COLORMODERATE"];
      userArr["COLORDARK"] = mxSet["COLORDARK"];
      userArr["COLORLIGHT"] = mxSet["COLORLIGHT"];
      userArr["MXROLEKEY"] = "admin";
      userArr[
        "LOGOLIGHT"
      ] = `${global.UPLOADURL}/setting/${mxSet["LOGOLIGHT"]}`;
      userArr[
        "LOGOMODERATE"
      ] = `${global.UPLOADURL}/setting/${mxSet["LOGOMODERATE"]}`;
      userArr["LOGODARK"] = `${global.UPLOADURL}/setting/${mxSet["LOGODARK"]}`;
      userArr["FAVICON"] = `${global.UPLOADURL}/setting/${mxSet["FAVICON"]}`;
      userArr[
        "LOADERIMAGE"
      ] = `${global.UPLOADURL}/setting/${mxSet["LOADERIMAGE"]}`;
    } else {
      const DB = new RxDB();
      if (userData && Object.keys(userData).length) {
        DB.types = "i";
        DB.vals = [userID];
        DB.sql = `SELECT AU.displayName,AU.userEmail,AU.userID,AU.roleID,AR.rolePage,AR.roleKey,roleKeyP,AR.parentID,AU.orgID,AU.thememode,AU.themetype
                          FROM ${DB.pre}x_admin_user AS AU
                          LEFT JOIN ${DB.pre}x_admin_role AS AR ON AU.roleID = AR.roleID
                          WHERE AU.userID = ?`;
        userData = await DB.dbRow();
      }
      const accArr: any = await this.getAccess(userData["roleID"]);
      userArr["MXACCESS"] = accArr["access"];
      userArr["MXMENU"] = accArr["menus"];
      userArr["MXCOREMENU"] = accArr["coremenus"];
      userArr["LOGINTYPE"] = "backend";
      userArr["MXID"] = userData["userID"];
      userArr["MXNAME"] = userData["displayName"];
      userArr["MXEMAIL"] = userData["userEmail"];
      userArr["MXROLE"] = userData["roleID"];
      userArr["MXROLEP"] = userData["parentID"];
      userArr["MXROLEKEY"] = userData["roleKey"];
      userArr["MXROLEKEYP"] = userData["roleKeyP"];
      userArr["THEMEMODE"] = userData["thememode"]
        ? userData["thememode"]
        : "light";
      userArr["THEMETYPE"] = userData["themetype"]
        ? userData["themetype"]
        : "normal";

      userArr["FONT"] = userData["userFont"] ? userData["userFont"] : "small";
      userArr["DEFAULTPAGE"] = userData["rolePage"];
      userArr["ORGID"] = userData["orgID"];

      const DB1 = new RxDB();
      DB1.vals = [userData["roleID"]];
      DB1.types = "i";
      DB1.sql = `SELECT GROUP_CONCAT(roleID SEPARATOR ',') AS strRoleIDs FROM ${DB1.pre}x_admin_role WHERE parentID=? GROUP BY NULL`;
      await DB1.dbRow();
      if (DB1.numRows > 0) {
        const arrRoleIDs = DB1.row.strRoleIDs.split(",");
        userArr["MXROLEC"] = arrRoleIDs;
      }
      const mxSet = await this.getSetting("", userData["orgID"]);
      userArr["PAGETITLE"] = mxSet["PAGETITLE"];
      userArr["COLORMODERATE"] = mxSet["COLORMODERATE"];
      userArr["COLORDARK"] = mxSet["COLORDARK"];
      userArr["COLORLIGHT"] = mxSet["COLORLIGHT"];
      userArr[
        "LOGOLIGHT"
      ] = `${process?.env?.UPLOAD_URL}/setting/${mxSet["LOGOLIGHT"]}`;
      userArr[
        "LOGOMODERATE"
      ] = `${process?.env?.UPLOAD_URL}/setting/${mxSet["LOGOMODERATE"]}`;
      userArr[
        "LOGODARK"
      ] = `${process?.env?.UPLOAD_URL}/setting/${mxSet["LOGODARK"]}`;
      userArr[
        "FAVICON"
      ] = `${process?.env?.UPLOAD_URL}/setting/${mxSet["FAVICON"]}`;
      userArr[
        "LOADERIMAGE"
      ] = `${process?.env?.UPLOAD_URL}/setting/${mxSet["LOADERIMAGE"]}`;
    }

    return userArr;
  }

  public async getAccess(roleID = "") {
    const accessArr: any = {};
    const menuArr: any[] = [];
    const coreMenuArr: any[] = [];

    if (roleID == "SUPER") {
      for (const [key, menuItem] of Object.entries(MXADMINMENU)) {
        accessArr[menuItem.seoUri] = MXACCESS;
        coreMenuArr.push(menuItem);
      }
      const DB = new RxDB();
      DB.sql = `SELECT CAST(adminMenuID AS CHAR) as adminMenuID,seoUri,params,hideMenu,xOrder,menuTitle,menuType,forceNav,parentID FROM ${DB.pre}x_admin_menu WHERE status = ? ORDER BY xOrder ASC`;
      DB.vals = [1];
      DB.types = "i";
      const A = await DB.dbRows();

      if (DB?.numRows > 0) {
        for (const element of DB.rows) {
          accessArr[element?.seoUri] = MXACCESS;
          menuArr.push(element);
        }
      }
    } else {
      if (Number(roleID)) {
        const DB = new RxDB();
        DB.sql = `SELECT CAST(A.adminMenuID AS CHAR) as adminMenuID,A.accessType,M.seoUri,M.menuTitle,M.hideMenu,M.menuType,M.xOrder,M.parentID FROM ${DB.pre}x_admin_role_access AS A
                          LEFT JOIN ${DB.pre}x_admin_menu AS M ON M.adminMenuID=A.adminMenuID AND M.status = ? WHERE A.roleID=?`;
        DB.vals = [1, Number(roleID)];
        DB.types = "ii";
        const A = await DB.dbRows();
        if (DB.numRows > 0) {
          for (const m of DB.rows) {
            if (MXADMINMENU.hasOwnProperty(m?.adminMenuID)) {
              m.seoUri = MXADMINMENU[m.adminMenuID].seoUri;
              m.dUri = MXADMINMENU[m.adminMenuID].dUri;
              m.class = MXADMINMENU[m.adminMenuID].class;
              m.menuTitle = MXADMINMENU[m.adminMenuID].menuTitle;
              accessArr[m.seoUri] = JSON.parse(m.accessType);
              coreMenuArr.push(m);
            } else {
              accessArr[m.seoUri] = JSON.parse(m.accessType);
              menuArr.push(m);
            }
          }
        }
      }
    }
    return { menus: menuArr, coremenus: coreMenuArr, access: accessArr };
  }

  public async getSetting(settingKey: any = "", orgID: any = 0) {
    let val = [orgID];
    let type = "i";
    let where = "";
    let arr: any = {};
    if (settingKey) {
      where += " AND settingKey=?";
      val.push(settingKey);
      type += "s";
    }
    const DB = new RxDB();
    DB.types = type;
    DB.vals = val;
    DB.sql = `SELECT * FROM ${DB.pre}x_setting WHERE orgID = ? ${where}`;
    await DB.dbRows();

    DB?.rows?.forEach((v) => {
      let val = v.settingDefault;
      if (v.settingVal && v.settingVal.trim() !== "") {
        val = v.settingVal;
      }
      arr[v.settingKey] = val;
    });

    return arr || {};
  }
}
