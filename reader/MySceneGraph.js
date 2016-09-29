
function MySceneGraph(filename, scene) {
	this.loadedOk = null;
	
	// Establish bidirectional references between scene and graph
	this.scene = scene;
	scene.graph=this;
		
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
MySceneGraph.prototype.onXMLReady=function() 
{
	console.log("XML Loading finished.");
	var rootElement = this.reader.xmlDoc.documentElement;
	
	// Here should go the calls for different functions to parse the various blocks
	var error = this.parseData(rootElement); //this.parseGlobalsExample(rootElement);

	if (error != null) {
		this.onXMLError(error);
		return;
	}	

	this.loadedOk=true;
	
	// As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
	this.scene.onGraphLoaded();
};

/*
 * Parse the data to the scene
 */
MySceneGraph.prototype.parseData= function(rootElement) {
	this.parseScene(rootElement);
	this.parseViews(rootElement);
	this.parseIllumination(rootElement);
	this.parseLights(rootElement);
	this.parseTextures(rootElement);
	this.parseMaterials(rootElement);
	this.parseTransformations(rootElement);
	this.parsePrimitives(rootElement);
};

/*
 * Scene
 */
MySceneGraph.prototype.parseScene = function(rootElement) {
	var scene = rootElement.getElementsByTagName('scene')[0];
	var s_axisLength = this.reader.getFloat(scene, 'axis_length', true)
	this.axis = new CGFaxis(this.scene, s_axisLength, 0.2);	

	console.log("O meu axis: " + s_axisLength);
};

/*
 * Views
 */
MySceneGraph.prototype.parseViews = function(rootElement) {
	var views = rootElement.getElementsByTagName('views')[0];
	this.perspCams = [];
	this.orthoCams = [];

	// Perspective
	{
		var perspCams = views.getElementsByTagName('perpective');
		for (var i = 0; i < perspCams.length; i++) {
			var near = this.reader.getFloat(perspCams[i], 'near', true);
			var far = this.reader.getFloat(perspCams[i], 'far', true);
			var fov = this.reader.getFloat(perspCams[i], 'angle', true);
			var fromElem = perspCams[i].getElementsByTagName('from')[0];
			var toElem = perspCams[i].getElementsByTagName('to')[0];
			var position = this.getXYZ(fromElem, true);
			var target = this.getXYZ(toElem, true);
			this.perspCams.push(new CGFcamera(fov, near, far, position, target));

			console.log("Posicao da minha " + (i + 1) + " camera: " + position);
		}
	}
	
	// Orthographic
	{
		var v_orthographic = views.getElementsByTagName('orthographic');
		// TODO: orthographic cameras
	}

};

/*
 * Illumination
 */
MySceneGraph.prototype.parseIllumination = function(rootElement) {
	var illumination = rootElement.getElementsByTagName("illumination")[0];
	var ambient = illumination.getElementsByTagName('ambient')[0];
	var background = illumination.getElementsByTagName('background')[0];
	this.ambientLight = this.getRGBA(ambient, true);
	this.background = this.getRGBA(background, true);
};

/*
 * Lights
 */
MySceneGraph.prototype.parseLights = function(rootElement) {
	 var lights = rootElement.getElementsByTagName('lights')[0];
	 this.omniLights = [];
	 this.spotLights = [];

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

			 console.log("Ola");
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
		 }
	 }
};
	
/**
 * Textures
 */
MySceneGraph.prototype.parseTextures = function(rootElement) {
	var texturesElem = rootElement.getElementsByTagName('textures')[0];
	var textures = texturesElem.getElementsByTagName('texture');

	for(var i = 0; i < textures.length; i++) {
		var id = this.reader.getString(textures[i], 'id', true);
		var file = this.reader.getString(textures[i], 'file', true);
		var length_s = this.reader.getFloat(textures[i], 'length_s', true);
		var length_t = this.reader.getFloat(textures[i], 'length_t', true);

		console.log("Texture num " + (i + 1) + ": id = " + id + ", file = " + file + ", length_s = " + length_s + ", length_t = " + length_t);

		/*var texture = new CGFappearance(this.scene);
		texture.loadTexture(file);
		textures.push(texture);*/
	}
};

/**
 * Materials
 */
MySceneGraph.prototype.parseMaterials = function(rootElement) {
	var materialsElem = rootElement.getElementsByTagName('materials')[0];
	var materials = materialsElem.getElementsByTagName('material');

	console.log("Tamanho: " + materials.length);

	for(var i = 0; i < materials.length; i++) {
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

		/*var material = new CGFappearance(this.scene);		//THERE'S NO ID????
		material.setEmission(emission);
		material.setAmbient(ambient);
		material.setDiffuse(diffuse);
		material.setSpecular(specular);
		material.setShininess(shininess);

		materials.push(material);*/

		console.log("Material " + id + ": emission = " + emission + ", ambient = " + ambient + ", diffuse = " + diffuse + ", shininess = " + shininess + "\n");	
	}
};

/**
 * Transformations
 */
MySceneGraph.prototype.parseTransformations = function(rootElement) {
	var transformationsElem = rootElement.getElementsByTagName('transformations')[0];
	var transformations = transformationsElem.getElementsByTagName('transformation');

	for(var i = 0; i < transformations.length; i++) {
		var id = this.reader.getString(transformations[i], 'id', true);

		var translateElem = transformations[i].getElementsByTagName('translate')[0];
		var translate = this.getXYZ(translateElem, true);

		console.log("Transformation num " + (i + 1) + ": id = " + id + ", translate = " + translate);
	}
};

/**
 * Primitives
 */
MySceneGraph.prototype.parsePrimitives = function(rootElement) {
	var primitivesElem = rootElement.getElementsByTagName('primitives')[0];
	var primitives = primitivesElem.getElementsByTagName('primitive');

	for(var i = 0; i < primitives.length; i++) {
		var id = this.reader.getString(primitives[i], 'id', true);

		var typeElem = null;
		if((typeElem = primitives[i].getElementsByTagName('rectangle')[0]) != null) {
			var x1 = this.reader.getFloat(typeElem, 'x1', true);
			var y1 = this.reader.getFloat(typeElem, 'y1', true);
			var x2 = this.reader.getFloat(typeElem, 'x2', true);
			var y2 = this.reader.getFloat(typeElem, 'y2', true);
			console.log("Primitive num " + (i + 1) + ": id = " + id + ", x1 = " + x1 + ", y1 = " + y1 +
				", x2 = " + x2 + ", y2 = " + y2);
		} else if((typeElem = primitives[i].getElementsByTagName('triangle')[0]) != null) {
			var x1 = this.reader.getFloat(typeElem, 'x1', true);
			var y1 = this.reader.getFloat(typeElem, 'y1', true);
			var z1 = this.reader.getFloat(typeElem, 'z1', true);
			var x2 = this.reader.getFloat(typeElem, 'x2', true);
			var y2 = this.reader.getFloat(typeElem, 'y2', true);
			var z2 = this.reader.getFloat(typeElem, 'z2', true);
			var x3 = this.reader.getFloat(typeElem, 'x3', true);
			var y3 = this.reader.getFloat(typeElem, 'y3', true);
			var z3 = this.reader.getFloat(typeElem, 'z3', true);
			console.log("Primitive num " + (i + 1) + ": id = " + id + ", x1 = " + x1 + 
				", y1 = " + y1 + ", z1 = " + z1 + ", x2 = " + x2 + ", y2 = " + y2 + 
				", z2 = " + z2 + ", x3 = " + x3 + ", y3 = " + y3 + ", z3 = " + z3);
		} else if((typeElem = primitives[i].getElementsByTagName('cylinder')[0]) != null) {
			var base = this.reader.getFloat(typeElem, 'base', true);
			var top = this.reader.getFloat(typeElem, 'top', true);
			var height = this.reader.getFloat(typeElem, 'height', true);
			var slices = this.reader.getFloat(typeElem, 'slices', true);
			var stacks = this.reader.getFloat(typeElem, 'stacks', true);
			console.log("Primitive num " + (i + 1) + ": id = " + id + ", base = " + base +
				", top = " + top + ", height = " + height + ", slices = " + slices + ", stacks = " + stacks);
		} else if((typeElem = primitives[i].getElementsByTagName('sphere')[0]) != null) {
			var radius = this.reader.getFloat(typeElem, 'radius', true);
			var slices = this.reader.getFloat(typeElem, 'slices', true);
			var stacks = this.reader.getFloat(typeElem, 'stacks', true);
			console.log("Primitive num " + (i + 1) + ": id = " + id + ", radius = " + radius +
				", slices = " + slices + ", stacks = " + stacks);
		} else if((typeElem = primitives[i].getElementsByTagName('torus')[0]) != null) {
			var inner = this.reader.getFloat(typeElem, 'inner', true);
			var outer = this.reader.getFloat(typeElem, 'outer', true);
			var slices = this.reader.getFloat(typeElem, 'slices', true);
			var loops = this.reader.getFloat(typeElem, 'loops', true);
			console.log("Primitive num " + (i + 1) + ": id = " + id + ", inner = " + inner +
				", outer = " + outer + ", slices = " + slices + ", loops = " + loops);
		}
	}
};

/**
 * Callback to be executed on any read error
 */
MySceneGraph.prototype.onXMLError=function (message) {
	console.error("XML Loading Error: "+message);	
	this.loadedOk=false;
};

/**
 * Util functions
 */
MySceneGraph.prototype.getRGBA = function(element, required) {
	var r = this.reader.getFloat(element, 'r', required);
	var g = this.reader.getFloat(element, 'g', required);
	var b = this.reader.getFloat(element, 'b', required);
	var a = this.reader.getFloat(element, 'a', required);
	return vec4.fromValues(r, g, b, a)
};

MySceneGraph.prototype.getXYZ = function(element, required) {
	var x = this.reader.getFloat(element, 'x', required);
	var y = this.reader.getFloat(element, 'y', required);
	var z = this.reader.getFloat(element, 'z', required);
	return vec3.fromValues(x, y, z);
};

MySceneGraph.prototype.getRectSize = function(element, required) {
	var x1 = this.reader.getFloat(element, 'x1', required);
	var y1 = this.reader.getFloat(element, 'y1', required);
	var x2 = this.reader.getFloat(element, 'x2', required);
	var y2 = this.reader.getFloat(element, 'y2', required);
	return vec4.fromValues(x1, y1, x2, y2);
};

MySceneGraph.prototype.getTriangleSize = function(element, required) {
	var x1 = this.reader.getFloat(element, 'x1', required);
	var y1 = this.reader.getFloat(element, 'y1', required);
	var z1 = this.reader.getFloat(element, 'z1', required);
	var x2 = this.reader.getFloat(element, 'x2', required);
	var y2 = this.reader.getFloat(element, 'y2', required);
	var z2 = this.reader.getFloat(element, 'z2', required);
};