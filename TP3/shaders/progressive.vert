attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform float dimX;
uniform float dimY;
uniform float time;

varying vec2 vTextureCoord;

void main() {
	vec2 vertexPosition = floor(aTextureCoord * vec2(dimX, dimY));

    float pi = 3.14;

    float a = time + aTextureCoord.x;
    float b = time + aTextureCoord.y;

    float height = cos(a + pi) / 5.0 + sin(b + pi * 10.0) / 5.0;

	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition + aVertexNormal * height, 1.0);

    vTextureCoord = aTextureCoord;
}