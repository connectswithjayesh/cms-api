import { Application, Request, Response, Router } from "express";
import AdminRoleController from "../../controllers/core/AdminRoleController";

const adminRoleRoute = Router();
const adminRoleCtr = new AdminRoleController();


adminRoleRoute.get("/", (req: Request, res: Response) =>
  adminRoleCtr.list(req, res)
);

adminRoleRoute.get("/menu", (req: Request, res: Response) =>
  adminRoleCtr.menu(req, res)
);

adminRoleRoute.get("/:roleID", (req: Request, res: Response) =>
  adminRoleCtr.view(req, res)
);

adminRoleRoute.post("/", (req: Request, res: Response) =>
  adminRoleCtr.add(req, res)
);
adminRoleRoute.put("/:roleID", (req: Request, res: Response) =>
  adminRoleCtr.update(req, res)
);

export default (app: Application) =>
  app.use(`${process.env.BASE_URL}/admin-role`, adminRoleRoute);
