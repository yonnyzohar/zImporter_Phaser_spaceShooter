import { Entity } from "../../core/Entity";
import { Pool, PoolsManager } from "../../core/Pool";
import { Model, WeaponObj } from "../Model";
import { Bullet } from "./Bullet";




export class Cannon extends Entity {
    private bulletsPool: Pool<Entity>;
    private fireCounter: number = 0;
    private fireRate: number;
    private numTurrets: number;
    private cannonSpacing: number;

    constructor(params: WeaponObj) {
        super(params);


        this.fireRate = params.fireRate;
        this.numTurrets = params.numTurrets;
        this.cannonSpacing = params.cannonSpacing;
    }
    public updateFire(dt: number, spawnX: number, spawnY: number, direction: number = (Math.PI * 2) - (Math.PI / 2)) {
        // const fire = Model.movement.space; // Uncomment if needed
        if (!this.bulletsPool) {
            let weaponParams: WeaponObj = this.params as WeaponObj;
            let bulletObj = Model.bullets[weaponParams.bullet!];
            this.bulletsPool = PoolsManager.getPool(bulletObj.assetName!, bulletObj)!;
        }
        this.fireCounter += dt;

        if (this.fireCounter >= this.fireRate) {
            let startX = spawnX - (((this.numTurrets - 1) / 2) * this.cannonSpacing);

            for (let i = 0; i < this.numTurrets; i++) {
                const bullet: Bullet = this.bulletsPool.get() as unknown as Bullet;
                bullet.fire(startX, spawnY, direction);
                bullet.setGrid(this.getGrid()!);
                startX += this.cannonSpacing;
            }

            this.fireCounter = 0;
        }
    }

}