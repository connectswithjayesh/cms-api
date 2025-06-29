import { Application, Request, Response, Router } from "express";
import OrganizationController from "../../controller/core/OrganizationController";

const orgRoute = Router();
const orgCtr = new OrganizationController();

orgRoute.get("/", (req: Request, res: Response) => orgCtr.list(req, res));
orgRoute.get("/:orgID", (req: Request, res: Response) => orgCtr.view(req, res));
orgRoute.post("/", (req: Request, res: Response) => orgCtr.add(req, res));
orgRoute.put("/:orgID", (req: Request, res: Response) =>
  orgCtr.update(req, res)
);

export default (app: Application) =>
  app.use(`${process.env.BASE_URL}/organization`, orgRoute);
