import { Application, Request, Response, Router } from "express";
import AdminMasterController from "../../controller/core/AdminMasterController";

const adminMasterRoute = Router();
const adminMasterCtr = new AdminMasterController();

adminMasterRoute.get("/org-list", (req: Request, res: Response) =>
  adminMasterCtr.organizationList(req, res)
);

adminMasterRoute.get("/role-list", (req: Request, res: Response) =>
  adminMasterCtr.roleList(req, res)
);

adminMasterRoute.get("/menu-dropdown", (req: Request, res: Response) =>
  adminMasterCtr.menuDropDown(req, res)
);

export default (app: Application) =>
  app.use(`${process.env.BASE_URL}/admin-master`, adminMasterRoute);
