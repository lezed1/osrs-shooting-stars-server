import { Entity, Column, PrimaryColumn, BaseEntity } from "typeorm";
import { WorldMode } from "../enum/WorldMode";
import { Min, IsInt, Max } from "class-validator";
import { AppDataSource } from "../services/DBService";
import { type TelescopeObservationReport } from "../types/TelescopeObservationReport";

@Entity("telescope_observation")
export default class TelescopeObservation extends BaseEntity {
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

  @Column({
    type: "enum",
    enum: WorldMode,
  })
  mode!: WorldMode;

  @Column()
  message!: string;

  static async insertTelescopeObservationReport(
    telescopeObservationReport: TelescopeObservationReport,
  ): Promise<void> {
    await AppDataSource.createQueryBuilder()
      .insert()
      .into(TelescopeObservation)
      .values({
        world: telescopeObservationReport.world,
        mode: telescopeObservationReport.mode,
        message: telescopeObservationReport.message,
      })
      .updateEntity(false)
      .execute();
  }
}
