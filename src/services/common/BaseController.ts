import { Response } from "express";
import { ZodError } from "zod";

export default class BaseController {
  protected sendResponse(
    res: Response,
    status: boolean,
    msg: string,
    data: any = []
  ) {
    return res.send({ status, msg, data });
  }

  protected handleZodErrorSingle(error: ZodError) {
    return error?.errors?.[0]?.message || "Validation error";
  }

  public handleZodErrorCombined(error: ZodError) {
    return error?.errors?.map((e) => e?.message)?.join(", ");
  }
}
