function PatchBuilder() {
	// Empty block
}

PatchBuilder.buildVehiclePatch = function(scene, id) {
	var vert = [[-1.000, 0.000, -1.000, 1],
				[-0.500, 0.000, -1.500, 1],
				[3.500, 0.000, -1.500, 1],
				[4.000, 0.000, -0.850, 1],
				[-1.500, 0.000, -0.500, 1],
				[-1.596, 1.079, -0.500, 1],
				[3.743, 1.785, -0.500, 1],
				[4.500, 0.000, -0.500, 1],
				[-1.500, 0.000, -0.500, 1],
				[-0.434, 2.165, -0.500, 1],
				[3.226, 1.322, -0.500, 1],
				[4.500, 0.000, -0.500, 1],
				[-1.500, 0.000, 0.500, 1],
				[-0.434, 2.174, 0.500, 1],
				[3.235, 1.322, 0.500, 1],
				[4.500, 0.000, 0.500, 1],
				[-1.500, 0.000, 0.500, 1],
				[-1.605, 1.062, 0.500, 1],
				[3.743, 1.785, 0.500, 1],
				[4.500, 0.000, 0.500, 1],
				[-1.000, 0.000, 1.000, 1],
				[-0.500, 0.000, 1.500, 1],
				[3.500, 0.000, 1.500, 1],
				[4.000, 0.000, 0.850, 1]];
	var patch = PatchBuilder.buildPatch(scene, id, 5, 3, 20, 20, vert);
	return patch;
}

PatchBuilder.buildPatch = function (scene, id, degreeU, degreeV, partsU, partsV, controlVertexes) {
	// WARNING: controlVertexes might need an aditional 1 at the end of each patch
	var expectedNumVertexes = (degreeU + 1) * (degreeV + 1);
	if (controlVertexes.length != expectedNumVertexes) {
		console.error("Wrong number of control vertexes!\nExpected "
			+ expectedNumVertexes + ", was " + controlVertexes.length);
		return undefined;
	}
	var computedVertexes = computeVertexes(degreeU, degreeV, controlVertexes);

	var knotsU = getKnotsVector(degreeU);
	var knotsV = getKnotsVector(degreeV);

	var nurb = new CGFnurbsSurface(degreeU, degreeV, knotsU, knotsV, computedVertexes);
	getSurfacePoint = function (u, v) {
		return nurb.getPoint(u, v);
	};
	return new CGFnurbsObject(scene, getSurfacePoint, partsU, partsV);
}

getKnotsVector = function (degree) {
	var v = [];
	for (var i = 0; i <= degree; i++) {
		v.push(0);
	}
	for (var i = 0; i <= degree; i++) {
		v.push(1);
	}
	return v;
}

computeVertexes = function (degreeU, degreeV, controlVertexes) {
	var computed = [];
	for (var u = 0; u <= degreeU; u++) {
		var tmp = [];
		for (var v = 0; v <= degreeV; v++) {
			tmp.push(controlVertexes[u * (degreeV + 1) + v]);
		}
		computed.push(tmp);
	}
	return computed;
}