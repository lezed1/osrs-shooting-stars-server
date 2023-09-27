import { IsInt } from "class-validator";

export class Location {
  @IsInt()
  x!: number;

  @IsInt()
  y!: number;

  @IsInt()
  plane!: number;
}
