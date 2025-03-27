import { Game, GameState } from "./flappybird.js";

enum MenuState {
  GAME_PLAYING,
  PAUSE_MENU,
  START_MENU,
  GAME_OVER,
};

class Menu {
  private menuState: MenuState = MenuState.START_MENU;
  private startButton = document.getElementById('startButton');
  private pauseButton = document.getElementById('pauseButton');
  private canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  private game: Game | null = null;
  constructor(Game: Game) {

    if (!this.canvas) throw new Error('No canvas found');
    if (!this.startButton) this.startButton = document.createElement('button');
    if (!this.pauseButton) this.pauseButton = document.createElement('button');
    this.game = Game
    if (!this.game) throw new Error('Couldn\'t find reference to game.');
    this.setUpButtons();

  }
  private setUpButtons = () => {
    if (!this.startButton) throw new Error('No startButton found.');
    if (!this.pauseButton) throw new Error('No pauseButton found.');

    const baseButton = (button: HTMLElement) => {
      button.style.width = '30';
      button.style.display = 'block';
      button.style.width = '10';
    };

    try {

      this.startButton.id = 'startButton';
      this.startButton.addEventListener('click', this.handleStart);
      this.pauseButton.id = 'pauseButton';
      this.pauseButton.addEventListener('click', this.handlePause);

      baseButton(this.startButton);
      baseButton(this.pauseButton);

      const container = document.getElementById('game-container');
      if (!container) throw new Error('Unable to find comainer element');
      container.appendChild(this.startButton);
      container.appendChild(this.pauseButton);

      this.pauseMenu('Start?');

    } catch (e) { console.error(e) }
  };
  public getState = () => { return this.menuState };
  public setState = (state: MenuState) => { this.menuState = state };

  private handleStart = () => {
    if (!this.game) throw new Error('Couldn\'t find game.')
    if (this.game.getState() === GameState.GAME_OVER) this.game.resetBoard();
    if (this.game.getState() === GameState.RUNNING) return;
    this.menuState = MenuState.GAME_PLAYING;
    this.game.setState(GameState.RUNNING);
    this.game.update();
    this.update();
  }
  private handlePause = () => {
    if (!this.game) throw new Error('Couldn\'t find game.');
    this.menuState = MenuState.PAUSE_MENU;
    this.game.setState(GameState.STOPPED);
    this.game.update();
    this.update();
  };
  private pauseMenu = (text: string) => {
    if (!this.pauseButton || !this.startButton) throw new Error('couldn\'t find buttons');

    this.pauseButton.style.display = 'none';
    this.pauseButton.className = '';
    this.pauseButton.focus();

    this.startButton.style.display = 'block';
    this.startButton.className = 'pauseMenu';
    this.startButton.innerText = text;
  };

  private playingMenu = () => {
    if (!this.pauseButton || !this.startButton) throw new Error('couldn\'t find buttons');

    this.startButton.style.display = 'none';
    this.startButton.className = '';
    this.pauseButton.style.display = 'block';
    this.pauseButton.className = 'playingMenu';
    this.pauseButton.innerText = 'PAUSE';
  };
  public update = () => {

    if (this.game?.getState() === GameState.GAME_OVER) this.setState(MenuState.GAME_OVER);

    switch (this.menuState) {
      case MenuState.GAME_PLAYING:
        this.playingMenu();
        break;
      case MenuState.PAUSE_MENU:
        this.pauseMenu('RESUME');
        break;
      case MenuState.START_MENU:
        this.pauseMenu('START');
        break;
      case MenuState.GAME_OVER:
        this.pauseMenu('PLAY AGAIN?');
        break;
      default:
        break;
    };
  };
};
export default Menu;
