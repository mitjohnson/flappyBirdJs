export default class Bird {
  public x;
  public y;
  private width;
  private height;
  private velocity = 0;
  private gravity = 1;
  private skin;
  private ctx;

  constructor(x: number, y: number, width: number, height: number, skin: HTMLImageElement, ctx: CanvasRenderingContext2D) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.skin = skin;

    this.ctx = ctx;
  };

  public update = () => {
    this.velocity += this.gravity;

    this.y = Math.max(this.y + this.velocity, 0);

    if (this.y > 640 - this.height) {
      this.y = 640 - this.height;
      this.velocity = 0;
    }
  };

  public draw = () => {
    if (this.ctx) {
      this.ctx.drawImage(this.skin, this.x, this.y, this.width / 2, this.height / 2);
    }
  };
  public flap = () => this.velocity = this.velocity = -10;
};

