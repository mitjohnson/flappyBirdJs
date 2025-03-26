export interface Assets {
  images: {
    [key: string]: string;
  };
}
export interface LoadedAssets {
  [key: string]: HTMLImageElement;
}

export class AssetManager {
  private assets: Assets = {
    images: {
      "flappybird": "./assets/flappybird.png",
      "tPipe": "./assets/toppipe.png",
      "bPipe": "./assets/bottompipe.png",
    },
  };
  private loadedAssets: LoadedAssets = {};
  private loadedAssetsCount: number = 0;
  private totalAssets: number = Object.keys(this.assets.images).length;

  public preloadAssets(): Promise<void> {
    return new Promise((resolve, reject) => {

      for (const key in this.assets.images) {
        const img = new Image();

        img.src = this.assets.images[key];
        img.id = key
        console.log(key);
        img.onload = () => {
          this.loadedAssets[key] = img;
          this.loadedAssetsCount++;
          if (this.loadedAssetsCount === this.totalAssets) {
            resolve(); // All assets loaded
          }
        };
        img.onerror = () => {
          console.error(`Failed to load image: ${this.assets.images[key]}`);
          reject(new Error(`Failed to load image: ${this.assets.images[key]}`));
        };
      }
    });
  }
  public getAsset(name: string): HTMLImageElement | null {

    for (let key in this.loadedAssets) {
      console.log(this.loadedAssets[key]);
      if (key.toLowerCase() === name.toLowerCase()) {
        return this.loadedAssets[key];
      }
    }
    console.log('not found :\(');
    return null;
  }
}
export default AssetManager;
