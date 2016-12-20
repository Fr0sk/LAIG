/**
 * MyInterface
 * @constructor
 */


function MyInterface() {
	//call CGFinterface constructor 
	CGFinterface.call(this);
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

	// add a group of controls (and open/expand by defult)

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
		case 82:
		case 114:
			console.log("'R' was pressed --> Back to free camera...");
			//this.scene.resetCamera();
			this.scene.game.undo();
			break;
		case 77:
		case 109:
			console.log("'M' was pressed --> Changing materials...");
			this.scene.changeMaterials();
			break;
		default: break;
	};
};

MyInterface.prototype.addOmniLight = function(lightNum, lightName) {
	this.omniGroup.add(this.scene.lightStatus, lightNum).name(lightName);
};

MyInterface.prototype.addSpotLight = function(lightNum, lightName) {
	this.spotGroup.add(this.scene.lightStatus, lightNum).name(lightName);
};