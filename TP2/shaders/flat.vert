attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform float normScale;

void main() {
	vec2 f = floor(aTextureCoord * vec2(3.0, 3.0));
	if(f[0])
	if(ivec2(f).x == 1)
		gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition + aVertexNormal * normScale, 1.0);
	else
		gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1);
}