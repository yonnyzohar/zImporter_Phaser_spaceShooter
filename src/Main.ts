import Phaser from 'phaser';
import { Model } from './game/Model';
import { Game } from './game/Game';
import { EventsManager } from './core/EventsManager';
import { ZScene, ZSceneStack, ZContainer } from 'zimporter-phaser';
import { MobileControls } from './game/MobileControls';

const LEFT_KEY = 'ArrowLeft';
const RIGHT_KEY = 'ArrowRight';
const UP_KEY = 'ArrowUp';
const DOWN_KEY = 'ArrowDown';

export class Main {
    private game: Game;
    private mobileControls: MobileControls | null = null;

    constructor(
        phaserScene: Phaser.Scene,
        resizeCanvas: () => void,
        updatePreloader?: (per: number) => void,
        hidePreloader?: () => void
    ) {
        let loadPath = (window as any).loadPath || "./scene/";
        let scene: ZScene = new ZScene("game-scene", phaserScene);
        scene.load(loadPath, () => {
            hidePreloader?.();
            ZSceneStack.push(scene);

            let stage = scene.sceneStage;
            scene.loadStage(phaserScene);
            Model.stage = stage;

            resizeCanvas?.();

            this.showSplash(() => {
                this.game = new Game();
                this.mobileControls = new MobileControls();
            });

        }, (progress: number) => {
            updatePreloader?.(progress);
        });

        EventsManager.addListener('GAME_OVER', this.onGameOver.bind(this));

        window.addEventListener('keydown', (e) => {
            switch (e.key) {
                case LEFT_KEY:
                    Model.movement.left = true;
                    break;
                case RIGHT_KEY:
                    Model.movement.right = true;
                    break;
                case UP_KEY:
                    Model.movement.up = true;
                    break;
                case DOWN_KEY:
                    Model.movement.down = true;
                    break;
                case ' ':
                case 'Spacebar':
                    Model.movement.space = true;
                    EventsManager.emit('MENU_SPACE_PRESSED');
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch (e.key) {
                case LEFT_KEY:
                    Model.movement.left = false;
                    break;
                case RIGHT_KEY:
                    Model.movement.right = false;
                    break;
                case UP_KEY:
                    Model.movement.up = false;
                    break;
                case DOWN_KEY:
                    Model.movement.down = false;
                    break;
                case ' ':
                case 'Spacebar':
                    Model.movement.space = false;
                    break;
            }
        });
    }

    onGameOver(obj: { win: boolean }) {
        this.game.onGameOver(() => {
            if (obj?.win) {
                Model.level = Model.level + 1;
                if (!Model.levels[Model.level]) {
                    Model.level = 0;
                }
            } else {
                Model.level = 0;
            }
            this.game.init();
        }, obj?.win ?? false);
    }

    update(dt: number) {
        if (this.game) {
            this.game.update(dt);
        }
    }

    private showSplash(onDismiss: () => void) {
        const logo = Model.stage?.get('logo') as ZContainer | null;
        if (!logo) {
            onDismiss();
            return;
        }

        logo.setVisible(true);
        logo.setInteractive();

        const dismiss = () => {
            logo.setVisible(false);
            logo.off('pointerdown', dismiss);
            window.removeEventListener('keydown', onKey);
            onDismiss();
        };

        const onKey = () => dismiss();

        logo.on('pointerdown', dismiss);
        window.addEventListener('keydown', onKey, { once: true });
    }
}
