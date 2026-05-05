import Phaser from 'phaser';
import { Main } from "./Main";
import { ZSceneStack, ZUpdatables } from 'zimporter-phaser';

const targetFPS = 24;

// HTML preloader — sits above the Phaser canvas while assets load
const preloaderEl = document.createElement('div');
Object.assign(preloaderEl.style, {
    position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
    backgroundColor: '#000000', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', zIndex: '100'
});

const loadingLabel = document.createElement('div');
Object.assign(loadingLabel.style, {
    color: '#ffffff', fontSize: '20px', fontFamily: 'Arial', marginBottom: '16px'
});
loadingLabel.textContent = 'Loading... 0%';

const barContainer = document.createElement('div');
Object.assign(barContainer.style, {
    width: '300px', height: '20px', backgroundColor: '#333333', borderRadius: '10px', overflow: 'hidden'
});

const barFill = document.createElement('div');
Object.assign(barFill.style, {
    width: '0%', height: '100%', backgroundColor: '#4488ff', borderRadius: '10px'
});

barContainer.appendChild(barFill);
preloaderEl.appendChild(loadingLabel);
preloaderEl.appendChild(barContainer);
document.body.appendChild(preloaderEl);

function updatePreloader(per: number) {
    const pct = Math.floor(per * 100);
    loadingLabel.textContent = `Loading... ${pct}%`;
    barFill.style.width = `${pct}%`;
}

function hidePreloader() {
    if (preloaderEl.parentNode) {
        document.body.removeChild(preloaderEl);
    }
}

const frameDuration = 1000 / targetFPS;

class GameScene extends Phaser.Scene {
    private main!: Main;
    private accumulator = 0;

    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        ZUpdatables.init(targetFPS);

        const resizeCanvas = () => {
            ZSceneStack.resize(this.scale.width, this.scale.height);
        };

        this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
            ZSceneStack.resize(gameSize.width, gameSize.height);
        });

        this.main = new Main(this, resizeCanvas, updatePreloader, hidePreloader);
    }

    update(_time: number, delta: number) {
        if (!this.main) return;
        this.accumulator += delta;
        while (this.accumulator >= frameDuration) {
            this.main.update(frameDuration / 1000);
            ZUpdatables.update();
            this.accumulator -= frameDuration;
        }
    }
}

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight,
    },
    scene: GameScene
};

new Phaser.Game(config);

export * from "./game";
export * from "./core";
export * from "./managers";
export * from "./game/entities";
