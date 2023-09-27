import express, { type Request, type Response } from "express";
import "dotenv/config";
import "reflect-metadata";
import bodyParser from "body-parser";
import { AppDataSource } from "./services/DBService";
import StarObservation from "./orm/StarObservation";
import { validate } from "class-validator";
import { StarReport } from "./types/StarReport";

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
  const starReport = new StarReport();
  starReport.world = req.body.world;
  starReport.mode = req.body.mode;
  starReport.location = req.body.location;
  starReport.tier = req.body.tier;
  starReport.hp = req.body.hp;
  starReport.exact = req.body.exact;
  const errors = await validate(starReport);
  if (errors.length > 0) {
    res.json({ error: "Invalid request", errors });
  }
  console.log(starReport);
  await StarObservation.insertStarReport(starReport);
  res.json({ success: true });
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
