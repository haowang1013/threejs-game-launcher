import * as THREE from 'three';
import { Game } from '../../interfaces/Game';

export class ColorShifter implements Game {
  private objects: THREE.Mesh[] = [];
  private colorPhase = 0;
  
  constructor(private scene: THREE.Scene, private camera: THREE.Camera) {}
  
  getName(): string {
    return 'Color Shifter';
  }
  
  init(): void {
    // Create multiple objects with different shapes
    const shapes = [
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.SphereGeometry(0.5, 32, 32),
      new THREE.ConeGeometry(0.5, 1, 32),
      new THREE.TorusGeometry(0.5, 0.2, 16, 32)
    ];
    
    // Position objects in a circle
    for (let i = 0; i < shapes.length; i++) {
      const angle = (i / shapes.length) * Math.PI * 2;
      const radius = 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const mesh = new THREE.Mesh(shapes[i], material);
      mesh.position.set(x, y, 0);
      
      this.objects.push(mesh);
      this.scene.add(mesh);
    }
    
    // Position camera
    this.camera.position.z = 5;
  }
  
  update(): void {
    // Update color phase
    this.colorPhase += 0.01;
    
    // Update each object
    this.objects.forEach((obj, index) => {
      // Rotate object
      obj.rotation.x += 0.01;
      obj.rotation.y += 0.01;
      
      // Shift color based on position and time
      const hue = (this.colorPhase + index * 0.25) % 1;
      const color = new THREE.Color().setHSL(hue, 1, 0.5);
      (obj.material as THREE.MeshBasicMaterial).color = color;
    });
  }
  
  cleanup(): void {
    // Remove all objects
    this.objects.forEach(obj => {
      this.scene.remove(obj);
      obj.geometry.dispose();
      (obj.material as THREE.Material).dispose();
    });
    this.objects = [];
  }
}