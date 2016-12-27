/**
 * MyInterface
 * @constructor
 */

function MyInterface() {
	//call CGFinterface constructor 
	CGFinterface.call(this);
	this.alreadyAdded = false;
};

MyInterface.prototype = Object.create(CGFinterface.prototype);
MyInterface.prototype.constructor = MyInterface;

/**
 * init
 * @param {CGFapplication} application
 */
MyInterface.prototype.init = function (application) {
	// call CGFinterface init
	CGFinterface.prototype.init.call(this, application);

	// init GUI. For more information on the methods, check:
	//  http://workshop.chromeexperiments.com/examples/gui

	this.gui = new dat.GUI();

	// add a button:
	// the first parameter is the object that is being controlled (in this case the scene)
	// the identifier 'doSomething' must be a function declared as part of that object (i.e. a member of the scene class)
	// e.g. LightingScene.prototype.doSomething = function () { console.log("Doing something..."); }; 

	//this.gui.add(this.scene, 'doSomething');	
	this.omniGroup = this.gui.addFolder("Omni Lights");
	this.spotGroup = this.gui.addFolder("Spot Lights");
	this.matchInfoGroup = this.gui.addFolder("Match Info");
	this.gameInfoGroup = this.gui.addFolder("Game Info");

	// add a group of controls (and open/expand by defult)
	this.matchInfoGroup.open();
	this.gameInfoGroup.open();

	// add two check boxes to the group. The identifiers must be members variables of the scene initialized in scene.init as boolean
	// e.g. this.option1=true; this.option2=false;

	// add a slider
	// must be a numeric variable of the scene, initialized in scene.init e.g.
	// this.speed=3;
	// min and max values can be specified as parameters

	return true;
};

MyInterface.prototype.processKeyDown = function (event) {
	// call CGFinterface default code (omit if you want to override)
	CGFinterface.prototype.processKeyDown.call(this, event);

	switch (event.keyCode) {
		case 86:
		case 118:
			console.log("'V' was pressed --> Changed active camera...");
			this.scene.changeCamera();
			break;
		case 90:
		case 122:
			console.log("'Z' was pressed --> Back to free camera...");
			this.scene.resetCamera();
			break;
		case 82:
		case 114:
			console.log("'R' was pressed --> Undo last move...");
			this.scene.game.undo();
			break;
		case 77:
		case 109:
			console.log("'M' was pressed --> Changing materials...");
			this.scene.changeMaterials();
			break;
		case 70:
		case 102:
			console.log("'F' was pressed --> Showing film...");
			if (this.scene.mainMenu && this.scene.mainMenu.onMainMenu) {
				if (this.scene.moveStack) {
					this.scene.game = new Game(this.scene, this.mode-4, this.difficulty-1);~
					this.scene.game.startGame(1, 1);
					this.scene.game.showMovie(this.scene.moveStack);
				}
			}
			break;
		//T/t
		case 84:
		case 116:
			this.scene.game.setBuilding(0);
			break;
		//C/c
		case 67:
		case 99:
			this.scene.game.setBuilding(1);
			break;
		//Esc
		case 27:
			this.scene.game.resetCurrentMove();
			break;
		//G/g
		case 71:
		case 103:
			console.info("********** Starting a new match! **********");
			this.scene.matchUndergoing = false;
			this.scene.game = undefined;
			if(!this.alreadyAdded)
				this.scene.startNewMatch();
			break; 
		default: break;
	};
};

MyInterface.prototype.addOmniLight = function (lightNum, lightName) {
	this.omniGroup.add(this.scene.lightStatus, lightNum).name(lightName);
};

MyInterface.prototype.addSpotLight = function (lightNum, lightName) {
	this.spotGroup.add(this.scene.lightStatus, lightNum).name(lightName);
};

MyInterface.prototype.addMatchInfo = function () {
	this.alreadyAdded = true;
	this.matchInfoGroup.add(this.scene.game.matchInfo, 0).name('Game Mode').listen();
	this.matchInfoGroup.add(this.scene.game.matchInfo, 1).name('Difficulty').listen();
	this.matchInfoGroup.add(this.scene.game, 'Level', { Space: 0, City: 1} );
};

MyInterface.prototype.setGameMode = function (gameMode) {
	this.scene.game.matchInfo[0] = gameMode;

	for (var i in this.gui.__controllers) {
		this.gui.__controllers[i].updateDisplay();
	}
};

MyInterface.prototype.setGameDifficulty = function (difficulty) {
	this.scene.game.matchInfo[1] = difficulty;

	for (var i in this.gui.__controllers) {
		this.gui.__controllers[i].updateDisplay();
	}
};

MyInterface.prototype.updateControllers = function () {
	for (var i in this.gui.__controllers) {
		this.gui.__controllers[i].updateDisplay();
	}
}

MyInterface.prototype.addGameInfo = function () {
	this.gameInfoGroup.add(this.scene.game.gameInfo, 0).name('Turn Time').listen();
	this.gameInfoGroup.add(this.scene.game.gameInfo, 1).name('Player 1 Score').listen();
	this.gameInfoGroup.add(this.scene.game.gameInfo, 2).name('Player 2 Score').listen();
	this.gameInfoGroup.add(this.scene.game.gameInfo, 3).name('Player 1 Win Rounds').listen();
	this.gameInfoGroup.add(this.scene.game.gameInfo, 4).name('Player 2 Win Rounds').listen();
};

MyInterface.prototype.setPlayer1Score = function(score) {
	this.scene.game.gameInfo[1] = score;

	for (var i in this.gui.__controllers) {
		this.gui.__controllers[i].updateDisplay();
	}
};

MyInterface.prototype.setPlayer2Score = function(score) {
	this.scene.game.gameInfo[2] = score;

	for (var i in this.gui.__controllers) {
		this.gui.__controllers[i].updateDisplay();
	}
};

MyInterface.prototype.setPlayer1WinRounds = function(winRounds) {
	this.scene.game.gameInfo[3] = winRounds;

	for (var i in this.gui.__controllers) {
		this.gui.__controllers[i].updateDisplay();
	}
};

MyInterface.prototype.setPlayer2WinRounds = function(winRounds) {
	this.scene.game.gameInfo[4] = winRounds;

	for (var i in this.gui.__controllers) {
		this.gui.__controllers[i].updateDisplay();
	}
};