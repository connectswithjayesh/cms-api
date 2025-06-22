import { Request, Response } from "express";
import { RxDB } from "./DBService";

export async function checkDublicate(params: any) {
    const DB = new RxDB();
    const whrVals: any[] = [];
    whrVals.push(params?.status || 1);
    let whrTypes = "i";
    let whrClause = "status=?";

    if (params?.fld) {
      whrVals.push(params?.val || 0);
      whrTypes += params["type"];
      whrClause += " AND " + params?.fld + " = ?";
    }

    if (params?.pid) {
      whrVals.push(params?.pid || 0);
      whrTypes += "i";
      whrClause += " AND " + params["pk"] + " != ?";
    }

    DB.vals = whrVals;
    DB.types = whrTypes;
    DB.sql = `SELECT ${params?.pk} FROM ${params?.tbl} WHERE ${whrClause}`;

    await DB.dbQuery();

    const totRec = DB.numRows;
    const resp: any = {};

    if (totRec > 0) {
      resp.status = false;
      resp.msg = `This ${params?.["title"] || params?.["fld"]} - ${params["val"]} already exist`;
    } else {
      resp.status = true;
      resp.msg = "";
    }
    return resp;
  }

export async function mxOrderBy(req: Request, orderP: string = "") {
  const reqD: any = req.query;

  if (
    reqD?.orderBy &&
    reqD?.order &&
    reqD?.orderBy !== "" &&
    reqD?.order !== ""
  ) {
    let orderBy = "";
    let order = "";

    if (reqD.orderBy !== "") {
      // Directly use the orderBy value (assuming it is safe and validated)
      orderBy = reqD?.orderBy;

      if (reqD.order !== "") {
        // Validate and set the order direction (ASC, DESC)
        order = reqD?.order?.toUpperCase() === "ASC" ? "ASC" : "DESC";
      }
    }

    orderP = ` ORDER BY ${orderBy} ${order}`;
  } else if (orderP !== "") {
    // Directly use the orderP value (assuming it is safe and validated)
    orderP = ` ORDER BY ${orderP}`;
  }

  return orderP;
}
