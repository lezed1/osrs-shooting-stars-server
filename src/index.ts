import express, {
  type ErrorRequestHandler,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import "dotenv/config";
import "reflect-metadata";
import bodyParser from "body-parser";
import { AppDataSource } from "./services/DBService";
import StarObservation from "./orm/StarObservation";
import { validate } from "class-validator";
import { StarObservationReport } from "./types/StarObservationReport";
import { TelescopeObservationReport } from "./types/TelescopeObservationReport";
import TelescopeObservation from "./orm/TelescopeObservation";
import * as StarService from "./services/StarService";
import { CannonObservationReport } from "./types/CannonObservationReport";
import CannonObservation from "./orm/CannonObservation";

const app = express();
const { PORT = 3000 } = process.env;

const corsOptions = {
  maxAge: 86400,
  methods: "GET",
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "hello world",
  });
});

function logWithJson(message: string, obj: any): void {
  console.log(message, JSON.stringify(obj, null, 2));
}

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.post("/shooting_stars", async (req, res) => {
  logWithJson("Got POST to /shooting_stars. Body:", req.body);
  if ("location" in req.body) {
    const starObservationReport = new StarObservationReport();
    starObservationReport.world = req.body.world;
    starObservationReport.mode = req.body.mode;
    starObservationReport.location = req.body.location;
    starObservationReport.tier = req.body.tier;
    starObservationReport.hp = req.body.hp;
    starObservationReport.exact = req.body.exact;
    const errors = await validate(starObservationReport);
    if (errors.length > 0) {
      res.json({ error: "Invalid request", errors });
      return;
    }
    logWithJson("Parsed starObservationReport:", starObservationReport);
    await StarObservation.insertStarObservationReport(starObservationReport);
    res.json({ success: true });
  } else if ("message" in req.body) {
    const telescopeObservationReport = new TelescopeObservationReport();
    telescopeObservationReport.world = req.body.world;
    telescopeObservationReport.mode = req.body.mode;
    telescopeObservationReport.message = req.body.message;
    const errors = await validate(telescopeObservationReport);
    if (errors.length > 0) {
      res.json({ error: "Invalid request", errors });
      return;
    }
    logWithJson(
      "Parsed telescopeObservationReport:",
      telescopeObservationReport,
    );
    await TelescopeObservation.insertTelescopeObservationReport(
      telescopeObservationReport,
    );
    res.json({ success: true });
  } else if ("cannonVarbit" in req.body) {
    const cannonObservationReport = new CannonObservationReport();
    cannonObservationReport.world = req.body.world;
    cannonObservationReport.mode = req.body.mode;
    cannonObservationReport.cannonVarbit = req.body.cannonVarbit;
    const time = new Date(req.body.time);
    if (time < new Date("1980-01-01")) {
      cannonObservationReport.time = new Date(req.body.time * 1000);
    } else {
      cannonObservationReport.time = time;
    }
    const errors = await validate(cannonObservationReport);
    if (errors.length > 0) {
      res.json({ error: "Invalid request", errors });
      return;
    }
    logWithJson("Parsed cannonObservationReport:", cannonObservationReport);
    await CannonObservation.insertCannonObservationReport(
      cannonObservationReport,
    );
    res.json({ success: true });
  } else {
    console.log("Unknown request");
    res.json({ error: "Invalid request" });
  }
});

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.get("/shooting_stars", async (req, res) => {
  res.json(await StarService.whereAreTheStars());
});

// Error handling
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);
  res
    .status(500)
    .json({ error: "There was an internal error. Please try again later." });
  next();
};
app.use(errorHandler);

// eslint-disable-next-line @typescript-eslint/no-misused-promises
const server = app.listen(PORT, async () => {
  await AppDataSource.initialize();
  // await AppDataSource.synchronize();

  // await StarObservation.insertStarObservationReport({
  //   world: 0,
  //   mode: WorldMode.STANDARD,
  //   location: { x: 1, y: 2, plane: 3 },
  //   tier: 0,
  // });

  console.log("server started at http://localhost:" + PORT);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Closing down Express server");

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  server.close(async () => {
    console.log("HTTP server closed");

    await AppDataSource.destroy();
    console.log("DB connection closed");
    process.exit();
  });
});
