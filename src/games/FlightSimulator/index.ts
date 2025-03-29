import * as THREE from 'three';
import { Game } from '../../interfaces/Game';

export class FlightSimulator implements Game {
  private airplane: THREE.Group | null = null;
  private clouds: THREE.Mesh[] = [];
  private terrain: THREE.Mesh | null = null;
  private skybox: THREE.Mesh | null = null;
  private speed = 0.05;
  private rotationSpeed = 0.02;
  private pitch = 0;
  private yaw = 0;
  private roll = 0;
  private keyState: { [key: string]: boolean } = {};
  private instructionsEl: HTMLDivElement | null = null;
  
  constructor(private scene: THREE.Scene, private camera: THREE.Camera) {}
  
  getName(): string {
    return 'Cartoon Flight Simulator';
  }
  
  private handleKeyDown = (e: KeyboardEvent) => this.keyState[e.key] = true;
  private handleKeyUp = (e: KeyboardEvent) => this.keyState[e.key] = false;
  
  init(): void {
    // Set up key listeners with bound methods
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    
    // Create skybox
    const skyGeometry = new THREE.BoxGeometry(1000, 1000, 1000);
    const skyMaterial = new THREE.MeshBasicMaterial({
      color: 0x87CEEB, // Sky blue
      side: THREE.BackSide
    });
    this.skybox = new THREE.Mesh(skyGeometry, skyMaterial);
    this.scene.add(this.skybox);
    
    // Create terrain
    const terrainGeometry = new THREE.PlaneGeometry(500, 500, 50, 50);
    const terrainMaterial = new THREE.MeshBasicMaterial({
      color: 0x228B22, // Forest green
      wireframe: false,
      side: THREE.DoubleSide
    });
    
    // Add some random height to terrain vertices
    const vertices = terrainGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      if (i % 3 === 1) { // y-coordinate
        (vertices as any)[i] = Math.random() * 10 - 20; // Random height between -20 and -10
      }
    }
    
    this.terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
    this.terrain.rotation.x = Math.PI / 2;
    this.terrain.position.y = -30;
    this.scene.add(this.terrain);
    
    // Create cartoon airplane
    this.createAirplane();
    
    // Create clouds
    this.createClouds(30);
    
    // Position camera
    this.camera.position.set(0, 3, -20);
    this.camera.lookAt(0, 0, -10);
  }
  
  private createAirplane(): void {
    this.airplane = new THREE.Group();
    
    // Airplane body (fuselage)
    const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 4, 8);
    const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0xFF6347 }); // Tomato red
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI / 2; // Correctly rotated to point along Z-axis
    this.airplane.add(body);
    
    // Wings
    const wingGeometry = new THREE.BoxGeometry(5, 0.1, 1);
    const wingMaterial = new THREE.MeshBasicMaterial({ color: 0x4169E1 }); // Royal blue
    const wings = new THREE.Mesh(wingGeometry, wingMaterial);
    // Position needs to be adjusted for X-axis rotation
    wings.position.set(0, 0, 0); // Center on the fuselage
    this.airplane.add(wings);
    
    // Tail
    const tailGeometry = new THREE.BoxGeometry(1, 0.1, 1);
    const tailMaterial = new THREE.MeshBasicMaterial({ color: 0x4169E1 });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    // Position needs to be adjusted for X-axis rotation
    tail.position.set(0, 0, 1.5); // Move to back of fuselage
    this.airplane.add(tail);
    
    // Vertical stabilizer
    const vStabGeometry = new THREE.BoxGeometry(0.8, 1, 0.1);
    const vStabMaterial = new THREE.MeshBasicMaterial({ color: 0xFF6347 });
    const vStab = new THREE.Mesh(vStabGeometry, vStabMaterial);
    // Position needs to be adjusted for X-axis rotation
    vStab.position.set(0, 0.5, 1.5); // Above the tail
    this.airplane.add(vStab);
    
    // Propeller
    const propGeometry = new THREE.BoxGeometry(0.1, 1.5, 0.1);
    const propMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const propeller = new THREE.Mesh(propGeometry, propMaterial);
    // Make propeller larger and ensure it's positioned correctly
    propeller.position.set(0, 0, -2.1); // Slightly further forward
    propeller.scale.set(2, 2, 2); // Make it larger
    this.airplane.add(propeller);
    
    // Add airplane to scene
    this.scene.add(this.airplane);
    
    // Position airplane
    this.airplane.position.set(0, 0, -10);
  }
  
  private createClouds(count: number): void {
    const cloudGeometry = new THREE.SphereGeometry(1, 7, 7);
    const cloudMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    
    for (let i = 0; i < count; i++) {
      const cloud = new THREE.Group();
      
      // Create cloud puffs
      const puffCount = 3 + Math.floor(Math.random() * 3);
      for (let j = 0; j < puffCount; j++) {
        const puff = new THREE.Mesh(cloudGeometry, cloudMaterial);
        const scale = 0.5 + Math.random() * 0.5;
        puff.scale.set(scale, scale, scale);
        puff.position.set(
          Math.random() * 2 - 1,
          Math.random() * 0.5,
          Math.random() * 2 - 1
        );
        cloud.add(puff);
      }
      
      // Position cloud randomly in sky
      cloud.position.set(
        Math.random() * 200 - 100,
        10 + Math.random() * 20,
        Math.random() * 200 - 100
      );
      
      this.clouds.push(cloud as any);
      this.scene.add(cloud);
    }
  }
  
  update(): void {
    if (!this.airplane) return;
    
    // Handle keyboard controls
    this.handleControls();
    
    // Apply rotation to airplane
    this.airplane.rotation.x = this.pitch;
    this.airplane.rotation.y = this.yaw;
    this.airplane.rotation.z = this.roll;
    
    // Move airplane forward
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(this.airplane.quaternion);
    direction.multiplyScalar(this.speed);
    this.airplane.position.add(direction);
    
    // Update camera position to follow airplane
    const cameraOffset = new THREE.Vector3(0, 1, 8);
    cameraOffset.applyQuaternion(this.airplane.quaternion);
    this.camera.position.copy(this.airplane.position).add(cameraOffset);
    
    // Make camera look at the airplane's forward direction
    const lookAtPos = new THREE.Vector3(0, 0, -5);
    lookAtPos.applyQuaternion(this.airplane.quaternion);
    lookAtPos.add(this.airplane.position);
    this.camera.lookAt(lookAtPos);
    
    // Rotate propeller - adjusted for new orientation
    // Rotate propeller - adjusted for new orientation
    if (this.airplane.children[4]) {
    // Use rotation around Z axis for a more visible spinning effect
    this.airplane.children[4].rotation.z += 0.5;
    }
    
    // Move clouds slowly
    this.clouds.forEach(cloud => {
      cloud.position.z += 0.1;
      if (cloud.position.z > 100) {
        cloud.position.z = -100;
        cloud.position.x = Math.random() * 200 - 100;
        cloud.position.y = 10 + Math.random() * 20;
      }
    });
  }
  
  handleControls(): void {
    // Pitch control (up/down)
    if (this.keyState['ArrowUp']) {
      this.pitch -= this.rotationSpeed;
    }
    if (this.keyState['ArrowDown']) {
      this.pitch += this.rotationSpeed;
    }
    
    // Yaw control (left/right)
    if (this.keyState['a'] || this.keyState['A']) {
      this.yaw += this.rotationSpeed;
    }
    if (this.keyState['d'] || this.keyState['D']) {
      this.yaw -= this.rotationSpeed;
    }
    
    // Roll control (tilt)
    if (this.keyState['ArrowLeft']) {
      this.roll += this.rotationSpeed;
    }
    if (this.keyState['ArrowRight']) {
      this.roll -= this.rotationSpeed;
    }
    
    // Speed control
    if (this.keyState['w'] || this.keyState['W']) {
      this.speed += 0.001;
    }
    if (this.keyState['s'] || this.keyState['S']) {
      this.speed -= 0.001;
    }
    
    // Limit values
    this.pitch = Math.max(Math.min(this.pitch, Math.PI / 4), -Math.PI / 4);
    this.roll = Math.max(Math.min(this.roll, Math.PI / 4), -Math.PI / 4);
    this.speed = Math.max(Math.min(this.speed, 0.2), 0.01);
    
    // Gradually return to neutral position when no keys are pressed
    if (!this.keyState['ArrowUp'] && !this.keyState['ArrowDown']) {
      this.pitch *= 0.99;
    }
    if (!this.keyState['ArrowLeft'] && !this.keyState['ArrowRight']) {
      this.roll *= 0.99;
    }
    if (!this.keyState['a'] && !this.keyState['A'] && !this.keyState['d'] && !this.keyState['D']) {
      this.yaw *= 0.99;
    }
  }
  
  cleanup(): void {
    // Remove event listeners with proper references
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    
    // Remove airplane
    if (this.airplane) {
      this.scene.remove(this.airplane);
      this.airplane.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          (child.material as THREE.Material).dispose();
        }
      });
      this.airplane = null;
    }
    
    // Remove clouds
    this.clouds.forEach(cloud => {
      this.scene.remove(cloud);
      if (cloud instanceof THREE.Group) {
        cloud.children.forEach(child => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            (child.material as THREE.Material).dispose();
          }
        });
      }
    });
    this.clouds = [];
    
    // Remove terrain
    if (this.terrain) {
      this.scene.remove(this.terrain);
      this.terrain.geometry.dispose();
      (this.terrain.material as THREE.Material).dispose();
      this.terrain = null;
    }
    
    // Remove skybox
    if (this.skybox) {
      this.scene.remove(this.skybox);
      this.skybox.geometry.dispose();
      (this.skybox.material as THREE.Material).dispose();
      this.skybox = null;
    }
  }

  showUI(): void {
    this.instructionsEl = document.createElement('div');
    this.instructionsEl.id = 'flight-instructions';
    this.instructionsEl.style.position = 'absolute';
    this.instructionsEl.style.bottom = '10px';
    this.instructionsEl.style.right = '10px';
    this.instructionsEl.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    this.instructionsEl.style.color = 'white';
    this.instructionsEl.style.padding = '10px';
    this.instructionsEl.style.borderRadius = '5px';
    this.instructionsEl.style.maxWidth = '300px';
    
    this.instructionsEl.innerHTML = `
      <h3>Flight Controls:</h3>
      <ul>
        <li>↑/↓: Pitch (nose up/down)</li>
        <li>←/→: Roll (tilt left/right)</li>
        <li>A/D: Yaw (turn left/right)</li>
        <li>W/S: Increase/decrease speed</li>
      </ul>
    `;
    
    document.body.appendChild(this.instructionsEl);
  }

  hideUI(): void {
    if (this.instructionsEl) {
      document.body.removeChild(this.instructionsEl);
      this.instructionsEl = null;
    }
  }
}