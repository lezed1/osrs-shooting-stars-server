import { type WorldMode } from "../enum/WorldMode";

export interface StarReport {
  world: number;
  mode: WorldMode;
  location: { x: number; y: number; plane: number };
  tier: number;
  progress?: number;
}
