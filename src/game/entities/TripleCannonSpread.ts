import { Entity } from "../../core/Entity";
import { Pool, PoolsManager } from "../../core/Pool";
import { Model, WeaponObj } from "../Model";
import { Bullet } from "./Bullet";
import { Cannon } from "./Cannon";



export class TripleCannonSpread extends Entity {
    private fireCounter: number = 0;
    private fireRate: number;
    private numTurrets: number;
    private spreadAngle: number;

    constructor(params: WeaponObj) {
        super(params);
        // Assuming allPools is a global object

        // Pool initialization logic

        this.fireRate = params.fireRate;
        this.numTurrets = params.numTurrets;
        this.spreadAngle = params.spreadAngle!;
    }

    updateFire(dt: number, spawnX: number, spawnY: number) {

        // Assuming Model.movement.space is a boolean indicating fire
        const fire = Model.movement.space;
        this.fireCounter += dt;

        if (this.fireCounter >= this.fireRate) {
            // Fire three bullets with spread
            const upAngle = (Math.PI * 2) - (Math.PI / 2);
            let weaponParams: WeaponObj = this.params as WeaponObj;
            let bulletObj = Model.bullets[weaponParams.bullet!];
            let pool = PoolsManager.getPool(bulletObj.assetName!, bulletObj);

            let bullet: Bullet = pool!.get() as unknown as Bullet;
            bullet.fire(spawnX, spawnY, upAngle - this.spreadAngle);

            bullet = pool!.get() as unknown as Bullet;
            bullet.fire(spawnX, spawnY, upAngle);

            bullet = pool!.get() as unknown as Bullet;
            bullet.fire(spawnX, spawnY, upAngle + this.spreadAngle);

            this.fireCounter = 0;
        }
    }

    destroy() {
        // Implement destroy logic if needed
    }
}