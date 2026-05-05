import { ZScene, ZTimeline } from "zimporter-phaser";
import { Entity } from "../core/Entity";
import { Updatables } from "../core/Updatables";
import { CollectibleObj, Model } from "./Model";


export class Collectible extends Entity {
    speed: number;
    rnd: number;
    time: number;
    currTime: number = 0;

    constructor(params: CollectibleObj) {
        super(params);
        this.pool = params.pool;
        this.speed = params.speed ?? 50;
        this.rnd = Math.random();
        this.time = params.time;
    }

    spawn(_x: number, _y: number) {
        this.isDestroyed = false;
        this.x = _x;
        this.y = _y;
        let gameContainer = Model.stage?.get("gameContainer")!;
        gameContainer.add(this.asset!);
        this.asset!.setVisible(true);
        Updatables.add(this);
        this.currTime = 0;
        this.asset!.alpha = 1;
        if (this.asset instanceof ZTimeline) {
            this.asset.gotoAndPlay(0);
        }
    }

    update(dt: number) {
        let scene: ZScene = ZScene.getSceneById("game-scene")!;
        let dimensions = scene.getInnerDimensions();
        super.update(dt);
        this.x! += Math.cos(performance.now() / 1000 * 2 * this.rnd) * (50 * dt);
        this.y! += this.speed * dt;
        this.asset!.x = this.x!;
        this.asset!.y = this.y!;
        this.currTime += (dt * 1000);

        if (this.y! > dimensions.height || this.currTime > this.time) {
            this.asset!.alpha -= 0.02;
            if (this.asset!.alpha <= 0) {
                this.asset!.alpha = 0;
                this.destroyEntity();
            }
        }
    }

    destroyEntity() {
        if (this.isDestroyed) return;
        this.pool!.putBack(this);
        this.asset?.setVisible(false);
        if (this.asset?.parentContainer) {
            this.asset.parentContainer.remove(this.asset, false);
        }
        if (this.asset instanceof ZTimeline) {
            this.asset.stop();
        }
        Updatables.remove(this);
        super.destroyEntity();
    }
}
