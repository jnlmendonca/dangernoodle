const KEYS = {
  left: 37,
  up: 38,
  right: 39,
  down: 40
}

class Controller {
  constructor (game) {
    this.game = game
    console.log()
    document.onkeydown = this.detectKeyPress.bind(this)
  }

  detectKeyPress (event) {
    let keyCode = window.event.keyCode
    keyCode = event.keyCode

    if (keyCode === KEYS.up) {
      this.game.moveSnake('up')
    } else if (keyCode === KEYS.down) {
      this.game.moveSnake('down')
    } else if (keyCode === KEYS.left) {
      this.game.moveSnake('left')
    } else if (keyCode === KEYS.right) {
      this.game.moveSnake('right')
    }
  }
};

module.exports = Controller
