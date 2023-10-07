import { Entity, Column, PrimaryColumn, BaseEntity, Timestamp } from "typeorm";
import { WorldMode } from "../enum/WorldMode";
import { Min, IsInt, Max } from "class-validator";
import { AppDataSource } from "../services/DBService";
import { type CannonObservationReport } from "../types/CannonObservationReport";

@Entity("cannon_observation")
export default class CannonObservation extends BaseEntity {
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

  @Column()
  varbit2180!: number;

  @Column()
  time_from_client!: Date;

  static async insertCannonObservationReport(
    cannonObservationReport: CannonObservationReport,
  ): Promise<void> {
    await AppDataSource.createQueryBuilder()
      .insert()
      .into(CannonObservation)
      .values({
        world: cannonObservationReport.world,
        mode: cannonObservationReport.mode,
        varbit2180: cannonObservationReport.varbit2180,
        time_from_client: cannonObservationReport.time,
      })
      .updateEntity(false)
      .execute();
  }
}
