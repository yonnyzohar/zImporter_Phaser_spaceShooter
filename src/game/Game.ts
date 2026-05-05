import { MagnetObj, Model, ShieldObj, WeaponObj } from './Model';
import { EventsManager } from './../core/EventsManager';
import { PoolsManager } from './../core/Pool';
import { Updatables } from './../core/Updatables';
import { TimersManager } from './../managers/TimerService';
import { Ship } from './entities/Ship';
import { EnemyManager } from './../managers/EnemyManager';
import { Stars } from './entities/Stars';
import { Healthbar } from './Healthbar';
import { CollectiblesManager } from './../managers/CollectiblesManager';
import { ScoreHolder } from './ScoreHolder';
import { Entity } from '../core/Entity';
import { Explosion } from './entities/Explosion';
import { ZContainer, ZScene, ZTimeline } from 'zimporter-phaser';
import { Enemy } from './entities';
import { PlanetsManager } from '../managers/PlanetsManager';


export class Game {

    private timersManager = new TimersManager();
    private levelContainer: ZContainer | null = null;
    private enemyManager!: EnemyManager;
    private ship!: Ship;
    private collectiblesManager!: CollectiblesManager;
    private stars!: Stars;
    private planetsManager!: PlanetsManager;
    private healthbar!: Healthbar;
    private scoreHolder!: ScoreHolder;

    private gameOver = false;
    private win = false;
    private callback?: () => void;
    private winMsgCooldown = 0;
    private static readonly WIN_MSG_COOLDOWN = 1;

    constructor(params?: any) {
        this.init();
    }

    public reset() {
        this.timersManager.destroyAll();
        this.collectiblesManager?.clear();
        this.enemyManager?.clear();
        Model.enemiesGrid = {};
        Model.shipGrid = {};
        Model.collectiblesGrid = {};
        this.gameOver = false;
        this.win = false;
        this.callback = undefined;
        this.winMsgCooldown = Game.WIN_MSG_COOLDOWN;
        PoolsManager.resetAllPools();
        this.healthbar?.removeFromParent();
        this.scoreHolder?.destroy();
        this.ship?.destroyEntity();
        this.enemyManager?.destroy();
        this.enemyManager = undefined!;
        this.collectiblesManager = undefined!;
        Updatables.clearWithCleanup();
    }

    init() {
        this.reset();

        let dimensions = ZScene.getSceneById("game-scene")?.getInnerDimensions();
        Model.gridSize = Math.min(dimensions!.width, dimensions!.height) / 5;

        const levelsObj = Model.levels[Model.level];
        this.levelContainer = Model.stage!.get("levelContainer") as ZContainer;
        (this.levelContainer.get("scoreInner") as ZContainer).setText("LEVEL: " + Model.level.toString());

        let sound_btn = Model.stage!.get("sound_btn") as ZContainer;
        sound_btn.setVisible(false);

        this.healthbar = new Healthbar(levelsObj.healthParams);
        const gameContainer = Model.stage?.get("gameContainer")!;

        if (!this.planetsManager) {
            this.planetsManager = new PlanetsManager(gameContainer);
        }
        if (!this.stars) {
            this.stars = new Stars(levelsObj.starsParams, gameContainer);
        }

        levelsObj.shipParams.grid = Model.shipGrid;
        this.ship = new Ship(levelsObj.shipParams);
        this.ship.setCannon(Model.weapons.defaultCannon);

        this.enemyManager = new EnemyManager(levelsObj.enemyManagerParams);
        this.enemyManager.setShip(this.ship);

        this.collectiblesManager = new CollectiblesManager();
        this.scoreHolder = new ScoreHolder();

        EventsManager.addListener('ENEMY_DESTROYED', this.onEnemyDestroyed.bind(this));
        EventsManager.addListener('WEAPON_PICKUP', this.onWeaponPickup.bind(this));
        EventsManager.addListener('SHIELD_PICKUP', this.onShieldPickup.bind(this));
        EventsManager.addListener('MAGNET_PICKUP', this.onMagnetPickup.bind(this));
        EventsManager.addListener('HEALTHPACK_PICKUP', this.onHealthpackPickup.bind(this));
        EventsManager.addListener('SHIP_COLISSION', this.onShipHit.bind(this));
        EventsManager.addListener("TARGET_HIT", this.onTargetHit.bind(this));
    }

    private onTargetHit(obj: { target: Entity }) {
        const target = obj.target;
        if (target instanceof Enemy) {
            target.destroyEntity();
        } else if (target === this.ship) {
            this.onShipHit();
        }
    }

    private onShipHit() {
        if (this.gameOver) return;
        if (this.ship.shield) return;
        this.healthbar.damage(0.25);
        this.ship.shock = true;
        this.ship.shockVal = 0;
        if (this.healthbar.isDead()) {
            const pool = PoolsManager.getPool(Model.explosions.defaultExplosion.assetName!, Model.explosions.defaultExplosion);
            for (let i = 0; i < 5; i++) {
                const explosion = pool!.get() as unknown as Explosion;
                const offsetX = (Math.random() - 0.5) * 60;
                const offsetY = (Math.random() - 0.5) * 60;
                explosion.spawn(this.ship.x! + offsetX, this.ship.y! + offsetY);
            }
            EventsManager.emit('GAME_OVER', { win: false });
        }
    }

    private onHealthpackPickup() {
        this.healthbar.heal(1);
    }

    onMagnetPickup(obj: MagnetObj) {
        this.timersManager.addTime(
            "magnet",
            obj.time,
            obj.color!,
            () => { this.ship.setMagnet(undefined); }
        );
    }

    onWeaponPickup(obj: WeaponObj) {
        this.timersManager.addTime(
            "weapon",
            obj.time!,
            obj.color!,
            () => { this.ship.setCannon(Model.weapons.defaultCannon); }
        );
    }

    onShieldPickup(obj: ShieldObj) {
        this.timersManager.addTime(
            "shield",
            obj.time,
            obj.color,
            () => { this.ship.setShield(undefined); }
        );
    }

    private static readonly KILL_MESSAGES = [
        'AMAZING!', 'AWESOME!', 'NICE SHOT!', 'BOOM!', 'OBLITERATED!',
        'GOOD JOB!', 'EXCELLENT!', 'SPECTACULAR!', 'DESTROYED!', 'NAILED IT!'
    ];

    onEnemyDestroyed(obj: { x: number; y: number }) {
        let pool = PoolsManager.getPool(Model.explosions.defaultExplosion.assetName!, Model.explosions.defaultExplosion);
        const explosion = pool!.get() as unknown as Explosion;
        explosion.spawn(obj.x, obj.y);
        this.collectiblesManager.spawn(obj.x, obj.y);

        const scene: ZScene = ZScene.getSceneById("game-scene")!;
        if (this.winMsgCooldown >= Game.WIN_MSG_COOLDOWN) {
            this.winMsgCooldown = 0;
            const anim: ZTimeline = scene.spawn("WinMsg") as ZTimeline;
            if (anim) {
                const textContainer = anim.get("textContainer") as ZContainer;
                if (textContainer) {
                    const msg = Game.KILL_MESSAGES[Math.floor(Math.random() * Game.KILL_MESSAGES.length)];
                    textContainer.setText(msg);
                }
                anim.x = obj.x;
                anim.y = obj.y;
                let gameContainer = Model.stage?.get("gameContainer")!;
                gameContainer.add(anim);
                anim.play();
                anim.addStateEndEventListener(() => {
                    anim.stop();
                    anim.removeStateEndEventListener();
                    gameContainer.remove(anim, false);
                });
            }
        }
    }

    update(dt: number) {
        this.stars.update(dt);
        this.planetsManager.update(dt);
        this.winMsgCooldown += dt;
        this.enemyManager.update(dt);
        Updatables.update(dt);
        this.draw();
    }

    draw() { }

    onGameOver(callback: () => void, win: boolean) {
        EventsManager.removeListener('WEAPON_PICKUP', this.onWeaponPickup.bind(this));
        EventsManager.removeListener('SHIELD_PICKUP', this.onShieldPickup.bind(this));
        EventsManager.removeListener('ENEMY_DESTROYED', this.onEnemyDestroyed.bind(this));
        if (this.gameOver) return;
        this.gameOver = true;
        this.win = win;
        const scene: ZScene = ZScene.getSceneById("game-scene")!;
        const anim: ZTimeline = scene.spawn("GameOverTemplate") as ZTimeline;
        let textContainer = anim.get("textContainer") as ZContainer;
        if (textContainer) {
            textContainer.setText(win ? "LEVEL COMPLETE" : "GAME OVER");
        }

        let calloutMarker = Model.stage?.get("calloutMarker")!;
        calloutMarker.add(anim);
        anim.setScale(0.9, 0.9);
        anim.play();
        anim.addStateEndEventListener(() => {
            this.ship.destroyEntity();
            this.healthbar.destroy();
            this.scoreHolder.destroy();
            Updatables.clearWithCleanup();
            anim.stop();
            anim.removeStateEndEventListener();
            calloutMarker.remove(anim, false);
            if (callback) callback();
        });

        this.ship.disable();

        if (!win) {
            this.ship.setRender(false);
        }
    }
}
