var cameraIndex = 0;
var freeCam;

function XMLscene(interface) {
    CGFscene.call(this);
    this.interface = interface;
}

XMLscene.prototype = Object.create(CGFscene.prototype);
XMLscene.prototype.constructor = XMLscene;

XMLscene.prototype.init = function(application) {
    CGFscene.prototype.init.call(this, application);

    this.initCameras();

    this.numLight = 0;
    this.lightStatus = [];

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

XMLscene.prototype.initLights = function() {
    this.lights[0].setPosition(2, 3, 3, 1);
    this.lights[0].setDiffuse(1.0, 1.0, 1.0, 1.0);
    this.lights[0].update();

    this.lightStatus = [];
};

XMLscene.prototype.initCameras = function() {
    freeCam = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
    this.camera = freeCam;
};

XMLscene.prototype.setDefaultAppearance = function() {
    this.setAmbient(0.2, 0.4, 0.8, 1.0);
    this.setDiffuse(0.2, 0.4, 0.8, 1.0);
    this.setSpecular(0.2, 0.4, 0.8, 1.0);
    this.setShininess(10.0);
};

// Handler called when the graph is finally loaded. 
// As loading is asynchronous, this may be called already after the application has started the run loop
XMLscene.prototype.onGraphLoaded = function() {
    this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

    this.axis = this.graph.axis;

    //this.camera = this.graph.perspCams[cameraIndex];

    this.setLightsFromXML();
};

XMLscene.prototype.display = function() {
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

    // it is important that things depending on the proper loading of the graph
    // only get executed after the graph has loaded correctly.
    // This is one possible way to do it
    if (this.graph.loadedOk) {
        this.updateLightsStatus();

        //Starts going through the graph
        this.runGraph(this.graph.rootNode);
    };
};

XMLscene.prototype.runGraph = function(node) {
    this.pushMatrix();

    //Apply material
    node.materials[node.indexActiveMaterial].apply();

    //Apply transformation matrix
    this.multMatrix(node.mat);

    //Draws primitive (if it has one)
    if (node.primitive != null)
        node.primitive.display();

    //Uses pesquisa em profundidade
    for (var i = 0; i < node.children.length; i++)
        this.runGraph(node.children[i]);

    this.popMatrix();
};

XMLscene.prototype.changeCamera = function() {
    console.log(this.graph.perspCams.length);
    if (cameraIndex >= this.graph.perspCams.length - 1)
        cameraIndex = 0;
    else
        cameraIndex++;

    this.camera = this.graph.perspCams[cameraIndex];
    x = 1;
};

XMLscene.prototype.resetCamera = function() {
    this.camera = freeCam;
};

XMLscene.prototype.changeMaterials = function() {
    this.graph.changeNodesMaterialIndex(this.graph.rootNode);
};

XMLscene.prototype.setLightsFromXML = function() {
    this.setGlobalAmbientLight(this.graph.ambientLight[0], this.graph.ambientLight[1], this.graph.ambientLight[2], this.graph.ambientLight[3]);

    var currentLight;

    for (var i = 0; i < this.graph.omniLights.length && this.numLight < 8; i++, this.numLight++) {
        currentLight = this.graph.omniLights[i];

        this.lights[this.numLight].setPosition(currentLight.position[0], currentLight.position[1], currentLight.position[2], currentLight.homogeneous);
        this.lights[this.numLight].setAmbient(currentLight.ambient[0], currentLight.ambient[1], currentLight.ambient[2], currentLight.ambient[3]);
        this.lights[this.numLight].setDiffuse(currentLight.diffuse[0], currentLight.diffuse[1], currentLight.diffuse[2], currentLight.diffuse[3]);
        this.lights[this.numLight].setSpecular(currentLight.specular[0], currentLight.specular[1], currentLight.specular[2], currentLight.specular[3]);

        if (currentLight.enabled) {
            this.lights[this.numLight].enable();
            this.lightStatus[this.numLight] = true;
        } else {
            this.lights[this.numLight].disable();
            this.lightStatus[this.numLight] = false;
        }

        this.interface.addLight(this.numLight, currentLight.id);
    }

    for (var i = 0; i < this.graph.spotLights.length && this.numLight < 8; i++, this.numLight++) {
        currentLight = this.graph.spotLights[i];

        this.lights[this.numLight].setPosition(currentLight.position[0], currentLight.position[1], currentLight.position[2], currentLight.homogeneous);
        this.lights[this.numLight].setAmbient(currentLight.ambient[0], currentLight.ambient[1], currentLight.ambient[2], currentLight.ambient[3]);
        this.lights[this.numLight].setDiffuse(currentLight.diffuse[0], currentLight.diffuse[1], currentLight.diffuse[2], currentLight.diffuse[3]);
        this.lights[this.numLight].setSpecular(currentLight.specular[0], currentLight.specular[1], currentLight.specular[2], currentLight.specular[3]);

        this.lights[this.numLight].setSpotExponent(currentLight.exponent);
        this.lights[this.numLight].setSpotCutOff(currentLight.cutOff);
        this.lights[this.numLight].setSpotDirection(currentLight.direction[0], currentLight.direction[1], currentLight.direction[2]);

        if (currentLight.enabled) {
            this.lights[this.numLight].enable();
            this.lightStatus[this.numLight] = true;
        } else {
            this.lights[this.numLight].disable();
            this.lightStatus[this.numLight] = false;
        }

        this.interface.addLight(this.numLight, currentLight.id);
    }
};

XMLscene.prototype.updateLightsStatus = function() {
    for (var i = 0; i < this.numLight; i++) {
        if (this.lightStatus[i])
            this.lights[i].enable();
        else
            this.lights[i].disable();

        this.lights[i].update();
    }
};