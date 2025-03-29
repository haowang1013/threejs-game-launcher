import * as THREE from 'three';
import { Game } from './interfaces/Game';
import { CubeRotator } from './games/CubeRotator/index';
import { BallBouncer } from './games/BallBouncer/index';
import { ColorShifter } from './games/ColorShifter/index';
import { FlightSimulator } from './games/FlightSimulator/index';

class GameLauncher {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private currentGame: Game | null = null;
  private games: Game[] = [];

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.camera.position.z = 5;

    // Register available games
    this.registerGames();
    
    // Create game selection UI
    this.createGameSelectionUI();
    
    // Start animation loop
    this.animate();
  }

  private registerGames(): void {
    // Add games to the collection
    this.games.push(new CubeRotator(this.scene, this.camera));
    this.games.push(new BallBouncer(this.scene, this.camera));
    this.games.push(new ColorShifter(this.scene, this.camera));
    this.games.push(new FlightSimulator(this.scene, this.camera));
  }

  private createGameSelectionUI(): void {
    const menuContainer = document.createElement('div');
    menuContainer.style.position = 'absolute';
    menuContainer.style.top = '10px';
    menuContainer.style.left = '10px';
    menuContainer.style.zIndex = '100';
    menuContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    menuContainer.style.padding = '10px';
    menuContainer.style.borderRadius = '5px';
    
    const title = document.createElement('h2');
    title.textContent = 'Game Launcher';
    title.style.color = 'white';
    title.style.margin = '0 0 10px 0';
    menuContainer.appendChild(title);

    // Create buttons for each game
    this.games.forEach((game, index) => {
      const button = document.createElement('button');
      button.textContent = game.getName();
      button.style.display = 'block';
      button.style.margin = '5px 0';
      button.style.padding = '8px 16px';
      button.style.cursor = 'pointer';
      
      button.addEventListener('click', () => {
        this.launchGame(index);
      });
      
      menuContainer.appendChild(button);
    });
    
    // Add a home button to return to the launcher
    const homeButton = document.createElement('button');
    homeButton.textContent = 'Return to Launcher';
    homeButton.style.display = 'block';
    homeButton.style.margin = '15px 0 5px 0';
    homeButton.style.padding = '8px 16px';
    homeButton.style.cursor = 'pointer';
    homeButton.style.backgroundColor = '#ff5555';
    
    homeButton.addEventListener('click', () => {
      this.exitCurrentGame();
    });
    
    menuContainer.appendChild(homeButton);
    
    document.body.appendChild(menuContainer);
  }

  private launchGame(index: number): void {
    this.exitCurrentGame();
    
    this.currentGame = this.games[index];
    this.currentGame.init();
    
    // Show game-specific UI if implemented
    if (this.currentGame.showUI) {
      this.currentGame.showUI();
    }
  }
  
  private exitCurrentGame(): void {
    if (this.currentGame) {
      // Hide game-specific UI if implemented
      if (this.currentGame.hideUI) {
        this.currentGame.hideUI();
      }
      
      this.currentGame.cleanup();
      this.currentGame = null;
    }
  }
  
  private animate(): void {
    requestAnimationFrame(() => this.animate());

    // Update current game if one is active
    if (this.currentGame) {
      this.currentGame.update();
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize the game launcher
window.addEventListener('DOMContentLoaded', () => {
  new GameLauncher();
});