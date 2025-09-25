import "reflect-metadata";

import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser"
import session from "express-session"

import { openAPIRouter } from "./swagger/openAPIRouter";
import { modules } from "./modules/index";
import { appEnv } from "./config/app.config";
import passport from "./config/passport.config";
import { AppDataSource } from "./config/db.config";

const app: Express = express();

app.use(express.json());
app.use(cookieParser());
app.set("trust proxy", true);

// Middlewares
app.use(cors({ origin: appEnv.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(morgan("combined"));
app.use(session({
  secret: appEnv.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax'
  }
}));
app.use(passport.initialize());
app.use(passport.session());

AppDataSource.initialize()
  .then(() => {
    const healCheckRouterInstance = new modules.healthCheckRouter();
    const authRouterInstance = new modules.AuthRouter();
    app.use("/health-check", healCheckRouterInstance.router);
    app.use("/auth", authRouterInstance.router);

    app.use(openAPIRouter);

    app.listen(appEnv.PORT, () => {
      const { NODE_ENV, HOST, PORT } = appEnv;
      console.log(`Server (${NODE_ENV}) running on port http://${HOST}:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database connection:", error);
    process.exit(1);
  });