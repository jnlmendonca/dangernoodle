# Danger Noodle
A simple javascript implementation of the Snake game.

*Note: The game itself does not implement a controller. If you need a simple one, just to control the snake's movement, please check the example in the [**Controller**](#controller) section below.*

## Installation
```bash
npm install @jnlmendonca/dangernoodle
```

## Usage
In your HTML code, add class **danger-noodle** to an element:
```html
<!DOCTYPE html>
<html>
    <body>
        <div class="danger-noodle"></div>
    </body>
</html>
```

In your code, import the DangerNoodle module and instantiate the DangerNoodle class:
```javascript
// CommonJS
require('@jnlmendonca/dangernoodle');

// ES6
import '@jnlmendonca/dangernoodle';

const game = new DangerNoodle();
```

The game canvas will be appended as a child to the element with the **danger-noodle** class.

To use it directly on client-side javascript, add a ```<scrip>``` tag pointing to the external *UNPKG* url:

```html
<script src="https://unpkg.com/@jnlmendonca/dangernoodle/index.js"></script>
```

### Options
An *options* object can be passed as argument to the DangerNoodle class on instantiation. The object should comply to the following structure

- **selector** (String)

   Argument passed down to the [*querySelector*](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector) used for the game canvas placement. Default value: **.danger-noodle**

- **game** (Object)
    + **width** (Integer)

       Number of horizontal cells. Default value: **30**

    + **height** (Integer)

       Number of vertical cells. Default value: **20**

    + **scale** (Integer)

       The size of each cell in canvas pixels. Default value: **10**

    + **border** (Integer)

       Border width for each cell, in canvas pixels. Default value: **1**

    + **tickDuration** (Integer)

       How many milliseconds between each snake movement. Default value: **50**

    + **solidWalls** (Boolean)

       Wall collisions are active? Default value: **false**

    + **backgroundColor** (String)

       Game background color. All valid [CSS Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) values are accepted. Default value: **#000000**

- **snake** (Object)

    + **initialLength** (Integer)

       Initial snake size, in cells. Default value: **3**

    + **mainColor** (String)

       Snake main color. All valid [CSS Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) values are accepted. Default value: **#00ff00**

    + **borderColor** (String)

       Snake border color. All valid [CSS Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) values are accepted. Default value: **#000000**

    + **hitColor** (String)

       Snake main color after when hit occurs. All valid [CSS Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) values are accepted. Default value: **#0000ff**

- **apple** (Object)

    + **mainColor** (String)

       Apple main color. All valid [CSS Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) values are accepted. Default value: **#ff0000**

    + **borderColor** (String)

       Apple border color. All valid [CSS Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) values are accepted. Default value: **#000000**

### Methods
The DangerNoodle instance exposes methods through which we can control the game:

- **start()**

   (Re)Starts a game, setting the snake's length, position and direction to the initial values and all game state values to zero.

- **stop(clear)**

   Stops the game permanently.
   Arguments:

   - **clear** (Boolean)
   If true, the display will be cleared. Default value: **true**

- **pause()**

   Pauses the game, but keeps its state.

- **resume()**

   Resumes a paused game.

- **moveSnake(direction)**

   Sets snake direction for the following movements. Direction is relative to the game display, not to the snake itself.
   Arguments:

   - **direction** (String)
   Can be either **left**, **right**, **up** or **down**.

- **setTickDuration(tickDuration)**

   Sets new tick duration.
   Arguments:

   - **tickDuration** (Integer)
   Number of milliseconds between ticks.

- **getState()**

   Returns the current game state. Return value complies to the following structure:

   ```javascript
   {
        movements: Number,  // Number of times direction changed

        gameTicks: Number,  // Game ticks elapsed

        applesEaten: Number, // Number of apples eaten

        snakePositions: [  // Array with the positions of each snake cell, head to tail
            {
                x: Number,  // Position's horizontal value
                y: Number,  // Position's vertical value
            },
            ...
        ],

        snakeDirection: {
            name: String,  // Direction's name. right, left, up or down
            x: Number,  //Direction vector's horizontal value
            y: Number,  //Direction vector's vertical value
        },

        applePosition: {
            x: Number,  // Apple position's horizontal value
            y: Number,  // Apple position's vertical value
        },
    }
   ```

### Events
The DangerNoodle instance emits events after certain actions take place. These can be caugh in the following manner:
```javascript
const game = new DangerNoodle();
game.events.on('eventName', function (eventData) {
    // Do something with data
});
```

The list of available events is as follows:

Event Name | Event Data | Description
--- | --- | ---
start | | Emitted when the game starts
stop | | Emitted when the game stops
pause | | Emitted when the game pauses
resume | | Emitted when the game resumes
tick | gameTicks (Number) | Emitted every game tick. Total number of elapsed game ticks is available in data.
move | name (String), {x (Number), y (Number)} | Emitted when the snake changes direction. Direction vector and name are available in data.
appleEaten | applesEaten (Number) | Emitted when the an apple is eaten. Total number of apples eaten is available in data.
wallHit | | Emitted when the snake hits a wall
bodyHit | | Emitted when the snake hits its own body

### Controller
The following code creates a simple controller that maps the keyboard arrow keys to the commands that move the snake. Use the DangerNoodle instance [events](#events) and [methods](#methods) to create your own versions of a controller.
```javascript
class Controller {

    constructor(game) {
        this.game = game;
        document.onkeydown = this.detectKeyPress.bind(this);
    }

    detectKeyPress(event) {
        let keyCode = window.event.keyCode;
        keyCode = event.keyCode;

        if (keyCode == 38) {
            this.game.moveSnake('up');
        } else if (keyCode == 40) {
            this.game.moveSnake('down');
        } else if (keyCode == 37) {
            this.game.moveSnake('left');
        } else if (keyCode == 39) {
            this.game.moveSnake('right');
        } 
    }
}

const controller = new Controller(game);
```
