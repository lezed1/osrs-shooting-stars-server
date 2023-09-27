import { Min, IsInt, Max, IsEnum, IsString, MaxLength } from "class-validator";
import { WorldMode } from "../enum/WorldMode";

export class TelescopeObservationReport {
  @IsInt()
  @Min(1)
  @Max(1000)
  world!: number;

  @IsEnum(WorldMode)
  mode!: WorldMode;

  @IsString()
  @MaxLength(250)
  message!: string;
}
