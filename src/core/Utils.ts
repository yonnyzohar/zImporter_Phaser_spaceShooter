import { Entity } from "./Entity";

export class Utils {
    static distance(x1: number, y1: number, x2: number, y2: number): number {
        return Math.sqrt(((x2 - x1) ** 2) + ((y2 - y1) ** 2));
    }

    static sign(n: number): number {
        return n === 0 ? 0 : n > 0 ? 1 : -1;
    }

    static deepcopy<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj));
    }

    static getCollisionsAllScreen(
        entity: Entity,
        radius: number,
        matrix: Record<string, Map<Entity, boolean>>,
        gridSize: number,
        className?: string
    ): Entity[] {
        if (!matrix) return [];
        const collisions: Entity[] = [];
        for (let dictName in matrix) {
            if (matrix[dictName]) {
                const map = matrix[dictName];
                for (const k of map.keys()) {
                    if (entity === k) continue;
                    if (!map.get(k)) continue;
                    let proceed = false;
                    if (className) {
                        if (k.constructor.name === className) {
                            proceed = true;
                        }
                    } else {
                        proceed = true;
                    }
                    if (proceed) {
                        const dist = Math.abs(Utils.distance(k.x!, k.y!, entity.x!, entity.y!));
                        if (dist < (radius + k.radius!)) {
                            collisions.push(k);
                        }
                    }
                }
            }
        }
        return collisions;
    }

    static getCollisions(
        entity: Entity,
        radius: number,
        matrix: Record<string, Map<Entity, boolean>>,
        gridSize: number,
        className?: string
    ): Entity[] {
        if (!matrix) return [];
        const collisions: Entity[] = [];
        const col = Math.floor(entity.x! / gridSize);
        const row = Math.floor(entity.y! / gridSize);
        for (let r = -1; r <= 1; r++) {
            for (let c = -1; c <= 1; c++) {
                const dictName = `${row + r}_${col + c}`;
                if (matrix[dictName]) {
                    const map = matrix[dictName];
                    for (const k of map.keys()) {
                        if (entity === k) continue;
                        if (!map.get(k)) continue;
                        let proceed = false;
                        if (className) {
                            if (k.constructor.name === className) {
                                proceed = true;
                            }
                        } else {
                            proceed = true;
                        }
                        if (proceed) {
                            const dist = Math.abs(Utils.distance(k.x!, k.y!, entity.x!, entity.y!));
                            if (dist < (radius + k.radius!)) {
                                collisions.push(k);
                            }
                        }
                    }
                }
            }
        }
        return collisions;
    }
}
