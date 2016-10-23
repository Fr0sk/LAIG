var degToRad = Math.PI / 180.0;

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

    this.reader.open('scenes/' + filename, this);
}

/*
 * Callback to be executed after successful reading
 */
MySceneGraph.prototype.onXMLReady = function () {
    //console.log("XML Loading finished.");
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
        'materials', 'transformations', 'primitives', 'components'
    ];

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

MySceneGraph.prototype.checkDoubleId = function (list, where) {
    var lastElementIndex = list.length - 1;

    for (var i = 0; i < list.length - 1; i++) {
        if (list[i].id == list[lastElementIndex].id)
            return "detected the same id '" + list[i].id + "' under " + where + "!";
    }
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
    this.cameraIndex;
    err = this.parseViews(rootElement);
    if (err != null) return err;
    this.checkDoubleId(this.perspCams);

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

    console.info("If you have more than 1 texture per component, all but the first one will be ignored.");
    console.info("Tap 'R' to select free camera movement.");

    this.rootNode;
    err = this.parseNodes(rootElement);
    if (err != null) return err;
};

/**
 * Changes the current active material of all the components
 */
MySceneGraph.prototype.changeNodesMaterialIndex = function (node) {
    if (node.indexActiveMaterial >= node.materials.length - 1)
        node.indexActiveMaterial = 0;
    else
        node.indexActiveMaterial++;

    for (var i = 0; i < node.children.length; i++)
        this.changeNodesMaterialIndex(node.children[i]);
}

/*
 * Scene
 */
MySceneGraph.prototype.parseScene = function (rootElement) {
    var scene = rootElement.getElementsByTagName('scene')[0];
    var axisLength = this.reader.getFloat(scene, 'axis_length', true);
    this.rootNodeId = this.reader.getString(scene, 'root', true);
    this.axis = new CGFaxis(this.scene, axisLength, 0.2);

    //console.log("Scene axis_length =" + s_axisLength);
};

/*
 * Views
 */
MySceneGraph.prototype.parseViews = function (rootElement) {
    var views = rootElement.getElementsByTagName('views')[0];
    var err;

    // Perspective cameras
    {
        var perspCams = views.getElementsByTagName('perspective');
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

            err = this.checkDoubleId(this.perspCams, "perspective cameras");
            if (err != null)
                return err;

            //console.log("ID = " + id + " ,view = " + near + ", far = " + far);
        }
    }

    var defaultCam = this.reader.getString(views, 'default', true);
    for (var i = 0; i < this.perspCams.length; i++)
        if (this.perspCams[i].id == defaultCam) {
            this.cameraIndex = i;
            return null;
        }

    if (this.cameraIndex == null)
        return "couldn't find default camera '" + defaultCam + "'!";
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
    var err;

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

            err = this.checkDoubleId(this.omniLights, "omni lights");
            if (err != null)
                return err;
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
            target[2] - location[2]
            ];

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

            err = this.checkDoubleId(this.spotLights, "spot lights");
            if (err != null)
                return err;

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

        var texture = new CGFtexture(this.scene, file);
        texture.id = id;
        texture.length_s = length_s;
        texture.length_t = length_t;
        this.textures.push(texture);

        err = this.checkDoubleId(this.textures, "textures");
        if (err != null)
            return err;
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

        err = this.checkDoubleId(this.materials, "materials");
        if (err != null)
            return err;

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

            err = this.checkDoubleId(this.transformations, "transformations (specifically translates)");
            if (err != null)
                return err;
        }

        var rotateElem = transformations[i].getElementsByTagName('rotate')[0];
        if (rotateElem != null) {
            var rotationToSend = {};
            rotationToSend.id = ID;
            rotationToSend.type = "rotate";
            rotationToSend.axis = this.reader.getString(rotateElem, 'axis', true);
            rotationToSend.angle = this.reader.getFloat(rotateElem, 'angle', true);
            this.transformations.push(rotationToSend);

            err = this.checkDoubleId(this.transformations, "transformations (specifically rotates)");
            if (err != null)
                return err;
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

            err = this.checkDoubleId(this.transformations, "transformations (specifically scales)");
            if (err != null)
                return err;
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
            var rectangle = {};
            rectangle.id = id;
            rectangle.type = "rectangle";
            rectangle.x1 = this.reader.getFloat(typeElem, 'x1', true);
            rectangle.y1 = this.reader.getFloat(typeElem, 'y1', true);
            rectangle.x2 = this.reader.getFloat(typeElem, 'x2', true);
            rectangle.y2 = this.reader.getFloat(typeElem, 'y2', true);
            this.primitives.push(rectangle);
            //console.log("Primitive num " + (i + 1) + ": id = " + id + ", x1 = " + x1 + ", y1 = " + y1 +
            //", x2 = " + x2 + ", y2 = " + y2);
        } else if ((typeElem = primitives[i].getElementsByTagName('triangle')[0]) != null) {
            var triangle = {};
            triangle.id = id;
            triangle.type = "triangle";
            triangle.x1 = this.reader.getFloat(typeElem, 'x1', true);
            triangle.y1 = this.reader.getFloat(typeElem, 'y1', true);
            triangle.z1 = this.reader.getFloat(typeElem, 'z1', true);
            triangle.x2 = this.reader.getFloat(typeElem, 'x2', true);
            triangle.y2 = this.reader.getFloat(typeElem, 'y2', true);
            triangle.z2 = this.reader.getFloat(typeElem, 'z2', true);
            triangle.x3 = this.reader.getFloat(typeElem, 'x3', true);
            triangle.y3 = this.reader.getFloat(typeElem, 'y3', true);
            triangle.z3 = this.reader.getFloat(typeElem, 'z3', true);
            this.primitives.push(triangle);
            //console.log("Primitive num " + (i + 1) + ": id = " + id + ", x1 = " + x1 + 
            //", y1 = " + y1 + ", z1 = " + z1 + ", x2 = " + x2 + ", y2 = " + y2 + 
            //", z2 = " + z2 + ", x3 = " + x3 + ", y3 = " + y3 + ", z3 = " + z3);
        } else if ((typeElem = primitives[i].getElementsByTagName('cylinder')[0]) != null) {
            var cylinder = {};
            cylinder.id = id;
            cylinder.type = "cylinder";
            cylinder.base = this.reader.getFloat(typeElem, 'base', true);
            cylinder.top = this.reader.getFloat(typeElem, 'top', true);
            cylinder.height = this.reader.getFloat(typeElem, 'height', true);
            cylinder.slices = this.reader.getFloat(typeElem, 'slices', true);
            cylinder.stacks = this.reader.getFloat(typeElem, 'stacks', true);
            this.primitives.push(cylinder);
            //console.log("Primitive num " + (i + 1) + ": id = " + id + ", base = " + base +
            //", top = " + top + ", height = " + height + ", slices = " + slices + ", stacks = " + stacks);
        } else if ((typeElem = primitives[i].getElementsByTagName('sphere')[0]) != null) {
            var sphere = {};
            sphere.id = id;
            sphere.type = "sphere";
            sphere.radius = this.reader.getFloat(typeElem, 'radius', true);
            sphere.slices = this.reader.getFloat(typeElem, 'slices', true);
            sphere.stacks = this.reader.getFloat(typeElem, 'stacks', true);
            this.primitives.push(sphere);
            //console.log("Primitive num " + (i + 1) + ": id = " + id + ", radius = " + radius +
            //", slices = " + slices + ", stacks = " + stacks);
        } else if ((typeElem = primitives[i].getElementsByTagName('torus')[0]) != null) {
            var torus = {};
            torus.id = id;
            torus.type = "torus";
            torus.inner = this.reader.getFloat(typeElem, 'inner', true);
            torus.outer = this.reader.getFloat(typeElem, 'outer', true);
            torus.slices = this.reader.getFloat(typeElem, 'slices', true);
            torus.loops = this.reader.getFloat(typeElem, 'loops', true);
            this.primitives.push(torus);
            //console.log("Primitive num " + (i + 1) + ": id = " + id + ", inner = " + inner +
            //", outer = " + outer + ", slices = " + slices + ", loops = " + loops);
        }

        err = this.checkDoubleId(this.primitives, "primitives");
        if (err != null)
            return err;
    }
};

/**
 * Components
 */
MySceneGraph.prototype.parseNodes = function (rootElement) {
    var componentsElem = rootElement.getElementsByTagName('components')[0];
    var components = componentsElem.getElementsByTagName('component');
    var rootComponent = this.getComponentFromId(components, this.rootNodeId);
    if (rootComponent == null) return "root node '" + this.rootNodeId + "' not found in the components!";
    rootComponent.id = this.rootNodeId;

    var doubleId = this.checkForDoubleIdInComponents(components);
    if (doubleId != null)
        return doubleId;

    this.rootNode = this.parseNode(components, rootComponent, null);

    //If rootNode is a string, that means it countains an error
    if (typeof this.rootNode === 'string' || this.rootNode instanceof String)
        return this.rootNode;
};

/**
 * Recursive function to get all the individual components
 */
MySceneGraph.prototype.parseNode = function (componentsList, component, parentNode) {
    var node = new Node(component.id);
    var checkType;
    var firstTransformation = true;

    //Transformations
    {
        var transformations = [
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0
        ];

        var transformationElem = component.getElementsByTagName('transformation')[0].childNodes;
        for (var j = 0; j < transformationElem.length; j++) {
            if (transformationElem[j].nodeName == "translate") {
                if (firstTransformation) {
                    firstTransformation = false;
                    checkType = "explicit";
                } else if (checkType != "explicit")
                    return "detected explicit transformation while parsing node '" + component.id + "'. Please use only one method!";

                var x = this.reader.getFloat(transformationElem[j], 'x', true);
                var y = this.reader.getFloat(transformationElem[j], 'y', true);
                var z = this.reader.getFloat(transformationElem[j], 'z', true);
                this.applyTransform("translate", transformations, x, y, z, null, null);
            } else if (transformationElem[j].nodeName == "rotate") {
                if (firstTransformation) {
                    firstTransformation = false;
                    checkType = "explicit";
                } else if (checkType != "explicit")
                    return "detected explicit transformation while parsing node '" + component.id + "'. Please use only one method!";

                var axis = this.reader.getString(transformationElem[j], 'axis', true);
                var angle = this.reader.getFloat(transformationElem[j], 'angle', true);
                this.applyTransform("rotate", transformations, null, null, null, axis, angle);
            } else if (transformationElem[j].nodeName == "scale") {
                if (firstTransformation) {
                    firstTransformation = false;
                    checkType = "explicit";
                } else if (checkType != "explicit")
                    return "detected explicit transformation while parsing node '" + component.id + "'. Please use only one method!";

                var x = this.reader.getFloat(transformationElem[j], 'x', true);
                var y = this.reader.getFloat(transformationElem[j], 'y', true);
                var z = this.reader.getFloat(transformationElem[j], 'z', true);
                this.applyTransform("scale", transformations, x, y, z, null, null);
            } else if (transformationElem[j].nodeName == "transformationref") {
                if (firstTransformation) {
                    firstTransformation = false;
                    checkType = "reference";
                } else if (checkType != "reference")
                    return "detected referenced transformation while parsing node '" + component.id + "'. Please use only one method!";

                var id = this.reader.getString(transformationElem[j], 'id', true);
                for (var k = 0; k < this.transformations.length; k++)
                    if (this.transformations[k].id == id) {
                        this.applyTransform(this.transformations[k].type, transformations,
                            this.transformations[k].x, this.transformations[k].y, this.transformations[k].z,
                            this.transformations[k].axis, this.transformations[k].angle);
                        break;
                    }
            }
        }

        node.setMat(transformations);
    }

    //Materials
    {
        var materialsElem = component.getElementsByTagName('materials')[0].childNodes;

        if (materialsElem == null)
            return "Can't"

        if (materialsElem.length < 2)
            return "component '" + component.id + "' needs to have at least one material!";

        for (var i = 0; i < materialsElem.length; i++) {
            if (materialsElem[i].nodeName != "material")
                continue;

            var materialId = this.reader.getString(materialsElem[i], 'id', true);
            if (materialId == 'inherit') {
                if (parentNode == null)
                    return "Root can't inherit materials";

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

        if (textureId == "inherit") {
            if (parentNode == null)
                return "Root node can't inherit a texture";
            node.setTexture(parentNode.texture);
        } else if (textureId != "none")
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
            var child = this.parseNode(componentsList, newComponent, node);
            //If the child is a string, that means it countains an error
            if (typeof child === 'string' || child instanceof String)
                return child;

            node.pushChild(child);
        }

        var primitiveref = childrenElem.getElementsByTagName('primitiveref');
        var primitives = [];
        for (var i = 0; i < primitiveref.length; i++) {
            var primitiveId = this.reader.getString(primitiveref[i], 'id', true);

            for (var j = 0; j < this.primitives.length; j++) {
                if (primitiveId == this.primitives[j].id) {
                    if (node.texture != null)
                        node.setPrimitive(this.generatePrimitive(this.primitives[j], node.texture.length_s, node.texture.length_t));
                    else
                        node.setPrimitive(this.generatePrimitive(this.primitives[j], 1, 1));
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

/**
 * Generates the apropriate primitive
 */
MySceneGraph.prototype.generatePrimitive = function (primitiveInfo, length_s, length_t) {
    if (primitiveInfo.type == "rectangle")
        return PrimitiveBuilder.buildRect(this.scene, primitiveInfo.x1, primitiveInfo.y1, primitiveInfo.x2, primitiveInfo.y2, length_s, length_t);
    else if (primitiveInfo.type == "triangle")
        return PrimitiveBuilder.buildTri(this.scene, primitiveInfo.x1, primitiveInfo.y1, primitiveInfo.z1,
            primitiveInfo.x2, primitiveInfo.y2, primitiveInfo.z2, primitiveInfo.x3, primitiveInfo.y3, primitiveInfo.z3,
            length_s, length_t);
    else if (primitiveInfo.type == "cylinder")
        return PrimitiveBuilder.buildCylinder(this.scene, primitiveInfo.base, primitiveInfo.top, primitiveInfo.height,
            primitiveInfo.slices, primitiveInfo.stacks);
    else if (primitiveInfo.type == "sphere")
        return PrimitiveBuilder.buildSphere(this.scene, primitiveInfo.radius, primitiveInfo.slices, primitiveInfo.stacks);
    else if (primitiveInfo.type == "torus")
        return PrimitiveBuilder.buildTorus(this.scene, primitiveInfo.inner, primitiveInfo.outer, primitiveInfo.slices,
            primitiveInfo.loops);
};

/**
 * Checks if there's more than one components with the same id
 */
MySceneGraph.prototype.checkForDoubleIdInComponents = function (components) {
    var idCollection = [];

    for (var i = 0; i < components.length; i++)
        idCollection.push(this.reader.getString(components[i], 'id', true));

    for (var i = 0; i < idCollection.length; i++)
        for (var j = i + 1; j < idCollection.length; j++)
            if (idCollection[i] == idCollection[j])
                return "there are components with the same id: '" + idCollection[i] + "'!";

    return null;
}

/**
 * Applies transformations to only one variable
 */
MySceneGraph.prototype.applyTransform = function (type, transformations, x, y, z, axis, angle) {
    switch (type) {
        case "translate":
            mat4.translate(transformations, transformations, [x, y, z]);
            break;
        case "rotate":
            switch (axis) {
                case "x":
                    mat4.rotate(transformations, transformations, angle * degToRad, [1, 0, 0]);
                    break;
                case "y":
                    mat4.rotate(transformations, transformations, angle * degToRad, [0, 1, 0]);
                    break;
                case "z":
                    mat4.rotate(transformations, transformations, angle * degToRad, [0, 0, 1]);
                    break;
            }
            break;
        case "scale":
            mat4.scale(transformations, transformations, [x, y, z]);
            break;
    }
}