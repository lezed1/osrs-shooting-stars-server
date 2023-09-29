// Ideas in case we want a MOTD:
// Please rate me 5 stars
// Don't forget to star <github repo badge>
// 🤩

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
    .addSelect("MAX(star_observation.recorded_at)", "lastest_recorded_at")
    .addSelect("star_observation.tier", "tier")
    .addSelect("AVG(star_observation.percent_remaining)", "percent_remaining")
    .addSelect("COUNT(*)", "count")
    .from(StarObservation, "star_observation")
    .where("star_observation.recorded_at > NOW() - 60")
    .andWhere("tier > 0")
    .andWhere("star_observation.mode = :mode", { mode: WorldMode.STANDARD })
    .groupBy("world")
    .addGroupBy("location_x")
    .addGroupBy("location_y")
    .addGroupBy("location_plane")
    .addGroupBy("tier")
    .orderBy("world", "ASC")
    .addOrderBy("lastest_recorded_at", "DESC")
    .addOrderBy("count", "DESC")
    .getRawMany();

  const activeStars = _.chain(resultFromDB)
    .groupBy("world")
    .mapValues(_.head)
    .mapValues((observation) => ({
      world: observation.world,
      location: {
        x: observation.location_x,
        y: observation.location_y,
        plane: observation.location_plane,
      },
      timestamp: observation.lastest_recorded_at,
      tier: observation.tier,
      percent_remaining: Number(observation.percent_remaining),
    }))
    .values()
    .value();
  const result = {
    generated_at: new Date().toISOString(),
    active_stars: activeStars,
  };
  console.log(result);
  return result;
}
