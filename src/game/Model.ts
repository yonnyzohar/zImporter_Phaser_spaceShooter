
import { Utils } from '../core/Utils';
import { Entity } from '../core/Entity';
import { Pool } from '../core/Pool';
import { ZContainer } from 'zimporter-phaser';

export interface Movement {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    space: boolean;
}

export interface StarObj {
    radius: number;
    speed: number;
    numStars: number;
}

export interface EnemyManagerParams {
    pool?: Pool<Entity>;
    spawnRate: number;
    totalEnemies: number;
    enemies: string[];
}

export interface LevelConfig {
    explosionParams: EntityObj;
    shipParams: ShipObj;
    starsParams: StarObj;
    enemyManagerParams: EnemyManagerParams;
    healthParams: any;
}

export interface MagnetObj extends BaseObj {
    time: number;
    radius: number;
    color: number;
}

export interface ModelInterface {
    stage: ZContainer | null;
    gridSize: number;
    movement: Movement;
    level: number;
    levels: LevelConfig[];
    enemiesGrid: Record<string, Map<Entity, boolean>>;
    shipGrid: Record<string, Map<Entity, boolean>>;
    collectiblesGrid: Record<string, Map<Entity, boolean>>;
    magnets: Record<string, MagnetObj>;
    shields: Record<string, ShieldObj>;
    weapons: Record<string, WeaponObj>;
    ships: Record<string, ShipObj>;
    enemies: Record<string, EnemyObj>;
    bullets: Record<string, EntityObj>;
    explosions: Record<string, EntityObj>;
    collectibles: Record<string, CollectibleObj>;
    stars: Record<string, StarObj>;
    spawnProbabilities: Record<string, number>;
}

export interface BaseObj {
    assetName: string;
    ClassName?: string;
    type: string;
    grid?: Record<string, Map<Entity, boolean>>;
    pool?: Pool<Entity>;
    radius?: number;
    isAddedToGrid: boolean;
}

export interface EntityObj extends BaseObj {
    speed?: number;
    value?: number;
    duration?: number;
    numStars?: number;
}

export interface ShipObj extends EntityObj {
    acceleration: number;
    deceleration: number;
    cannonName: string;
    cannonObj?: WeaponObj;
}

export interface EnemyObj extends EntityObj {
    cannonName: string;
    cannonObj?: WeaponObj;
}

export interface ShieldObj extends BaseObj {
    time: number;
    speed: number;
    radius: number;
    numShields: number;
    color: number;
}

export interface WeaponObj extends BaseObj {
    numTurrets: number;
    cannonSpacing: number;
    spreadAngle?: number;
    fireRate: number;
    bullet: string;
    time?: number;
    color?: number;
    fireRadius: number;
}

export interface CollectibleObj extends BaseObj {
    value?: number;
    speed?: number;
    numLives?: number;
    time: number;
}

export const Model: ModelInterface = {
    stage: null,
    gridSize: 32,
    movement: { left: false, right: false, up: false, down: false, space: false } as Movement,
    level: 0,
    levels: [],
    enemiesGrid: {},
    shipGrid: {},
    collectiblesGrid: {},
    magnets: {
        defaultMagnet: {
            time: 5,
            radius: 200,
            assetName: "MagnetTemplate",
            type: "magnet",
            ClassName: "Magnet",
            color: 0xFFFF00,
            isAddedToGrid: true
        }
    },
    shields: {
        defaultShield: {
            time: 5,
            speed: 100,
            radius: 120,
            numShields: 3,
            assetName: "ShieldTemplate",
            type: "shield",
            ClassName: "Shield",
            color: 0x00FFFF,
            isAddedToGrid: false
        }
    },
    stars: {
        defaultStars: {
            radius: 0.1,
            speed: 100,
            numStars: 200
        }
    },
    weapons: {
        defaultCannon: {
            numTurrets: 1,
            cannonSpacing: 10,
            fireRate: 0.1,
            ClassName: "Cannon",
            bullet: "defaultBullet",
            assetName: "Bullet9",
            type: "bullet",
            isAddedToGrid: false,
            fireRadius: -1
        },
        alienCannon: {
            numTurrets: 1,
            cannonSpacing: 10,
            fireRate: 1,
            ClassName: "Cannon",
            bullet: "alienBullet",
            assetName: "FireRateTemplate",
            type: "bullet",
            isAddedToGrid: false,
            fireRadius: 600
        },
        fastAlienCannon: {
            numTurrets: 1,
            cannonSpacing: 10,
            fireRate: 0.5,
            ClassName: "Cannon",
            bullet: "bullet3",
            assetName: "FireRateTemplate",
            type: "bullet",
            isAddedToGrid: false,
            fireRadius: 600
        },
        heavyAlienCannon: {
            numTurrets: 1,
            cannonSpacing: 10,
            fireRate: 1.5,
            ClassName: "Cannon",
            bullet: "bullet5",
            assetName: "FireRateTemplate",
            type: "bullet",
            isAddedToGrid: false,
            fireRadius: 800
        },
        tripleAlienCannon: {
            numTurrets: 3,
            cannonSpacing: 12,
            fireRate: 1.2,
            ClassName: "Cannon",
            bullet: "bullet4",
            assetName: "FireRateTemplate",
            type: "bullet",
            isAddedToGrid: false,
            fireRadius: 600
        },
        spreadAlienCannon: {
            numTurrets: 3,
            spreadAngle: 0.35,
            fireRate: 0.8,
            ClassName: "TripleCannonSpread",
            bullet: "alienBullet",
            assetName: "FireAnglesTemplate",
            type: "bullet",
            cannonSpacing: 0,
            isAddedToGrid: false,
            fireRadius: 700
        },
        tripleCannon: {
            numTurrets: 3,
            cannonSpacing: 10,
            fireRate: 0.2,
            ClassName: "Cannon",
            bullet: "defaultBullet",
            assetName: "FireRateTemplate",
            type: "weapon",
            time: 5,
            color: 0x00FF00,
            isAddedToGrid: false,
            fireRadius: -1
        },
        tripleCannonSpread: {
            numTurrets: 3,
            spreadAngle: 0.3,
            fireRate: 0.1,
            ClassName: "TripleCannonSpread",
            bullet: "defaultBullet",
            assetName: "FireAnglesTemplate",
            type: "weapon",
            time: 5,
            color: 0x0000FF,
            cannonSpacing: 0,
            isAddedToGrid: false,
            fireRadius: -1
        }
    },
    ships: {
        defaultShip: {
            assetName: "Ship1",
            speed: 300,
            acceleration: 0.06,
            deceleration: 0.05,
            type: "entity",
            cannonName: "defaultCannon",
            isAddedToGrid: true
        },
        ship2: {
            assetName: "Ship2",
            speed: 300,
            acceleration: 0.06,
            deceleration: 0.05,
            type: "entity",
            cannonName: "defaultCannon",
            isAddedToGrid: true
        },
        ship3: {
            assetName: "Ship3",
            speed: 300,
            acceleration: 0.06,
            deceleration: 0.05,
            type: "entity",
            cannonName: "defaultCannon",
            isAddedToGrid: true
        },
        ship4: {
            assetName: "Ship4",
            speed: 300,
            acceleration: 0.06,
            deceleration: 0.05,
            type: "entity",
            cannonName: "defaultCannon",
            isAddedToGrid: true
        },
        ship5: {
            assetName: "Ship5",
            speed: 300,
            acceleration: 0.06,
            deceleration: 0.05,
            type: "entity",
            cannonName: "defaultCannon",
            isAddedToGrid: true
        }
    },
    enemies: {
        enemy1: {
            assetName: "Enemy1",
            ClassName: "Enemy",
            speed: 100,
            value: 5,
            type: "entity",
            cannonName: "alienCannon",
            isAddedToGrid: true
        },
        enemy2: {
            assetName: "Enemy2",
            ClassName: "Enemy",
            speed: 80,
            value: 5,
            type: "entity",
            cannonName: "tripleAlienCannon",
            isAddedToGrid: true
        },
        enemy3: {
            assetName: "Enemy3",
            ClassName: "Enemy",
            speed: 80,
            value: 5,
            type: "entity",
            cannonName: "alienCannon",
            isAddedToGrid: true
        },
        enemy4: {
            assetName: "Enemy4",
            ClassName: "Enemy",
            speed: 130,
            value: 10,
            type: "entity",
            cannonName: "fastAlienCannon",
            isAddedToGrid: true
        },
        enemy5: {
            assetName: "Enemy5",
            ClassName: "Enemy",
            speed: 55,
            value: 15,
            type: "entity",
            cannonName: "heavyAlienCannon",
            isAddedToGrid: true
        },
    },
    bullets: {
        defaultBullet: {
            assetName: "Bullet1",
            ClassName: "Bullet",
            speed: 400,
            type: "weapon",
            isAddedToGrid: true
        },
        alienBullet: {
            assetName: "Bullet6",
            ClassName: "Bullet",
            speed: 150,
            type: "weapon",
            isAddedToGrid: true
        },
        bullet2: {
            assetName: "Bullet2",
            ClassName: "Bullet",
            speed: 180,
            type: "weapon",
            isAddedToGrid: true
        },
        bullet3: {
            assetName: "Bullet3",
            ClassName: "Bullet",
            speed: 220,
            type: "weapon",
            isAddedToGrid: true
        },
        bullet4: {
            assetName: "Bullet4",
            ClassName: "Bullet",
            speed: 160,
            type: "weapon",
            isAddedToGrid: true
        },
        bullet5: {
            assetName: "Bullet5",
            ClassName: "Bullet",
            speed: 120,
            type: "weapon",
            isAddedToGrid: true
        },
        bullet7: {
            assetName: "Bullet7",
            ClassName: "Bullet",
            speed: 200,
            type: "weapon",
            isAddedToGrid: true
        },
        bullet8: {
            assetName: "Bullet8",
            ClassName: "Bullet",
            speed: 250,
            type: "weapon",
            isAddedToGrid: true
        },
    },
    explosions: {
        defaultExplosion: {
            assetName: "Explosion1",
            duration: .5,
            ClassName: "Explosion",
            type: "explosion",
            isAddedToGrid: false
        }
    },
    collectibles: {
        magnet: {
            ClassName: "Collectible",
            assetName: "MagnetTemplate",
            type: "magnet",
            time: 5000,
            isAddedToGrid: true
        },
        tripleCannon: {
            ClassName: "Collectible",
            assetName: "FireRateTemplate",
            type: "weapon",
            time: 5000,
            isAddedToGrid: true
        },
        tripleCannonSpread: {
            ClassName: "Collectible",
            assetName: "FireAnglesTemplate",
            type: "weapon",
            time: 5000,
            isAddedToGrid: true
        },
        health: {
            assetName: "HealthPackTemplate",
            numLives: 1,
            ClassName: "Collectible",
            type: "health",
            time: 5000,
            isAddedToGrid: true
        },
        coin: {
            assetName: "CoinTemplate",
            ClassName: "Collectible",
            value: 10,
            speed: 10,
            type: "collectible",
            time: 5000,
            isAddedToGrid: true
        },
        defaultShield: {
            assetName: "ShieldTemplate",
            ClassName: "Collectible",
            type: "shield",
            time: 5000,
            isAddedToGrid: true
        },
        defaultMagnet: {
            assetName: "MagnetTemplate",
            ClassName: "Collectible",
            type: "magnet",
            time: 5000,
            isAddedToGrid: true
        }
    },
    spawnProbabilities: {
        coin: 1,
        tripleCannon: 1,
        tripleCannonSpread: 1,
        health: 1,
        defaultShield: 1,
        defaultMagnet: 1
    }
};

Model.levels = [
    // Level 0 — Tutorial: slow trickle, single enemy type
    {
        explosionParams: Utils.deepcopy(Model.explosions.defaultExplosion) as EntityObj,
        shipParams: Utils.deepcopy(Model.ships.defaultShip) as ShipObj,
        starsParams: Utils.deepcopy(Model.stars.defaultStars) as StarObj,
        enemyManagerParams: { spawnRate: 2.0, totalEnemies: 12, enemies: ["enemy1"] },
        healthParams: { numLives: 6, assetName: "HealthPackTemplate" }
    },
    // Level 1 — Scout Wave
    {
        explosionParams: Utils.deepcopy(Model.explosions.defaultExplosion) as EntityObj,
        shipParams: Utils.deepcopy(Model.ships.ship2) as ShipObj,
        starsParams: Utils.deepcopy(Model.stars.defaultStars) as StarObj,
        enemyManagerParams: { spawnRate: 1.2, totalEnemies: 20, enemies: ["enemy1", "enemy2"] },
        healthParams: { numLives: 5, assetName: "HealthPackTemplate" }
    },
    // Level 2 — Mixed Assault
    {
        explosionParams: Utils.deepcopy(Model.explosions.defaultExplosion) as EntityObj,
        shipParams: Utils.deepcopy(Model.ships.ship3) as ShipObj,
        starsParams: Utils.deepcopy(Model.stars.defaultStars) as StarObj,
        enemyManagerParams: { spawnRate: 0.9, totalEnemies: 30, enemies: ["enemy1", "enemy2", "enemy3"] },
        healthParams: { numLives: 5, assetName: "HealthPackTemplate" }
    },
    // Level 3 — Speed Run
    {
        explosionParams: Utils.deepcopy(Model.explosions.defaultExplosion) as EntityObj,
        shipParams: Utils.deepcopy(Model.ships.ship4) as ShipObj,
        starsParams: Utils.deepcopy(Model.stars.defaultStars) as StarObj,
        enemyManagerParams: { spawnRate: 0.7, totalEnemies: 35, enemies: ["enemy2", "enemy3", "enemy4"] },
        healthParams: { numLives: 5, assetName: "HealthPackTemplate" }
    },
    // Level 4 — Heavy Hitters
    {
        explosionParams: Utils.deepcopy(Model.explosions.defaultExplosion) as EntityObj,
        shipParams: Utils.deepcopy(Model.ships.ship5) as ShipObj,
        starsParams: Utils.deepcopy(Model.stars.defaultStars) as StarObj,
        enemyManagerParams: { spawnRate: 0.65, totalEnemies: 40, enemies: ["enemy1", "enemy3", "enemy4"] },
        healthParams: { numLives: 5, assetName: "HealthPackTemplate" }
    },
    // Level 5 — Swarm
    {
        explosionParams: Utils.deepcopy(Model.explosions.defaultExplosion) as EntityObj,
        shipParams: Utils.deepcopy(Model.ships.defaultShip) as ShipObj,
        starsParams: Utils.deepcopy(Model.stars.defaultStars) as StarObj,
        enemyManagerParams: { spawnRate: 0.4, totalEnemies: 60, enemies: ["enemy1", "enemy2", "enemy1", "enemy2", "enemy3"] },
        healthParams: { numLives: 5, assetName: "HealthPackTemplate" }
    },
    // Level 6 — Elite Squad
    {
        explosionParams: Utils.deepcopy(Model.explosions.defaultExplosion) as EntityObj,
        shipParams: Utils.deepcopy(Model.ships.ship2) as ShipObj,
        starsParams: Utils.deepcopy(Model.stars.defaultStars) as StarObj,
        enemyManagerParams: { spawnRate: 0.55, totalEnemies: 45, enemies: ["enemy3", "enemy4", "enemy5"] },
        healthParams: { numLives: 4, assetName: "HealthPackTemplate" }
    },
    // Level 7 — Blitz
    {
        explosionParams: Utils.deepcopy(Model.explosions.defaultExplosion) as EntityObj,
        shipParams: Utils.deepcopy(Model.ships.ship3) as ShipObj,
        starsParams: Utils.deepcopy(Model.stars.defaultStars) as StarObj,
        enemyManagerParams: { spawnRate: 0.3, totalEnemies: 70, enemies: ["enemy2", "enemy3", "enemy4", "enemy5"] },
        healthParams: { numLives: 4, assetName: "HealthPackTemplate" }
    },
    // Level 8 — All Hands
    {
        explosionParams: Utils.deepcopy(Model.explosions.defaultExplosion) as EntityObj,
        shipParams: Utils.deepcopy(Model.ships.ship4) as ShipObj,
        starsParams: Utils.deepcopy(Model.stars.defaultStars) as StarObj,
        enemyManagerParams: { spawnRate: 0.25, totalEnemies: 90, enemies: ["enemy1", "enemy2", "enemy3", "enemy4", "enemy5"] },
        healthParams: { numLives: 4, assetName: "HealthPackTemplate" }
    },
    // Level 9 — Apocalypse
    {
        explosionParams: Utils.deepcopy(Model.explosions.defaultExplosion) as EntityObj,
        shipParams: Utils.deepcopy(Model.ships.ship5) as ShipObj,
        starsParams: Utils.deepcopy(Model.stars.defaultStars) as StarObj,
        enemyManagerParams: {
            spawnRate: 0.18, totalEnemies: 120,
            enemies: ["enemy1", "enemy2", "enemy3", "enemy4", "enemy5", "enemy4", "enemy5", "enemy3"]
        },
        healthParams: { numLives: 3, assetName: "HealthPackTemplate" }
    },
];
