import { Response } from "express";

export interface HttpResp {
  msg: string;
  status: boolean;
  data?: any;
  count?: number;
  res: Response;
  code:number;
}

export interface HttpContentResp {
  status: number;
  contentType?: string;
  data?: any;
  res: Response;
}
