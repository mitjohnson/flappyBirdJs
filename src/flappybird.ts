import { log } from "console";
import AssetManager from "./asset-manager.js";
import Bird from './Bird.js';
import PipeManager from "./PipeManager.js";

enum GameState {
  RUNNING,
  PAUSED
};

class Game {
  private gameState = GameState.PAUSED;
  private board;
  private ctx;
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
      })
      .catch(error => {
        console.error(error);
        return;
      })
      .finally(() => this.startGame());
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

      } catch (e) { console.error(e); }

      if (this.gameState !== GameState.RUNNING) {
        return;
      };
      window.requestAnimationFrame(loop);
    };
    loop();
  };
  private keyDownHandler = (e: KeyboardEvent) => {
    switch (e.key) {
      case " ":
        e.preventDefault();
        this.bird ? this.bird.flap() : console.log('The bird is gone??');
        break;
    }
  };

  private initBoard = () => {
    try {
      if (!this.board) throw new Error('Board not found');

      this.board.height = 640;
      this.board.width = 360;
      this.board.tabIndex = 0;
      this.board.focus();
      this.board.style.backgroundImage = 'url("./assets/flappybirdbg.png")';

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
};

new Game(document.getElementById('game-canvas') as HTMLCanvasElement);

