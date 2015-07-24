'use strict';

var game = game || {
	config : {
		'screenWidth': 500,
		'screenHeight': 500,
		'screenCanvasID': 'playground',
		'maxLives': 3
	}
};

game.Food = (function() {

	function Food(foodConfig) {
		var food = this;
		food.position = foodConfig.coordinates;
		food.points = foodConfig.points;
		food.min = foodConfig.min;
		food.max = foodConfig.max;
		setInterval(function() {food.flee();},foodConfig.timeUntilFlee*1000);
	}

	Food.prototype.flee = function() {
		var food = this;
		food.position = Food.randomCoordinates(this.min, this.max);
	};

	Food.random = function(points, min, max, timeUntilFlee) {
		return new Food({
			'timeUntilFlee': timeUntilFlee,
			'coordinates': Food.randomCoordinates(min, max),
			'points': points,
			'min': min,
			'max': max
		});
	};

	Food.randomCoordinates = function(min, max) {
		var x = Math.round((Math.random()*(max-min)+min)/10)*10;
		var y = Math.round((Math.random()*(max-min)+min)/10)*10;
		return {'x': x, 'y': y};
	};

	return Food;
}());

game.Snake = (function() {
	
	function Snake() {

		this.body = [
			{x: 40, y: 60},
			{x: 30, y: 60},
			{x: 20, y: 60},
			{x: 10, y: 60}
		];
		this.direction = 'RIGHT';
		this.limits = {'x': {'min':0, 'max': 490}, 'y': {'min': 60, 'max': 490}};
	}

	Snake.prototype.moveUp = function() {
		if (this.direction !== 'DOWN') {
			this.direction = 'UP';
		}
	};

	Snake.prototype.moveDown = function() {
		if (this.direction !== 'UP') {
			this.direction = 'DOWN';
		}
	};

	Snake.prototype.moveLeft = function() {
		if (this.direction !== 'RIGHT') {
			this.direction = 'LEFT';
		}
	};

	Snake.prototype.moveRight = function() {
		if (this.direction !== 'LEFT') {
			this.direction = 'RIGHT';
		}
	};

	Snake.prototype.hasBittenItself = function() {
		var body = this.body.slice(1,this.body.length);

		for (var i = 0; i < body.length; i++) {
			var itSelf = body[i];
			itSelf.position = {'x': itSelf.x, 'y': itSelf.y};
			if (this.bite(itSelf)) {
				return true;
			}
		}

		return false;
	};

	Snake.prototype.bite = function(thing) {
		var head = this.body[0];

		if (thing.position.x === head.x && thing.position.y === head.y) {
			return true;
		}

		return false;
	};

	Snake.prototype.eat = function(food) {

		if (this.bite(food)) {
			var tail = this.body[this.body.length - 1];
			var newPiece = {'x': tail.x + 10, 'y': tail.y};
			this.body.push(newPiece);
			return true;
		}

		return false;
	};

	Snake.prototype.move = function(distance) {
		var axis = (this.direction === 'LEFT' || this.direction == 'RIGHT') ? 'x' : 'y';
		var head = this.body[0];
		var lastPosition = {x: head.x, y: head.y};

		distance = (this.direction === 'UP' || this.direction == 'LEFT') ? (distance * -1) : distance;
		head[axis] += distance;

		if (head[axis] < this.limits[axis].min) {
			head[axis] = this.limits[axis].max;
		}

		if (head[axis] > this.limits[axis].max) {
			head[axis] = this.limits[axis].min;
		}

		for(var i = 1; i < this.body.length; i++) {
			var piece = this.body[i];
			var lastPositionAux = {x: piece.x, y: piece.y};
			this.body[i] = lastPosition;
			lastPosition = lastPositionAux;
		}

	};

	return Snake;
}());

game.Level = (function() {

	function Level(levelConfig) {
		this.name = levelConfig.name;
		this.speed = levelConfig.speed;
		this.goal = levelConfig.goal;
		this.foodValue = levelConfig.foodValue;
		this.foodTimeUntilFlee = levelConfig.foodTimeUntilFlee;
		this.score = 0;
		this.walls = [];
	}

	Level.prototype.generateFood = function() {
		return game.Food.random(this.foodValue,60,game.config.screenWidth - 10,this.foodTimeUntilFlee);
	};

	Level.prototype.gotGoal = function() {
		return this.score >= this.goal;
	};

	return Level;
}());

game.screen = (function() {
	
	var canvas = document.getElementById(game.config.screenCanvasID);
	var scr = {};

	scr.strokeRect = function(position,color) {
		var ctx = canvas.getContext('2d');
		ctx.strokeStyle = color;
		ctx.strokeRect(position.x, position.y, 10, 10);
	};

	scr.clear = function() {
		canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
	};

	scr.paintFood = function(f) {
		scr.strokeRect(f.position,'red');
	};

	scr.paintSnake = function(s) {
		for(var i = 0; i < s.body.length; i++) {
			scr.strokeRect(s.body[i],'green');
		}
	};

	scr.paintScore = function() {
		var level = game.general.getCurrentLevel();
		var ctx = canvas.getContext('2d');
		ctx.font = 'normal normal bold 20px Consolas';
		ctx.fillStyle = 'lightgray';

		ctx.strokeStyle = 'gray';
		ctx.strokeRect(0,0, game.config.screenWidth, 50);

		ctx.fillText('lvl', 10, 30);
		ctx.fillText(level.name, 50, 30);

		ctx.fillText('score', 190, 30);
		ctx.fillText(level.score, 250, 30);

		ctx.fillText('total', 300, 30);
		ctx.fillText(game.general.getTotalScore(), 370, 30);

		ctx.fillStyle = 'red';
		ctx.strokeStyle = 'lightgray';

		var x = 420, lives = game.general.getLives(), totalLives = game.config.maxLives;

		for (var t = 1; t <= lives; t++) {
			ctx.fillText('\u2665', x, 30);
			x += 20;
		}
		for (var i = totalLives; i > lives; i--) {
			ctx.strokeText('\u2665', x, 30);
			x += 20;
		}
	};

	scr.paintWalls = function() {

	};

	return scr;
}());

game.general = (function() {

	var snake = new game.Snake();
	var level = null;
	var levels = [];
	var food = null;
	var loopID = null;
	var lives = 3;
	var totalScore = 0;
	var lvlIndex = 0;

	function init() {
		listenKeyboard();
		generateLevels();
		level = getCurrentLevel();
		food = level.generateFood();
		start();
	}

	function start() {
		loopID = setInterval(go, level.speed);
	}

	function pause() {
		clearInterval(loopID);	
	}

	function go() {
		game.screen.clear();
		game.screen.paintSnake(snake);
		game.screen.paintFood(food);
		game.screen.paintWalls(level.walls);
		game.screen.paintScore();

		snake.move(10);

		if(snake.hasBittenItself()) {
			lives -=1 ;
			snake = new game.Snake();
		}

		if(lives <= 0) {
			gameOver();
		}

		if (snake.eat(food)) {
			level.score += food.points;
			totalScore += food.points;
			food = level.generateFood();
		}

		if(level.gotGoal()) {
			pause();
			level = getNextLevel();
			snake = new game.Snake();
			food = level.generateFood();
			start();
		}

	}

	function listenKeyboard() {
		addEvent(document,'keydown',detectKeyboard);
	}
	
	function detectKeyboard(e) {
		e = e || window.event;

		switch(e.keyCode) {
			case 38:
				snake.moveUp();
				break;
			case 40:
				snake.moveDown();
				break;
			case 37:
				snake.moveLeft();
				break;
			case 39:
				snake.moveRight();
				break;
		}
	}

	function addEvent(element, eventName, callback) {
	    if (element.addEventListener) {
	        element.addEventListener(eventName, callback, false);
	    } else if (element.attachEvent) {
	        element.attachEvent('on' + eventName, callback);
	    } else {
	        element['on' + eventName] = callback;
	    }
	}

	function gameOver() {
		pause();
	}

	function generateLevels() {
		for (var i = 1; i <= 10; i++) {
			var lvl =  new game.Level({
				'name': i,
				'speed': (100 - (i * 5)),
				'goal': 10,
				'foodValue': i,
				'foodTimeUntilFlee': 50
			});
			levels.push(lvl);
		}
	}

	function getCurrentLevel() {
		return levels[lvlIndex];
	}

	function getNextLevel() {
		lvlIndex = levels.length - (levels.length - (lvlIndex + 1));
		if(lvlIndex === levels.length) {
			pause();
		}
		return levels[lvlIndex];
	}

	function getTotalScore() {
		return totalScore;
	}

	function getLives() {
		return lives;
	}

	return {
		init: init,
		start: start,
		pause: pause,
		getCurrentLevel : getCurrentLevel,
		getTotalScore: getTotalScore,
		getLives: getLives
	};

}());

game.general.init();