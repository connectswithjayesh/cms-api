import { mxOrderBy } from "../../../services/common/DBHelper";
import { formatToIST } from "../../../services/common/datetime";
import { RxDB } from "../../../services/common/DBService";

export async function listVehicleCategoryM(reqQuery: any) {
  try {
    const queryParams: any = reqQuery;
    const status = queryParams["status"] ?? 1;
    let whrVals = [status];
    let whrTypes = "i";
    let whrClause = "VC.status = ?";

    const offset: any = queryParams?.offset ?? 0;
    const showRecord: any = queryParams?.show ?? 20;

    if (queryParams?.vehicleCatID) {
      whrClause += " AND VC.vehicleCatID = ?";
      whrTypes += "i";
      whrVals.push(queryParams?.vehicleCatID);
    }

    if (queryParams?.vehicleCatName) {
      whrClause += ' AND VC.vehicleCatName LIKE CONCAT("%",?,"%")';
      whrTypes += "s";
      whrVals.push(queryParams?.vehicleCatName);
    }

    // step 1 : Get record count
    const DB = new RxDB();
    DB.vals = whrVals;
    DB.types = whrTypes;

    DB.sql = `SELECT VC.vehicleCatName FROM ${DB.pre}vehicle_category AS VC WHERE ${whrClause}`;
    await DB.dbQuery();

    const totRec = DB.numRows;

    // step 2 : Get Record
    DB.vals = whrVals;
    DB.types = whrTypes;
    const d: any = await mxOrderBy(reqQuery, "vehicleCatID DESC");
    const limit = ` LIMIT ${offset},${showRecord}`;

    DB.sql = `SELECT VC.vehicleCatID, VC.vehicleCatName, VC.vehicleCatDesc FROM ${DB.pre}vehicle_category AS VC WHERE ${whrClause} ${d} ${limit}`;
    await DB.dbRows();

    return { count: totRec ?? 0, data: DB.rows || [] };
  } catch (error: any) {
    throw new Error(error?.message);
  }
}

export async function createVehicleCategoryM(reqBody: any) {
  try {
    const DB = new RxDB();
    DB.table = `${DB.pre}vehicle_category`;
    DB.data = {
      vehicleCatName: reqBody?.vehicleCatName || "",
      vehicleCatDesc: reqBody?.vehicleCatDesc || "",
      dateAdded: formatToIST(new Date()),
    };

    if (await DB.dbInsert()) {
      return reqBody;
    } else {
      throw new Error("Fail to add vehicle category");
    }
  } catch (error: any) {
    throw new Error(error?.message);
  }
}

export async function updateVehicleCategoryM(vehicleCatID: any, reqBody: any) {
  try {
    const DB = new RxDB();
    DB.data = { ...reqBody, dateModified: formatToIST(new Date()) };
    DB.table = `${DB.pre}vehicle_category`;
    await DB.dbUpdate("vehicleCatID=?", "i", [vehicleCatID]);
    if (DB.affectedRows == 0) throw new Error("Fail to update vehicle tag.");
    return {
      ...reqBody,
      vehicleCatID: vehicleCatID,
    };
  } catch (error: any) {
    throw new Error(error?.message);
  }
}

export async function getVehicleCategoryM(vehicleCatID: any) {
  try {
    const DB = new RxDB();
    DB.vals = [vehicleCatID];
    DB.types = ["i"];
    DB.sql = `SELECT VC.vehicleCatName, VC.vehicleCatDesc FROM ${DB.pre}vehicle_category AS VC WHERE VC.vehicleCatID = ?`;
    await DB.dbRow();
    if (DB.numRows > 0) {
      return DB.row;
    }
    throw new Error("vehicle category not exist.");
  } catch (error: any) {
    throw new Error(error?.message);
  }
}

export async function trashRestoreVehicleCategoryM(body: any) {
  try {
    const { Ids, action }: any = body;
    if (!Ids || !Array.isArray(Ids) || Ids.length === 0) {
      throw new Error("Invalid Ids array.");
    }

    if (!["trash", "restore"].includes(action)) {
      throw new Error("Invalid action.");
    }

    const DB = new RxDB();
    DB.table = `${DB.pre}vehicle_category`;
    DB.data = {
      status: action === "trash" ? 0 : 1,
    };

    const placeholders = Ids?.map(() => "?").join(",");
    const types = Ids?.map(() => "i").join("");

    await DB.dbUpdate(`vehicleCatID IN (${placeholders})`, types, Ids);

    if (DB.affectedRows == 0) throw new Error(`Fail to ${action} record`);
    return;
  } catch (error: any) {
    throw new Error(error?.message);
  }
}
