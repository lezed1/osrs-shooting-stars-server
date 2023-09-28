import {
  Entity,
  Column,
  BaseEntity,
  Timestamp,
  PrimaryGeneratedColumn,
} from "typeorm";
import { WorldMode } from "../enum/WorldMode";
import { Min, IsInt, Max } from "class-validator";
import { type StarObservationReport } from "../types/StarObservationReport";
import { AppDataSource } from "../services/DBService";

@Entity("star_observation")
export default class StarObservation extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: "timestamp",
    precision: 6,
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  recorded_at!: Timestamp;

  @Column()
  @IsInt()
  @Min(1)
  @Max(1000)
  world!: number;

  @Column({
    type: "enum",
    enum: WorldMode,
  })
  mode!: WorldMode;

  @Column()
  location_x!: number;

  @Column()
  location_y!: number;

  @Column()
  location_plane!: number;

  @Column()
  tier!: number;

  @Column({
    nullable: true,
  })
  hp?: number;

  @Column({
    nullable: true,
  })
  exact?: boolean;

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
        exact: starObservationReport.exact,
      })
      .updateEntity(false)
      .execute();
  }
}
