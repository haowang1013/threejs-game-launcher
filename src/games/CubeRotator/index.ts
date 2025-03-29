import * as THREE from 'three';
import { Game } from '../../interfaces/Game';

export class CubeRotator implements Game {
  private cube: THREE.Mesh | null = null;
  
  constructor(private scene: THREE.Scene, private camera: THREE.Camera) {}
  
  getName(): string {
    return 'Cube Rotator';
  }
  
  init(): void {
    // Create a cube
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube);
    
    // Position camera
    this.camera.position.z = 5;
  }
  
  update(): void {
    if (this.cube) {
      this.cube.rotation.x += 0.01;
      this.cube.rotation.y += 0.01;
    }
  }
  
  cleanup(): void {
    if (this.cube) {
      this.scene.remove(this.cube);
      this.cube.geometry.dispose();
      (this.cube.material as THREE.Material).dispose();
      this.cube = null;
    }
  }
}