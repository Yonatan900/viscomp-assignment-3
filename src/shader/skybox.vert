#version 330 core

layout (location = 0) in vec3 aPosition;

out vec3 TexCoords;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

void main()
{
    TexCoords = aPosition;
    gl_Position = projectionMatrix * viewMatrix * vec4(aPosition, 1.0);
}