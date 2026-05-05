import { ZScene, ZTimeline } from "zimporter-phaser";
import { Entity } from "../../core/Entity";
import { Pool } from "../../core/Pool";
import { Updatables } from "../../core/Updatables";
import { EnemyObj, Model, WeaponObj } from "../Model";
import { EventsManager } from "../../core/EventsManager";
import { Cannon } from "./Cannon";
import { Utils } from "../../core/Utils";

export class Enemy extends Entity {
    pool: Pool<Entity>;
    initialXOffset: number = 0;
    private speed: number;
    radius: number;
    public static globalId = 0;
    private ship: Entity | null = null;
    cannon: Cannon | null = null;
    private fireRadius: number = 0;
    private value: number = 0;

    constructor(params: EnemyObj) {
        super(params);

        this.pool = params.pool!;
        this.speed = params.speed!;
        this.value = params.value || 0;

        if (params.cannonName) {
            params.cannonObj = Model.weapons[params.cannonName];
            this.fireRadius = params?.cannonObj.fireRadius || 0;
            this.setCannon(params.cannonObj);
        }
    }

    override setGrid(grid: Record<string, Map<Entity, boolean>>): void {
        super.setGrid(grid);
        if (this.cannon) {
            this.cannon.setGrid(Model.shipGrid);
        }
    }

    public setShip(ship: Entity | null) {
        this.ship = ship;
    }

    spawn(_x: number, _y: number) {
        this.isDestroyed = false;
        this.x = _x;
        this.y = _y;
        this.initialXOffset = Math.random() * 6.24;
        Updatables.add(this);
        let gameContainer = Model.stage?.get("gameContainer")!;
        gameContainer.add(this.asset!);
        this.asset!.setVisible(true);
        this.asset!.name = "enemy_" + (Enemy.globalId++);
        if (this.asset instanceof ZTimeline) {
            this.asset.gotoAndPlay(0);
        }
    }

    update(dt: number) {
        let scene: ZScene = ZScene.getSceneById("game-scene")!;
        let dimensions = scene.getInnerDimensions();
        super.update(dt);
        this.x! += Math.cos(performance.now() / 1000 + this.initialXOffset) * 50 * dt;
        this.y! += this.speed * dt;
        this.asset!.x = this.x!;
        this.asset!.y = this.y!;

        if (this.y! > dimensions.height) {
            this.destroyEntity();
            return;
        }
        this.fixBounds();

        if (this.cannon && this.ship) {
            if (this.fireRadius == -1) {
                let angleToShip = Math.PI / 2;
                let x = this.x! + Math.cos(angleToShip) * this.radius!;
                let y = this.y! + Math.sin(angleToShip) * this.radius!;
                this.cannon.updateFire(dt, x, y, angleToShip);
            } else {
                let collisions = Utils.getCollisionsAllScreen(this, this.fireRadius, Model.shipGrid, Model.gridSize, this.ship.constructor.name);
                if (collisions.length > 0) {
                    let ship = collisions[0];
                    let angleToShip = Math.atan2(ship.y! - this.y!, ship.x! - this.x!);
                    let x = this.x! + Math.cos(angleToShip) * this.radius!;
                    let y = this.y! + Math.sin(angleToShip) * this.radius!;
                    this.cannon.updateFire(dt, x, y, angleToShip);
                }
            }
        }
    }

    setCannon(cannonParams: WeaponObj | null) {
        if (this.cannon) {
            this.cannon.destroyEntity();
            this.cannon = null;
        }
        if (cannonParams) {
            const CannonClass = (window as any).SpaceGame[cannonParams.ClassName!];
            this.cannon = new CannonClass(cannonParams);
        }
    }

    fixBounds() {
        let scene: ZScene = ZScene.getSceneById("game-scene")!;
        let dimensions = scene.getInnerDimensions();
        if ((this.x! + this.w! / 2) > dimensions.width) {
            this.x = dimensions.width - this.w! / 2;
        }
        if ((this.x! - this.w! / 2) < 0) {
            this.x = this.w! / 2;
        }
    }

    destroyEntity() {
        if (this.isDestroyed) return;
        this.pool.putBack(this);
        if (this.asset?.parentContainer) {
            this.asset.parentContainer.remove(this.asset, false);
        }
        if (this.asset instanceof ZTimeline) {
            this.asset.stop();
        }

        this.asset?.setVisible(false);
        EventsManager.emit('ENEMY_DESTROYED', { x: this.x!, y: this.y!, value: this.value });
        Updatables.remove(this);
        super.destroyEntity();
    }
}
