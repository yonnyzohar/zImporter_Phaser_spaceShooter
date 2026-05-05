

// This class handles all collectibles left by dead enemies.
// First, this class parses the probabilities table to determine what will be spawned.
// Then, when an enemy dies, it spawns according to that probability - a coin, health pack, or weapon.

import { CollectibleObj, Model } from "../game/Model";
import { Utils } from "../core/Utils";
import { Collectible } from "../game/Collectible";
import { Pool, PoolsManager } from "../core/Pool";

type CollectibleName = keyof typeof Model.spawnProbabilities;
type ProbabilityEntry = {
    name: CollectibleName;
    startVal: number;
    endVal: number;
};


export class CollectiblesManager {
    private probabilitiesArr: ProbabilityEntry[] = [];

    constructor(params?: any) {
        let curr = 0;
        const arr: ProbabilityEntry[] = [];
        const props: Record<string, number> = Utils.deepcopy(Model.spawnProbabilities);
        let total = 0;

        // Work out how many altogether
        for (const k of Object.keys(props) as CollectibleName[]) {
            total += props[k];
        }
        for (const k of Object.keys(props) as CollectibleName[]) {
            props[k] = props[k] / total;
        }

        for (const k of Object.keys(props) as CollectibleName[]) {
            arr.push({ name: k, startVal: curr, endVal: props[k] + curr });
            curr += props[k];
        }
        /*  */
        this.probabilitiesArr = arr;
    }

    clear() {
        for (const key in Model.collectiblesGrid) {
            const map = Model.collectiblesGrid[key];
            for (const entity of map.keys()) {
                if (entity.asset && entity.asset.parentContainer) {
                    entity.asset.parentContainer.remove(entity.asset, false);
                }
            }
        }
    }

    spawn(_x: number, _y: number) {
        const rnd = Math.random();
        for (let i = 0; i < this.probabilitiesArr.length; i++) {
            const obj = this.probabilitiesArr[i];
            if (rnd >= obj.startVal && rnd <= obj.endVal) {
                let collectibleObj: CollectibleObj = Model.collectibles[obj.name];
                let pool = PoolsManager.getPool(collectibleObj.assetName!, collectibleObj);
                const prize = pool!.get() as unknown as Collectible;
                prize.id = obj.name; // this is the magic connection!
                prize.setGrid(Model.collectiblesGrid);
                prize.spawn(_x, _y);
                // type = "collectible"
                // type = "health"
                // type = "weapon"
                break;
            }
        }
    }
}