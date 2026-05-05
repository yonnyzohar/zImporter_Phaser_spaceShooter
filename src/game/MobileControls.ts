import Phaser from 'phaser';
import { ZContainer } from 'zimporter-phaser';
import { Model } from './Model';
import { EventsManager } from '../core/EventsManager';

export class MobileControls {

    static isMobile(): boolean {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    constructor() {
        const keypad = Model.stage?.get('keypad') as ZContainer | undefined;
        if (!keypad) return;

        if (!MobileControls.isMobile()) {
            keypad.setVisible(false);
            return;
        }

        keypad.setVisible(true);

        const canvas = document.querySelector('canvas');
        if (canvas) {
            canvas.addEventListener('contextmenu', (e) => e.preventDefault());
            (canvas.style as any).webkitTouchCallout = 'none';
            canvas.style.userSelect = 'none';
            (canvas.style as any).webkitUserSelect = 'none';
        }

        const bindBtn = (btnName: string, key: keyof typeof Model.movement) => {
            const btn = keypad.get(btnName) as ZContainer | undefined;
            if (!btn) return;

            btn.setInteractive(
                new Phaser.Geom.Rectangle(-60, -60, 120, 120),
                Phaser.Geom.Rectangle.Contains
            );

            btn.on('pointerdown', () => {
                (Model.movement as any)[key] = true;
                if (key === 'space') EventsManager.emit('MENU_SPACE_PRESSED');
            });
            btn.on('pointerup', () => { (Model.movement as any)[key] = false; });
            btn.on('pointerupoutside', () => { (Model.movement as any)[key] = false; });
            btn.on('pointercancel', () => { (Model.movement as any)[key] = false; });
        };

        bindBtn('upBTN', 'up');
        bindBtn('leftBTN', 'left');
        bindBtn('downBTN', 'down');
        bindBtn('rightBTN', 'right');
    }
}
