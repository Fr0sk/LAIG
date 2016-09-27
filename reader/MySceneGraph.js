
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
	 
	this.reader.open('scenes/'+filename, this);  
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
}

/*
 * Scene
 */
MySceneGraph.prototype.parseScene = function(rootElement) {
	var scene = rootElement.getElementsByTagName('scene')[0];
	var s_axisLength = this.reader.getFloat(scene, 'axis_length', true)
	this.axis = new CGFaxis(this.scene, s_axisLength, 0.2);	
}

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
		}
	}
	
	// Orthographic
	{
		var v_orthographic = views.getElementsByTagName('orthographic');
		// TODO: orthographic cameras
	}

}

/*
 * Illumination
 */
MySceneGraph.prototype.parseIllumination = function(rootElement) {
	var illumination = rootElement.getElementsByTagName("illumination")[0];
	var ambient = illumination.getElementsByTagName('ambient')[0];
	var background = illumination.getElementsByTagName('background')[0];
	this.ambientLight = this.getRGBA(ambient, true);
	this.background = this.getRGBA(background, true);
}

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
}
	
/*
 * Callback to be executed on any read error
 */
MySceneGraph.prototype.onXMLError=function (message) {
	console.error("XML Loading Error: "+message);	
	this.loadedOk=false;
};

MySceneGraph.prototype.getRGBA = function(element, required) {
	var r = this.reader.getFloat(element, 'r', required);
	var g = this.reader.getFloat(element, 'g', required);
	var b = this.reader.getFloat(element, 'b', required);
	var a = this.reader.getFloat(element, 'a', required);
	return vec4.fromValues(r, g, b, a)
}

MySceneGraph.prototype.getXYZ = function(element, required) {
	var x = this.reader.getFloat(element, 'x', required);
	var y = this.reader.getFloat(element, 'y', required);
	var z = this.reader.getFloat(element, 'z', required);
	return vec3.fromValues(x, y, z);
}
