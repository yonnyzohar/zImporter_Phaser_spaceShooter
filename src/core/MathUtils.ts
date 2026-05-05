export class MathUtils {
    static clamp(val: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, val));
    }
    static lerp(a: number, b: number, t: number): number {
        return a + (b - a) * t;
    }
    static randomRange(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }
}
