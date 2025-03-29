import * as THREE from 'three';

export interface Game {
  getName(): string;
  init(): void;
  update(): void;
  cleanup(): void;
  showUI?(): void;  // Optional method for game-specific UI
  hideUI?(): void;  // Optional method to hide game-specific UI
}