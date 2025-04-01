import AssetManager from "./AssetManager.js";
import Bird from './Bird.js';
import PipeManager from "./PipeManager.js";
import Menu from "./Menu.js";

export enum GameState {
  RUNNING,
  STOPPED,
  GAME_OVER
};

export class Game {
  private gameState = GameState.STOPPED;
  private board;
  private ctx;
  private score = 0;
  private bird: Bird | null = null;
  private pipeManager: PipeManager | null = null;
  private assetManager: AssetManager | null = null;

  constructor(board: HTMLCanvasElement) {
    try {
      this.board = board;
      if (!this.board) throw new Error('Failed to find board.');
      this.ctx = this.initBoard();
      if (!this.ctx) throw new Error('Failed to obtain 2d context.');
      this.assetManager = new AssetManager();
      if (!this.assetManager) throw new Error('Failed to load AssetManager');
    } catch (e) {
      console.error(e);
      return;
    };

    this.addServWorker();
    this.assetManager.preloadAssets()
      .then(() => {
        if (!this.board) throw new Error('No board found');
        if (!this.assetManager) throw new Error('no AssetManager found');

        this.pipeManager = new PipeManager(
          this.assetManager.getAsset('tPipe') || new Image(),
          this.assetManager.getAsset('bPipe') || new Image(),
          this.ctx as CanvasRenderingContext2D,
          this.board.width || 360,
          this.board.height || 640,
        );
        if (!this.pipeManager) throw new Error('unable to load in PipeManager');
        this.pipeManager.loadPipes();

        this.bird = new Bird(
          this.board.width / 8,
          this.board.height / 2,
          68,
          48,
          this.assetManager.getAsset('flappybird') || new Image(),
          this.ctx as CanvasRenderingContext2D
        );
        if (!this.bird) throw new Error('Coudn\'t load Bird');
        this.bird.draw();
        this.pipeManager.update(this.bird);
      })
      .catch(error => {
        console.error(error);
        return;
      })
      .finally(() => { });
  }
  private startGame = () => {
    this.gameState = GameState.RUNNING;

    const loop = () => {
      try {
        if (!this.bird) throw new Error('Bird not found');
        if (!this.pipeManager) throw new Error('PipeManager not found');
        if (!this.ctx) throw new Error('Unable to find 2d context');
        if (!this.board) throw new Error('unable to find board');

        this.ctx.clearRect(0, 0, this.board.width, this.board.height);
        this.bird.update();
        this.bird.draw();

        this.pipeManager.update(this.bird);

        if (this.checkCollision(this.bird)) {
          this.setState(GameState.GAME_OVER);
          const pauseButton = document.getElementById('pauseButton');
          const startButton = document.getElementById('startButton');
          if (!pauseButton || !startButton) throw new Error('Unable to find buttons');
          pauseButton.style.display = 'none';
          pauseButton.className = '';
          pauseButton.focus();

          startButton.style.display = 'block';
          startButton.className = 'pauseMenu';
          startButton.innerText = 'Play Again?';
        };
        const pipes = this.pipeManager.getPipes();

        for (let i = 0; i < pipes.length; i++) {
          if (pipes[i].isPassed() && !pipes[i].scored) {
            this.score = this.score + 1;
            pipes[i].scored = true;
            break;
          }
        };

        this.ctx.font = '20px Arial Black';
        this.ctx.fillText(String(this.score), this.board.width / 2, this.board.height / 6);

      } catch (e) { console.error(e); }

      if (this.gameState !== GameState.RUNNING) {
        return;
      };
      window.requestAnimationFrame(loop);
    };
    loop();
  };
  private keyDownHandler = (e: KeyboardEvent) => {
    const pauseBtn = document.getElementById('pauseButton');
    const startBtn = document.getElementById('startButton');
    switch (e.key) {
      case " ":
        e.preventDefault();
        if (this.getState() === GameState.RUNNING) {
          this.bird ? this.bird.flap() : console.log('The bird is gone??');
          break;
        };
        if (!startBtn) { console.error('couldn\'t find start button'); break; }
        startBtn.click()
        break;
      case "p":
        if (!pauseBtn) { console.error('couldn\'t find pause button'); break; }
        pauseBtn.click()
        break;
    }
  };
  public resetBoard = () => {
    if (!this.bird || !this.board || !this.pipeManager) throw new Error('missing bird, board, or pipeManager');
    this.bird.x = this.board.height / 8;
    this.bird.y = this.board.width / 2;
    this.pipeManager.destroyPipes();
    this.pipeManager.loadPipes();
    this.score = 0;
  };
  private checkCollision = (bird: Bird) => {

    const birdX = bird.x;
    const birdY = bird.y;
    const birdH = bird.height - 30;
    const birdW = bird.width - 30;

    const pipeList = this.pipeManager?.getPipes();
    if (!pipeList) throw new Error('Unable to get list of pipes');

    for (let i = 0; i < pipeList.length; ++i) {
      if ((birdX + birdW) > pipeList[i].xCord && birdX < (pipeList[i].xCord + pipeList[i].width)) {
        if (birdY < (pipeList[i].yCord + pipeList[i].height) && (birdY + birdH) > pipeList[i].yCord) {
          return true;
        };
      };
    };
    return false;
  };

  public getState = () => { return this.gameState; }
  public setState = (gameState: GameState) => { this.gameState = gameState };
  public update = () => {
    switch (this.gameState) {
      case GameState.RUNNING:
        this.startGame();
        break;
      case GameState.STOPPED:
        break;
    };
  };
  private initBoard = () => {
    try {
      if (!this.board) throw new Error('Board not found');

      this.board.height = 640;
      this.board.width = 360;
      this.board.tabIndex = 0;
      this.board.focus();
      this.board.style.backgroundImage = 'url("/assets/flappybirdbg.png")';

      this.board.addEventListener('keydown', this.keyDownHandler, false);
      this.board.addEventListener('click', () => this.bird?.flap());
      const ctx = this.board.getContext('2d');
      if (!ctx) throw new Error('Failed to obtain 2d context');

      return ctx;
    } catch (e) {
      console.error(e);
      return;
    }

  }
  private addServWorker = () => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(() => {
            console.log('Service Worker Registered.');
          })
          .catch(err => {
            console.error(err);
          });
      });
    };
  };
};

new Menu(new Game(document.getElementById('game-canvas') as HTMLCanvasElement));

