import { Entity, Column, PrimaryColumn, BaseEntity } from "typeorm";
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

  @PrimaryColumn({
    type: "timestamp",
    precision: 6,
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  recorded_at!: Date;

  @Column({ nullable: true })
  reportedBy?: string;

  @Column({
    type: "enum",
    enum: WorldMode,
  })
  mode!: WorldMode;

  @Column()
  cannonVarbit!: number;

  @Column({
    type: "timestamp",
    precision: 6,
  })
  time_from_client!: Date;

  static async insertCannonObservationReport(
    cannonObservationReport: CannonObservationReport,
    reportedBy: string | undefined,
  ): Promise<void> {
    await AppDataSource.createQueryBuilder()
      .insert()
      .into(CannonObservation)
      .values({
        world: cannonObservationReport.world,
        mode: cannonObservationReport.mode,
        cannonVarbit: cannonObservationReport.cannonVarbit,
        time_from_client: cannonObservationReport.time,
        reportedBy,
      })
      .updateEntity(false)
      .execute();
  }
}
