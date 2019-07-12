import './style.scss'
import { merge, random, range } from 'lodash'
import Events from 'events'

const DEFAULTS = {
  selector: '.danger-noodle',
  game: {
    width: 30,
    height: 20,
    scale: 10,
    border: 1,
    tickDuration: 50,
    solidWalls: false,
    backgroundColor: '#000000'
  },
  snake: {
    initialLength: 3,
    defaultColor: '#00ff00',
    borderColor: '#000000',
    hitColor: '#0000ff'
  },
  apple: {
    defaultColor: '#ff0000',
    borderColor: '#000000'
  }
}

const DIRECTIONS = {
  right: { x: 1, y: 0 },
  left: { x: -1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 }
}

class DangerNoodle {
  constructor (options) {
    // Merge options with defaults
    this.options = merge(DEFAULTS, options)

    // Prepare event emitter
    this.events = new Events()

    // Create game display
    this.gameDisplay = document.createElement('canvas')

    // Set display properties
    this.gameDisplay.setAttribute('width', this.scale(this.options.game.width))
    this.gameDisplay.setAttribute('height', this.scale(this.options.game.height))
    this.gameDisplay.setAttribute('class', 'danger-noodle-canvas')

    // Prepare game
    this.displayContext = this.gameDisplay.getContext('2d')

    // Place game canvas
    this.reRender()
  }

  reRender() {
    const wrapper = document.querySelector(this.options.selector)
    if (wrapper) {
      wrapper.appendChild(this.gameDisplay)
    }
  }

  start () {
    // Initialize game elements
    this.snake = new Snake(this)
    this.apple = new Apple(this)
    this.snake.draw()
    this.apple.draw()

    // Initialize game status
    this.applesEaten = 0
    this.gameTicks = 0
    this.movements = 0
    this.paused = false
    this.stopped = false
    this.tickDuration = this.options.game.tickDuration
    this.newTickDuration = null

    // Run game
    this.mainLoop = setInterval(this.loop.bind(this), this.tickDuration)

    // Emit START event
    this.events.emit('start')
  }

  stop (clear = true) {
    this.terminate(clear)

    // Emit STOP event
    this.events.emit('stop')
  }

  terminate (clear = true) {
    clearInterval(this.mainLoop)
    if (clear) {
      this.clearDisplay()
    }
    this.stopped = true
  }

  pause () {
    clearInterval(this.mainLoop)
    this.paused = true

    // Emit PAUSE event
    this.events.emit('pause')
  }

  resume () {
    this.mainLoop = setInterval(this.loop.bind(this), this.tickDuration)
    this.paused = false

    // Emit RESUME event
    this.events.emit('resume')
  }

  moveSnake (direction) {
    this.snake.setDirection(direction)
  }

  setTickDuration (tickDuration = 50) {
    this.newTickDuration = tickDuration
  }

  getState () {
    return {
      movements: this.movements,
      gameTicks: this.gameTicks,
      applesEaten: this.applesEaten,
      snakePositions: this.snake.positions,
      snakeDirection: this.snake.direction,
      applePosition: {
        x: this.apple.x,
        y: this.apple.y
      }
    }
  }

  clearDisplay () {
    this.displayContext.fillStyle = this.options.game.backgroundColor
    this.displayContext.fillRect(0, 0, this.scale(this.options.game.width), this.scale(this.options.game.height))
  }

  loop () {
    // Snake died - stop game
    if (this.snake.dead) {
      this.stop(false)
      return
    }

    // Increment tick counter
    this.gameTicks += 1

    // Emit TICK event
    this.events.emit('tick', this.gameTicks)

    // Reset display
    this.clearDisplay()

    // Move Snake
    this.snake.move()

    // Check if apple can be eaten
    if (this.hitApple()) {
      this.applesEaten += 1
      this.snake.eat()
      this.apple = new Apple(this)

      // Emit APPLE EATEN event
      this.events.emit('appleEaten', this.applesEaten)
    }

    // Check if snake hits itself
    if (this.hitBody()) {
      this.snake.die()

      // Emit BODY HIT event
      this.events.emit('bodyHit')
    }

    // Check if snake hits walls
    if (this.options.game.solidWalls && this.hitWall()) {
      this.snake.die(true)

      // Emit WALL HIT event
      this.events.emit('wallHit')
    }

    // Draw elements
    this.apple.draw()
    this.snake.draw()

    // Change tick duration
    if (this.newTickDuration) {
        this.tickDuration = this.newTickDuration
        this.newTickDuration = null
        clearInterval(this.mainLoop)
        this.mainLoop = setInterval(this.loop.bind(this), this.tickDuration)
    }
  }

  hitApple () {
    return this.apple.x === this.snake.x && this.apple.y === this.snake.y
  }

  hitBody () {
    let bodyHit = false
    this.snake.positions.slice(1).forEach(bodyPosition => {
      if (this.snake.x === bodyPosition.x && this.snake.y === bodyPosition.y) {
        bodyHit = true
      }
    })
    return bodyHit
  }

  hitWall () {
    return this.snake.xOrig === -1 || this.snake.xOrig === this.options.game.width || this.snake.yOrig === -1 || this.snake.yOrig === this.options.game.height
  }

  scale (value, scale = this.options.game.scale) {
    return scale * value
  }

  drawBlock (x, y, color) {
    this.displayContext.fillStyle = color
    this.displayContext.fillRect(this.scale(x) + this.options.game.border, this.scale(y) + this.options.game.border, this.scale(1, this.options.game.scale - this.options.game.border * 2), this.scale(1, this.options.game.scale - this.options.game.border * 2))
  }

  drawBorder (x, y, color) {
    this.displayContext.fillStyle = color
    this.displayContext.fillRect(this.scale(x), this.scale(y), this.scale(1), this.scale(1))
  }

  // Rectifies a game position to standard coordinates - useful
  position (value, dimension = 'width') {
    let maxSize = this.options.game.width
    if (dimension === 'height') {
      maxSize = this.options.game.height
    }
    if (value < 0) {
      return maxSize + value
    } else if (value > maxSize - 1) {
      return value - maxSize
    } else {
      return value
    }
  }
}

class Snake {
  constructor (game) {
    this.game = game
    this.newDirectionSet = false
    this.dead = false
    this.direction = DIRECTIONS[Object.keys(DIRECTIONS)[random(3)]]
    this.x = Math.floor(this.game.options.game.width / 2)
    this.y = Math.floor(this.game.options.game.height / 2)
    this.xOrig = this.x
    this.yOrig = this.y
    this.positions = []
    range(this.game.options.snake.initialLength).forEach(index => {
      this.positions.push({
        x: this.game.position(this.x - this.direction.x * index, 'width'),
        y: this.game.position(this.y - this.direction.y * index, 'height')
      })
    })
  }

  draw () {
    if (this.dead) {
      if (this.wallHit) {
        this.positions.forEach((position, index) => {
          if (index > 0) {
            this.game.drawBorder(position.x, position.y, this.game.options.snake.borderColor)
            this.game.drawBlock(position.x, position.y, this.game.options.snake.hitColor)
          }
        })
      } else {
        this.positions.forEach((position, index) => {
          if (index > 0) {
            this.game.drawBorder(position.x, position.y, this.game.options.snake.borderColor)
            this.game.drawBlock(position.x, position.y, this.game.options.snake.defaultColor)
          }
        })
        this.game.drawBorder(this.x, this.y, this.game.options.snake.borderColor)
        this.game.drawBlock(this.x, this.y, this.game.options.snake.hitColor)
      }
    } else {
      this.positions.forEach((position, index) => {
        this.game.drawBorder(position.x, position.y, this.game.options.snake.borderColor)
        this.game.drawBlock(position.x, position.y, this.game.options.snake.defaultColor)
      })
    }
    this.game.displayContext.stroke()
    this.newDirectionSet = false
  }

  move () {
    this.previousTailPosition = this.positions.pop()
    const nextHeadPosition = this.getNextHeadPosition()
    this.positions.unshift(nextHeadPosition)
    this.x = nextHeadPosition.x
    this.y = nextHeadPosition.y
    this.xOrig = nextHeadPosition.xOrig
    this.yOrig = nextHeadPosition.yOrig
  }

  eat () {
    this.positions.push(this.previousTailPosition)
  }

  die (wallHit = false) {
    this.dead = true
    this.wallHit = wallHit
  }

  getNextHeadPosition () {
    return {
      x: this.game.position(this.x + this.direction.x, 'width'),
      y: this.game.position(this.y + this.direction.y, 'height'),
      xOrig: this.x + this.direction.x,
      yOrig: this.y + this.direction.y
    }
  }

  setDirection (direction) {
    if (!this.newDirectionSet) {
      if ((direction === 'right' && this.direction !== DIRECTIONS.left && this.direction !== DIRECTIONS.right) ||
                (direction === 'left' && this.direction !== DIRECTIONS.right && this.direction !== DIRECTIONS.left) ||
                (direction === 'up' && this.direction !== DIRECTIONS.down && this.direction !== DIRECTIONS.up) ||
                (direction === 'down' && this.direction !== DIRECTIONS.up && this.direction !== DIRECTIONS.down)) {
        this.movements += 1
        this.direction = DIRECTIONS[direction]
        this.newDirectionSet = true

        // Emit MOVE event
        this.game.events.emit('move', direction, this.direction)
      }
    }
  }
}

class Apple {
  constructor (game) {
    this.game = game
    this.findValidCoordinates()
  }

  draw () {
    this.game.drawBorder(this.x, this.y, this.game.options.apple.borderColor)
    this.game.drawBlock(this.x, this.y, this.game.options.apple.defaultColor)
    this.game.displayContext.stroke()
  }

  findValidCoordinates () {
    let coordinatesValid = true
    do {
      coordinatesValid = true
      this.x = random(this.game.options.game.width - 1)
      this.y = random(this.game.options.game.height - 1)
      this.game.snake.positions.forEach(position => {
        if (position.x === this.x && position.y === this.y) {
          coordinatesValid = false
        }
      })
    } while (!coordinatesValid)
  }
}

export default DangerNoodle
