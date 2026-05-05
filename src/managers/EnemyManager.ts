import { Pool, PoolsManager } from "../core/Pool";
import { Entity } from "../core/Entity";
import { EnemyManagerParams, EnemyObj, Model } from "../game/Model";
import { EventsManager } from "../core/EventsManager";
import { Enemy } from "../game/entities/Enemy";
import { ZScene } from "zimporter-phaser";
import { Utils } from "../core/Utils";


export class EnemyManager {
    private spawnRate: number;
    private totalToSpawn: number;
    private aliveEnemies: number = 0;
    private count: number = 0;
    private ship!: Entity;
    private enemyObjects: EnemyObj[] = [];
    private boundOnEnemyDestroyed: () => void;

    constructor(params: EnemyManagerParams) {
        this.spawnRate = params.spawnRate;
        this.totalToSpawn = params.totalEnemies;
        for (let i = 0; i < params.enemies.length; i++) {
            let enemyName = params.enemies[i];
            this.enemyObjects.push(Model.enemies[enemyName]);
        }

        this.boundOnEnemyDestroyed = this.onEnemyDestroyed.bind(this);
        EventsManager.addListener('ENEMY_DESTROYED', this.boundOnEnemyDestroyed);
    }

    setShip(ship: Entity) {
        this.ship = ship;
    }

    update(dt: number) {
        this.count += dt;
        if (this.count >= this.spawnRate && this.totalToSpawn > 0) {
            let randomObj = this.enemyObjects[Math.floor(Math.random() * this.enemyObjects.length)];
            let pool = PoolsManager.getPool(randomObj.assetName!, randomObj);
            const enemy = pool!.get() as Enemy;
            enemy.pool = pool!;
            enemy.setGrid(Model.enemiesGrid);
            let scene: ZScene = ZScene.getSceneById("game-scene")!;
            let dimensions = scene.getInnerDimensions();

            const tenPerStage = dimensions.width * 0.1;
            const eightyPerStage = dimensions.width * 0.8;
            const rndInRange = eightyPerStage * Math.random();

            enemy.spawn(tenPerStage + rndInRange, -20);
            enemy.setShip(this.ship);
            this.count = 0;
            this.totalToSpawn--;
            this.aliveEnemies++;
        }
    }

    private onEnemyDestroyed() {
        this.aliveEnemies--;
        if (this.aliveEnemies <= 0 && this.totalToSpawn <= 0) {
            EventsManager.emit("GAME_OVER", { win: true });
        }
    }

    destroy() {
        EventsManager.removeListener('ENEMY_DESTROYED', this.boundOnEnemyDestroyed);
    }

    clear() {
        for (const key in Model.enemiesGrid) {
            const map = Model.enemiesGrid[key];
            for (const entity of map.keys()) {
                if (entity.asset && entity.asset.parentContainer) {
                    entity.asset.parentContainer.remove(entity.asset, false);
                }
            }
        }
    }
}
