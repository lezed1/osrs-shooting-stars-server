import { DataSource } from "typeorm";
import StarObservation from "../orm/StarObservation";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.TYPEORM_HOST,
  port: Number(process.env.TYPEORM_PORT),
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  synchronize: Boolean(process.env.TYPEORM_SYNCHRONIZE),
  logging: Boolean(process.env.TYPEORM_LOGGING),
  entities: [StarObservation],
  // entities,
  // migrations,
});

export async function initialize(): Promise<void> {
  AppDataSource.initialize()
    .then(() => {
      console.log("Data Source has been initialized!");
    })
    .catch((err) => {
      console.error("Error during Data Source initialization", err);
    });
}
