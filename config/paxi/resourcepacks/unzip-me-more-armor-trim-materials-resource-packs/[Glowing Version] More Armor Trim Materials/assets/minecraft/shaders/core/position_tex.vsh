#version 150

in vec3 Position;
in vec2 UV0;
in vec4 Color;

uniform vec4 FogColor;
uniform mat4 ModelViewMat;
uniform mat4 ProjMat;
uniform sampler2D Sampler0;

out vec2 texCoord0;

float frames = 12;

#moj_import <compare_float.glsl>

void main() {
    gl_Position = ProjMat * ModelViewMat * vec4(Position, 1.0);

    vec4 corners = texture(Sampler0,vec2(0.0))*255.0;

    //checks corner pixel colours
    if(corners == vec4(1.0,2.0,3.0,255.0))
    {
        //checks custom biome fog colours
        if(approxEquals(FogColor.rgb * 255.0, vec3(5.0,4.0,7.0), 1.0))
        {
            texCoord0 = vec2(UV0.x,UV0.y/frames+1/frames); //faewild uv shift
        }
        else if (approxEquals(FogColor.rgb * 255.0, vec3(215.0,255.0,250.0), 1.0)){
            texCoord0 = vec2(UV0.x,UV0.y/frames+2/frames); //brine uv shift
        }
        else if (approxEquals(FogColor.rgb * 255.0, vec3(30.0, 30.0, 30.0), 1.0)){
            texCoord0 = vec2(UV0.x,UV0.y/frames+3/frames); //dormis uv shift
        }
        else if (approxEquals(FogColor.rgb * 255.0, vec3(219.0,88.0,64.0), 1.0)){
            texCoord0 = vec2(UV0.x,UV0.y/frames+4/frames); //sanctum uv shift
        }
        else if (approxEquals(FogColor.rgb * 255.0, vec3(213.0, 220.0, 218.0), 1.0)){
            texCoord0 = vec2(UV0.x,UV0.y/frames+5/frames); //pax ceno uv shift
        }
        else if (approxEquals(FogColor.rgb * 255.0, vec3(143.0, 152.0, 255.0), 1.0)){
            texCoord0 = vec2(UV0.x,UV0.y/frames+6/frames); //brine water uv shift
        }
        else if (approxEquals(FogColor.rgb * 255.0, vec3(112.0, 12.0, 255.0), 1.0)){
            texCoord0 = vec2(UV0.x,UV0.y/frames+10/frames); //brine median uv shift
        }
        else if (approxEquals(FogColor.rgb * 255.0, vec3(19.0, 0.0, 14.0), 1.0)){
            texCoord0 = vec2(UV0.x,UV0.y/frames+11/frames); //brine void uv shift
        }
        else if (approxEquals(FogColor.rgb * 255.0, vec3(10.0,7.0,20.0), 1.0)){
            texCoord0 = vec2(UV0.x,UV0.y/frames+8/frames); //varskspace uv shift
        }
        else if (approxEquals(FogColor.rgb * 255.0, vec3(0.0, 13.0, 0.0), 1.0)){
            texCoord0 = vec2(UV0.x,UV0.y/frames+9/frames); //omnidrome uv shift
        }




        else if (approxEquals(FogColor.rgb * 255.0, vec3(2.0,1.0,3.0), 1.0)){
            texCoord0 = vec2(UV0.x,UV0.y/frames+1/frames); //faewild uv shift short
        }
        else if (approxEquals(FogColor.rgb * 255.0, vec3(207.0,255.0,245.0), 1.0)){
            texCoord0 = vec2(UV0.x,UV0.y/frames+2/frames); //brine uv shift short
        }
        else if (approxEquals(FogColor.rgb * 255.0, vec3(53.0, 53.0, 53.0), 1.0)){
            texCoord0 = vec2(UV0.x,UV0.y/frames+3/frames); //dormis uv shift short
        }
        else if (approxEquals(FogColor.rgb * 255.0, vec3(209.0,84.0,62.0), 1.0)){
            texCoord0 = vec2(UV0.x,UV0.y/frames+4/frames); //sanctum uv shift short
        }
        else if (approxEquals(FogColor.rgb * 255.0, vec3(212.0,221.0,220.0), 1.0)){
            texCoord0 = vec2(UV0.x,UV0.y/frames+5/frames); //pax ceno uv shift short
        }
        else if (approxEquals(FogColor.rgb * 255.0, vec3(8.0,6.0,18.0), 1.0)){
            texCoord0 = vec2(UV0.x,UV0.y/frames+8/frames); //varskspace uv shift short
        }
        else if (approxEquals(FogColor.rgb * 255.0, vec3(0.0, 12.0, 0.0), 1.0)){
            texCoord0 = vec2(UV0.x,UV0.y/frames+9/frames); //omnidrome uv shift short
        }
        else{
            texCoord0 = vec2(UV0.x,UV0.y/frames); //omnidrome uv shift
        }
    }
    else
    {
        texCoord0 = UV0;
    }
}