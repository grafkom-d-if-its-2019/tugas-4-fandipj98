(function() {

  var canvas, gl, program;
  var scaleXUniformLocation, scaleX, scaleYUniformLocation, scaleY, melebar;
  var thetaUniformLocation, theta, thetaSpeed, mmLoc, mm, vmLoc, vm, pmLoc, pm, camera, axis, x, y, z;
  var xHurufLocation, x_huruf, yHurufLocation, y_huruf, zHurufLocation, z_huruf, x_arah, y_arah, z_arah;
  var flag, flagUniformLocation;

  var verticesKubus = [];
  var cubePoints = [
    [ -0.8, -0.8,  0.8 ],
    [ -0.8,  0.8,  0.8 ],
    [  0.8,  0.8,  0.8 ],
    [  0.8, -0.8,  0.8 ],
    [ -0.8, -0.8, -0.8 ],
    [ -0.8,  0.8, -0.8 ],
    [  0.8,  0.8, -0.8 ],
    [  0.8, -0.8, -0.8 ]
  ];
  var cubeColors = [
    [],
    [0.0, 1.0, 1.0], // biru hijau
    [0.0, 1.0, 0.5], // hijau biru
    [0.0, 1.0, 0.5], // hijau biru
    [0.0, 1.0, 0.5], // hijau biru
    [0.0, 1.0, 0.5], // hijau biru
    [0.0, 1.0, 0.5], // hijau biru
    []
  ];
  function quadKubus(a, b, c, d) {
    var indices = [a, b, c, d, a];
    for (var i=0; i < indices.length; i++) {
      for (var j=0; j < 3; j++) {
        verticesKubus.push(cubePoints[indices[i]][j]);
      }
      for (var j=0; j < 3; j++) {
        verticesKubus.push(cubeColors[a][j]);
      }
    }
  }

  var verticesHuruf = new Float32Array([
    //x,y,z           //r,g,b
    0.2, 0.3, 0.0,   0.0, 0.0, 1.0,
    0.2, 0.2, 0.0,   0.0, 1.0, 0.0,
    -0.2, 0.3, 0.0,   0.0, 1.0, 1.0,
    -0.1, 0.2, 0.0,   1.0, 0.0, 0.0,
    -0.2, 0.2, 0.0,   1.0, 0.0, 1.0,
    -0.1, 0.1, 0.0,   1.0, 1.0, 0.0,
    -0.2, 0.1, 0.0,   1.0, 1.0, 1.0,
    0.2, 0.1, 0.0,   0.0, 1.0, 1.0,
    0.2, 0.0, 0.0,   0.0, 1.0, 0.0,
    -0.1, 0.0, 0.0,   1.0, 1.0, 0.0,
    -0.1, 0.1, 0.0,   1.0, 1.0, 0.0,
    -0.2, 0.1, 0.0,   1.0, 1.0, 1.0,
    -0.1, -0.3, 0.0,   1.0, 0.0, 1.0,
    -0.2, -0.3, 0.0,   1.0, 1.0, 0.0
  ]);

  glUtils.SL.init({ callback: function() { main(); }});
  
  function main() {
    // Register Callbacks
    window.addEventListener('resize', resizer);

    // Get canvas element and check if WebGL enabled
    canvas = document.getElementById("glcanvas");
    gl = glUtils.checkWebGL(canvas);

    initGlSize();

    //initialize the shaders and program
    var vertexShader = glUtils.getShader(gl, gl.VERTEX_SHADER, glUtils.SL.Shaders.v1.vertex);
    var fragmentShader = glUtils.getShader(gl, gl.FRAGMENT_SHADER, glUtils.SL.Shaders.v1.fragment);
    program = glUtils.createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);
    
    quadKubus(1, 0, 3, 2); // Depan
    quadKubus(2, 3, 7, 6); // Kanan
    quadKubus(6, 5, 1, 2); // Atas
    quadKubus(5, 4, 0, 1); // Kiri
    quadKubus(4, 5, 6, 7); // Belakang
    quadKubus(4, 7, 3, 0); // Bawah

    resizer();
    draw();
  
  }

  function initGlSize() {
    var width = canvas.getAttribute("width"), height = canvas.getAttribute("height");
    // Fullscreen if not set
    if (width) {
      gl.maxWidth = width;
    }
    if (height) {
      gl.maxHeight = height;
    }
  }

  function animasiTranslasi(){
    if (x_huruf >= (0.8 - Math.abs(0.2 * 0.7 * scaleX))) x_arah = -1.0;
    else if (x_huruf <= (-0.8 + Math.abs(0.2 * 0.7 * scaleX))) x_arah = 1.0;
    x_huruf += 0.004 * x_arah;
    gl.uniform1f(xHurufLocation, x_huruf);
    
    if (y_huruf >= (0.8 - (0.3 * 0.7))) y_arah = -1.0;
    else if (y_huruf <= (-0.8 + (0.3 * 0.7))) y_arah = 1.0;
    y_huruf += 0.005 * y_arah;
    gl.uniform1f(yHurufLocation, y_huruf);
    
    if (z_huruf >= 0.8) z_arah = -1.0;
    else if (z_huruf <= -0.8) z_arah = 1.0;
    z_huruf += 0.006 * z_arah;
    gl.uniform1f(zHurufLocation, z_huruf);
  }

  function render(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
    theta += thetaSpeed;
    if (axis[z]) glMatrix.mat4.rotateZ(mm, mm, thetaSpeed);
    if (axis[y]) glMatrix.mat4.rotateY(mm, mm, thetaSpeed);
    if (axis[x]) glMatrix.mat4.rotateX(mm, mm, thetaSpeed);
    gl.uniformMatrix4fv(mmLoc, false, mm);

    glMatrix.mat4.lookAt(vm,
      [camera.x, camera.y, camera.z], // di mana posisi kamera (posisi)
      [0.0, 0.0, -2.0], // ke mana kamera menghadap (vektor)
      [0.0, 1.0, 0.0]  // ke mana arah atas kamera (vektor)
    );
    gl.uniformMatrix4fv(vmLoc, false, vm);
    
    var nKubus = initBuffersKubus(gl, verticesKubus);
    if(nKubus < 0){
      console.log('Failed to set the positions of the verticesKubus');
      return;
    }

    flag = 0;
    gl.uniform1i(flagUniformLocation, flag);
    gl.drawArrays(gl.LINE_STRIP, 0, nKubus);
            
    //animasi refleksi
    if (scaleX >= 1.0) melebar = -1.0;
    else if (scaleX <= -1.0) melebar = 1.0;
    scaleX += 0.0056 * melebar;
    gl.uniform1f(scaleXUniformLocation, scaleX);

    //animasi translasi
    animasiTranslasi();

    var nHuruf = initBuffers(gl,verticesHuruf);
    
    if(nHuruf < 0){
        console.log('Failed to set the positions of the verticesHuruf');
        return;
    }

    flag = 1;
    gl.uniform1i(flagUniformLocation, flag);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, nHuruf);

    requestAnimationFrame(render);
  }

  function draw(){

    // Membuat sambungan untuk uniform
    thetaUniformLocation = gl.getUniformLocation(program, 'theta');
    theta = 0;
    thetaSpeed = 0.0;
    axis = [true, true, true];
    x = 0;
    y = 1;
    z = 2;

    // Definisi untuk matriks model
    mmLoc = gl.getUniformLocation(program, 'modelMatrix');
    mm = glMatrix.mat4.create();
    glMatrix.mat4.translate(mm, mm, [0.0, 0.0, -2.0]);

    // Definisi untuk matrix view dan projection
    vmLoc = gl.getUniformLocation(program, 'viewMatrix');
    vm = glMatrix.mat4.create();
    pmLoc = gl.getUniformLocation(program, 'projectionMatrix');
    pm = glMatrix.mat4.create();

    camera = {x: 0.0, y: 0.0, z:0.0};
    glMatrix.mat4.perspective(pm,
      glMatrix.glMatrix.toRadian(90), // fovy dalam radian
      canvas.width/canvas.height,     // aspect ratio
      0.5,  // near
      10.0, // far  
    );
    gl.uniformMatrix4fv(pmLoc, false, pm);

    xHurufLocation = gl.getUniformLocation(program, 'x_huruf');
    x_huruf = 0.0;
    gl.uniform1f(xHurufLocation, x_huruf);

    yHurufLocation = gl.getUniformLocation(program, 'y_huruf');
    y_huruf = 0.0;
    gl.uniform1f(yHurufLocation, y_huruf);

    zHurufLocation = gl.getUniformLocation(program, 'z_huruf');
    z_huruf = 0.0;
    gl.uniform1f(zHurufLocation, z_huruf);
    
    scaleXUniformLocation = gl.getUniformLocation(program, 'scaleX');
    scaleX = 1.0;
    gl.uniform1f(scaleXUniformLocation, scaleX);

    scaleYUniformLocation = gl.getUniformLocation(program, 'scaleY');
    scaleY = 1.0;
    gl.uniform1f(scaleYUniformLocation, scaleY);

    flagUniformLocation = gl.getUniformLocation(program, 'flag');
    flag = 0;
    gl.uniform1i(flagUniformLocation, flag);

    melebar = 1.0;
    x_arah = 1.0;
    y_arah = 1.0;
    z_arah = 1.0;

    gl.clearColor(10/255, 50/255, 50/255, 1.0);
    gl.enable(gl.DEPTH_TEST);
    render();

  }

  function initBuffers(gl,vertices) {
    // The number of vertices
    var n = vertices.length/6;
   
    // Create a buffer object
    var vertexBufferObject = gl.createBuffer();
    if (!vertexBufferObject) {
      console.log('Failed to create the buffer object');
      return -1;
    }

    // Bind the buffer object to target
    // target: ARRAY_BUFFER, ELEMENT_ARRAY_BUFFER
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
    // Write date into the buffer object
    // usage: STATIC_DRAW, STREAM_DRAW, DYNAMIC_DRAW
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, 'vPosition');
    if (vPosition < 0) {
      console.log('Failed to get the storage location of vPosition');
      return -1;
    }
    
    var vColor = gl.getAttribLocation(program, 'vColor');
    if (vColor < 0) {
      console.log('Failed to get the storage location of vColor');
      return -1;
    }

    // Assign the buffer object to vPosition variable
    gl.vertexAttribPointer(
      vPosition,   //variable yang memegang posisis attribute di shader
      3,          // jumlah elemen per atribut vPosition
      gl.FLOAT,   // tipe data atribut
      gl.FALSE,
      6 * Float32Array.BYTES_PER_ELEMENT, // ukuran byte tiap vertex (overall)
      0                                    // offset dari posisi elemen di array
    );
    
    gl.vertexAttribPointer(
      vColor,
      3,
      gl.FLOAT,
      gl.FALSE,
      6 * Float32Array.BYTES_PER_ELEMENT,
      3 * Float32Array.BYTES_PER_ELEMENT
    );

    // Enable the assignment to vPosition variable      
    gl.enableVertexAttribArray(vPosition);
    // Enable the assignment to vPosition variable      
    gl.enableVertexAttribArray(vColor);
  
    return n;
  }

  function initBuffersKubus(gl,vertices) {
    // The number of vertices
    var n = vertices.length/6;
   
    // Create a buffer object
    var vertexBufferObject = gl.createBuffer();
    if (!vertexBufferObject) {
      console.log('Failed to create the buffer object');
      return -1;
    }

    // Bind the buffer object to target
    // target: ARRAY_BUFFER, ELEMENT_ARRAY_BUFFER
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
    // Write date into the buffer object
    // usage: STATIC_DRAW, STREAM_DRAW, DYNAMIC_DRAW
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, 'vPosition');
    if (vPosition < 0) {
      console.log('Failed to get the storage location of vPosition');
      return -1;
    }
    
    var vColor = gl.getAttribLocation(program, 'vColor');
    if (vColor < 0) {
      console.log('Failed to get the storage location of vColor');
      return -1;
    }

    gl.vertexAttribPointer(
      vPosition,    // variabel yang memegang posisi attribute di shader
      3,            // jumlah elemen per atribut
      gl.FLOAT,     // tipe data atribut
      gl.FALSE, 
      6 * Float32Array.BYTES_PER_ELEMENT, // ukuran byte tiap verteks (overall) 
      0                                   // offset dari posisi elemen di array
    );
    gl.vertexAttribPointer(
      vColor,
      3,
      gl.FLOAT,
      gl.FALSE,
      6 * Float32Array.BYTES_PER_ELEMENT,
      3 * Float32Array.BYTES_PER_ELEMENT
    );

    // Enable the assignment to vPosition variable      
    gl.enableVertexAttribArray(vPosition);
    // Enable the assignment to vColor variable      
    gl.enableVertexAttribArray(vColor);
  
    return n;
  }

  function onKeyDown(event) {
    if (event.keyCode == 189) thetaSpeed -= 0.01;       // key '-' google chrome
    else if (event.keyCode == 187) thetaSpeed += 0.01;  // key '='
    // if (event.keyCode == 173) thetaSpeed -= 0.01;       // key '-' firefox mozilla
    // else if (event.keyCode == 61) thetaSpeed += 0.01;  // key '='
    else if (event.keyCode == 48) thetaSpeed = 0;       // key '0'
    if (event.keyCode == 88) axis[x] = !axis[x];        // key 'x'
    if (event.keyCode == 89) axis[y] = !axis[y];        // key 'y'
    if (event.keyCode == 90) axis[z] = !axis[z];        // key 'z'
    if (event.keyCode == 190) camera.z -= 0.1;          // key '/'
    else if (event.keyCode == 191) camera.z += 0.1;     // key '.'
    if (event.keyCode == 37) camera.x -= 0.1;           // key kiri
    else if (event.keyCode == 39) camera.x += 0.1;      // key kanan
    if (event.keyCode == 38) camera.y += 0.1;           // key atas 
    else if (event.keyCode == 40) camera.y -= 0.1;      // key Bawah
  }
  document.addEventListener('keydown', onKeyDown);
  
  //fungsi untuk meresize ukuran canvas agar square
  function resizer(){
    /**
    * Callback for when the screen is resized
    **/
    // Scaling for a square!
    var width = canvas.getAttribute("width"), height = canvas.getAttribute("height");
    // Fullscreen if not set
    if (!width || width < 0) {
        canvas.width = window.innerWidth;
        gl.maxWidth = window.innerWidth;
    }
    if (!height || height < 0) {
        canvas.height = window.innerHeight;
        gl.maxHeight = window.innerHeight;
    }

    // scale down for smaller size
    var min = Math.min.apply(Math, [gl.maxWidth, gl.maxHeight, window.innerWidth, window.innerHeight]);
    canvas.width = min;
    canvas.height = min;

    // viewport!
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  // Register window and document callbacks
  // Resize the canvas to fill browser window dynamically
  window.addEventListener('resize',resizer);

})();