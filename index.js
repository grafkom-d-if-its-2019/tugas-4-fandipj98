(function() {

  var canvas, gl, program;
  var scaleXUniformLocation, scaleX, scaleYUniformLocation, scaleY, melebar;
  var thetaUniformLocation, theta, thetaSpeed, mmLoc, mm, vmLoc, vm, pmLoc, pm, camera, axis, x, y, z;
  var xHurufLocation, x_huruf, yHurufLocation, y_huruf, zHurufLocation, z_huruf, x_arah, y_arah, z_arah;
  var dcLoc, dc, ddLoc, dd, acLoc, ac, nmLoc;
  var flag, flagUniformLocation, fFlag, fFlagUniformLocation;
  var theta, phi;

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
  var cubeNormals = [
    [],
    [  0.0,  0.0,  1.0 ], // depan
    [  1.0,  0.0,  0.0 ], // kanan
    [  0.0, -1.0,  0.0 ], // bawah
    [  0.0,  0.0, -1.0 ], // belakang
    [ -1.0,  0.0,  0.0 ], // kiri
    [  0.0,  1.0,  0.0 ], // atas
    []
  ];
  function quadKubus(a, b, c, d) {
    var indices = [a, b, c, a, c, d];
    for (var i=0; i < indices.length; i++) {
      for (var j=0; j < 3; j++) {
        verticesKubus.push(cubePoints[indices[i]][j]);
      }
      for (var j=0; j < 3; j++) {
        verticesKubus.push(cubeColors[a][j]);
      }
      for (var j=0; j < 3; j++) {
        verticesKubus.push(-1*cubeNormals[a][j]);
      }
      switch (indices[i]) {
        case a:
          verticesKubus.push((a-2)*0.125);
          verticesKubus.push(0.0);
          break;
        case b:
          verticesKubus.push((a-2)*0.125);
          verticesKubus.push(1.0);
          break;
        case c:
          verticesKubus.push((a-1)*0.125);
          verticesKubus.push(1.0);
          break;
        case d:
          verticesKubus.push((a-1)*0.125);
          verticesKubus.push(0.0);
          break;
      
        default:
          break;
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

  function initTexture() {
    // Uniform untuk tekstur
    var sampler0Loc = gl.getUniformLocation(program, 'sampler0');
    gl.uniform1i(sampler0Loc, 0);

    // Create a texture.
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Fill the texture with a 1x1 blue pixel.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                  new Uint8Array([0, 0, 255, 255]));

    // Asynchronously load an image
    var image = new Image();
    image.src = "images/tugas4_grafkom.jpg";
    image.addEventListener('load', function() {
      // Now that the image has loaded make copy it to the texture.
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.generateMipmap(gl.TEXTURE_2D);
    });
  }

  function animasiTranslasi(){
    if (x_huruf >= (0.8 - Math.abs(0.2 * 0.7 * scaleX))) x_arah = -1.0;
    else if (x_huruf <= (-0.8 + Math.abs(0.2 * 0.7 * scaleX))) x_arah = 1.0;
    x_huruf += 0.009 * x_arah;
    gl.uniform1f(xHurufLocation, x_huruf);
    
    if (y_huruf >= (0.8 - (0.3 * 0.7))) y_arah = -1.0;
    else if (y_huruf <= (-0.8 + (0.3 * 0.7))) y_arah = 1.0;
    y_huruf += 0.010 * y_arah;
    gl.uniform1f(yHurufLocation, y_huruf);
    
    if (z_huruf >= (0.8 - Math.abs(0.2 * 0.7 * scaleX))) z_arah = -1.0;
    else if (z_huruf <= (-0.8 + Math.abs(0.2 * 0.7 * scaleX))) z_arah = 1.0;
    z_huruf += 0.011 * z_arah;
    gl.uniform1f(zHurufLocation, z_huruf);
  }

  function render(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
    theta += thetaSpeed;
    if (axis[z]) glMatrix.mat4.rotateZ(mm, mm, thetaSpeed);
    if (axis[y]) glMatrix.mat4.rotateY(mm, mm, thetaSpeed);
    if (axis[x]) glMatrix.mat4.rotateX(mm, mm, thetaSpeed);
    gl.uniformMatrix4fv(mmLoc, false, mm);

    // Perhitungan modelMatrix untuk vektor normal
    var nm = glMatrix.mat3.create();
    glMatrix.mat3.normalFromMat4(nm, mm);
    gl.uniformMatrix3fv(nmLoc, false, nm);

    glMatrix.mat4.lookAt(vm,
      [camera.x, camera.y, camera.z], // di mana posisi kamera (posisi)
      [0.0, 0.0, -2.0], // ke mana kamera menghadap (vektor)
      [0.0, 1.0, 0.0]  // ke mana arah atas kamera (vektor)
    );
    gl.uniformMatrix4fv(vmLoc, false, vm);

    // Interaksi mouse

    if (!drag) {
      dX *= AMORTIZATION, dY*=AMORTIZATION;
      theta+=dX, phi+=dY;
    }

    mm[0] = 1, mm[1] = 0, mm[2] = 0,
    mm[3] = 0,

    mm[4] = 0, mm[5] = 1, mm[6] = 0,
    mm[7] = 0,

    mm[8] = 0, mm[9] = 0, mm[10] = 1,
    mm[11] = 0,

    mm[12] = 0, mm[13] = 0, mm[14] = 0,
    mm[15] = 1;

    glMatrix.mat4.translate(mm, mm, [0.0, 0.0, -2.0]);

    rotateY(mm, theta);
    rotateX(mm, phi);
        
    var nKubus = initBuffersKubus(gl, verticesKubus);
    if(nKubus < 0){
      console.log('Failed to set the positions of the verticesKubus');
      return;
    }

    fFlag = 0;
    flag = 0;
    gl.uniform1i(flagUniformLocation, flag);
    gl.uniform1i(fFlagUniformLocation, fFlag);
    gl.drawArrays(gl.TRIANGLES, 0, nKubus);

    //animasi refleksi
    if (scaleX >= 1.0) melebar = -1.0;
    else if (scaleX <= -1.0) melebar = 1.0;
    
    scaleX += 0.0056 * melebar;
    
    gl.uniform1f(scaleXUniformLocation, scaleX);

    //animasi translasi
    animasiTranslasi();

    // arah cahaya berdasarkan koordinat huruf
    dd = glMatrix.vec3.fromValues(x_huruf, y_huruf, z_huruf);  // xyz
    gl.uniform3fv(ddLoc, dd);

    var nHuruf = initBuffers(gl,verticesHuruf);
    
    if(nHuruf < 0){
      console.log('Failed to set the positions of the verticesHuruf');
      return;
    }

    fFlag = 1;
    flag = 1;
    gl.uniform1i(flagUniformLocation, flag);
    gl.uniform1i(fFlagUniformLocation, fFlag);
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

    fFlagUniformLocation = gl.getUniformLocation(program, 'fFlag');
    fFlag = 0;
    gl.uniform1i(fFlagUniformLocation, fFlag);

    melebar = 1.0;
    x_arah = 1.0;
    y_arah = 1.0;
    z_arah = 1.0;

    // Uniform untuk pencahayaan
    dcLoc = gl.getUniformLocation(program, 'diffuseColor');
    dc = glMatrix.vec3.fromValues(1.0, 1.0, 1.0);  // rgb
    gl.uniform3fv(dcLoc, dc);
    
    ddLoc = gl.getUniformLocation(program, 'diffusePosition');

    acLoc = gl.getUniformLocation(program, 'ambientColor');
    ac = glMatrix.vec3.fromValues(0.17, 0.40, 0.56);
    gl.uniform3fv(acLoc, ac);

    // Uniform untuk modelMatrix vektor normal
    nmLoc = gl.getUniformLocation(program, 'normalMatrix');

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

    gl.enableVertexAttribArray(vPosition);
    gl.enableVertexAttribArray(vColor);
  
    return n;
  }

  function initBuffersKubus(gl,vertices) {
    // The number of vertices
    var n = vertices.length/11;
   
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

    var vNormal = gl.getAttribLocation(program, 'vNormal');
    if (vNormal < 0) {
      console.log('Failed to get the storage location of vNormal');
      return -1;
    }

    var vTexCoord = gl.getAttribLocation(program, 'vTexCoord');
    if (vTexCoord < 0) {
      console.log('Failed to get the storage location of vTexCoord');
      return -1;
    }

    // Assign the buffer object to vPosition variable
    gl.vertexAttribPointer(
      vPosition,   //variable yang memegang posisis attribute di shader
      3,          // jumlah elemen per atribut vPosition
      gl.FLOAT,   // tipe data atribut
      gl.FALSE,
      11 * Float32Array.BYTES_PER_ELEMENT, // ukuran byte tiap vertex (overall)
      0                                    // offset dari posisi elemen di array
    );

    gl.vertexAttribPointer(
      vNormal,
      3,
      gl.FLOAT,
      gl.FALSE,
      11 * Float32Array.BYTES_PER_ELEMENT,
      6 * Float32Array.BYTES_PER_ELEMENT
    );

    gl.vertexAttribPointer(
      vTexCoord,
      2,
      gl.FLOAT,
      gl.FALSE,
      11 * Float32Array.BYTES_PER_ELEMENT,
      9 * Float32Array.BYTES_PER_ELEMENT
    );

    gl.enableVertexAttribArray(vPosition);
    gl.enableVertexAttribArray(vNormal);
    gl.enableVertexAttribArray(vTexCoord);
  
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

  /*================= Mouse events ======================*/

  var AMORTIZATION = 0.56;
  var drag = false;
  var old_x, old_y;
  var dX = 0, dY = 0;
  theta = 0;
  phi = 0;

  var mouseDown = function(e) {
    drag = true;
    old_x = e.pageX, old_y = e.pageY;
    e.preventDefault();
    return false;
  };

  var mouseUp = function(e){
    drag = false;
  };

  var mouseMove = function(e) {
    if (!drag) return false;
    dX = (e.pageX-old_x)*2*Math.PI/canvas.width,
    dY = (e.pageY-old_y)*2*Math.PI/canvas.height;
    theta+= dX;
    phi+=dY;
    old_x = e.pageX, old_y = e.pageY;
    e.preventDefault();
  };

  document.addEventListener("mousedown", mouseDown, false);
  document.addEventListener("mouseup", mouseUp, false);
  document.addEventListener("mouseout", mouseUp, false);
  document.addEventListener("mousemove", mouseMove, false);

  /*=========================rotation================*/

  function rotateX(m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv1 = m[1], mv5 = m[5], mv9 = m[9];

    m[1] = m[1]*c-m[2]*s;
    m[5] = m[5]*c-m[6]*s;
    m[9] = m[9]*c-m[10]*s;

    m[2] = m[2]*c+mv1*s;
    m[6] = m[6]*c+mv5*s;
    m[10] = m[10]*c+mv9*s;
  }

  function rotateY(m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv0 = m[0], mv4 = m[4], mv8 = m[8];

    m[0] = c*m[0]+s*m[2];
    m[4] = c*m[4]+s*m[6];
    m[8] = c*m[8]+s*m[10];

    m[2] = c*m[2]-s*mv0;
    m[6] = c*m[6]-s*mv4;
    m[10] = c*m[10]-s*mv8;
  }

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

    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  // Register window and document callbacks
  // Resize the canvas to fill browser window dynamically
  window.addEventListener('resize',resizer);

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
    
    quadKubus(2, 3, 7, 6);
    quadKubus(3, 0, 4, 7);
    quadKubus(4, 5, 6, 7);
    quadKubus(5, 4, 0, 1);
    quadKubus(6, 5, 1, 2);
    initTexture();

    resizer();
    draw();
  
  }

})();