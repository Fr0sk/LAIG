attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform float normScale;
uniform float dimX;
uniform float dimY;
uniform float selectedU;
uniform float selectedV;

uniform float c1R;
uniform float c1G;
uniform float c1B;
uniform float c1A;

//uniform vec4 c1;

uniform float c2R;
uniform float c2G;
uniform float c2B;
uniform float c2A;

uniform float csR;
uniform float csG;
uniform float csB;
uniform float csA;

varying vec2 vTextureCoord;
varying vec2 vertexPositionFrag;
varying float selectedUFrag;
varying float selectedVFrag;

//varying vec4 c1Flag;

varying float c1RFrag;
varying float c1GFrag;
varying float c1BFrag;
varying float c1AFrag;

varying float c2RFrag;
varying float c2GFrag;
varying float c2BFrag;
varying float c2AFrag;

varying float csRFrag;
varying float csGFrag;
varying float csBFrag;
varying float csAFrag;



void main() {
	vec2 vertexPosition = floor(aTextureCoord * vec2(dimX, dimY));

	if(selectedU == -1.0 && selectedV == -1.0)
		gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
	else if(ivec2(vertexPosition) == ivec2(selectedU, selectedV)
		|| ivec2(vertexPosition) == ivec2(selectedU + 1.0, selectedV)
		|| ivec2(vertexPosition) == ivec2(selectedU, selectedV + 1.0)
		|| ivec2(vertexPosition) == ivec2(selectedU + 1.0, selectedV + 1.0))
		gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition + aVertexNormal * normScale, 1.0);
	else
		gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);



	vTextureCoord = aTextureCoord;
	vertexPositionFrag = vertexPosition;
	selectedUFrag = selectedU;
	selectedVFrag = selectedV;

	c1RFrag = c1R;
	c1GFrag = c1G;
	c1BFrag = c1B;
	c1AFrag = c1A;

	//c1Flag = c1;

	c2RFrag = c2R;
	c2GFrag = c2G;
	c2BFrag = c2B;
	c2AFrag = c2A;

	csRFrag = csR;
	csGFrag = csG;
	csBFrag = csB;
	csAFrag = csA;
	
}