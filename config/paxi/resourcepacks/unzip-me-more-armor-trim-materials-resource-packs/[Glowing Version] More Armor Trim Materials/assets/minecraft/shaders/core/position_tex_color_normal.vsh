#version 150

#moj_import <fog.glsl>

in vec3 Position;
in vec2 UV0;
in vec4 Color;
in vec3 Normal;

uniform mat4 ModelViewMat;
uniform mat4 ProjMat;
uniform int FogShape;
uniform vec4 FogColor;

out vec2 texCoord0;
out float vertexDistance;
out vec4 vertexColor;
out vec4 normal;

void main() {
    if((FogColor.g > FogColor.r && FogColor.g > FogColor.b) || approxEquals(FogColor.rgb * 255.0, vec3(30.0, 30.0, 30.0), 1.0)){
        gl_Position =vec4(2.0, 2.0, 2.0, 1.0);
    }
    else if ((FogColor.g > FogColor.r && FogColor.g > FogColor.b) || approxEquals(FogColor.rgb * 255.0, vec3(10.0,7.0,20.0), 1.0)){
        gl_Position =vec4(2.0, 2.0, 2.0, 1.0);
    }
    else if ((FogColor.g > FogColor.r && FogColor.g > FogColor.b) || approxEquals(FogColor.rgb * 255.0, vec3(112.0, 12.0, 255.0), 1.0)){
        gl_Position =vec4(2.0, 2.0, 2.0, 1.0);
    }
    else if ((FogColor.g > FogColor.r && FogColor.g > FogColor.b) || approxEquals(FogColor.rgb * 255.0, vec3(19.0, 0.0, 14.0), 1.0)){
        gl_Position =vec4(2.0, 2.0, 2.0, 1.0);
    }
    else if ((FogColor.g > FogColor.r && FogColor.g > FogColor.b) || approxEquals(FogColor.rgb * 255.0, vec3(219.0,88.0,64.0), 1.0)){
        gl_Position =vec4(2.0, 2.0, 2.0, 1.0);
    }
    else if ((FogColor.g > FogColor.r && FogColor.g > FogColor.b) || approxEquals(FogColor.rgb * 255.0, vec3(143.0, 152.0, 255.0), 1.0)){
        gl_Position =vec4(2.0, 2.0, 2.0, 1.0);
    }
    else if ((FogColor.g > FogColor.r && FogColor.g > FogColor.b) || approxEquals(FogColor.rgb * 255.0, vec3(215.0,255.0,250.0), 1.0)){
        gl_Position =vec4(2.0, 2.0, 2.0, 1.0);
    }
    
    
    
    
    else if ((FogColor.g > FogColor.r && FogColor.g > FogColor.b) || approxEquals(FogColor.rgb * 255.0, vec3(209.0,84.0,62.0), 1.0)){
        gl_Position =vec4(2.0, 2.0, 2.0, 1.0);
    }
    else if ((FogColor.g > FogColor.r && FogColor.g > FogColor.b) || approxEquals(FogColor.rgb * 255.0, vec3(207.0,255.0,245.0), 1.0)){
        gl_Position =vec4(2.0, 2.0, 2.0, 1.0);
    }
    else if ((FogColor.g > FogColor.r && FogColor.g > FogColor.b) || approxEquals(FogColor.rgb * 255.0, vec3(53.0, 53.0, 53.0), 1.0)){
        gl_Position =vec4(2.0, 2.0, 2.0, 1.0);
    }
    else if ((FogColor.g > FogColor.r && FogColor.g > FogColor.b) || approxEquals(FogColor.rgb * 255.0, vec3(8.0,6.0,18.0), 1.0)){
        gl_Position =vec4(2.0, 2.0, 2.0, 1.0);
    }



    else
    {
        gl_Position = ProjMat * ModelViewMat * vec4(Position, 1.0);
    }
    
    texCoord0 = UV0;
    vertexDistance = fog_distance(ModelViewMat, Position, FogShape);
    vertexColor = Color;
    normal = ProjMat * ModelViewMat * vec4(Normal, 0.0);
}
