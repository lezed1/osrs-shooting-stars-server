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

  static async insertStarObservationReport(
    starObservationReport: StarObservationReport,
  ): Promise<void> {
    await AppDataSource.createQueryBuilder()
      .insert()
      .into(StarObservation)
      .values({
        world: starObservationReport.world,
        mode: starObservationReport.mode,
        location_x: starObservationReport.location?.x,
        location_y: starObservationReport.location?.y,
        location_plane: starObservationReport.location?.plane,
        tier: starObservationReport.tier,
        hp: starObservationReport.hp,
      })
      .updateEntity(false)
      .execute();
  }
}
