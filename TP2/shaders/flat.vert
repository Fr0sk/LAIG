attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform float normScale;

void main() {
	vec2 f = floor(aTextureCoord * vec2(3.0, 3.0));
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition + aVertexNormal * normScale, 1.0);
}