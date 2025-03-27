import Bird from "./Bird";

export class Pipe {
  public xCord;
  public yCord;
  public width = 360;
  public height = 640;
  private img;
  private velocity = 2;
  private pastBird = false;
  public scored = false;

  constructor(xCord: number, yCord: number, width: number, height: number, img: HTMLImageElement) {
    this.width = width;
    this.height = height;
    this.xCord = xCord;
    this.yCord = yCord;
    this.img = img;
  };

  public update = (bird: Bird) => {
    this.xCord -= this.velocity;

    if (!this.pastBird && this.xCord + this.width < bird.x) {
      this.pastBird = true;
    };
  };

  public draw = (ctx: CanvasRenderingContext2D) => {
    ctx.drawImage(this.img, this.xCord, this.yCord, this.width, this.height);
  };
  public isPassed = () => { return this.pastBird };
};

export default class PipeManager {
  private pipes: Pipe[] = []
  private tPipe;
  private bPipe;
  private ctx;

  private boardW
  private boardH;

  constructor(
    tPipe: HTMLImageElement,
    bPipe: HTMLImageElement,
    ctx: CanvasRenderingContext2D,
    boardW: number,
    boardH: number) {
    try {

      this.tPipe = tPipe;
      if (!this.tPipe) throw new Error('Unable to find top pipe image');
      this.bPipe = bPipe;
      if (!this.bPipe) throw new Error('Unable to find bottom pipe image')
      this.ctx = ctx;
      if (!this.ctx) throw new Error('No 2D context found');
      this.boardW = boardW;
      this.boardH = boardH;

    } catch (e) {
      console.error(e);
      return;
    };
  };

  public destroyPipes = () => { this.pipes = [] };
  public getPipes = () => { return this.pipes }
  public loadPipes = () => {
    const width = (this.boardW || 360);
    const pipeGap = (this.boardH || 640) / 4;
    const pipeSpacing = width / 2;
    const numOfPipes = 2;

    for (let i = 0; i < numOfPipes; i++) {
      const topPipe = new Pipe(
        width + i * pipeSpacing,
        this.getRandomPipeSpacing(512),
        64,
        512,
        this.tPipe || new Image()
      );
      topPipe.scored = true;
      this.pipes.push(topPipe);

      const bottomPipe = new Pipe(
        width + i * pipeSpacing,
        topPipe.yCord + 512 + pipeGap,
        64,
        512,
        this.bPipe || new Image()
      );
      bottomPipe.scored = true;
      this.pipes.push(bottomPipe);
    };
  };

  public update = (bird: Bird) => {
    if (!bird) throw new Error('no bird found');
    if (!this.ctx) throw new Error('no 2d context');
    const width = (this.boardW || 360);
    const height = (this.boardH || 640);
    let topPipe: Pipe;
    let bottomPipe: Pipe;

    for (let i = 0; i < this.pipes.length; i += 2) {
      topPipe = this.pipes[i];
      bottomPipe = this.pipes[i + 1];

      topPipe.update(bird);
      topPipe.draw(this.ctx);
      bottomPipe.update(bird);
      bottomPipe.draw(this.ctx);

      if (topPipe.xCord < -topPipe.width) {
        topPipe.xCord = width;
        topPipe.yCord = this.getRandomPipeSpacing(512);
        bottomPipe.xCord = width;
        bottomPipe.yCord = topPipe.yCord + 512 + height / 4;

        topPipe.scored = false;
        bottomPipe.scored = false;

        if (topPipe.isPassed() && !topPipe.scored) {
          // TODO: Add score
          topPipe.scored = true;
        };
      };
    };
  };

  private getRandomPipeSpacing = (height: number) => {
    return 0 - height / 4 - Math.random() * height / 2;
  };

};
