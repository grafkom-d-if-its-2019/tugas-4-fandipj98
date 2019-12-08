precision mediump float;

varying vec3 fColor;
varying vec3 fNormal;
varying vec3 fPosition;
varying vec2 fTexCoord;

uniform vec3 diffuseColor;
uniform vec3 diffusePosition; // Titik sumber cahaya
uniform vec3 ambientColor;
uniform int fFlag;

uniform sampler2D sampler0;

void main() {
  if (fFlag == 0){
    vec3 normal = normalize(fNormal);

    // Arah cahaya = lokasi titik verteks - lokasi titik sumber cahaya
    vec3 diffuseDirection = normalize(diffusePosition - fPosition);
    // Nilai intensitas cahaya = 
    //  nilai COS sudut antara arah datang cahaya dengan arah vektor normal =
    //  dot product dari vektor arah datang cahaya • arah vektor normal
    float normalDotLight = max(dot(normal, diffuseDirection), 0.0);

    // specular light
    float specularPower = 120.0;
    float specular = 0.0;

    if (normalDotLight > 0.0) {
      // viewing vector
      vec3 viewVec = vec3(0,0,1.0);

      // reflective vector
      vec3 reflectVec = reflect(-diffuseDirection, normal);

      // determine the specularFactor based on the dot product of viewing and reflective,
      // taking at least a minimum of 0.0
      float specularFactor = max(dot(reflectVec, viewVec), 0.0);
      specular = pow(specularFactor, specularPower);
    }

    // Untuk mendapatkan nilai warna (RGBA) dari tekstur
    vec4 textureColor = texture2D(sampler0, fTexCoord);

    vec3 diffuse = diffuseColor * textureColor.rgb * normalDotLight;
    vec3 ambient = ambientColor * textureColor.rgb;

    gl_FragColor = vec4(diffuse + ambient + specular, textureColor.a);
  }
  else if (fFlag == 1){
    gl_FragColor = vec4(fColor, 1.0);
  }
 
}
