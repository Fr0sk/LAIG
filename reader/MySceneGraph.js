
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
	if (!this.validateOrder(rootElement)) return;

	var error = this.parseData(rootElement);

	if (error != null) {
		this.onXMLError(error);
		return;
	}

	this.loadedOk = true;

	// As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
	this.scene.onGraphLoaded();
};

MySceneGraph.prototype.validateOrder = function (rootElement) {
	var nodes = rootElement.childNodes;
	var types = [];
	var names = ['scene', 'views', 'illumination', 'lights', 'textures',
		'materials', 'transformations', 'primitives', 'components'];

	for (var i = 0; i < nodes.length; i++) {
		if (nodes[i].nodeType == 1) {
			types.push(nodes[i]);
			console.info(nodes[i]);
		}
	}

	if (types.length < 9) {
		// Missing nodes, checking which ones are missing
		var missingNodes = [];
		for (var name = 0; name < names.length; name++) {
			var found = false;
			for (var type = 0; type < types.length; type++) {

				if (names[name] == types[type].nodeName) {
					found = true;
					break;
				}
			}
			if (!found) {
				missingNodes.push([names[name]]);
			}
		}
		var errorText = "XML is missing the following nodes:\n";
		for (var i = 0; i < missingNodes.length; i++)
			errorText += "\t" + missingNodes[i] + ";\n";
		this.onXMLError(errorText + "Aborting!");
		return false;
	} else if (types.length > 9)
		console.warn("Unexpected number of nodes, trying to parse anyway");


	for (var i = 0; i < names.length; i++) {
		if (names[i] != types[i].nodeName) {
			var found = false;
			for (var j = 0; j < types.length; j++) {
				if (names[i] == types[j].nodeName) {
					found = true;
					break;
				}
			}

			if (found) {
				console.warn(names[i] + " node found but in wrong place, trying to parse anyway");
			} else {
				this.onXMLError(names[i] + " node not found, aborting!");
				return false;
			}
		} else {
			console.debug(names[i] + " node found");
		}
	}

	return true;
}

/*
 * Parse the data to the scene
 */
MySceneGraph.prototype.parseData = function (rootElement) {
	/*
	 * The variables before each method are the variables
	 * that method populates in his body
	 */
	var err = null;

	this.axis;
	this.rootNodeId;
	err = this.parseScene(rootElement);
	if (err != null) return err;

	this.perspCams = [];
	err = this.parseViews(rootElement);
	if (err != null) return err;

	this.ambientLight;
	this.background;
	err = this.parseIllumination(rootElement);
	if (err != null) return err;

	this.omniLights = [];
	this.spotLights = [];
	err = this.parseLights(rootElement);
	if (err != null) return err;

	this.textures = [];
	err = this.parseTextures(rootElement);
	if (err != null) return err;

	this.materials = [];
	err = this.parseMaterials(rootElement);
	if (err != null) return err;

	this.transformations = [];
	err = this.parseTransformations(rootElement);
	if (err != null) return err;

	this.primitives = [];
	err = this.parsePrimitives(rootElement);
	if (err != null) return err;

	this.rootNode;
	err = this.parseNodes(rootElement);
	if (err != null) return err;

	this.myDebug();
};

/**
 * Debug purposes
 */
MySceneGraph.prototype.myDebug = function () {
	//console.log("Numero de components = " + this.components[0].componentsRef.length);
}

/**
 * 
 */
MySceneGraph.prototype.changeNodesMaterialIndex = function () {

}

/*
 * Scene
 */
MySceneGraph.prototype.parseScene = function (rootElement) {
	var scene = rootElement.getElementsByTagName('scene')[0];
	var axisLength = this.reader.getFloat(scene, 'axis_length', true);
	this.rootNodeId = this.reader.getString(scene, 'root', true);
	this.axis = new CGFaxis(this.scene, axisLength, 0.2);

	return null;

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

			var lightObj = {
				id: id,
				type: 'omni',
				enabled: enabled,
				position: location,
				ambient: ambient,
				diffuse: diffuse,
				specular: specular,
				homogeneous: homogeneous
			};

			this.omniLights.push(lightObj);
		}
	}

	// SpotLights
	{
		var spotLights = lights.getElementsByTagName('spot');
		for (var i = 0; i < spotLights.length; i++) {
			var light = spotLights[i];
			var id = this.reader.getString(light, 'id', true);
			var enabled = this.reader.getBoolean(light, 'enabled', true);
			var angle = this.reader.getFloat(light, 'angle', true) * Math.PI / 180;
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
			var target = this.getXYZ(targetElem, true);

			var direction = [target[0] - location[0],
			target[1] - location[1],
			target[2] - location[2]];

			var lightObj = {
				id: id,
				type: 'spot',
				enabled: enabled,
				position: location,
				ambient: ambient,
				diffuse: diffuse,
				specular: specular,
				homogeneous: 1,
				exponent: exponent,
				cutOff: angle,
				direction: direction
			};

			this.spotLights.push(lightObj);

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
		var file = "./scenes" + this.reader.getString(textures[i], 'file', true);
		var length_s = this.reader.getFloat(textures[i], 'length_s', true);
		var length_t = this.reader.getFloat(textures[i], 'length_t', true);

		//console.log("Texture num " + (i + 1) + ": id = " + id + ", file = " + file + ", length_s = " + length_s + ", length_t = " + length_t);

		var texture = new CGFtexture(this.scene, file);
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

		var material = {};
		material.id = id;
		material.emission = this.getColorFromRGBA(emissionElem, true);
		material.ambient = this.getColorFromRGBA(ambientElem, true);
		material.diffuse = this.getColorFromRGBA(diffuseElem, true);
		material.specular = this.getColorFromRGBA(specularElem, true);
		material.shininess = this.reader.getFloat(shininessElem, 'value', true);

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
			translateToSend.type = "translate";
			translateToSend.x = this.reader.getFloat(translateElem, 'x', true);
			translateToSend.y = this.reader.getFloat(translateElem, 'y', true);
			translateToSend.z = this.reader.getFloat(translateElem, 'z', true);
			this.transformations.push(translateToSend);
		}

		var rotateElem = transformations[i].getElementsByTagName('rotate')[0];
		if (rotateElem != null) {
			var rotationToSend = {};
			rotationToSend.id = ID;
			rotationToSend.type = "rotate";
			rotationToSend.axis = this.reader.getString(rotateElem, 'axis', true);
			rotationToSend.angle = this.reader.getFloat(rotateElem, 'angle', true);
			this.transformations.push(rotationToSend);
		}

		var scaleElem = transformations[i].getElementsByTagName('scale')[0];
		if (scaleElem != null) {
			var scaleToSend = {};
			scaleToSend.id = ID;
			scaleToSend.type = "scale;"
			scaleToSend.x = this.reader.getFloat(scaleElem, 'x', true);
			scaleToSend.y = this.reader.getFloat(scaleElem, 'y', true);
			scaleToSend.z = this.reader.getFloat(scaleElem, 'z', true);
			this.transformations.push(scaleToSend);
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
MySceneGraph.prototype.parseNodes = function (rootElement) {
	var componentsElem = rootElement.getElementsByTagName('components')[0];
	var components = componentsElem.getElementsByTagName('component');
	var rootComponent = this.getComponentFromId(components, this.rootNodeId);
	rootComponent.id = this.rootNodeId;

	if (this.rootNodeId == null) return "Root node not found!";		//Mudei de rootNode
	this.rootNode = this.parseNode(components, rootComponent, null);
};

/**
 * Recursive function to get all the individual components
 */
MySceneGraph.prototype.parseNode = function (componentsList, component, parentNode) {
	var node = new Node(component.id);

	//Transformations
	{
		var transformationElem = component.getElementsByTagName('transformation')[0].childNodes;
		var transforms = [];
		for (var j = 0; j < transformationElem.length; j++) {
			//console.log(transformationElem[i].nodeName + ":" + transformationElem[i].nodeValue);
			if (transformationElem[j].nodeName == "translate") {
				var translateToSend = {};
				translateToSend.type = "translate";
				translateToSend.x = this.reader.getFloat(transformationElem[j], 'x', true);
				translateToSend.y = this.reader.getFloat(transformationElem[j], 'y', true);
				translateToSend.z = this.reader.getFloat(transformationElem[j], 'z', true);
				transforms.push(translateToSend);
			} else if (transformationElem[j].nodeName == "rotate") {
				var rotateToSend = {};
				rotateToSend.type = "rotate";
				rotateToSend.axis = this.reader.getString(transformationElem[j], 'axis', true);
				rotateToSend.angle = this.reader.getFloat(transformationElem[j], 'angle', true);
				transforms.push(rotateToSend);
			} else if (transformationElem[j].nodeName == "scale") {
				var scaleToSend = {};
				scaleToSend.type = "scale";
				scaleToSend.x = this.reader.getFloat(transformationElem[j], 'x', true);
				scaleToSend.y = this.reader.getFloat(transformationElem[j], 'y', true);
				scaleToSend.z = this.reader.getFloat(transformationElem[j], 'z', true);
				transforms.push(scaleToSend);
			} else if (transformationElem[j].nodeName == "transformationref") {
				var id = this.reader.getString(transformationElem[j], 'id', true);
				for (var k = 0; k < this.transformations.length; k++) {
					if (this.transformations[k].id == id) {
						transforms.push(this.transformations[k]);
						break;
					}
				}
			}
		}

		node.setMat(transforms);
	}

	//Materials
	{
		var materialsElem = component.getElementsByTagName('materials')[0];
		var materials = materialsElem.getElementsByTagName('material');
		for (var i = 0; i < materials.length; i++) {
			var materialId = this.reader.getString(materials[i], 'id', true);
			if (materialId == 'inherit') {
				if (parent == null) return "Root can't have inherit materials";

				var parentMaterials = parentNode.getMaterials();
				for (var j = 0; j < parentMaterials.length; j++) {

					for (var k = 0; k < this.materials.length; k++)
						if (this.materials[k].id == parentMaterials[j].id) {
							var materialRef = this.materials[k];
							var material = new CGFappearance(this.scene);
							material.id = parentMaterials[j].id;
							material.setEmission(materialRef.emission.r, materialRef.emission.g, materialRef.emission.b, materialRef.emission.a);
							material.setAmbient(materialRef.ambient.r, materialRef.ambient.g, materialRef.ambient.b, materialRef.ambient.a);
							material.setDiffuse(materialRef.diffuse.r, materialRef.diffuse.g, materialRef.diffuse.b, materialRef.diffuse.a);
							material.setSpecular(materialRef.specular.r, materialRef.specular.g, materialRef.specular.b, materialRef.specular.a);
							material.setShininess(materialRef.shininess);
							node.pushMaterial(material);
						}
				}
			} else {
				//Add the material to the component
				for (var j = 0; j < this.materials.length; j++)
					if (this.materials[j].id == materialId) {
						var materialRef = this.materials[j];
						var material = new CGFappearance(this.scene);
						material.id = materialId;
						material.setEmission(materialRef.emission.r, materialRef.emission.g, materialRef.emission.b, materialRef.emission.a);
						material.setAmbient(materialRef.ambient.r, materialRef.ambient.g, materialRef.ambient.b, materialRef.ambient.a);
						material.setDiffuse(materialRef.diffuse.r, materialRef.diffuse.g, materialRef.diffuse.b, materialRef.diffuse.a);
						material.setSpecular(materialRef.specular.r, materialRef.specular.g, materialRef.specular.b, materialRef.specular.a);
						material.setShininess(materialRef.shininess);
						node.pushMaterial(material);
					}
			}
		}
	}

	//Textures
	{
		var textureElem = component.getElementsByTagName('texture')[0];
		var textureId = this.reader.getString(textureElem, 'id', true);

		if (textureId == "inherit")
			node.setTexture(parentNode.texture);
		else if (textureId != "none")
			for (var i = 0; i < this.textures.length; i++) {
				if (this.textures[i].id == textureId) {
					node.setTexture(this.textures[i]);
					break;
				}
			}
	}

	//Children
	{
		var childrenElem = component.getElementsByTagName('children')[0];

		var componentsRef = childrenElem.getElementsByTagName('componentref');
		for (var i = 0; i < componentsRef.length; i++) {
			var componentId = this.reader.getString(componentsRef[i], 'id', true);
			var newComponent = this.getComponentFromId(componentsList, componentId);
			newComponent.id = componentId;
			node.pushChild(this.parseNode(componentsList, newComponent, node));
		}

		var primitiveref = childrenElem.getElementsByTagName('primitiveref');
		var primitives = [];
		for (var i = 0; i < primitiveref.length; i++) {
			var primitiveId = this.reader.getString(primitiveref[i], 'id', true);

			for (var j = 0; j < this.primitives.length; j++) {
				if (primitiveId == this.primitives[j].id) {
					node.setPrimitive(this.primitives[j]);
					break;
				}
			}
		}
	}

	return node;
}

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
MySceneGraph.prototype.getComponentFromId = function (list, id) {
	for (var i = 0; i < list.length; i++) {
		var component = list[i];
		var componentId = this.reader.getString(component, 'id', true);
		if (componentId == id)
			return component;
	}
}

MySceneGraph.prototype.getRGBA = function (element, required) {
	var r = this.reader.getFloat(element, 'r', required);
	var g = this.reader.getFloat(element, 'g', required);
	var b = this.reader.getFloat(element, 'b', required);
	var a = this.reader.getFloat(element, 'a', required);
	return vec4.fromValues(r, g, b, a);
};

MySceneGraph.prototype.getColorFromRGBA = function (element, required) {
	var color = {};
	color.r = this.reader.getFloat(element, 'r', required);
	color.g = this.reader.getFloat(element, 'g', required);
	color.b = this.reader.getFloat(element, 'b', required);
	color.a = this.reader.getFloat(element, 'a', required);
	return color;
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

MySceneGraph.prototype.getInheritTexture = function (childComponentID) {
	for (var i = 0; i < this.components.length; i++)
		for (var j = 0; j < this.components[i].componentsRef.length; j++)
			if (this.components[i].componentsRef[j] == childComponentID)
				return this.components[i].texture;

	//HANDLE THIS NULL RETURN!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	return null;
};