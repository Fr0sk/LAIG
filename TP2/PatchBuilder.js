function PatchBuilder() {
	// Empty block
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