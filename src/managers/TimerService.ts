import Phaser from 'phaser';
import { Updatables } from './../core/Updatables';
import { ZScene } from 'zimporter-phaser';
import { Model } from '../game';

export class TimersManager {
    private timers: Map<string, TimerService> = new Map();

    destroyAll() {
        this.timers.forEach((timer) => timer.destroy());
        this.timers.clear();
    }

    addTime(timerId: string, time: number, color: number, completeCallback: Function) {
        if (this.timers.has(timerId)) {
            this.timers.get(timerId)!.destroy();
            this.timers.delete(timerId);
            this.reorganizeTimers();
        }
        const timer = new TimerService();
        timer.start(time, color, completeCallback, () => {
            this.timers.delete(timerId);
            this.reorganizeTimers();
        });
        this.timers.set(timerId, timer);
        this.reorganizeTimers();
    }

    reorganizeTimers() {
        let index = 0;
        this.timers.forEach((timer) => {
            timer.rect.y = -30 * index;
            index++;
        });
    }
}

export class TimerService {
    private time: number = 0;
    private startTime: number = 0;
    private color: number = 0xFFFFFF;
    private completeCallback?: Function;
    public rect!: Phaser.GameObjects.Graphics;
    private scene: ZScene = ZScene.getSceneById("game-scene")!;
    private stopCallback?: Function;

    start(
        time: number,
        color: number,
        completeCallback: Function,
        stopCallback?: Function
    ) {
        this.time = time;
        this.startTime = 0;
        this.color = color;
        this.stopCallback = stopCallback;
        this.completeCallback = completeCallback;

        let dimensions = this.scene.getInnerDimensions();
        const phaserScene = this.scene.sceneStage.scene;
        this.rect = phaserScene.add.graphics();
        this.rect.fillStyle(this.color, 0.6);
        this.rect.fillRect(0, 0, dimensions.width, 30);

        let meterSpawn = Model.stage!.get("meterSpawn")!;
        meterSpawn.add(this.rect);
        meterSpawn.setScale(0.90, 1);

        Updatables.add(this);
    }

    update(dt: number) {
        this.startTime += dt;
        let per = this.startTime / this.time;
        let dimensions = this.scene.getInnerDimensions();

        this.rect.clear();
        this.rect.fillStyle(this.color, 0.6);
        this.rect.fillRect(0, 0, dimensions.width * per, 30);

        if (this.startTime >= this.time) {
            if (this.completeCallback) {
                this.completeCallback();
            }
            this.destroy();
        }
    }

    destroy() {
        Updatables.remove(this);
        if (this.rect) {
            this.rect.clear();
            if (this.rect.parentContainer) {
                this.rect.parentContainer.remove(this.rect, false);
            }
            this.rect.destroy();
        }
        this.stopCallback?.();
    }

    stop() {
        Updatables.remove(this);
    }
}
