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
      } else if (index >= 4) {
        // Custom games (added after the initial 4 built-in games)
        button.style.backgroundColor = '#aa44ff';
        button.title = 'Custom Game';
      }
      
      button.addEventListener('click', () => {
        this.launchGame(index);
      });
      
      menuContainer.appendChild(button);
    });
    
    // Add a "Create Custom Game" button
    const createGameButton = document.createElement('button');
    createGameButton.textContent = 'Create Custom Game';
    createGameButton.style.display = 'block';
    createGameButton.style.margin = '15px 0 5px 0';
    createGameButton.style.padding = '8px 16px';
    createGameButton.style.cursor = 'pointer';
    createGameButton.style.backgroundColor = '#44cc44';
    
    createGameButton.addEventListener('click', () => {
      this.showCreateGameUI();
    });
    
    menuContainer.appendChild(createGameButton);
    
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

  private showCreateGameUI(): void {
    // Create a modal dialog for game creation
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    modal.style.zIndex = '1000';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.padding = '20px';

    // Create a container for the form
    const container = document.createElement('div');
    container.style.backgroundColor = '#222';
    container.style.padding = '20px';
    container.style.borderRadius = '5px';
    container.style.width = '80%';
    container.style.maxWidth = '800px';
    container.style.maxHeight = '80%';
    container.style.overflowY = 'auto';

    // Create a title
    const title = document.createElement('h2');
    title.textContent = 'Create Custom Game';
    title.style.color = 'white';
    title.style.marginTop = '0';
    container.appendChild(title);

    // Create a description
    const description = document.createElement('p');
    description.textContent = 'Enter JavaScript code that implements the Game interface. Your code should define a class that has init(), update(), and cleanup() methods.';
    description.style.color = 'white';
    container.appendChild(description);

    // Create a code example
    const example = document.createElement('pre');
    example.textContent = `// Example:
class MyCustomGame {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.objects = [];
  }

  init() {
    // Create your game objects here
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);
    this.objects.push(cube);
  }

  update() {
    // Update your game objects here
    this.objects.forEach(obj => {
      obj.rotation.x += 0.01;
      obj.rotation.y += 0.01;
    });
  }

  cleanup() {
    // Remove your game objects here
    this.objects.forEach(obj => {
      this.scene.remove(obj);
    });
    this.objects = [];
  }
}

// Important: Your code should either:
// 1. Define a class named MyCustomGame (as shown above), or
// 2. Return a constructor function as the last expression
`;
    example.style.color = '#aaffaa';
    example.style.backgroundColor = '#333';
    example.style.padding = '10px';
    example.style.borderRadius = '5px';
    example.style.overflow = 'auto';
    container.appendChild(example);

    // Create a name input
    const nameLabel = document.createElement('label');
    nameLabel.textContent = 'Game Name:';
    nameLabel.style.color = 'white';
    nameLabel.style.display = 'block';
    nameLabel.style.marginTop = '15px';
    container.appendChild(nameLabel);

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'My Custom Game';
    nameInput.style.width = '100%';
    nameInput.style.padding = '8px';
    nameInput.style.marginTop = '5px';
    nameInput.style.backgroundColor = '#333';
    nameInput.style.color = 'white';
    nameInput.style.border = '1px solid #555';
    nameInput.style.borderRadius = '3px';
    container.appendChild(nameInput);

    // Create a code input
    const codeLabel = document.createElement('label');
    codeLabel.textContent = 'Game Code:';
    codeLabel.style.color = 'white';
    codeLabel.style.display = 'block';
    codeLabel.style.marginTop = '15px';
    container.appendChild(codeLabel);

    const codeInput = document.createElement('textarea');
    codeInput.placeholder = 'Enter your game code here...';
    codeInput.style.width = '100%';
    codeInput.style.height = '300px';
    codeInput.style.padding = '8px';
    codeInput.style.marginTop = '5px';
    codeInput.style.backgroundColor = '#333';
    codeInput.style.color = 'white';
    codeInput.style.border = '1px solid #555';
    codeInput.style.borderRadius = '3px';
    codeInput.style.fontFamily = 'monospace';
    container.appendChild(codeInput);

    // Create buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginTop = '20px';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'space-between';

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.padding = '8px 16px';
    cancelButton.style.cursor = 'pointer';
    cancelButton.style.backgroundColor = '#ff5555';
    cancelButton.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    buttonContainer.appendChild(cancelButton);

    const createButton = document.createElement('button');
    createButton.textContent = 'Create Game';
    createButton.style.padding = '8px 16px';
    createButton.style.cursor = 'pointer';
    createButton.style.backgroundColor = '#44cc44';
    createButton.addEventListener('click', () => {
      const name = nameInput.value.trim() || 'Custom Game';
      const code = codeInput.value;
      this.createCustomGame(name, code);
      document.body.removeChild(modal);
    });
    buttonContainer.appendChild(createButton);

    container.appendChild(buttonContainer);
    modal.appendChild(container);
    document.body.appendChild(modal);
  }

  private createCustomGame(name: string, code: string): void {
    try {
      // Generate a unique name if the provided name is empty or already exists
      let uniqueName = name.trim() || 'Custom Game';
      
      // Check if the name already exists and append a number if needed
      let counter = 1;
      const originalName = uniqueName;
      while (this.games.some(game => game.name === uniqueName)) {
        uniqueName = `${originalName} ${counter}`;
        counter++;
      }
      
      // Use a simpler and more reliable approach to evaluate the code
      let gameClass;
      
      // First, try to evaluate the code in a sandbox function
      const sandbox = new Function('THREE', `
        let exportedClass;
        
        // Execute the user code
        ${code}
        
        // Check if MyCustomGame was defined
        if (typeof MyCustomGame === 'function') {
          exportedClass = MyCustomGame;
        }
        
        return exportedClass;
      `);
      
      // Execute the sandbox function with THREE as parameter
      gameClass = sandbox(THREE);
      
      // If no class was exported, try a direct evaluation approach
      if (!gameClass) {
        // Try to directly evaluate as a class expression
        try {
          gameClass = new Function('THREE', `return ${code}`)(THREE);
        } catch (e) {
          // If that fails, the code might not be a direct class expression
          throw new Error('Could not find a valid game class. Make sure your code defines a class named MyCustomGame or returns a class directly.');
        }
      }
      
      // Check if we got a valid constructor
      if (typeof gameClass !== 'function') {
        throw new Error('The code must define a class or constructor function');
      }
      
      // Create an instance of the game
      const gameInstance = new gameClass(this.scene, this.camera);
      
      // Verify that the game implements the required methods
      if (typeof gameInstance.init !== 'function' ||
          typeof gameInstance.update !== 'function' ||
          typeof gameInstance.cleanup !== 'function') {
        throw new Error('Custom game must implement init(), update(), and cleanup() methods');
      }
      
      // Add the game to the collection
      this.games.push({
        name: uniqueName,
        instance: gameInstance
      });
      
      // Refresh the UI to show the new game
      this.refreshGameSelectionUI();
      
      // Show an on-screen notification instead of an alert
      this.showNotification(`Game "${uniqueName}" created successfully!`);
    } catch (error) {
      console.error('Error creating custom game:', error);
      this.showNotification(`Error creating game: ${error.message}`, true);
    }
  }

  // Add a new method to show on-screen notifications
  private showNotification(message: string, isError: boolean = false): void {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '4px';
    notification.style.backgroundColor = isError ? '#ff5555' : '#44cc44';
    notification.style.color = 'white';
    notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    notification.style.zIndex = '2000';
    notification.style.maxWidth = '80%';
    notification.style.transition = 'opacity 0.5s ease-in-out';
    
    document.body.appendChild(notification);
    
    // Automatically remove the notification after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 500);
    }, 3000);
  }

  private refreshGameSelectionUI(): void {
    // Remove the existing UI
    const existingUI = document.querySelector('div[style*="position: absolute"][style*="top: 10px"][style*="left: 10px"]');
    if (existingUI) {
      document.body.removeChild(existingUI);
    }
    
    // Create a new UI
    this.createGameSelectionUI();
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