"use strict";
const NORTH = "N";
const SOUTH = "S";
const EAST = "E";
const WEST = "W";

class Utils {
  static randomBetweenZeroAnd(x) {
    return Math.round(Math.random() * x);
  }
  static randomPosition(maxX, maxY) {
    return {
      x: Utils.randomBetweenZeroAnd(maxX),
      y: Utils.randomBetweenZeroAnd(maxY)
    };
  }
}

class GameObject {
  constructor(position, engine) {
    this.position = position;
    this.engine = engine;
  }
  render() {
    this.engine.render(this);
  }
}
class Food extends GameObject {
  constructor(value, position, engine) {
    super(position, engine);
    this.value = value;
  }
  flee() {
    const [maxX, maxY] = [this.engine.width, this.engine.height];
    this.position = Utils.randomPosition(maxX, maxY);
  }
}
class Snake extends GameObject {
  constructor(position, engine) {
    super(position, engine);
    this.body = [new GameObject(position, engine)];
    this.direction = EAST;
  }
}
class RenderingEngine {
  constructor() {
    this.width = 100;
    this.height = 100;
  }
  clear() {
    throw "Not implemented (clear)";
  }
  renderFood() {
    throw "Not implemented (renderFood)";
  }
  renderSnake() {
    throw "Not implemented (renderSnake)";
  }
  render(gameObject) {
    if (gameObject instanceof Food) return this.renderFood(gameObject);
    if (gameObject instanceof Snake) return this.renderSnake(gameObject);
    throw `could not find render method for ${gameObject.constructor.name}`;
  }
}
class Canvas2DEngine extends RenderingEngine {
  constructor() {
    super();
    const canvas = document.getElementById("canvas");
    this.ctx = canvas.getContext("2d");
  }
  clear() {
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  renderFood(food) {
    const { x, y } = food.position;
    this.ctx.fillStyle = "green";
    this.ctx.fillRect(x, y, 10, 10);
  }
  renderSnake(snake) {
    snake.body.forEach(part => {
      const { x, y } = part.position;
      this.ctx.fillStyle = "red";
      this.ctx.fillRect(x, y, 10, 10);
    });
  }
}
class WebGLEngine extends RenderingEngine {
  constructor() {
    super();
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("webgl");
    ctx.clearColor(0.0, 0.0, 0.0, 1.0);
    ctx.clear(ctx.COLOR_BUFFER_BIT);
  }
}

class Game {
  constructor(engine) {
    this.engine = engine;
    this.food = new Food(10, Utils.randomPosition(100, 100), this.engine);
    this.snake = new Snake(Utils.randomPosition(100, 100), this.engine);
    this.frameId = 0;
  }
  start() {
    this.frameId = requestAnimationFrame(this.render.bind(this));
  }
  pause() {
    cancelAnimationFrame(this.frameId);
  }
  render() {
    this.engine.clear();
    this.food.render();
    this.snake.render();
    this.frameId = requestAnimationFrame(this.render.bind(this));
  }
}

const game = new Game(new Canvas2DEngine());
