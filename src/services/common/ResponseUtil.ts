import { z } from "zod";

import { Request, Response, NextFunction } from "express";
import { HttpContentResp, HttpResp } from "../../types/http.type";

export const sendResponse = (response: HttpResp) => {
  const finalJson: any = {
    msg: response?.msg,
    status: response?.status ?? false,
    // data: response?.data ?? {},
    ...(response?.data && { data: response.data }),
  };

  if (response?.count !== undefined && response?.count !== null) {
    finalJson.count = response.count;
  }
  response?.res.status(response?.code || 400).send(finalJson);
};

// export const sendContentResponse = (response: HttpContentResp) => {
//   const contentType = response?.contentType || "text/html";
//   response.res.setHeader("Content-Type", contentType);
//   response?.res.status(response.status).send(response?.data || "");
// };

// export const errorHandler = (
//   err: any,
//   res: HttpContentResp
// ) => {
//   if (err instanceof z.ZodError) {
//     res?.res.status(400).send(response?.data || "");
//   }

//   res.status(500).json({
//     msg: "Internal Server Error",
//     err: 1,
//     data: err.message,
//   });
// };
