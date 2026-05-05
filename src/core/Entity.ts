import { BaseObj, Model } from '../game/Model';
import { Pool } from './Pool';
import { ZContainer, ZScene } from 'zimporter-phaser';
import { Updatables } from './Updatables';

export class Entity {
    private grid?: Record<string, Map<Entity, boolean>>;
    prevRow?: number;
    prevCol?: number;
    id: string;
    protected isDestroyed: boolean = false;
    params: BaseObj;
    pool?: Pool<Entity>;
    asset: ZContainer | undefined;
    x?: number;
    y?: number;
    w?: number;
    h?: number;
    radius?: number;
    private type: string;
    // circle is intentionally null — drawCircle always returns early (debug-only code)
    public circle: any = null;

    constructor(params: BaseObj) {
        this.params = params;
        if (params.grid) {
            this.grid = params.grid;
        }
        this.type = params.type;
        this.setView(params);
    }

    setGrid(grid: Record<string, Map<Entity, boolean>>) {
        this.grid = grid;
    }

    getGrid(): Record<string, Map<Entity, boolean>> | undefined {
        return this.grid;
    }

    setView(params: BaseObj) {
        const scene = ZScene.getSceneById("game-scene");
        this.asset = scene?.spawn(params.assetName);
        // Container.width is ComputedSize.width (always 0 unless setSize is called).
        // Use getBounds() to get the actual visual extent from children.
        const bounds = this.asset!.getBounds();
        this.w = bounds.width;
        this.h = bounds.height;
        this.radius = Math.min(this.w, this.h) / 2;
        // ZContainer auto-adds to the scene's display list in its constructor.
        // Pool entities must stay off the display list until placed in a container.
        this.asset!.removeFromDisplayList();
    }

    public drawCircle(_collision: boolean) {
        return;
    }

    public getType(): string {
        return this.type;
    }

    public update(dt: number) {
        const col = Math.floor(this.x! / Model.gridSize);
        const row = Math.floor(this.y! / Model.gridSize);
        const grid = this.grid;

        if (grid && row !== this.prevRow || col !== this.prevCol) {
            if (this.prevRow !== undefined && this.prevCol !== undefined && grid) {
                const oldDictName = `${this.prevRow}_${this.prevCol}`;
                const block = grid[oldDictName];
                if (block && this.params.isAddedToGrid) {
                    const map: Map<Entity, boolean> = grid[oldDictName];
                    map.delete(this);
                }
            }
            if (grid && this.params.isAddedToGrid) {
                const newDictName = `${row}_${col}`;
                if (!grid[newDictName]) {
                    grid[newDictName] = new Map<Entity, boolean>();
                }
                grid[newDictName].set(this, true);
            }
            this.prevRow = row;
            this.prevCol = col;
        }
    }

    render() {
        if (this.asset && typeof this.x === 'number') {
            this.asset.x = this.x;
        }
        if (this.asset && typeof this.y === 'number') {
            this.asset.y = this.y;
        }
    }

    destroyEntity() {
        if (this.isDestroyed) return;
        this.isDestroyed = true;
        const grid = this.grid;
        if (!grid) return;
        const col = Math.floor(this.x! / Model.gridSize);
        const row = Math.floor(this.y! / Model.gridSize);
        const newDictName = `${row}_${col}`;
        const oldDictName = `${this.prevRow}_${this.prevCol}`;
        if (grid[oldDictName]) {
            const map: Map<Entity, boolean> = grid[oldDictName];
            map.delete(this);
        }
        if (grid[newDictName]) {
            const map: Map<Entity, boolean> = grid[newDictName];
            map.delete(this);
        }
        this.prevRow = undefined;
        this.prevCol = undefined;
        if (this.asset && this.asset.parentContainer) {
            this.asset.parentContainer.remove(this.asset, false);
            // Phaser's removeHandler re-adds to the scene's display list; undo that.
            this.asset.removeFromDisplayList();
        }
        Updatables.remove(this);
    }
}
