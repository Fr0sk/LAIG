var freeCam;

function XMLscene(interface) {
    CGFscene.call(this);
    this.interface = interface;
}

XMLscene.prototype = Object.create(CGFscene.prototype);
XMLscene.prototype.constructor = XMLscene;

XMLscene.prototype.init = function (application) {
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
    this.enableTextures(true);

    this.plane = new Plane(this, "1", 1, 1, 5, 5);

    this.appearance = new CGFappearance(this);
    this.appearance.setAmbient(0.3, 0.3, 0.3, 1);
    this.appearance.setDiffuse(0.7, 0.7, 0.7, 1);
    this.appearance.setSpecular(0.0, 0.0, 0.0, 1);
    this.appearance.setShininess(120);
    this.texture = new CGFtexture(this, "resources/building.jpg");
    this.appearance.setTexture(this.texture);
    this.appearance.setTextureWrap('REPEAT', 'REPEAT');

    this.testShaders = [
        new CGFshader(this.gl, "shaders/flat.vert", "shaders/flat.frag")
    ];

    this.testShaders[0].setUniformsValues({ normScale: 0.2 });
    this.testShaders[0].setUniformsValues({ uSampler: 1});
};

XMLscene.prototype.initLights = function () {
    this.lights[0].setPosition(2, 3, 3, 1);
    this.lights[0].setDiffuse(1.0, 1.0, 1.0, 1.0);
    this.lights[0].update();
};

XMLscene.prototype.initCameras = function () {
    freeCam = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
    this.camera = freeCam;
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
    // Sets the background color
    this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

    // Updates lights
    this.setLightsFromXML();

    // Draws axis
    this.axis = this.graph.axis;

    // Inits camera
    this.camera = this.graph.perspCams[this.graph.cameraIndex];

    // Enables animations
    this.setUpdatePeriod(10);

    console.info("If you have more than 1 texture per component, all but the first one will be ignored.");
    console.info("Tap 'R' to select free camera movement.");
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

    /* this.pushMatrix();
     this.setActiveShader(this.testShaders[0]);
     this.appearance.apply();
     this.plane.display();
     this.setActiveShader(this.defaultShader);
     this.popMatrix();*/

    // it is important that things depending on the proper loading of the graph
    // only get executed after the graph has loaded correctly.
    // This is one possible way to do it
    if (this.graph.loadedOk) {
        this.updateLightsStatus();

        //Starts going through the graph
        this.runGraph(this.graph.rootNode);
    };
};

/**
 * Goes through the graph to display the full scene
 */
XMLscene.prototype.runGraph = function (node) {
    this.pushMatrix();

    //Apply material
    node.materials[node.indexActiveMaterial].apply();

    //Apply transformation matrix
    this.multMatrix(node.mat);

    //Draws primitive (if it has one)
    if (node.primitive != null) {
        if (node.activeShader != null) {
            this.setActiveShader(this.testShaders[node.activeShader]);
            node.texture.bind(1);
        }

        node.primitive.display();

        if (node.activeShader != null)
            this.setActiveShader(this.defaultShader);
    }

    //Uses pesquisa em profundidade
    for (var i = 0; i < node.children.length; i++)
        this.runGraph(node.children[i]);

    this.popMatrix();
};

/**
 * Changes the current camera
 */
XMLscene.prototype.changeCamera = function () {
    if (this.graph.cameraIndex >= this.graph.perspCams.length - 1)
        this.graph.cameraIndex = 0;
    else
        this.graph.cameraIndex++;

    this.camera = this.graph.perspCams[this.graph.cameraIndex];
};

/**
 * Selects the free camera (which has free movement)
 */
XMLscene.prototype.resetCamera = function () {
    this.camera = freeCam;
};

/**
 * Changes the current materials for all components
 */
XMLscene.prototype.changeMaterials = function () {
    this.graph.changeNodesMaterialIndex(this.graph.rootNode);
};

/**
 * References the xml lights to the scene lights, and add them to the interface
 */
XMLscene.prototype.setLightsFromXML = function () {
    this.setGlobalAmbientLight(this.graph.ambientLight[0], this.graph.ambientLight[1], this.graph.ambientLight[2], this.graph.ambientLight[3]);

    var currentLight;

    for (var i = 0; i < this.graph.omniLights.length && this.numLight < 8; i++ , this.numLight++) {
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

        this.interface.addOmniLight(this.numLight, currentLight.id);
    }

    for (var i = 0; i < this.graph.spotLights.length && this.numLight < 8; i++ , this.numLight++) {
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

        this.interface.addSpotLight(this.numLight, currentLight.id);
    }
};

/**
 * Updates light's status each frame
 */
XMLscene.prototype.updateLightsStatus = function () {
    for (var i = 0; i < this.numLight; i++) {
        if (this.lightStatus[i])
            this.lights[i].enable();
        else
            this.lights[i].disable();

        this.lights[i].update();
    }
};

/*
 * Update function
 */
var lastCurTime = -1;
XMLscene.prototype.update = function (curTime) {
    var deltaTime;
    if (lastCurTime < 0) {
        lastCurTime = curTime;
        return;
    } else {
        deltaTime = (curTime - lastCurTime) / 1000;
        lastCurTime = curTime;
    }

    if (this.graph.loadedOk) {
        for (var i = 0; i < this.graph.animatedNodes.length; i++) {
            var node = this.graph.animatedNodes[i];
            if (node.activeAnimation >= node.animations.length)
                continue;
            else
                node.animations[node.activeAnimation].animate(deltaTime);
        }
    }

}