import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response, NextFunction } from "express";
const app = express();
import path from "path";
import { globSync } from "glob";
import cors, { CorsOptions } from "cors";

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

const rootPath = path.normalize(__dirname).replace(/\\/g, "/");

const routePatterns = [`${rootPath}/api/admin/routes/**/*.{ts,js}`];
console.log(routePatterns);
const routesFiles = routePatterns.flatMap((pattern) =>
  globSync(pattern, {
    ignore: ["**/index.{ts,js}", "**/*.test.{ts,js}", "**/*.spec.{ts,js}"],
  })
);

console.log("Loading routes:", routesFiles);

routesFiles.forEach((route) => {
  try {
    require(route).default(app);
    console.log(`✓ Loaded: ${route}`);
  } catch (error: any) {
    console.error(`✗ Failed to load: ${route}`, error.message);
  }
});

app.get("/", (req: Request, res: Response) => {
  res.json({ data: "Welcome to CMS-API!!" });
});

const port = process.env.PORT || 3007;

app.listen(port, () => {
  console.log(`server listening on port : ${port}`);
});

// export default app;
