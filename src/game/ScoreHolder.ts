import { EventsManager } from "../core/EventsManager";
import { Model } from "./Model";
import { ZContainer } from "zimporter-phaser";


export class ScoreHolder {
    private score: number = 0;

    constructor() {
        EventsManager.addListener("COIN_COLLECTED", this.onCoinCollected);
        EventsManager.addListener("ENEMY_DESTROYED", this.onEnemyDestroyed);
        this.updateDisplay();
    }

    destroy() {
        EventsManager.removeListener("COIN_COLLECTED", this.onCoinCollected);
        EventsManager.removeListener("ENEMY_DESTROYED", this.onEnemyDestroyed);
    }

    private updateDisplay() {
        let scoreContainer = Model.stage?.get("scoreContainer")!;
        let scoreInner = scoreContainer.get("scoreInner") as ZContainer;
        scoreInner.setText(`Score : ${this.score}`);
    }

    private onEnemyDestroyed = (data: { x: number; y: number; value: number }) => {
        this.score += data?.value || 0;
        this.updateDisplay();
    };

    private onCoinCollected = (collectibleVal: number = 0) => {
        this.score += collectibleVal;
        this.updateDisplay();
    };
}
