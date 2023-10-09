import { Min, IsInt, Max, IsEnum, IsPositive, IsDate } from "class-validator";
import { WorldMode } from "../enum/WorldMode";

export class CannonObservationReport {
  @IsInt()
  @Min(1)
  @Max(1000)
  world!: number;

  @IsEnum(WorldMode)
  mode!: WorldMode;

  @IsInt()
  @IsPositive()
  cannonVarbit!: number;

  @IsDate()
  time!: Date;
}
