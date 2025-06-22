import { Application, Request, Response, Router } from "express";
import AdminUserController from "../../controllers/core/AdminUserController";

const adminUserRoute = Router();
const adminUserCtr = new AdminUserController();

adminUserRoute.post("/login", (req: Request, res: Response) =>
  adminUserCtr.login(req, res)
);

adminUserRoute.get("/", (req: Request, res: Response) =>
  adminUserCtr.list(req, res)
);

adminUserRoute.get("/:userID", (req: Request, res: Response) =>
  adminUserCtr.view(req, res)
);

adminUserRoute.post("/", (req: Request, res: Response) =>
  adminUserCtr.add(req, res)
);
adminUserRoute.put("/:userID", (req: Request, res: Response) =>
  adminUserCtr.update(req, res)
);

export default (app: Application) =>
  app.use(`${process.env.BASE_URL}/admin-user`, adminUserRoute);
