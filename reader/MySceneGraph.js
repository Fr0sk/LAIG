
function MySceneGraph(filename, scene) {
	this.loadedOk = null;

	// Establish bidirectional references between scene and graph
	this.scene = scene;
	scene.graph = this;

	// File reading 
	this.reader = new CGFXMLreader();

	/*
	 * Read the contents of the xml file, and refer to this class for loading and error handlers.
	 * After the file is read, the reader calls onXMLReady on this object.
	 * If any error occurs, the reader calls onXMLError on this object, with an error message
	 */

	this.reader.open('scenes/' + "ourSceneDemo.xml", this);
}

/*
 * Callback to be executed after successful reading
 */
MySceneGraph.prototype.onXMLReady = function () {
	console.log("XML Loading finished.");
	var rootElement = this.reader.xmlDoc.documentElement;

	// Here should go the calls for different functions to parse the various blocks
	var error = this.parseData(rootElement); //this.parseGlobalsExample(rootElement);

	if (error != null) {
		this.onXMLError(error);
		return;
	}

	this.loadedOk = true;

	// As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
	this.scene.onGraphLoaded();
};

/*
 * Parse the data to the scene
 */
MySceneGraph.prototype.parseData = function (rootElement) {
	/*
	 * The variables before each method are the variables
	 * that method populates in his body
	 */

	this.axis;
	this.parseScene(rootElement);

	this.perspCams = [];
	this.orthoCams = [];
	this.parseViews(rootElement);

	this.ambientLight;
	this.background;
	this.parseIllumination(rootElement);

	this.omniLights = [];
	this.spotLights = [];
	this.parseLights(rootElement);

	this.textures = [];
	this.parseTextures(rootElement);

	this.materials = [];
	this.parseMaterials(rootElement);

	this.translates = [];
	this.rotates = [];
	this.scales = [];
	this.parseTransformations(rootElement);

	this.primitives = [];
	this.parsePrimitives(rootElement);

	this.components = [];
	this.parserComponents(rootElement);
	this.getInnerComponents();

	this.myDebug();
};

/**
 * Debug purposes
 */
MySceneGraph.prototype.myDebug = function () {
	//console.log("Numero de components = " + this.components[0].componentsRef.length);
}

/**
 * Puts the actual components in the respective variable using their reference
 */
MySceneGraph.prototype.getInnerComponents = function () {
	for (var i = 0; i < this.components.length; i++)
		for (var j = 0; j < this.components[i].componentsRef.length; j++)
			for (var k = 0; k < this.components.length; k++)
				if (this.components[i].componentsRef[j] == this.components[k].id) {
					this.components[i].innerComponents.push(this.components[k]);
					break;
				}
}

/*
 * Scene
 */
MySceneGraph.prototype.parseScene = function (rootElement) {
	var scene = rootElement.getElementsByTagName('scene')[0];
	var s_axisLength = this.reader.getFloat(scene, 'axis_length', true)
	this.axis = new CGFaxis(this.scene, s_axisLength, 0.2);

	//console.log("Scene axis_length =" + s_axisLength);
};

/*
 * Views
 */
MySceneGraph.prototype.parseViews = function (rootElement) {
	var views = rootElement.getElementsByTagName('views')[0];

	// Perspective cameras
	{
		var perspCams = views.getElementsByTagName('perpective');
		for (var i = 0; i < perspCams.length; i++) {
			var id = this.reader.getString(perspCams[i], 'id', true);
			var near = this.reader.getFloat(perspCams[i], 'near', true);
			var far = this.reader.getFloat(perspCams[i], 'far', true);
			var fov = this.reader.getFloat(perspCams[i], 'angle', true);
			var fromElem = perspCams[i].getElementsByTagName('from')[0];
			var toElem = perspCams[i].getElementsByTagName('to')[0];
			var position = this.getXYZ(fromElem, true);
			var target = this.getXYZ(toElem, true);
			var cam = new CGFcamera(fov, near, far, position, target);
			cam.id = id;
			this.perspCams.push(cam);

			//console.log("ID = " + id + " ,view = " + near + ", far = " + far);
		}
	}
};

/*
 * Illumination
 */
MySceneGraph.prototype.parseIllumination = function (rootElement) {
	var illumination = rootElement.getElementsByTagName("illumination")[0];
	var ambient = illumination.getElementsByTagName('ambient')[0];
	var background = illumination.getElementsByTagName('background')[0];
	this.ambientLight = this.getRGBA(ambient, true);
	this.background = this.getRGBA(background, true);

	//console.log("Illumination ambient = " + this.ambientLight + ", background = " + this.background);
};

/*
 * Lights
 */
MySceneGraph.prototype.parseLights = function (rootElement) {
	var lights = rootElement.getElementsByTagName('lights')[0];

	// OmniLights
	{
		var omniLights = lights.getElementsByTagName('omni');
		for (var i = 0; i < omniLights.length; i++) {
			var light = omniLights[i];
			var id = this.reader.getString(light, 'id', true);
			var enabled = this.reader.getBoolean(light, 'enabled', true);
			var locationElem = light.getElementsByTagName('location')[0];
			var ambientElem = light.getElementsByTagName('ambient')[0];
			var diffuseElem = light.getElementsByTagName('diffuse')[0];
			var specularElem = light.getElementsByTagName('specular')[0];

			var location = this.getXYZ(locationElem, true);
			var ambient = this.getRGBA(ambientElem, true);
			var diffuse = this.getRGBA(diffuseElem, true);
			var specular = this.getRGBA(specularElem, true);
			var homogeneous = this.reader.getFloat(locationElem, 'w', true);

			var light = new CGFlight(this.scene, id);
			light.setPosition(location[0], location[1], location[2], homogeneous);
			light.setAmbient(ambient[0], ambient[1], ambient[2], ambient[3]);
			light.setDiffuse(diffuse[0], diffuse[1], diffuse[2], diffuse[3]);
			light.setSpecular(specular[0], specular[1], specular[2], specular[3]);
			enabled ? light.enable() : light.disable();

			this.omniLights.push(light);

			//console.log("Omni light id = " + id);
		}
	}

	// SpotLights
	{
		var spotLights = lights.getElementsByTagName('spot');
		for (var i = 0; i < spotLights.length; i++) {
			var light = spotLights[i];
			var id = this.reader.getString(light, 'id', true);
			var enabled = this.reader.getBoolean(light, 'enabled', true);
			var angle = this.reader.getFloat(light, 'angle', true);
			var exponent = this.reader.getFloat(light, 'exponent', true);
			var targetElem = light.getElementsByTagName('target')[0];
			var locationElem = light.getElementsByTagName('location')[0];
			var ambientElem = light.getElementsByTagName('ambient')[0];
			var diffuseElem = light.getElementsByTagName('diffuse')[0];
			var specularElem = light.getElementsByTagName('specular')[0];

			var location = this.getXYZ(locationElem, true);
			var ambient = this.getRGBA(ambientElem, true);
			var diffuse = this.getRGBA(diffuseElem, true);
			var specular = this.getRGBA(specularElem, true);

			var light = new CGFlight(this.scene, id);
			light.setSpotExponent(exponent);
			light.setSpotCutOff(angle);
			light.setPosition(location[0], location[1], location[2], 1);
			light.setAmbient(ambient[0], ambient[1], ambient[2], ambient[3]);
			light.setDiffuse(diffuse[0], diffuse[1], diffuse[2], diffuse[3]);
			light.setSpecular(specular[0], specular[1], specular[2], specular[3]);
			enabled ? light.enable() : light.disable();

			this.spotLights.push(light);

			//console.log("Omni light id = " + id);
		}
	}
};

/**
 * Textures
 */
MySceneGraph.prototype.parseTextures = function (rootElement) {
	var texturesElem = rootElement.getElementsByTagName('textures')[0];
	var textures = texturesElem.getElementsByTagName('texture');

	for (var i = 0; i < textures.length; i++) {
		var id = this.reader.getString(textures[i], 'id', true);
		var file = this.reader.getString(textures[i], 'file', true);
		var length_s = this.reader.getFloat(textures[i], 'length_s', true);
		var length_t = this.reader.getFloat(textures[i], 'length_t', true);

		//console.log("Texture num " + (i + 1) + ": id = " + id + ", file = " + file + ", length_s = " + length_s + ", length_t = " + length_t);

		var texture = new CGFappearance(this.scene);
		texture.loadTexture(file);
		texture.id = id;
		texture.length_s = length_s;
		texture.length_t = length_t;
		this.textures.push(texture);
	}
};

/**
 * Materials
 */
MySceneGraph.prototype.parseMaterials = function (rootElement) {
	var materialsElem = rootElement.getElementsByTagName('materials')[0];
	var materials = materialsElem.getElementsByTagName('material');

	for (var i = 0; i < materials.length; i++) {
		var id = this.reader.getString(materials[i], 'id', true);
		var emissionElem = materials[i].getElementsByTagName('emission')[0];
		var ambientElem = materials[i].getElementsByTagName('ambient')[0];
		var diffuseElem = materials[i].getElementsByTagName('diffuse')[0];
		var specularElem = materials[i].getElementsByTagName('specular')[0];
		var shininessElem = materials[i].getElementsByTagName('shininess')[0];

		var emission = this.getRGBA(emissionElem, true);
		var ambient = this.getRGBA(ambientElem, true);
		var diffuse = this.getRGBA(diffuseElem, true);
		var specular = this.getRGBA(specularElem, true);
		var shininess = this.reader.getFloat(shininessElem, 'value', true);

		var material = new CGFappearance(this.scene);
		material.id = id;
		material.setEmission(emission);
		material.setAmbient(ambient);
		material.setDiffuse(diffuse);
		material.setSpecular(specular);
		material.setShininess(shininess);

		this.materials.push(material);

		//console.log("Material " + id + ": emission = " + emission + ", ambient = " + ambient + ", diffuse = " + diffuse + ", shininess = " + shininess + "\n");	
	}
};

/**
 * Transformations
 */
MySceneGraph.prototype.parseTransformations = function (rootElement) {
	var transformationsElem = rootElement.getElementsByTagName('transformations')[0];
	var transformations = transformationsElem.getElementsByTagName('transformation');

	for (var i = 0; i < transformations.length; i++) {
		var ID = this.reader.getString(transformations[i], 'id', true);

		var translateElem = transformations[i].getElementsByTagName('translate')[0];
		if (translateElem != null) {
			var translateToSend = {};
			translateToSend.id = ID;
			translateToSend.x = this.reader.getFloat(translateElem, 'x', true);
			translateToSend.y = this.reader.getFloat(translateElem, 'y', true);
			translateToSend.z = this.reader.getFloat(translateElem, 'z', true);
			this.translates.push(translateToSend);
		}

		var rotateElem = transformations[i].getElementsByTagName('rotate')[0];
		if (rotateElem != null) {
			var rotationToSend = {};
			rotationToSend.id = ID;
			rotationToSend.axis = this.reader.getString(rotateElem, 'axis', true);
			rotationToSend.angle = this.reader.getFloat(rotateElem, 'angle', true);
			this.rotates.push(rotationToSend);
		}

		var scaleElem = transformations[i].getElementsByTagName('scale')[0];
		if (scaleElem != null) {
			var scaleToSend = {};
			scaleToSend.id = ID;
			scaleToSend.x = this.reader.getFloat(scaleElem, 'x', true);
			scaleToSend.y = this.reader.getFloat(scaleElem, 'y', true);
			scaleToSend.z = this.reader.getFloat(scaleElem, 'z', true);
			this.scales.push(scaleToSend);
		}
	}
};

/**
 * Primitives
 */
MySceneGraph.prototype.parsePrimitives = function (rootElement) {
	var primitivesElem = rootElement.getElementsByTagName('primitives')[0];
	var primitives = primitivesElem.getElementsByTagName('primitive');

	for (var i = 0; i < primitives.length; i++) {
		var id = this.reader.getString(primitives[i], 'id', true);

		var typeElem = null;
		if ((typeElem = primitives[i].getElementsByTagName('rectangle')[0]) != null) {
			var x1 = this.reader.getFloat(typeElem, 'x1', true);
			var y1 = this.reader.getFloat(typeElem, 'y1', true);
			var x2 = this.reader.getFloat(typeElem, 'x2', true);
			var y2 = this.reader.getFloat(typeElem, 'y2', true);
			var rectangle = PrimitiveBuilder.buildRect(this.scene, x1, y1, x2, y2);
			rectangle.id = id;
			this.primitives.push(rectangle)
			//console.log("Primitive num " + (i + 1) + ": id = " + id + ", x1 = " + x1 + ", y1 = " + y1 +
			//", x2 = " + x2 + ", y2 = " + y2);
		} else if ((typeElem = primitives[i].getElementsByTagName('triangle')[0]) != null) {
			var x1 = this.reader.getFloat(typeElem, 'x1', true);
			var y1 = this.reader.getFloat(typeElem, 'y1', true);
			var z1 = this.reader.getFloat(typeElem, 'z1', true);
			var x2 = this.reader.getFloat(typeElem, 'x2', true);
			var y2 = this.reader.getFloat(typeElem, 'y2', true);
			var z2 = this.reader.getFloat(typeElem, 'z2', true);
			var x3 = this.reader.getFloat(typeElem, 'x3', true);
			var y3 = this.reader.getFloat(typeElem, 'y3', true);
			var z3 = this.reader.getFloat(typeElem, 'z3', true);
			var triangle = PrimitiveBuilder.buildTri(this.scene, x1, y1, z1, x2, y2, z2, x3, y3, z3);
			triangle.id = id;
			this.primitives.push(triangle);
			//console.log("Primitive num " + (i + 1) + ": id = " + id + ", x1 = " + x1 + 
			//", y1 = " + y1 + ", z1 = " + z1 + ", x2 = " + x2 + ", y2 = " + y2 + 
			//", z2 = " + z2 + ", x3 = " + x3 + ", y3 = " + y3 + ", z3 = " + z3);
		} else if ((typeElem = primitives[i].getElementsByTagName('cylinder')[0]) != null) {
			var base = this.reader.getFloat(typeElem, 'base', true);
			var top = this.reader.getFloat(typeElem, 'top', true);
			var height = this.reader.getFloat(typeElem, 'height', true);
			var slices = this.reader.getFloat(typeElem, 'slices', true);
			var stacks = this.reader.getFloat(typeElem, 'stacks', true);
			var cylinder = PrimitiveBuilder.buildCylinder(this.scene, base, top, height, slices, stacks);
			cylinder.id = id;
			this.primitives.push(cylinder);
			//console.log("Primitive num " + (i + 1) + ": id = " + id + ", base = " + base +
			//", top = " + top + ", height = " + height + ", slices = " + slices + ", stacks = " + stacks);
		} else if ((typeElem = primitives[i].getElementsByTagName('sphere')[0]) != null) {
			var radius = this.reader.getFloat(typeElem, 'radius', true);
			var slices = this.reader.getFloat(typeElem, 'slices', true);
			var stacks = this.reader.getFloat(typeElem, 'stacks', true);
			var sphere = PrimitiveBuilder.buildSphere(this.scene, radius, slices, stacks);
			sphere.id = id;
			this.primitives.push(sphere);
			//console.log("Primitive num " + (i + 1) + ": id = " + id + ", radius = " + radius +
			//", slices = " + slices + ", stacks = " + stacks);
		} else if ((typeElem = primitives[i].getElementsByTagName('torus')[0]) != null) {
			var inner = this.reader.getFloat(typeElem, 'inner', true);
			var outer = this.reader.getFloat(typeElem, 'outer', true);
			var slices = this.reader.getFloat(typeElem, 'slices', true);
			var loops = this.reader.getFloat(typeElem, 'loops', true);
			var torus = PrimitiveBuilder.buildTorus(this.scene, inner, outer, slices, loops);
			torus.id = id;
			this.primitives.push(torus);
			//console.log("Primitive num " + (i + 1) + ": id = " + id + ", inner = " + inner +
			//", outer = " + outer + ", slices = " + slices + ", loops = " + loops);
		}
	}
};

/**
 * Components
 */
MySceneGraph.prototype.parserComponents = function (rootElement) {
	var componentsElem = rootElement.getElementsByTagName('components')[0];
	var components = componentsElem.getElementsByTagName('component');

	for (var i = 0; i < components.length; i++) {
		//Component		
		var component = components[i];
		var componentID = this.reader.getString(component, 'id', true);
		//console.log("Component number " + (i + 1) + ", id = " + componentID);

		var componentToSend = {};
		componentToSend.id = componentID;
		componentToSend.transformationsRef = [];
		componentToSend.translates = [];
		componentToSend.rotates = [];
		componentToSend.scales = [];
		componentToSend.materials = [];
		componentToSend.texture;
		componentToSend.componentsRef = [];
		componentToSend.innerComponents = [];
		componentToSend.primitives = [];
		componentToSend.visited = false;

		//Transformations
		{
			var transformationElem = component.getElementsByTagName('transformation')[0];

			var transformationRef = transformationElem.getElementsByTagName('transformationref');
			for (var j = 0; j < transformationRef.length; j++) {
				var id = this.reader.getString(transformationRef[j], 'id', true);
				componentToSend.transformationsRef.push(id);
			}

			var translate = transformationElem.getElementsByTagName('translate');
			for (var j = 0; j < translate.length; j++) {
				var translateToSend = {};
				translateToSend.x = this.reader.getFloat(translate[j], 'x', true);
				translateToSend.y = this.reader.getFloat(translate[j], 'y', true);
				translateToSend.z = this.reader.getFloat(translate[j], 'z', true);
				componentToSend.translates.push(translateToSend);
			}

			var rotate = transformationElem.getElementsByTagName('rotate');
			for (var j = 0; j < rotate.length; j++) {
				var rotateToSend = {};
				rotateToSend.axis = this.reader.getString(rotate[j], 'axis', true);
				rotateToSend.angle = this.reader.getFloat(rotate[j], 'angle', true);
				componentToSend.rotates.push(rotateToSend);
			}

			var scale = transformationElem.getElementsByTagName('scale');
			for (var j = 0; j < scale.length; j++) {
				var scaleToSend = {};
				scaleToSend.x = this.reader.getFloat(scale[j], 'x', true);
				scaleToSend.y = this.reader.getFloat(scale[j], 'y', true);
				scaleToSend.z = this.reader.getFloat(scale[j], 'z', true);
				componentToSend.scales.push(scaleToSend);
			}
		}

		//Materials
		{
			var materialsElem = component.getElementsByTagName('materials')[0];
			var materials = materialsElem.getElementsByTagName('material');

			for (var j = 0; j < materials.length; j++) {
				var materialID = this.reader.getString(materials[j], 'id', true);

				//Add the material to the component
				for (var k = 0; k < this.materials.length; k++) {
					if (this.materials[k].id == materialID)
						componentToSend.materials.push(this.materials[k]);
				}

				//console.log("Material number " + (j + 1) + ", id = " + materialID);
			}
		}

		//Textures
		{
			var textureElem = component.getElementsByTagName('texture')[0];
			var textureID = this.reader.getString(textureElem, 'id', true);

			componentToSend.texture = null;
			for (var j = 0; j < this.textures.length; j++)
				if (this.textures[j].id == textureID)
					componentToSend.texture = this.textures[j];
		}

		//Children
		{
			var childrenElem = component.getElementsByTagName('children')[0];

			var componentsRef = childrenElem.getElementsByTagName('componentref');
			for (var j = 0; j < componentsRef.length; j++) {
				var componentID = this.reader.getString(componentsRef[j], 'id', true);
				componentToSend.componentsRef.push(componentID);
				//console.log("ComponentRef number " + (j + 1) + ", id = " + componentID);
			}

			var primitiveref = childrenElem.getElementsByTagName('primitiveref');
			for (var j = 0; j < primitiveref.length; j++) {
				var primitiveID = this.reader.getString(primitiveref[j], 'id', true);

				for (var k = 0; k < this.primitives.length; k++) {
					if (primitiveID == this.primitives[k].id) {
						componentToSend.primitives.push(this.primitives[k]);
						break;
					}
				}

				//console.log("PrimitiveRef number " + (j + 1) + ", id = " + primitiveID);
			}
		}

		this.components.push(componentToSend);
	}
};

/**
 * Callback to be executed on any read error
 */
MySceneGraph.prototype.onXMLError = function (message) {
	console.error("XML Loading Error: " + message);
	this.loadedOk = false;
};

/**
 * Util functions
 */
MySceneGraph.prototype.getRGBA = function (element, required) {
	var r = this.reader.getFloat(element, 'r', required);
	var g = this.reader.getFloat(element, 'g', required);
	var b = this.reader.getFloat(element, 'b', required);
	var a = this.reader.getFloat(element, 'a', required);
	return vec4.fromValues(r, g, b, a)
};

MySceneGraph.prototype.getXYZ = function (element, required) {
	var x = this.reader.getFloat(element, 'x', required);
	var y = this.reader.getFloat(element, 'y', required);
	var z = this.reader.getFloat(element, 'z', required);
	return vec3.fromValues(x, y, z);
};

MySceneGraph.prototype.getRectSize = function (element, required) {
	var x1 = this.reader.getFloat(element, 'x1', required);
	var y1 = this.reader.getFloat(element, 'y1', required);
	var x2 = this.reader.getFloat(element, 'x2', required);
	var y2 = this.reader.getFloat(element, 'y2', required);
	return vec4.fromValues(x1, y1, x2, y2);
};

MySceneGraph.prototype.getTriangleSize = function (element, required) {
	var x1 = this.reader.getFloat(element, 'x1', required);
	var y1 = this.reader.getFloat(element, 'y1', required);
	var z1 = this.reader.getFloat(element, 'z1', required);
	var x2 = this.reader.getFloat(element, 'x2', required);
	var y2 = this.reader.getFloat(element, 'y2', required);
	var z2 = this.reader.getFloat(element, 'z2', required);
};