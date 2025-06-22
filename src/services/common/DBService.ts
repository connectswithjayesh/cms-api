import mysql, { ResultSetHeader, Pool, PoolOptions } from "mysql2";

interface MxDbConfig {
  DBHOST: string;
  DBUSER: string;
  DBPASS: string;
  DBNAME: string;
  charset?: string;
}

export class RxDB {
  private static pool: Pool | null = null;
  public pre: string = "";
  public table: string | any;
  public sql: string | any;
  public data: any | any;
  public insertID: number | any;
  private updatedID: number | any;
  public numRows: number | any;
  public rows: any[] | any;
  public row: Record<string, any> | any;
  public affectedRows: number | any;
  public types: string | any;
  public vals: any[] | any;
  public cols: string[] | any;
  private parentFld: string[] | any;
  private skipOrg: boolean | any;
  private hasLang: boolean | any;
  private pkName: string | any;

  constructor() {
    // Use singleton pattern for connection pool
    if (!RxDB.pool) {
      const poolConfig: PoolOptions = {
        host: process.env.DBHOST,
        user: process.env.DBUSER,
        password: process.env.DBPASS,
        database: process.env.DBNAME,
        charset: 'utf8mb4',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        // acquireTimeout: 60000,
        // timeout: 60000
      };
      RxDB.pool = mysql.createPool(poolConfig);
    }
    this.dbReset();
  }

  private dbReset() {
    this.pre = "rx_";
    this.table = this.sql = this.pkName = this.types = "";
    this.insertID = this.updatedID = this.numRows = this.affectedRows = 0;
    this.data = this.row = {};
    this.rows = this.cols = this.vals = this.parentFld = [];
    this.hasLang = this.skipOrg = false;
  }

  private getParseType(type: string = ""): string {
    const arrParse = {
      b: ["tinyblob", "blob", "mediumblob", "longblob"],
      i: [
        "tinyint",
        "smallint",
        "mediumint",
        "int",
        "bit",
        "bigint",
        "boolean",
        "bool",
      ],
      d: ["decimal", "float", "double"],
    };
    let p = "s";
    if (type) {
      for (const [k, v] of Object.entries(arrParse)) {
        if (v.includes(type)) p = k;
      }
    }
    return p;
  }

  private async parseIn(table: string) {
    this.cols = [];
    this.vals = [];
    this.types = "";
    this.hasLang = false;
    const rows = await this.query(`DESCRIBE ${table}`);
    for (const col of rows) {
      const type = col.Type.split("(")[0].trim();
      const name = col.Field;

      if (col.Key === "PRI") this.pkName = name;
      if (name === "langChild") this.hasLang = true;
      if (this.data.hasOwnProperty(name)) {
        let val = this.data[name];
        if ((val === undefined || val === "") && col.Default === undefined)
          val = null;
        this.cols.push(name);
        this.vals.push(val);
        this.types += this.getParseType(type);
      }
    }
  }

  public async dbInsert() {
    try {
      if (this.data && typeof this.data === "object") {
        await this.parseIn(this.table);
        if (this.types && this.vals.length > 0) {
          this.sql = `INSERT INTO \`${this.table}\` (\`${this.cols.join(
            "`,`"
          )}\`) VALUES (${this.cols.map(() => "?").join(",")})`;
          if (await this.dbExecute()) {
            return true;
          }
        }
      }
      return false;
    } finally {
      this.dbClose();
    }
  }

  public async dbUpdate(
    whereSql: string = "",
    whereTypes: string = "",
    whereVal: any[] = []
  ) {
    try {
      if (this.data && typeof this.data === "object") {
        await this.parseIn(this.table);
        if (whereVal.length > 0) {
          this.vals.push(...whereVal);
          this.types += whereTypes;
        }
        if (this.vals.length > 0) {
          this.sql = `UPDATE \`${this.table}\` SET ${this.cols
            .map((col: any) => `${col}=?`)
            .join(",")} WHERE ${whereSql}`;
          if (await this.dbExecute()) {
            this.vals = whereVal;
            this.types = whereTypes;
            this.sql = `SELECT MAX(${this.pkName}) AS ${this.pkName} FROM \`${this.table}\` WHERE ${whereSql}`;
            const row = await this.dbRow();
            this.updatedID = row[this.pkName];
            return true;
          }
        }
      }
      return false;
    } finally {
      this.dbClose();
    }
  }

  public async dbQuery() {
    try {
      this.rows = [];
      this.row = {};
      if (await this.dbExecute()) {
        const result: any = await this.query(this.sql, this.vals);
        this.affectedRows = result.affectedRows;
        this.numRows = result.length;
        this.rows = result;
        return true;
      }
      return false;
    } finally {
      this.dbClose();
    }
  }

  public async dbRows() {
    try {
      this.rows = [];
      const result = await this.query(this.sql, this.vals);
      this.numRows = result.length;
      this.rows = result;
      return this.rows;
    } finally {
      this.dbClose();
    }
  }

  public async dbRow() {
    try {
      this.row = {};
      const result = await this.query(this.sql, this.vals);
      this.numRows = result.length;
      if (this.numRows > 0) {
        this.row = result[0];
      }
      return this.row;
    } finally {
      this.dbClose();
    }
  }

  private async mxWhereIn(
    strIn: string = "",
    type: string = "s"
  ): Promise<string> {
    let str = "";
    if (strIn.trim() !== "") {
      const s = strIn.split(",");
      for (const v of s) {
        this.vals.push(v);
        this.types += type;
      }
      str = s.map(() => "?").join(",");
    }
    return str;
  }

  private async dbExecute() {
    try {
      await this.query("SET SQL_MODE = ''");

      if (this.sql.trim() !== "") {
        const result: any = await this.query(this.sql, this.vals);
        this.affectedRows = result.affectedRows || 0;
        this.insertID = result.insertId || 0;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Database execution error:', error);
      throw error;
    }
  }

  private dbClose() {
    this.sql = this.types = "";
    this.vals = [];
  }

  public async showSql() {
    if (this.vals.length && this.types !== "") {
      let sql = this.sql;
      const arrTypes = this.types.split("");
      arrTypes.forEach((type: any, index: any) => {
        let val = this.vals[index];
        if (type === "s") val = `'${val}'`;
        sql = sql.replace("?", val);
      });
      console.log("\n" + sql + "\n");
    }
  }

  private async getAlias(): Promise<string> {
    let alias = "";
    if (this.sql !== "") {
      const string = this.sql.replace(/\s+/g, " ").toUpperCase();
      const arrStr = string.split(" ");
      const posFrom = arrStr.indexOf("FROM");
      if (posFrom > 0 && arrStr[posFrom + 2] === "AS" && arrStr[posFrom + 3]) {
        alias = arrStr[posFrom + 3] + ".";
      }
    }
    return alias;
  }

  public async ifTableExists(table: string): Promise<boolean> {
    const rows = await this.query(`SHOW TABLES LIKE ?`, [table]);
    return rows.length > 0;
  }

  private async updateLangChild(
    parentLID: number,
    action: string
  ): Promise<number> {
    let flg = 0;
    if (parentLID > 0) {
      this.data["parentLID"] = parentLID;
      let table = this.table;
      if (await this.ifTableExists(table + "_l")) {
        table = table + "_l";
        await this.parseIn(table);
        if (this.vals.length > 0) {
          if (action === "I") {
            this.sql = `INSERT INTO \`${table}\` (\`${this.cols.join(
              "`,`"
            )}\`) VALUES (${this.cols.map(() => "?").join(",")})`;
          } else {
            this.vals.push(parentLID);
            this.types += "ii";
            this.sql = `UPDATE \`${table}\` SET ${this.cols
              .map((col: any) => `${col}=?`)
              .join(",")} WHERE parentLID=? AND langID=?`;
          }
          if (await this.dbExecute()) flg++;
        }
      }
    }
    return flg;
  }

  public async parentFldRow(
    table: string,
    parentID: number
  ): Promise<Record<string, any>> {
    this.parentFld = [];
    this.sql = `SHOW COLUMNS FROM \`${table}\` LIKE 'parentID'`;
    if (await this.dbRow()) {
      this.sql = `SELECT * FROM \`${table}\` WHERE ${await this.getAlias()}parentID=${parentID}`;
      this.row = await this.dbRow();
    }
    return this.row;
  }

  private async query(sql: string, values?: any[]): Promise<any[]> {
    if (!RxDB.pool) {
      throw new Error('Database pool not initialized');
    }
    
    return new Promise<any[]>((resolve, reject) => {
      RxDB.pool!.query<ResultSetHeader>(sql, values, (err, results: any) => {
        if (err) {
          console.error('Query error:', err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  // Static method to close all connections when shutting down
  public static async closePool() {
    if (RxDB.pool) {
      await RxDB.pool.end();
      RxDB.pool = null;
    }
  }
}