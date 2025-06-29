import { mxOrderBy } from "../../../services/common/DBHelper";
import { formatToIST } from "../../../services/common/datetime";
import { RxDB } from "../../../services/common/DBService";

export async function listVehicleTagM(reqQuery: any) {
  try {
    const queryParams: any = reqQuery;
    const status = queryParams["status"] ?? 1;
    let whrVals = [status];
    let whrTypes = "i";
    let whrClause = "VT.status = ?";

    const offset: any = queryParams?.offset ?? 0;
    const showRecord: any = queryParams?.show ?? 20;

    if (queryParams?.vehicleTagID) {
      whrClause += " AND VT.vehicleTagID = ?";
      whrTypes += "i";
      whrVals.push(queryParams?.vehicleTagID);
    }

    if (queryParams?.vehicleTagName) {
      whrClause += ' AND VT.vehicleTagName LIKE CONCAT("%",?,"%")';
      whrTypes += "s";
      whrVals.push(queryParams?.vehicleTagName);
    }

    // step 1 : Get record count
    const DB = new RxDB();
    DB.vals = whrVals;
    DB.types = whrTypes;

    DB.sql = `SELECT VT.vehicleTagID, VT.vehicleTagName FROM ${DB.pre}vehicle_tag AS VT WHERE ${whrClause}`;
    await DB.dbQuery();

    const totRec = DB.numRows;

    // step 2 : Get Record
    DB.vals = whrVals;
    DB.types = whrTypes;
    const d: any = await mxOrderBy(reqQuery, "vehicleTagID DESC");
    const limit = ` LIMIT ${offset},${showRecord}`;

    DB.sql = `SELECT VT.vehicleTagID, VT.vehicleTagName FROM ${DB.pre}vehicle_tag AS VT WHERE ${whrClause} ${d} ${limit}`;
    await DB.dbRows();

    return { count: totRec ?? 0, data: DB.rows || [] };
  } catch (error: any) {
    throw new Error(error?.message);
  }
}

export async function createVehicleTagM(reqBody: any) {
  try {
    const DB = new RxDB();
    DB.table = `${DB.pre}vehicle_tag`;
    DB.data = {
      vehicleTagName: reqBody?.vehicleTagName || "",
      dateAdded: formatToIST(new Date()),
    };

    if (await DB.dbInsert()) {
      return reqBody;
    } else {
      throw new Error("Fail to add vehicle tag");
    }
  } catch (error: any) {
    throw new Error(error?.message);
  }
}

export async function updateVehicleTagM(vehicleTagID: any, reqBody: any) {
  try {
    const DB = new RxDB();
    DB.data = { ...reqBody, dateModified: formatToIST(new Date()) };
    DB.table = `${DB.pre}vehicle_tag`;
    await DB.dbUpdate("vehicleTagID=?", "i", [vehicleTagID]);
    if (DB.affectedRows == 0) throw new Error("Fail to update vehicle tag.");
    return {
      ...reqBody,
      vehicleTagID: vehicleTagID,
    };
  } catch (error: any) {
    throw new Error(error?.message);
  }
}

export async function getVehicleTagM(vehicleTagID: any) {
  try {
    const DB = new RxDB();
    DB.vals = [vehicleTagID];
    DB.types = ["i"];
    DB.sql = `SELECT VT.vehicleTagName FROM ${DB.pre}vehicle_tag AS VT WHERE VT.vehicleTagID = ?`;
    await DB.dbRow();
    if (DB.numRows > 0) {
      return DB.row;
    }
    throw new Error("vehicle tag not exist.");
  } catch (error: any) {
    throw new Error(error?.message);
  }
}

export async function trashRestoreVehicleTagM(body: any) {
  try {
    const { Ids, action }: any = body;
    if (!Ids || !Array.isArray(Ids) || Ids.length === 0) {
      throw new Error("Invalid Ids array.");
    }

    if (!["trash", "restore"].includes(action)) {
      throw new Error("Invalid action.");
    }

    const DB = new RxDB();
    DB.table = `${DB.pre}vehicle_tag`;
    DB.data = {
      status: action === "trash" ? 0 : 1,
    };

    const placeholders = Ids?.map(() => "?").join(",");
    const types = Ids?.map(() => "i").join("");

    await DB.dbUpdate(`vehicleTagID IN (${placeholders})`, types, Ids);

    if (DB.affectedRows == 0) throw new Error(`Fail to ${action} record`);
    return;
  } catch (error: any) {
    throw new Error(error?.message);
  }
}
