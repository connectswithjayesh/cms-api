import { z, ZodSchema } from "zod";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { sendResponse } from "../../../services/common/ResponseUtil";
type ValidationTarget = "body" | "query" | "params";

export const validateRequest = (
  schema: ZodSchema,
  target: ValidationTarget
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req[target]);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error?.errors?.map((err) => err?.message)?.join(", ");
        sendResponse({ res, code: 400, msg: errors, status: false });
      } else {
        next(error);
      }
    }
  };
};
