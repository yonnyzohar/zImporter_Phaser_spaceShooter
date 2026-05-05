import Phaser from 'phaser';

export class Menu {
    public container: Phaser.GameObjects.Container;
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.container = scene.add.container(0, 0);
        const title = scene.add.text(
            scene.scale.width / 2,
            scene.scale.height / 2,
            'Game Menu',
            { fontFamily: 'Arial', fontSize: '48px', color: '#ffffff' }
        );
        title.setOrigin(0.5);
        this.container.add(title);
    }

    update(_dt: number) { }

    draw() { }

    destroy() {
        this.container.destroy(true);
    }
}
