#version 330 core

struct Light_Directional
{
    vec3 direction;

    vec3 ambient;
    vec3 color;
};

struct Light_Spot
{
    vec3 position;
    vec3 direction;

    vec3 color;

    float constant;
    float linear;
    float quadratic;

    float cutoff;

    bool enabled;
};

struct Material
{
    sampler2D map_ambient;
    sampler2D map_normal;
    sampler2D map_diffuse;
    sampler2D map_specular;

    float shininess;
};
uniform Material uMaterial;

in vec3 tNormal;
in vec3 tFragPos;

in vec2 tUV;

out vec4 fragColor;

uniform vec3 uViewPos;
uniform Light_Directional uLightSun;
uniform Light_Spot uLightSpots[4];


vec3 brdf_blinn_phong(vec3 lightDir, vec3 viewDir, vec3 normal, vec3 diffuse, vec3 specular, float shininess)
{
    vec3 halfwayDir = normalize(lightDir + viewDir);
    float diff = max(dot(normal, lightDir), 0.0);
    float spec = pow(max(dot(normal, halfwayDir), 0.0), shininess);

    return (diff * diffuse) + (spec * specular);
}

void main(void)
{
    vec3 viewDir = normalize(uViewPos - tFragPos);
    vec3 normal = normalize(tNormal);

    vec3 diffuse = texture(uMaterial.map_diffuse, tUV).rgb;
    vec3 specular = texture(uMaterial.map_specular, tUV).rgb;
    vec3 ambient = texture(uMaterial.map_ambient, tUV).rgb;


    vec3 illuminance = uLightSun.ambient * diffuse * ambient;

    for(int i = 0; i < 4; i++)
    {
        if(uLightSpots[i].enabled == false) continue;

        vec3 lightDir = normalize(uLightSpots[i].position - tFragPos);
        float distance = length(uLightSpots[i].position - tFragPos);
        float attenuation = 1.0 / (uLightSpots[i].constant + uLightSpots[i].linear * distance + uLightSpots[i].quadratic * (distance * distance));

        float angle = acos(dot(-lightDir, uLightSpots[i].direction));
        float intensity = (angle < uLightSpots[i].cutoff) ? 1.0 : 0.0;

        illuminance += uLightSpots[i].color * intensity  * attenuation * brdf_blinn_phong(lightDir, viewDir, normal, diffuse, specular, uMaterial.shininess);
    }

    illuminance += uLightSun.color * brdf_blinn_phong(-normalize(uLightSun.direction), viewDir, normal, diffuse, specular, uMaterial.shininess);

    fragColor = vec4(illuminance, 1.0);
}
