import Phaser from 'phaser';
import { Entity } from './../../core/Entity';
import { MagnetObj, Model, ShieldObj, ShipObj, WeaponObj } from './../Model';
import { Updatables } from './../../core/Updatables';
import { Utils } from './../../core/Utils';
import { EventsManager } from './../../core/EventsManager';
import { Shield } from './Shield';
import { ZScene } from 'zimporter-phaser';
import { Cannon } from './Cannon';
import { Magnet } from './Magnet';


export class Ship extends Entity {
    cannon: Cannon | null = null;
    shield: Shield | null = null;
    private magnet: Magnet | null = null;
    speed: number;
    currCannonName: string;
    radius: number;
    velX = 0;
    velY = 0;
    decelaration: number;
    acceleration: number;
    disabled = false;
    disableRendering = false;
    shock = false;
    shockVal = 0;
    private gameContainer: Phaser.GameObjects.Container;

    constructor(params: ShipObj) {
        super(params);
        this.speed = params.speed!;
        this.currCannonName = params.cannonName!;
        let dimensions = ZScene.getSceneById("game-scene")?.getInnerDimensions();
        let gameContainer = Model.stage?.get("gameContainer")!;
        gameContainer.add(this.asset!);
        this.gameContainer = gameContainer;
        this.x = dimensions!.width / 2;
        this.y = dimensions!.height / 2;
        this.asset!.x = this.x;
        this.asset!.y = this.y;
        this.asset!.name = "ship";

        this.decelaration = params.deceleration!;
        this.acceleration = params.acceleration!;
        Updatables.add(this);
        EventsManager.addListener('CANNON_COLLECTED', this.setCannon.bind(this));
    }

    getCenter() {
        return { x: this.x, y: this.y };
    }

    disable() {
        this.disabled = true;
    }

    setMagnet(magnetParams: MagnetObj | undefined) {
        if (this.magnet) {
            this.magnet.destroyEntity();
        }
        if (magnetParams) {
            let MagnetClass = (window as any).SpaceGame[magnetParams.ClassName!];
            this.magnet = new MagnetClass(magnetParams);
            this.magnet!.setGrid(Model.collectiblesGrid);
            this.magnet!.setShip(this);
        }
    }

    setShield(shieldParams: ShieldObj | undefined) {
        if (this.shield) {
            this.shield.destroyEntity();
            this.shield = null;
        }
        if (shieldParams) {
            let ShieldClass = (window as any).SpaceGame[shieldParams.ClassName!];
            this.shield = new ShieldClass(shieldParams);
            this.shield!.setShip(this);
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
            this.cannon?.setGrid(Model.enemiesGrid);
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
        if ((this.y! + this.h! / 2) > dimensions.height) {
            this.y = dimensions.height - this.h! / 2;
        }
        if ((this.y! - this.h! / 2) < 0) {
            this.y = this.h! / 2;
        }
    }

    update(dt: number) {
        if (this.disabled) return;

        super.update(dt);

        const { left, right, up, down } = Model.movement;
        let moving = false;

        if (left) {
            moving = true;
            if (this.asset!.scaleX > 0.7) {
                this.asset!.scaleX -= 0.01;
            }
            this.velX -= this.acceleration;
            if (this.velX < -1) this.velX = -1;
        }
        if (right) {
            moving = true;
            this.velX += this.acceleration;
            if (this.asset!.scaleX > 0.7) {
                this.asset!.scaleX -= 0.01;
            }
            if (this.velX > 1) this.velX = 1;
        }
        if (up) {
            moving = true;
            this.velY -= this.acceleration;
            if (this.velY < -1) this.velY = -1;
        }
        if (down) {
            moving = true;
            this.velY += this.acceleration;
            if (this.velY > 1) this.velY = 1;
        }

        if (!moving) {
            this.asset!.scaleX += (1 - this.asset!.scaleX) * 0.1;
            if (this.velX !== 0) {
                if (this.velX < 0) {
                    this.velX += this.decelaration;
                    if (this.velX >= 0) this.velX = 0;
                } else {
                    this.velX -= this.decelaration;
                    if (this.velX <= 0) this.velX = 0;
                }
            }
            if (this.velY !== 0) {
                if (this.velY < 0) {
                    this.velY += this.decelaration;
                    if (this.velY >= 0) this.velY = 0;
                } else {
                    this.velY -= this.decelaration;
                    if (this.velY <= 0) this.velY = 0;
                }
            }
        }

        this.x! += this.velX * this.speed * dt;
        this.y! += this.velY * this.speed * dt;
        this.asset!.x = this.x!;
        this.asset!.y = this.y!;

        this.fixBounds();

        if (this.cannon) {
            this.cannon.updateFire(dt, this.x!, this.y! - this.h! / 2);
        }

        let collisions = Utils.getCollisions(this, this.radius, Model.collectiblesGrid, Model.gridSize);
        if (collisions && collisions.length > 0) {
            for (let i = 0; i < collisions.length; i++) {
                let collision = collisions[i];
                if (collision.params.type === 'collecible') {
                    EventsManager.emit('COIN_COLLECTED');
                } else if (collision.params.type === 'health') {
                    EventsManager.emit('HEALTHPACK_PICKUP');
                } else if (collision.params.type === 'weapon') {
                    const newWeapon = Model.weapons[collision.id];
                    if (newWeapon) {
                        this.setCannon(newWeapon);
                        if (newWeapon.time) {
                            EventsManager.emit('WEAPON_PICKUP', newWeapon);
                        }
                    }
                } else if (collision.params.type === 'shield') {
                    const newShield = Model.shields[collision.id];
                    if (newShield) {
                        this.setShield(newShield);
                        if (newShield.time) {
                            EventsManager.emit('SHIELD_PICKUP', newShield);
                        }
                    }
                } else if (collision.params.type === 'magnet') {
                    const newMagnet = Model.magnets[collision.id];
                    if (newMagnet) {
                        this.setMagnet(newMagnet);
                        if (newMagnet.time) {
                            EventsManager.emit('MAGNET_PICKUP', newMagnet);
                        }
                    }
                }
                collision?.destroyEntity();
            }
        }

        collisions = Utils.getCollisions(this, this.radius, Model.enemiesGrid, Model.gridSize);
        if (collisions && collisions.length > 0) {
            for (let i = 0; i < collisions.length; i++) {
                let collision = collisions[i];
                collision.drawCircle(true);
                collision.destroyEntity();
                if (!this.shield) {
                    this.shock = true;
                    this.shockVal = 0;
                    EventsManager.emit('SHIP_COLISSION', { x: this.x, y: this.y });
                }
            }
        }
        this.draw();
    }

    destroyEntity() {
        Updatables.remove(this);
        if (this.cannon) {
            this.cannon.destroyEntity();
        }
        if (this.magnet) {
            this.magnet.destroyEntity();
            this.magnet = null;
        }
        if (this.shield) {
            this.shield.destroyEntity();
            this.shield = null;
        }
        super.destroyEntity();
    }

    setRender(v: boolean) {
        this.disableRendering = v;
    }

    draw() {
        if (this.disableRendering) return;

        let render = true;
        if (this.shock) {
            this.shockVal += 1;
            if (this.shockVal % 2 === 0) {
                render = false;
            }
            if (this.shockVal > 50) {
                this.shock = false;
            }
        }
        if (render) {
            this.asset!.setVisible(true);
        } else {
            this.asset!.setVisible(false);
        }
    }
}
