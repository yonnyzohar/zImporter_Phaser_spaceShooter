import Phaser from 'phaser';
import { Entity, Updatables, Utils } from "../../core";
import { MagnetObj, Model } from "../Model";
import { Ship } from "./Ship";

export class Magnet extends Entity {
    private ship: Ship;
    private magnetCircle: Phaser.GameObjects.Graphics | null = null;

    constructor(params: MagnetObj) {
        super(params);
        this.radius = params.radius;
        Updatables.add(this);
    }

    setShip(ship: Ship) {
        this.ship = ship;
        const scene = Model.stage!.scene;
        this.magnetCircle = scene.add.graphics();
        this.magnetCircle.lineStyle(2, 0x00FF00, 0.5);
        this.magnetCircle.strokeCircle(0, 0, this.radius!);
        let gameContainer = Model.stage?.get("gameContainer")!;
        gameContainer.add(this.magnetCircle);
    }

    update(dt: number) {
        const shipCenter = this.ship.getCenter();
        let collisions: Entity[] = Utils.getCollisions(this.ship, this.radius!, this.getGrid()!, Model.gridSize);
        for (let i = 0; i < collisions.length; i++) {
            let collision = collisions[i];
            let a = collision.x! - shipCenter.x!;
            let o = collision.y! - shipCenter.y!;
            let dist = Math.sqrt(a * a + o * o);
            let sin = o / dist;
            let cos = a / dist;
            dist = (this.radius! - dist) / this.radius! * 300;
            let moveX = cos * dist * dt;
            let moveY = sin * dist * dt;
            collision.x! -= moveX;
            collision.y! -= moveY;
            collision.asset!.x = collision.x!;
            collision.asset!.y = collision.y!;
        }
        if (this.magnetCircle) {
            this.magnetCircle.x = shipCenter.x!;
            this.magnetCircle.y = shipCenter.y!;
        }
    }

    destroyEntity() {
        if (this.isDestroyed) return;
        super.destroyEntity();
        if (this.magnetCircle) {
            const gameContainer = Model.stage?.get("gameContainer")!;
            gameContainer.remove(this.magnetCircle, false);
            this.magnetCircle.destroy();
            this.magnetCircle = null;
        }
    }
}
