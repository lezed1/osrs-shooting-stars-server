import express, { type Request, type Response } from "express";
import "dotenv/config";
import "reflect-metadata";
import bodyParser from "body-parser";
import { AppDataSource } from "./services/DBService";
import StarObservation from "./orm/StarObservation";
import { validate } from "class-validator";
import { StarObservationReport } from "./types/StarObservationReport";
import { TelescopeObservationReport } from "./types/TelescopeObservationReport";
import TelescopeObservation from "./orm/TelescopeObservation";

const app = express();
const { PORT = 3000 } = process.env;

app.use(bodyParser.json());

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "hello world",
  });
});

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.post("/shooting_stars", async (req, res) => {
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
    }
    console.log(starObservationReport);
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
    }
    console.log(telescopeObservationReport);
    await TelescopeObservation.insertTelescopeObservationReport(
      telescopeObservationReport,
    );
    res.json({ success: true });
  } else {
    res.json({ error: "Invalid request" });
  }
});

// eslint-disable-next-line @typescript-eslint/no-misused-promises
const server = app.listen(PORT, async () => {
  await AppDataSource.initialize();
  // await AppDataSource.synchronize();
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
