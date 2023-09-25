import { Entity, Column, PrimaryColumn, BaseEntity } from "typeorm";
import { WorldMode } from "../enum/WorldMode";

@Entity("star_observation")
export default class StarObservation extends BaseEntity {
  @PrimaryColumn()
  world!: number;

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
