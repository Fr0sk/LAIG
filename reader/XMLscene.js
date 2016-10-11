
var degToRad = Math.PI / 180.0;

function XMLscene() {
    CGFscene.call(this);
}

XMLscene.prototype = Object.create(CGFscene.prototype);
XMLscene.prototype.constructor = XMLscene;

XMLscene.prototype.init = function (application) {
    CGFscene.prototype.init.call(this, application);

    this.initCameras();

    this.initLights();

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
	this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

	this.axis = new CGFaxis(this);

	//We need to enable textures
	this.enableTextures(true);
};

XMLscene.prototype.initLights = function () {

	this.lights[0].setPosition(2, 3, 3, 1);
    this.lights[0].setDiffuse(1.0, 1.0, 1.0, 1.0);
    this.lights[0].update();
};

XMLscene.prototype.initCameras = function () {
    this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
};

XMLscene.prototype.setDefaultAppearance = function () {
    this.setAmbient(0.2, 0.4, 0.8, 1.0);
    this.setDiffuse(0.2, 0.4, 0.8, 1.0);
    this.setSpecular(0.2, 0.4, 0.8, 1.0);
    this.setShininess(10.0);
};

// Handler called when the graph is finally loaded. 
// As loading is asynchronous, this may be called already after the application has started the run loop
XMLscene.prototype.onGraphLoaded = function () {
	this.setGlobalAmbientLight(this.graph.ambientLight[0], this.graph.ambientLight[1], this.graph.ambientLight[2], this.graph.ambientLight[3]);
	this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

	this.axis = this.graph.axis;

	//this.camera = this.graph.perspCams[0];

	this.lights[0].setVisible(true);
    this.lights[0].enable();

	// TODO: Lights not working when adding to scene (Probably scene limit)
	//this.lights[0].disable();
	for (var i = 0; i < this.graph.omniLights.length; i++)
		this.lights[i + 1] = this.graph.omniLights[i];
	for (var i = 0; i < this.graph.spotLights.length; i++)
		this.lights[this.graph.omniLights.length + i + 1] = this.graph.spotLights[i];
	this.lights[1] = this.graph.omniLights[0];
};

XMLscene.prototype.display = function () {
	// ---- BEGIN Background, camera and axis setup

	// Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

	// Initialize Model-View matrix as identity (no transformation
	this.updateProjectionMatrix();
    this.loadIdentity();

	// Apply transformations corresponding to the camera position relative to the origin
	this.applyViewMatrix();

	// Draw axis
	this.axis.display();

	this.setDefaultAppearance();

	// ---- END Background, camera and axis setup

	/*for (var i = 0; i < this.graph.components.length; i++) {
		//If this component hasn't already been visited
		if (!this.graph.components[i].visited) {
			console.log("Ciclo main numero: " + i);
			this.runGraph(this.graph.components[i]);
		}
	}*/

	//console.log("Numero de primitivas desenhadas: " + this.numDrawn);

	// it is important that things depending on the proper loading of the graph
	// only get executed after the graph has loaded correctly.
	// This is one possible way to do it
	if (this.graph.loadedOk) {
		this.lights[0].update();

		for (var i = 0; i < this.graph.components.length; i++)
			this.graph.components[i].visited = false;

		//Starts going through the graph
		this.runGraph(this.graph.components[0]);
	};
};

XMLscene.prototype.runGraph = function (component) {
	component.visited = true;

	this.pushMatrix();

	//Apply material
	//component.materials[0].apply();

	//Apply texture (if it doesn't have one, applies a null texture)
	component.texture.apply();

	//console.log("Component id: '" + component.id + "' usou o material com id: '" + component.materials[0].id + "' e que tem emission = " + component.materials[0].emission);

	//Do all the transformations
	for (var i = 0; i < component.transformations.length; i++) {
		if (component.transformations[i].type == "translate")
			this.translate(component.transformations[i].x, component.transformations[i].y, component.transformations[i].z);
		else if (component.transformations[i].type == "rotate") {
			switch (component.transformations[i].axis) {
				case 'x': this.rotate(component.transformations[i].angle * degToRad, 1, 0, 0); break;
				case 'y': this.rotate(component.transformations[i].angle * degToRad, 0, 1, 0); break;
				case 'z': this.rotate(component.transformations[i].angle * degToRad, 0, 0, 1); break;
				default: break;
			}
		}
		else if (component.transformations[i].type == "scale")
			this.scale(component.transformations[i].x, component.transformations[i].y, component.transformations[i].z);
	}

	//Draws the primitives
	for (var i = 0; i < component.primitives.length; i++)
		component.primitives[i].display();

	//Uses pesquisa em profundidade
	for (var i = 0; i < component.innerComponents.length; i++)
		this.runGraph(component.innerComponents[i]);

	this.popMatrix();
};