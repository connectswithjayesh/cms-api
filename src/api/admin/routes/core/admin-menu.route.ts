import { Application, Request, Response, Router } from "express";
import AdminMenuController from "../../controllers/core/AdminMenuController";

const adminMenuRoute = Router();
const adminMenuCtr = new AdminMenuController();

adminMenuRoute.get("/sidebar-menu", (req: Request, res: Response) =>
  adminMenuCtr.sidebarMenu(req, res)
);
adminMenuRoute.get("/recreate-menu", (req: Request, res: Response) => {
  adminMenuCtr.reCreateMenu(req, res);
});
adminMenuRoute.get("/", (req: Request, res: Response) =>
  adminMenuCtr.list(req, res)
);

adminMenuRoute.get("/:adminMenuID", (req: Request, res: Response) =>
  adminMenuCtr.view(req, res)
);

adminMenuRoute.post("/", (req: Request, res: Response) =>
  adminMenuCtr.add(req, res)
);

adminMenuRoute.put("/:adminMenuID", (req: Request, res: Response) =>
  adminMenuCtr.update(req, res)
);

export default (app: Application) =>
  app.use(`${process.env.BASE_URL}/admin-menu`, adminMenuRoute);
