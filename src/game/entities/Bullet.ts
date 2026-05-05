import { ZScene } from "zimporter-phaser";
import { Entity } from "../../core/Entity";
import { EventsManager } from "../../core/EventsManager";
import { Updatables } from "../../core/Updatables";
import { Utils } from "../../core/Utils";
import { EntityObj, Model } from "../Model";


export class Bullet extends Entity {
    speed: number;
    w: number;
    h: number;

    angle: number = 0;
    x: number = 0;
    y: number = 0;

    constructor(params: EntityObj) {
        super(params);
        this.speed = params.speed!;
        this.pool = params.pool!;
    }

    fire(_x: number, _y: number, initialAngle: number) {
        this.isDestroyed = false;
        this.angle = initialAngle;
        this.x = _x - (this.w / 2);
        this.y = _y;
        let gameContainer = Model.stage?.get("gameContainer")!;
        gameContainer.add(this.asset!);
        this.asset!.setVisible(true);
        this.asset!.x = this.x;
        this.asset!.y = this.y;
        this.asset!.rotation = initialAngle + Math.PI / 2;
        Updatables.add(this);
    }

    update(dt: number) {
        let scene: ZScene = ZScene.getSceneById("game-scene")!;
        let dimensions = scene.getInnerDimensions();
        const cos = Math.cos(this.angle);
        const sin = Math.sin(this.angle);

        this.x = this.x + (cos * this.speed * dt);
        this.y = this.y + (sin * this.speed * dt);
        this.asset!.x = this.x;
        this.asset!.y = this.y;

        if (this.y < 0 || this.y > dimensions.height || this.x < 0 || this.x > dimensions.width) {
            this.destroyEntity();
            return;
        }

        const collisions = Utils.getCollisions(this, this.radius!, this.getGrid()!, Model.gridSize);
        if (collisions && collisions.length > 0) {
            this.destroyEntity();
            for (let i = 0; i < collisions.length; i++) {
                let collision = collisions[i];
                EventsManager.emit("TARGET_HIT", { target: collision });
            }
        }
    }

    destroyEntity() {
        if (this.isDestroyed) return;
        this.asset?.setVisible(false);
        this.pool!.putBack(this);
        Updatables.remove(this);
        super.destroyEntity();
    }
}
