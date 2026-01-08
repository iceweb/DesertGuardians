import Phaser from 'phaser';

export class ResultsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ResultsScene' });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Will be fully implemented in Step 9
    this.cameras.main.setBackgroundColor('#1a0a00');

    const text = this.add.text(width / 2, height / 2, 'Results Scene\n(Coming in Step 9)', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#d4a574',
      align: 'center'
    });
    text.setOrigin(0.5);

    console.log('ResultsScene: Results screen ready');
  }
}
