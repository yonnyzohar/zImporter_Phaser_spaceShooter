import Phaser from 'phaser';
import { Model, StarObj } from '../Model';
import { ZScene, ZState } from 'zimporter-phaser';

interface Star {
    x: number;
    y: number;
    rnd: number;
    gfx: ZState;
}

export class Stars {
    private speed: number;
    private radius: number;
    private numStars: number;
    private starsArr: Star[] = [];
    private starsContainer: Phaser.GameObjects.Container;

    constructor(params: StarObj, parent: Phaser.GameObjects.Container) {
        let scene: ZScene = ZScene.getSceneById("game-scene")!;
        let dimensions = scene.getInnerDimensions();
        this.speed = params.speed;
        this.radius = params.radius;
        this.numStars = params.numStars;

        const phaserScene = parent.scene;
        this.starsContainer = new Phaser.GameObjects.Container(phaserScene);
        parent.addAt(this.starsContainer, 0);

        let allStates: (string | null)[] = [];

        for (let i = 0; i < this.numStars; i++) {
            const x = Math.random() * dimensions.width;
            const y = Math.random() * dimensions.height;
            const rnd = Math.random();
            const star: ZState = scene?.spawn("StarTemplate") as ZState;
            if (i === 0) {
                allStates = star.getAllStateNames();
            }
            const randomState = allStates ? allStates[Math.floor(Math.random() * allStates.length)] : null;
            if (randomState) {
                star.setState(randomState);
            }

            star.x = x;
            star.y = y;
            star.setScale(rnd);
            this.starsContainer.add(star);

            this.starsArr.push({ x, y, rnd, gfx: star });
        }
    }

    reset() {
        this.starsArr.forEach(star => {
            star.gfx.destroy();
        });
        this.starsArr = [];
    }

    update(dt: number) {
        let scene: ZScene = ZScene.getSceneById("game-scene")!;
        let dimensions = scene.getInnerDimensions();
        for (let i = 0; i < this.numStars; i++) {
            const star = this.starsArr[i];
            star.y += (this.speed * star.rnd) * dt;

            if (star.y > dimensions.height) {
                star.y = star.y - dimensions.height;
                star.x = Math.random() * dimensions.width;
            }

            star.gfx.x = star.x;
            star.gfx.y = star.y;
        }
    }
}
