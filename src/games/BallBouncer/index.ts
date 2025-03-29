import * as THREE from 'three';
import { Game } from '../../interfaces/Game';

export class BallBouncer implements Game {
  private ball: THREE.Mesh | null = null;
  private velocity = new THREE.Vector3(0.05, 0.03, 0);
  private bounds = { x: 3, y: 2 };
  
  constructor(private scene: THREE.Scene, private camera: THREE.Camera) {}
  
  getName(): string {
    return 'Ball Bouncer';
  }
  
  init(): void {
    // Create a sphere
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xff5500 });
    this.ball = new THREE.Mesh(geometry, material);
    this.scene.add(this.ball);
    
    // Position camera
    this.camera.position.z = 5;
  }
  
  update(): void {
    if (this.ball) {
      // Move the ball
      this.ball.position.x += this.velocity.x;
      this.ball.position.y += this.velocity.y;
      
      // Bounce off walls
      if (Math.abs(this.ball.position.x) > this.bounds.x) {
        this.velocity.x *= -1;
      }
      
      if (Math.abs(this.ball.position.y) > this.bounds.y) {
        this.velocity.y *= -1;
      }
      
      // Rotate the ball as it moves
      this.ball.rotation.x += 0.01;
      this.ball.rotation.z += 0.01;
    }
  }
  
  cleanup(): void {
    if (this.ball) {
      this.scene.remove(this.ball);
      this.ball.geometry.dispose();
      (this.ball.material as THREE.Material).dispose();
      this.ball = null;
    }
  }
}