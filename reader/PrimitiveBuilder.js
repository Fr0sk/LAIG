function PrimitiveBuilder() {
    // Empty block
}

// Builds a rectangle with the diagonal vertices
PrimitiveBuilder.buildRect = function(x1, y1, x2, y2) {
    var rect = {};
    // TODO Build rectangle
    return rect; 
}

// Builds a triangle with the given verices
PrimitiveBuilder.buildTri = function(x1, y1, z1, x2, y2, z2, x3, y3, z3) {
    var tri = {};
    // TODO Build triangle
    return tri;
}

// Builds a cylinder with given params
PrimitiveBuilder.buildCylinder = function(base, top, height, slices, stacks) {
    var cylinder = {};
    // TODO Build cylinder
    return cylinder;
}

// Builds a sphere with given params
PrimitiveBuilder.buildSphere = function(radius, slices, stacks) {
    var sphere = {};
    // TODO Build sphere
    return sphere;
}

// Builds a torus with given params
PrimitiveBuilder.buildTorus = function(inner, outer, slices, loops) {
    var torus = {};
    // TODO Build torus
    return torus;
}