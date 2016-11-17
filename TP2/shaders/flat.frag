#ifdef GL_ES
precision highp float;
#endif

struct lightProperties {
    vec4 position;                  
    vec4 ambient;                   
    vec4 diffuse;                   
    vec4 specular;                  
    vec4 half_vector;
    vec3 spot_direction;            
    float spot_exponent;            
    float spot_cutoff;              
    float constant_attenuation;     
    float linear_attenuation;       
    float quadratic_attenuation;    
    bool enabled;                   
};

#define NUMBER_OF_LIGHTS 8
uniform lightProperties uLight[NUMBER_OF_LIGHTS];

uniform sampler2D uSampler;

varying vec2 vTextureCoord;
varying vec2 vertexPositionFrag;
varying float selectedUFrag;
varying float selectedVFrag;

varying float c1RFrag;
varying float c1GFrag;
varying float c1BFrag;
varying float c1AFrag;

//varying vec4 c1Flag;

varying float c2RFrag;
varying float c2GFrag;
varying float c2BFrag;
varying float c2AFrag;

varying float csRFrag;
varying float csGFrag;
varying float csBFrag;
varying float csAFrag;

void main() {
    vec4 color = texture2D(uSampler, vTextureCoord);

    vec2 myMod = mod(vertexPositionFrag, 2.0);
    if((floor(myMod.x) == 0.0 && floor(myMod.y) == 0.0) || (floor(myMod.x) == 1.0 && floor(myMod.y) == 1.0))
        color = vec4(0, 0, 0, 1);

    vec4 filter;
    if(ivec2(vertexPositionFrag) == ivec2(selectedUFrag, selectedVFrag)) {
        color = vec4(c1RFrag, c1GFrag, c1BFrag, c1AFrag);
    }

    /*if(ivec2(vertexPositionFrag) == ivec2(selectedUFrag, selectedVFrag) || ivec2(vertexPositionFrag) == ivec2(selectedUFrag + 1.0, selectedVFrag) ||
        ivec2(vertexPositionFrag) == ivec2(selectedUFrag, selectedVFrag + 1.0) || ivec2(vertexPositionFrag) == ivec2(selectedUFrag + 1.0, selectedVFrag + 1.0))
        color = vec4(1, 0, 0, 1);*/

    gl_FragColor = color;
}