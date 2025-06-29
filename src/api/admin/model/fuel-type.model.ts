import { mxOrderBy } from "../../../services/common/DBHelper";
import { formatToIST } from "../../../services/common/datetime";
import { RxDB } from "../../../services/common/DBService";

export async function listFuelTypeM(reqQuery: any) {
  try {
    const queryParams: any = reqQuery;
    const status = queryParams["status"] ?? 1;
    let whrVals = [status];
    let whrTypes = "i";
    let whrClause = "FT.status = ?";

    const offset: any = queryParams?.offset ?? 0;
    const showRecord: any = queryParams?.show ?? 20;

    if (queryParams?.fuelTypeID) {
      whrClause += " AND FT.fuelTypeID = ?";
      whrTypes += "i";
      whrVals.push(queryParams?.fuelTypeID);
    }

    if (queryParams?.fuelTypeName) {
      whrClause += ' AND FT.fuelTypeName LIKE CONCAT("%",?,"%")';
      whrTypes += "s";
      whrVals.push(queryParams?.fuelTypeName);
    }

    // step 1 : Get record count
    const DB = new RxDB();
    DB.vals = whrVals;
    DB.types = whrTypes;

    DB.sql = `SELECT FT.fuelTypeID, FT.fuelTypeName FROM ${DB.pre}fuel_type AS FT WHERE ${whrClause}`;
    await DB.dbQuery();

    const totRec = DB.numRows;

    // step 2 : Get Record
    DB.vals = whrVals;
    DB.types = whrTypes;
    const d: any = await mxOrderBy(reqQuery, "fuelTypeID DESC");
    const limit = ` LIMIT ${offset},${showRecord}`;

    DB.sql = `SELECT FT.fuelTypeID, FT.fuelTypeName FROM ${DB.pre}fuel_type AS FT WHERE ${whrClause} ${d} ${limit}`;
    await DB.dbRows();

    return { count: totRec ?? 0, data: DB.rows || [] };
  } catch (error: any) {
    throw new Error(error?.message);
  }
}

export async function createFuelTypeM(reqBody: any) {
  try {
    const DB = new RxDB();
    DB.table = `${DB.pre}fuel_type`;
    DB.data = {
      fuelTypeName: reqBody?.fuelTypeName || "",
      dateAdded: formatToIST(new Date()),
    };

    if (await DB.dbInsert()) {
      return reqBody;
    } else {
      throw new Error("Fail to add fuel type");
    }
  } catch (error: any) {
    throw new Error(error?.message);
  }
}

export async function updateFuelTypeM(fuelTypeID: any, reqBody: any) {
  try {
    const DB = new RxDB();
    DB.data = { ...reqBody, dateModified: formatToIST(new Date()) };
    DB.table = `${DB.pre}fuel_type`;
    await DB.dbUpdate("fuelTypeID=?", "i", [fuelTypeID]);
    if (DB.affectedRows == 0) throw new Error("Fail to update vehicle tag.");
    return {
      ...reqBody,
      fuelTypeID: fuelTypeID,
    };
  } catch (error: any) {
    throw new Error(error?.message);
  }
}

export async function getFuelTypeM(fuelTypeID: any) {
  try {
    const DB = new RxDB();
    DB.vals = [fuelTypeID];
    DB.types = ["i"];
    DB.sql = `SELECT FT.fuelTypeName FROM ${DB.pre}fuel_type AS FT WHERE FT.fuelTypeID = ?`;
    await DB.dbRow();
    if (DB.numRows > 0) {
      return DB.row;
    }
    throw new Error("vehicle tag not exist.");
  } catch (error: any) {
    throw new Error(error?.message);
  }
}

export async function trashRestoreFuelTypeM(body: any) {
  try {
    const { Ids, action }: any = body;
    if (!Ids || !Array.isArray(Ids) || Ids.length === 0) {
      throw new Error("Invalid Ids array.");
    }

    if (!["trash", "restore"].includes(action)) {
      throw new Error("Invalid action.");
    }

    const DB = new RxDB();
    DB.table = `${DB.pre}fuel_type`;
    DB.data = {
      status: action === "trash" ? 0 : 1,
    };

    const placeholders = Ids?.map(() => "?").join(",");
    const types = Ids?.map(() => "i").join("");

    await DB.dbUpdate(`fuelTypeID IN (${placeholders})`, types, Ids);

    if (DB.affectedRows == 0) throw new Error(`Fail to ${action} record`);
    return;
  } catch (error: any) {
    throw new Error(error?.message);
  }
}
