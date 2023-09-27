import { Entity, Column, PrimaryColumn, BaseEntity, Timestamp } from "typeorm";
import { WorldMode } from "../enum/WorldMode";

@Entity("star_observation")
export default class StarObservation extends BaseEntity {
  @Column()
  world!: number;

  @PrimaryColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  recorded_at!: Timestamp;

  @Column({
    type: "enum",
    enum: WorldMode,
  })
  mode!: WorldMode;

  @PrimaryColumn()
  location!: string;

  @Column()
  tier!: number;

  @Column({
    nullable: true,
  })
  progress?: number;
}
