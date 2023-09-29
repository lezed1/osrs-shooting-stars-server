// Ideas in case we want a MOTD:
// Please rate me 5 stars
// Don't forget to star <github repo badge>
// 🤩

/* eslint-disable @typescript-eslint/naming-convention */
import _ from "lodash";
import { WorldMode } from "../enum/WorldMode";
import StarObservation from "../orm/StarObservation";
import { AppDataSource } from "./DBService";

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
    .where("star_observation.recorded_at > NOW() - 120")
    .andWhere("tier > 0")
    .andWhere("star_observation.mode = :mode", { mode: WorldMode.STANDARD })
    .orderBy("world", "ASC")
    .addOrderBy("recorded_at", "DESC")
    .getRawMany();

  const activeStars = _.chain(resultFromDB)
    .mapValues((observation) => {
      const { location_x, location_y, location_plane, ...rest } = observation;
      return {
        ...rest,
        location: {
          x: location_x,
          y: location_y,
          plane: location_plane,
        },
      };
    })
    .groupBy("world")
    .mapValues((observations) => {
      const observationsMostCommonLocation = _.chain(observations)
        .groupBy("location")
        .values()
        .maxBy((observations) => observations.length)
        .value();
      const percent_remaining = _.chain(observationsMostCommonLocation)
        .map("percent_remaining")
        .filter((x) => !_.isNull(x))
        .mean()
        .value();
      const infoForDebugging = _.map(
        observationsMostCommonLocation,
        ({ recorded_at, percent_remaining }) => ({
          recorded_at,
          percent_remaining,
        }),
      );
      const lastest_recorded_at = _.chain(observationsMostCommonLocation)
        .map("recorded_at")
        .max()
        .value();
      const { world, tier, location } = observationsMostCommonLocation[0];
      return {
        lastest_recorded_at,
        world,
        tier,
        location,
        percent_remaining,
        infoForDebugging,
      };
    })
    .values()
    // .join()
    // .values()
    // .mapValues((observation) => ({
    //   world: observation.world,
    //   location: {
    //     x: observation.location_x,
    //     y: observation.location_y,
    //     plane: observation.location_plane,
    //   },
    //   timestamp: observation.lastest_recorded_at,
    //   tier: observation.tier,
    //   percent_remaining: Number(observation.percent_remaining),
    // }))
    .value();
  const result = {
    generated_at: new Date().toISOString(),
    active_stars: activeStars,
  };
  console.log(result);
  return result;
}
