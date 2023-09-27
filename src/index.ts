import express, { type Request, type Response } from "express";
import "dotenv/config";
import "reflect-metadata";
import { AppDataSource } from "./services/DBService";
import StarObservation from "./orm/StarObservation";
import { WorldMode } from "./enum/WorldMode";

const app = express();
const { PORT = 3000 } = process.env;

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "hello world",
  });
});

// eslint-disable-next-line @typescript-eslint/no-misused-promises
const server = app.listen(PORT, async () => {
  await AppDataSource.initialize();
  // await AppDataSource.synchronize();
  console.log("server started at http://localhost:" + PORT);

  await AppDataSource.createQueryBuilder()
    .insert()
    .into(StarObservation)
    .values({
      world: 123,
      mode: WorldMode.STANDARD,
      location: "loc",
      tier: 0,
    })
    .updateEntity(false)
    .execute();
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
