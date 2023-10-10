// Ideas in case we want a MOTD:
// Please rate me 5 stars
// Don't forget to star <github repo badge>
// 🤩

/* eslint-disable @typescript-eslint/naming-convention */
import _ from "lodash";
import { WorldMode } from "../enum/WorldMode";
import StarObservation from "../orm/StarObservation";
import { AppDataSource } from "./DBService";

// eslint-disable-next-line @typescript-eslint/ban-types
type Prettify<T> = { [K in keyof T]: T[K] } & {};

interface Common {
  world: number;
  recorded_at: Date;
  tier: number;
  percent_remaining: number;
}

type FromDB = Prettify<
  Common & {
    location_x: number;
    location_y: number;
    location_plane: number;
  }
>;

type Structured = Prettify<
  Common & {
    location: {
      x: number;
      y: number;
      plane: number;
    };
  }
>;

function reformatOutput(observation: FromDB): Structured {
  const { location_x, location_y, location_plane, ...rest } = observation;
  return {
    ...rest,
    location: {
      x: location_x,
      y: location_y,
      plane: location_plane,
    },
  };
}

export async function whereAreTheStars(): Promise<any> {
  const resultFromDB = await AppDataSource.createQueryBuilder()
    .select("star_observation.world", "world")
    .addSelect("star_observation.location_x", "location_x")
    .addSelect("star_observation.location_y", "location_y")
    .addSelect("star_observation.location_plane", "location_plane")
    .addSelect("star_observation.recorded_at", "recorded_at")
    .addSelect("star_observation.tier", "tier")
    .addSelect("star_observation.percent_remaining", "percent_remaining")
    .from(StarObservation, "star_observation")
    .where("star_observation.recorded_at > NOW() - INTERVAL 2 MINUTE")
    .andWhere("tier > 0")
    .andWhere("star_observation.mode = :mode", { mode: WorldMode.STANDARD })
    .orderBy("world", "ASC")
    .addOrderBy("recorded_at", "DESC")
    .getRawMany();

  const activeStars = _.chain(resultFromDB)
    .mapValues(reformatOutput)
    .groupBy("world")
    .mapValues((observations) => {
      const observationsMostCommonLocation = _.chain(observations)
        .groupBy("location")
        .values()
        .maxBy((observations) => observations.length)
        .value() as any as Structured[];
      const percent_remaining = _.chain(observationsMostCommonLocation)
        .map("percent_remaining")
        .filter((x) => !_.isNull(x))
        .mean()
        .value();
      // const infoForDebugging = _.map(
      //   observationsMostCommonLocation,
      //   ({ recorded_at, percent_remaining }) => ({
      //     recorded_at,
      //     percent_remaining,
      //   }),
      // );
      const timestamp = _.chain(observationsMostCommonLocation)
        .map("recorded_at")
        .max()
        .value();
      const { world, tier, location } = observationsMostCommonLocation[0];
      return {
        world,
        location,
        timestamp,
        tier,
        percent_remaining,
        // infoForDebugging,
      };
    })
    .values()
    .value();
  const result = {
    generated_at: new Date().toISOString(),
    active_stars: activeStars,
  };
  console.log(result);
  return result;
}

export async function betterWhereAreTheStars(): Promise<any> {
  const resultFromDB = await AppDataSource.createQueryBuilder()
    .select("star_observation.world", "world")
    .addSelect("star_observation.location_x", "location_x")
    .addSelect("star_observation.location_y", "location_y")
    .addSelect("star_observation.location_plane", "location_plane")
    .addSelect("star_observation.recorded_at", "recorded_at")
    .addSelect("star_observation.tier", "tier")
    .addSelect("star_observation.percent_remaining", "percent_remaining")
    .from(StarObservation, "star_observation")
    .where("star_observation.recorded_at > NOW() - INTERVAL 12 HOUR")
    .andWhere("tier > 0")
    .andWhere("star_observation.mode = :mode", { mode: WorldMode.STANDARD })
    .orderBy("world", "ASC")
    .addOrderBy("recorded_at", "DESC")
    .stream();

  return await new Promise((resolve, reject) => {
    const counts = new Map<number, number>();
    resultFromDB.on("error", function (err) {
      console.log("error :'(", err);
      reject(new Error("error :'("));
    });

    resultFromDB.on("data", (row: FromDB) => {
      const structured = reformatOutput(row);
      const currentCount = counts.get(structured.world) ?? 0;
      counts.set(structured.world, currentCount + 1);
    });

    resultFromDB.on("end", function () {
      console.log("done");
      resolve(Object.fromEntries(counts));
    });
  });
}
