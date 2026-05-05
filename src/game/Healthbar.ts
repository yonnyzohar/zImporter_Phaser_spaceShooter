import Phaser from 'phaser';
import { Model } from './Model';

export class Healthbar {
    private bar: Phaser.GameObjects.Graphics;
    private maxHealth: number;
    private currentHealth: number;

    constructor(params: { numLives: number }) {
        this.maxHealth = params.numLives;
        this.currentHealth = params.numLives;
        let livesContainer = Model.stage?.get("livesContainer")!;
        this.bar = livesContainer.scene.add.graphics();
        livesContainer.add(this.bar);
        this.drawBar();
    }

    damage(amount: number = 1) {
        this.currentHealth = Math.max(0, this.currentHealth - amount);
        this.drawBar();
    }

    heal(amount: number = 1) {
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
        this.drawBar();
    }

    isDead(): boolean {
        return this.currentHealth <= 0;
    }

    setHealth(health: number) {
        this.currentHealth = health;
        this.drawBar();
    }

    private drawBar() {
        this.bar.clear();
        this.bar.fillStyle(0xff0000);
        this.bar.fillRect(0, 0, 100, 10);
        this.bar.fillStyle(0x00ff00);
        this.bar.fillRect(0, 0, 100 * (this.currentHealth / this.maxHealth), 10);
    }

    removeFromParent() {
        if (this.bar.parentContainer) {
            this.bar.parentContainer.remove(this.bar, false);
        }
    }

    destroy() {
        this.removeFromParent();
        this.bar.destroy();
    }
}
