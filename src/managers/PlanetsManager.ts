import Phaser from 'phaser';
import { ZScene, ZContainer } from 'zimporter-phaser';

interface Planet {
    asset: ZContainer;
    x: number;
    y: number;
    speed: number;
}

const PLANET_NAMES = ['Planet1', 'Planet2', 'Planet3'];
const SPAWN_INTERVAL_MIN = 8;
const SPAWN_INTERVAL_MAX = 18;
const SPEED_MIN = 20;
const SPEED_MAX = 50;

export class PlanetsManager {
    private container: Phaser.GameObjects.Container;
    private planets: Planet[] = [];
    private timer: number = 0;
    private nextSpawn: number;

    constructor(parentStage: Phaser.GameObjects.Container) {
        const phaserScene = parentStage.scene;
        this.container = new Phaser.GameObjects.Container(phaserScene);
        parentStage.addAt(this.container, 0);
        this.nextSpawn = this.randomInterval();
    }

    private randomInterval(): number {
        return SPAWN_INTERVAL_MIN + Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN);
    }

    update(dt: number) {
        const scene = ZScene.getSceneById("game-scene")!;
        const dimensions = scene.getInnerDimensions();

        this.timer += dt;
        if (this.timer >= this.nextSpawn) {
            this.timer = 0;
            this.nextSpawn = this.randomInterval();
            this.spawnPlanet(dimensions.width, dimensions.height);
        }

        for (let i = this.planets.length - 1; i >= 0; i--) {
            const p = this.planets[i];
            p.y += p.speed * dt;
            p.asset.x = p.x;
            p.asset.y = p.y;

            if (p.y > dimensions.height + p.asset.height) {
                this.container.remove(p.asset, false);
                this.planets.splice(i, 1);
            }
        }
    }

    private spawnPlanet(stageWidth: number, stageHeight: number) {
        const scene = ZScene.getSceneById("game-scene")!;
        const name = PLANET_NAMES[Math.floor(Math.random() * PLANET_NAMES.length)];
        const asset = scene.spawn(name) as ZContainer;
        if (!asset) return;

        const scale = 0.5 + Math.random() * 0.5;
        asset.setScale(scale);

        const x = asset.width / 2 + Math.random() * (stageWidth - asset.width);
        const y = -asset.height;
        const speed = (SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN)) * scale;

        asset.x = x;
        asset.y = y;
        this.container.add(asset);
        this.planets.push({ asset, x, y, speed });
    }

    clear() {
        for (const p of this.planets) {
            this.container.remove(p.asset, false);
        }
        this.planets = [];
        this.timer = 0;
    }

    destroy() {
        this.clear();
        if (this.container.parentContainer) {
            this.container.parentContainer.remove(this.container, false);
        }
    }
}
