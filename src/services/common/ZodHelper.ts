import { Response } from "express";
import { ZodError } from "zod";

export async function sendResponse(
  res: Response,
  status: boolean,
  msg: string,
  data: any = []
) {
  return res.send({ status, msg, data });
}

export async function handleZodErrorSingle(error: ZodError) {
  return error?.errors?.[0]?.message || "Validation error";
}

export async function handleZodErrorCombined(error: ZodError) {
  return error?.errors?.map((e) => e?.message)?.join(", ");
}
