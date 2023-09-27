import { Entity, Column, PrimaryColumn, BaseEntity, Timestamp } from "typeorm";
import { WorldMode } from "../enum/WorldMode";
import { Min, IsInt, Max } from "class-validator";
import { type StarObservationReport } from "../types/StarObservationReport";
import { AppDataSource } from "../services/DBService";

@Entity("star_observation")
export default class StarObservation extends BaseEntity {
  @Column()
  @IsInt()
  @Min(1)
  @Max(1000)
  world!: number;

  @PrimaryColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  recorded_at!: Timestamp;

  @Column({
    type: "enum",
    enum: WorldMode,
  })
  mode!: WorldMode;

  @PrimaryColumn()
  location_x!: number;

  @PrimaryColumn()
  location_y!: number;

  @PrimaryColumn()
  location_plane!: number;

  @Column()
  tier!: number;

  @Column({
    nullable: true,
  })
  hp?: number;

  static async insertStarReport(
    starReport: StarObservationReport,
  ): Promise<void> {
    await AppDataSource.createQueryBuilder()
      .insert()
      .into(StarObservation)
      .values({
        world: starReport.world,
        mode: starReport.mode,
        location_x: starReport.location?.x,
        location_y: starReport.location?.y,
        location_plane: starReport.location?.plane,
        tier: starReport.tier,
        hp: starReport.hp,
      })
      .updateEntity(false)
      .execute();
  }
}
