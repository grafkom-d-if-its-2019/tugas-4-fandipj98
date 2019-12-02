precision mediump float;

attribute vec3 vPosition;
attribute vec3 vColor;

varying vec3 fColor;

uniform float theta;
uniform float scaleX;
uniform float scaleY;
uniform float x_huruf;
uniform float y_huruf;
uniform float z_huruf;
uniform int flag;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

void main() {
  fColor = vColor;
  vec3 pusat = vec3(x_huruf, y_huruf, z_huruf);

  mat4 matrixSkalasi = mat4(
    scaleX, 0.0, 0.0, 0.0,
    0.0, scaleY, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
  );

  mat4 matrixTranslation = mat4(
    0.7, 0.0, 0.0, 0.0,
    0.0, 0.7, 0.0, 0.0,
    0.0, 0.0, 0.7, 0.0,
    pusat, 1.0
  );

  if(flag == 0){
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(vPosition, 1.0);  
  }
  else if(flag == 1){
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * matrixTranslation * matrixSkalasi * vec4(vPosition, 1.0);
  }

}
