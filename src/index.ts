import * as THREE from 'three';
import { Game } from './interfaces/Game';
import { CubeRotator } from './games/CubeRotator/index';
import { BallBouncer } from './games/BallBouncer/index';
import { ColorShifter } from './games/ColorShifter/index';
import { FlightSimulator } from './games/FlightSimulator/index';

interface GameInfo {
  name: string;
  url?: string;
  instance?: Game;
}

class GameLauncher {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private currentGame: Game | null = null;
  private games: GameInfo[] = [];
  private iframe: HTMLIFrameElement | null = null;

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
    // Add local games to the collection
    this.games.push({
      name: 'Cube Rotator',
      instance: new CubeRotator(this.scene, this.camera)
    });
    this.games.push({
      name: 'Ball Bouncer',
      instance: new BallBouncer(this.scene, this.camera)
    });
    this.games.push({
      name: 'Color Shifter',
      instance: new ColorShifter(this.scene, this.camera)
    });
    this.games.push({
      name: 'Flight Simulator',
      instance: new FlightSimulator(this.scene, this.camera)
    });
    
    // Add external games (3rd party)
    this.games.push({
      name: 'External Game 1',
      url: 'https://hexgl.bkcore.com/play/'
    });
    this.games.push({
      name: 'External Game 2',
      url: 'https://beinternetawesome.withgoogle.com/en_us/interland'
    });
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
      button.textContent = game.name;
      button.style.display = 'block';
      button.style.margin = '5px 0';
      button.style.padding = '8px 16px';
      button.style.cursor = 'pointer';
      
      // Add a visual indicator for external games
      if (game.url) {
        button.style.backgroundColor = '#4488ff';
        button.title = 'External Game';
      }
      
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
    
    const gameInfo = this.games[index];
    
    if (gameInfo.url) {
      // Launch external game in an iframe
      this.launchExternalGame(gameInfo.url);
    } else if (gameInfo.instance) {
      // Launch local game
      this.currentGame = gameInfo.instance;
      this.currentGame.init();
      
      // Show game-specific UI if implemented
      if (this.currentGame.showUI) {
        this.currentGame.showUI();
      }
    }
  }
  
  private launchExternalGame(url: string): void {
    // Hide the renderer for external games
    this.renderer.domElement.style.display = 'none';
    
    // Create an iframe to load the external game
    this.iframe = document.createElement('iframe');
    this.iframe.src = url;
    this.iframe.style.position = 'absolute';
    this.iframe.style.top = '0';
    this.iframe.style.left = '0';
    this.iframe.style.width = '100%';
    this.iframe.style.height = '100%';
    this.iframe.style.border = 'none';
    
    document.body.appendChild(this.iframe);
  }
  
  private exitCurrentGame(): void {
    if (this.iframe) {
      // Remove external game iframe
      document.body.removeChild(this.iframe);
      this.iframe = null;
      
      // Show the renderer again
      this.renderer.domElement.style.display = 'block';
    }
    
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