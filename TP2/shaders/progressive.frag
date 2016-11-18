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

varying vec2 vTextureCoord;//Variavel recebida do vertex shader
varying float newY;

void main( void ) {

    vec4 texel = texture2D(uSampler,vTextureCoord);
	
    gl_FragColor = vec4(texel.rgb * clamp(newY,0.3,0.6),texel.a);
}