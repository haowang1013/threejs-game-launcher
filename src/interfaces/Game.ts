import * as THREE from 'three';

export interface Game {
  getName(): string;
  init(): void;
  update(): void;
  cleanup(): void;
}