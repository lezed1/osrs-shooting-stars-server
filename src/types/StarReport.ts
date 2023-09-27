import {
  Min,
  IsInt,
  Max,
  IsEnum,
  IsBoolean,
  ValidateNested,
  IsOptional,
} from "class-validator";
import { WorldMode } from "../enum/WorldMode";
import { Location } from "./Location";

export class StarReport {
  @IsInt()
  @Min(1)
  @Max(1000)
  world!: number;

  @IsEnum(WorldMode)
  mode!: WorldMode;

  @ValidateNested()
  location!: Location;

  @Min(0)
  @Max(9)
  tier!: number;

  @Min(0)
  @Max(100)
  @IsOptional()
  hp?: number;

  @IsBoolean()
  @IsOptional()
  exact?: boolean;
}
