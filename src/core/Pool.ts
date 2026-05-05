// Assuming you have a base class system, but in TypeScript we use classes directly.

import { BaseObj } from "../game/Model";
import { Entity } from "./Entity";


export class PoolsManager {
    static allPools: Record<string, Pool<Entity>> = {};
    public static getPool(name: string, params: BaseObj): Pool<Entity> | undefined {
        if (!this.allPools[name]) {
            this.allPools[name] = new Pool(params);
        }
        return this.allPools[name];
    }

    public static resetAllPools(): void {
        for (let key in this.allPools) {
            this.allPools[key].reset();
        }
    }
}


export class Pool<T> {

    private arr: T[];
    private curIndex: number;
    private params: any;

    constructor(obj: BaseObj) {
        const numElements = 1000;
        // So the entity can place itself back inside
        (obj as any).pool = this;
        this.params = obj;
        const CLS_STR = obj.ClassName as unknown as string;
        const CLS = (window as any).SpaceGame[CLS_STR]
        this.arr = [];
        this.curIndex = 0;

        for (let i = 0; i < numElements; i++) {
            const e = new (CLS)(obj);
            this.arr[i] = e;
        }
    }

    get(): T {
        if (this.curIndex >= this.arr.length) {
            // Pool exhausted — grow it
            const growBy = Math.max(100, Math.floor(this.arr.length * 0.5));
            const CLS_STR = this.params.ClassName as unknown as string;
            const CLS = (window as any).SpaceGame[CLS_STR];
            for (let i = 0; i < growBy; i++) {
                this.arr.push(new CLS(this.params));
            }
            console.warn(`Pool grown to ${this.arr.length} for ${this.params.assetName ?? 'unknown'}`);
        }
        const e = this.arr[this.curIndex];
        this.curIndex += 1;
        return e;
    }

    putBack(e: T): void {
        if (this.curIndex <= 0) {
            console.warn(`Pool putBack called when already empty for ${this.params?.assetName ?? 'unknown'} — ignoring`);
            return;
        }
        this.curIndex -= 1;
        this.arr[this.curIndex] = e;
        
    }

    reset(): void {
        this.curIndex = 0;
    }

    destroy(): void {
        this.arr = [];
    }
}
