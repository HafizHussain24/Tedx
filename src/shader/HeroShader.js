// =====================================================================
//  TEDx Hero Shader Engine
//  Exact reproduction of the multi-pass shader from raviklaassens.com
//  Pipeline:
//    Pass 1: Portrait + Depth Parallax Occlusion Raymarching -> FBO A
//    Pass 2: Warped FBM Flame/Fluid Drift Distortion -> FBO B
//    Pass 3: PCG2D Fibonacci Dither & Film Grain -> Screen
// =====================================================================

const VS_PASS = `#version 300 es
precision highp float;
layout(location=0) in vec2 p;
layout(location=1) in vec2 t;
out vec2 vUV;
void main() {
  vUV = t;
  gl_Position = vec4(p, 0.0, 1.0);
}`;

// 3D Perspective Rotation Quad Vertex Shader (Pass 1)
const VS_IMAGE = `#version 300 es
precision highp float;
layout(location=0) in vec2 p;
layout(location=1) in vec2 t;

uniform vec2 uMousePos;
uniform float uTiltAmount;
uniform vec2 uShift;

out vec2 vUV;

void main() {
  vUV = t;

  // 3D rotation angles around center based on mouse position
  float angleX = (uMousePos.y - 0.5) * uTiltAmount;
  float angleY = (0.5 - uMousePos.x) * uTiltAmount;

  mat4 rotX = mat4(
    1.0, 0.0, 0.0, 0.0,
    0.0, cos(angleX), -sin(angleX), 0.0,
    0.0, sin(angleX),  cos(angleX), 0.0,
    0.0, 0.0, 0.0, 1.0
  );

  mat4 rotY = mat4(
     cos(angleY), 0.0, sin(angleY), 0.0,
     0.0,         1.0, 0.0,         0.0,
    -sin(angleY), 0.0, cos(angleY), 0.0,
     0.0,         0.0, 0.0,         1.0
  );

  vec4 pos = vec4(p, 0.0, 1.0);
  pos = rotX * rotY * pos;

  // 2D hover shift translation
  pos.xy += uShift;

  // Perspective projection divide (focal distance ≈ 2.5)
  float focal = 2.5;
  float zDist = max(0.1, focal - pos.z);
  pos.xy = (pos.xy * focal) / zDist;
  pos.z = 0.0;

  gl_Position = pos;
}`;

const FS_IMAGE_DEPTH = `#version 300 es
precision highp float;
precision highp int;
in vec2 vUV;
out vec4 fragColor;

uniform sampler2D uSourceImage;
uniform sampler2D uDepthMap;
uniform vec2 uResolution;
uniform vec2 uMousePos;
uniform float uExposure;
uniform float uOpacity;
uniform float uScale;
uniform vec2 uOffset;
uniform float uHover;
uniform float uParallaxStrength;

vec2 getCoverUV(vec2 uv, vec2 texSize, vec2 canvasSize, float scale, vec2 offset) {
  float textureAspect = texSize.x / texSize.y;
  float canvasAspect = canvasSize.x / canvasSize.y;
  vec2 c = uv;
  if (canvasAspect < textureAspect) {
    float s = canvasAspect / textureAspect;
    c.x = uv.x * s + (1.0 - s) * 0.5;
  } else {
    float s = textureAspect / canvasAspect;
    c.y = uv.y * s + (1.0 - s) * 0.5;
  }
  // Apply scale and offset around center
  c = (c - 0.5 - offset) / scale + 0.5;
  return c;
}

float getDepth(vec2 uv) {
  vec2 texSize = vec2(textureSize(uDepthMap, 0));
  vec2 coverUV = getCoverUV(uv, texSize, uResolution, uScale, uOffset);
  if (coverUV.x < 0.0 || coverUV.x > 1.0 || coverUV.y < 0.0 || coverUV.y > 1.0) {
    return 1.0;
  }
  vec4 depthColor = texture(uDepthMap, coverUV);
  float depth = dot(depthColor.rgb, vec3(0.299, 0.587, 0.114));
  return 1.0 - depth;
}

vec4 samplePortrait(vec2 uv) {
  vec2 texSize = vec2(textureSize(uSourceImage, 0));
  vec2 coverUV = getCoverUV(uv, texSize, uResolution, uScale, uOffset);
  if (coverUV.x < 0.0 || coverUV.x > 1.0 || coverUV.y < 0.0 || coverUV.y > 1.0) {
    return vec4(0.0);
  }
  return textureLod(uSourceImage, coverUV, 0.0);
}

void main() {
  vec2 uv = vUV;

  // Responsive Parallax Occlusion Raymarching
  vec2 mouseOffset = (uMousePos - 0.5);
  vec2 parallaxDir = mouseOffset * uParallaxStrength * (0.8 + uHover * 1.2);
  float layerDepth = 1.0 / 24.0 * 0.5;
  float currentLayerDepth = 0.0;

  vec2 currentUv = uv;
  vec2 prevUv = currentUv;
  float currentDepth = getDepth(currentUv);
  float prevDepth = currentDepth;

  for (int i = 0; i < 24; i++) {
    if (currentDepth < currentLayerDepth) break;
    currentLayerDepth += layerDepth;
    prevUv = currentUv;
    prevDepth = currentDepth;
    currentUv -= parallaxDir * layerDepth;
    currentDepth = getDepth(currentUv);
  }

  float beforeDepth = prevDepth - (currentLayerDepth - layerDepth);
  float afterDepth  = currentDepth - currentLayerDepth;
  float weight = beforeDepth / (beforeDepth - afterDepth + 1e-5);
  weight = clamp(weight, 0.0, 1.0);
  vec2 offsetUv = mix(prevUv, currentUv, weight);

  vec4 color = samplePortrait(offsetUv);

  // Exposure adjustments
  if (uExposure != 0.0) {
    vec3 ec = clamp(color.rgb + uExposure, 0.0, 1.0);
    color.rgb = mix(color.rgb, ec, color.a);
  }
  color.rgb = clamp(color.rgb, 0.0, 1.0);
  color.rgb *= color.a;

  // Composite with opacity onto black background
  vec4 bg = vec4(0.0, 0.0, 0.0, 1.0);
  fragColor = mix(bg, color + bg * (1.0 - color.a), uOpacity);
}`;

const FS_FBM = `#version 300 es
precision highp float;
in vec2 vUV;
out vec4 fragColor;

uniform sampler2D uTexture;
uniform float uTime;
uniform float uMixRadius;
uniform vec2 uMousePos;
uniform vec2 uResolution;
uniform float uIntensity;
uniform float uHover;
uniform float uFbmMouseFollow;

float ease(float t) {
  return t < 0.5
    ? (1.0 - sqrt(1.0 - 4.0 * t * t)) / 2.0
    : (sqrt(-((2.0 * t) - 3.0) * ((2.0 * t) - 1.0)) + 1.0) / 2.0;
}

vec3 hash33(vec3 p3) {
  p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));
  p3 += dot(p3, p3.yxz + 19.19);
  return -1.0 + 2.0 * fract(vec3(
    (p3.x + p3.y) * p3.z,
    (p3.x + p3.z) * p3.y,
    (p3.y + p3.z) * p3.x
  ));
}

float perlin_noise(vec3 p) {
  vec3 pi = floor(p);
  vec3 pf = p - pi;
  vec3 w  = pf * pf * (3.0 - 2.0 * pf);
  float n000 = dot(pf - vec3(0.0, 0.0, 0.0), hash33(pi + vec3(0.0, 0.0, 0.0)));
  float n100 = dot(pf - vec3(1.0, 0.0, 0.0), hash33(pi + vec3(1.0, 0.0, 0.0)));
  float n010 = dot(pf - vec3(0.0, 1.0, 0.0), hash33(pi + vec3(0.0, 1.0, 0.0)));
  float n110 = dot(pf - vec3(1.0, 1.0, 0.0), hash33(pi + vec3(1.0, 1.0, 0.0)));
  float n001 = dot(pf - vec3(0.0, 0.0, 1.0), hash33(pi + vec3(0.0, 0.0, 1.0)));
  float n101 = dot(pf - vec3(1.0, 0.0, 1.0), hash33(pi + vec3(1.0, 0.0, 1.0)));
  float n011 = dot(pf - vec3(0.0, 1.0, 1.0), hash33(pi + vec3(0.0, 1.0, 1.0)));
  float n111 = dot(pf - vec3(1.0, 1.0, 1.0), hash33(pi + vec3(1.0, 1.0, 1.0)));
  return mix(
    mix(mix(n000, n100, w.x), mix(n010, n110, w.x), w.y),
    mix(mix(n001, n101, w.x), mix(n011, n111, w.x), w.y),
    w.z
  );
}

const float PI = 3.14159265359;
mat2 rot(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }
mat2 rotHalf = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));

float fbm(in vec3 st) {
  float value = 0.0;
  float amp = 0.25;
  float aM = 0.1 + 0.86 * 0.65;
  vec2 shift = vec2(100.0);
  for (int i = 0; i < 8; i++) {
    value += amp * perlin_noise(st);
    st.xy *= rotHalf * 2.5;
    st.xy += shift;
    amp *= aM;
  }
  return value;
}

void main() {
  vec2 uv = vUV;
  float aspectRatio = uResolution.x / uResolution.y;
  float multiplier = 6.0 * (0.57 / ((aspectRatio + 1.0) / 2.0));

  // Dynamic mouse follow on hover: moves distortion center toward cursor
  vec2 mPos = vec2(0.5) + (uMousePos - 0.5) * (0.04 + uHover * uFbmMouseFollow);
  vec2 pos = mix(vec2(0.5), mPos, floor(uMixRadius));

  // Radial falloff: as cursor hovers, radius expands slightly and follows cursor
  float distFalloff = 4.0 * (1.0 - uMixRadius) * (1.0 - uHover * 0.2);
  float mDist = ease(max(0.0, 1.0 - distance(uv * vec2(aspectRatio, 1.0), mPos * vec2(aspectRatio, 1.0)) * distFalloff));

  // Skew Y to 25% to elongate noise vertically into flame tendrils
  vec2 skew = mix(vec2(1.0), vec2(1.0, 0.0), 0.75);
  vec2 st = ((uv - pos) * vec2(aspectRatio, 1.0)) * multiplier * aspectRatio;
  st = rot(0.0) * st * skew;

  // Drift upward over time
  vec2 drift = vec2(0.0, uTime * 0.005) * 1.0;
  float time = uTime * 0.025;

  // Two-pass warped FBM
  vec2 r = vec2(
    fbm(vec3(st - drift + vec2(1.7, 9.2), time)),
    fbm(vec3(st - drift + vec2(8.2, 1.3), time))
  );
  float f = fbm(vec3(st + r - drift, time)) * 0.35;

  // Active hover displacement: pulls background into face on hover
  float hoverDisplacement = 1.0 + uHover * 0.35;
  vec2 offset = (f * 2.0 + r * 0.35) * uIntensity * hoverDisplacement;
  fragColor = texture(uTexture, uv + offset * mDist);
}`;

const FS_DITHER = `#version 300 es
precision highp float;
precision highp int;
in vec2 vUV;
out vec4 fragColor;

uniform sampler2D uTexture;
uniform float uTime;
uniform float uDitherAmount;

uvec2 pcg2d(uvec2 v) {
  v = v * 1664525u + 1013904223u;
  v.x += v.y * v.y * 1664525u + 1013904223u;
  v.y += v.x * v.x * 1664525u + 1013904223u;
  v ^= v >> 16;
  v.x += v.y * v.y * 1664525u + 1013904223u;
  v.y += v.x * v.x * 1664525u + 1013904223u;
  return v;
}

float randFibo(vec2 p) {
  uvec2 v = floatBitsToUint(p);
  v = pcg2d(v);
  return float(v.x ^ v.y) / float(0xffffffffu);
}

vec3 dither(vec3 color, vec2 st) {
  float delta = floor(uTime);
  vec2 offset = vec2(randFibo(vec2(123.0, 16.0) + delta), randFibo(vec2(56.0, 96.0) + delta));
  float noise = randFibo(st + offset) - 0.005;
  float dither_threshold = max(0.0001, 0.08);
  float num_levels = 1.0 / dither_threshold;
  return floor(color * num_levels + noise) / num_levels;
}

void main() {
  vec4 color = texture(uTexture, vUV);
  if (color.a == 0.0) {
    fragColor = vec4(0.0);
    return;
  }
  vec3 dithered = dither(color.rgb, vUV);
  color.rgb = mix(color.rgb, dithered, uDitherAmount);
  fragColor = color;
}`;

export class HeroShader {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.gl = this.canvas.getContext('webgl2', {
      antialias: false,
      alpha: false,
      premultipliedAlpha: false,
      powerPreference: 'high-performance',
    });

    if (!this.gl) {
      throw new Error('WebGL 2 is required for TEDx Hero Shader.');
    }

    const gl = this.gl;

    // Shader programs
    this.progImage = this.linkProgram(VS_IMAGE, FS_IMAGE_DEPTH);
    this.progFBM = this.linkProgram(VS_PASS, FS_FBM);
    this.progDither = this.linkProgram(VS_PASS, FS_DITHER);

    // Fullscreen quad buffer
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    const vb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1, 0, 0,
         1, -1, 1, 0,
        -1,  1, 0, 1,
         1,  1, 1, 1,
      ]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);
    gl.bindVertexArray(null);

    // Framebuffers
    this.fboA = null;
    this.fboB = null;

    // Texture instances
    this.texPortrait = null;
    this.texDepth = null;

    // Mouse coordinates with momentum
    this.rawMX = 0.5;
    this.rawMY = 0.5;
    this.depthMX = 0.5;
    this.depthMY = 0.5;
    this.fbmMX = 0.5;
    this.fbmMY = 0.5;

    // Hover state tracking
    this.hoverAmount = 0.0;
    this.targetHover = 0.0;

    // Time & animation tracking
    this.t0 = performance.now();
    this.lastNow = 0;
    this.fbmAccTime = 0;
    this.ditherAccTime = 0;
    this.baseFps = 24;
    this.isRunning = false;
    this.isLoaded = false;

    // Configurable character settings
    this.config = {
      scale: 1.25,
      offsetY: 0.0,
      fbmIntensity: 1.0,
      ditherAmount: 1.0,
      mouseMomentum: 0.92,
      hoverShift: 0.14,         // 2D horizontal/vertical displacement on hover
      tiltAmount: 0.22,         // 3D perspective rotation tilt
      parallaxStrength: 0.16,   // Depth map parallax raymarching
      fbmMouseFollow: 0.22,     // Flame cursor tracking
    };

    this.initListeners();
    this.resize();
  }

  compileShader(type, src) {
    const gl = this.gl;
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s), src);
      return null;
    }
    return s;
  }

  linkProgram(vsSrc, fsSrc) {
    const gl = this.gl;
    const p = gl.createProgram();
    gl.attachShader(p, this.compileShader(gl.VERTEX_SHADER, vsSrc));
    gl.attachShader(p, this.compileShader(gl.FRAGMENT_SHADER, fsSrc));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(p));
      return null;
    }
    return p;
  }

  createFBO(w, h) {
    const gl = this.gl;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return { fb, tex, w, h };
  }

  createTexture(source) {
    const gl = this.gl;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return tex;
  }

  loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(new Error(`Failed to load image from: ${url}`));
      img.src = url;
    });
  }

  /**
   * Primary method to dynamically swap character/speaker image & depth map!
   */
  async setCharacter({ portraitUrl, depthUrl, imageElement, depthElement, scale, offsetY, fbmIntensity, hoverShift, tiltAmount, parallaxStrength, fbmMouseFollow }) {
    try {
      let pImg = imageElement;
      let dImg = depthElement;

      if (!pImg && portraitUrl) {
        pImg = await this.loadImage(portraitUrl);
      }

      if (!dImg && depthUrl) {
        dImg = await this.loadImage(depthUrl);
      }

      if (!pImg) {
        throw new Error('No valid portrait image provided.');
      }

      // If no depth map image is provided, generate procedural depth
      if (!dImg) {
        const { generateProceduralDepthMap } = await import('../utils/depthGenerator.js');
        dImg = generateProceduralDepthMap(pImg);
      }

      const gl = this.gl;
      if (this.texPortrait) gl.deleteTexture(this.texPortrait);
      if (this.texDepth) gl.deleteTexture(this.texDepth);

      this.texPortrait = this.createTexture(pImg);
      this.texDepth = this.createTexture(dImg);

      if (typeof scale === 'number') this.config.scale = scale;
      if (typeof offsetY === 'number') this.config.offsetY = offsetY;
      if (typeof fbmIntensity === 'number') this.config.fbmIntensity = fbmIntensity;
      if (typeof hoverShift === 'number') this.config.hoverShift = hoverShift;
      if (typeof tiltAmount === 'number') this.config.tiltAmount = tiltAmount;
      if (typeof parallaxStrength === 'number') this.config.parallaxStrength = parallaxStrength;
      if (typeof fbmMouseFollow === 'number') this.config.fbmMouseFollow = fbmMouseFollow;

      // Trigger fresh intro appear animation
      this.t0 = performance.now();
      this.isLoaded = true;

      if (!this.isRunning) {
        this.isRunning = true;
        requestAnimationFrame((t) => this.render(t));
      }

      return true;
    } catch (err) {
      console.error('Error setting character in HeroShader:', err);
      return false;
    }
  }

  initListeners() {
    window.addEventListener('resize', () => this.resize());

    window.addEventListener('mousemove', (e) => {
      this.rawMX = e.clientX / window.innerWidth;
      this.rawMY = 1.0 - (e.clientY / window.innerHeight);
      this.targetHover = 1.0;
    });

    document.addEventListener('mouseleave', () => {
      this.targetHover = 0.0;
    });

    window.addEventListener('mouseenter', () => {
      this.targetHover = 1.0;
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        this.rawMX = e.touches[0].clientX / window.innerWidth;
        this.rawMY = 1.0 - (e.touches[0].clientY / window.innerHeight);
        this.targetHover = 1.0;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.targetHover = 0.0;
    });
  }

  resize() {
    const gl = this.gl;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.floor(this.canvas.clientWidth * dpr);
    const h = Math.floor(this.canvas.clientHeight * dpr);

    if (w === 0 || h === 0) return;

    this.canvas.width = w;
    this.canvas.height = h;
    this.width = w;
    this.height = h;

    const fbmW = Math.floor(w * 0.75);
    const fbmH = Math.floor(h * 0.75);

    if (this.fboA) {
      gl.deleteFramebuffer(this.fboA.fb);
      gl.deleteTexture(this.fboA.tex);
    }
    if (this.fboB) {
      gl.deleteFramebuffer(this.fboB.fb);
      gl.deleteTexture(this.fboB.tex);
    }

    this.fboA = this.createFBO(w, h);
    this.fboB = this.createFBO(fbmW, fbmH);
  }

  // Exact Easing Curves from Unicorn Studio JSON
  easeOutQuart(s) {
    return 1.0 - Math.pow(1.0 - s, 4.0);
  }
  easeInOutQuart(s) {
    return s < 0.5 ? 8.0 * Math.pow(s, 4.0) : 1.0 - Math.pow(-2.0 * s + 2.0, 4.0) / 2.0;
  }
  easeInOutCubic(s) {
    return s < 0.5 ? 4.0 * Math.pow(s, 3.0) : 1.0 - Math.pow(-2.0 * s + 2.0, 3.0) / 2.0;
  }

  u(prog, name) {
    return this.gl.getUniformLocation(prog, name);
  }

  drawQuad() {
    const gl = this.gl;
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
  }

  render(now) {
    if (!this.isRunning) return;
    requestAnimationFrame((t) => this.render(t));
    if (!this.isLoaded || !this.fboA || !this.fboB) return;

    const gl = this.gl;
    const dt = this.lastNow ? Math.min((now - this.lastNow) / 1000, 0.1) : 1 / 60;
    this.lastNow = now;

    const sec = (now - this.t0) / 1000;

    // Mouse momentum smoothing
    this.depthMX += (this.rawMX - this.depthMX) * 0.08;
    this.depthMY += (this.rawMY - this.depthMY) * 0.08;
    this.fbmMX += (this.rawMX - this.fbmMX) * 0.03;
    this.fbmMY += (this.rawMY - this.fbmMY) * 0.03;

    // Smooth hover state transition
    this.hoverAmount += (this.targetHover - this.hoverAmount) * 0.06;

    // Compute 2D shift translation and 3D tilt
    const shiftFactor = (0.2 + this.hoverAmount * 0.8);
    const shiftX = (0.5 - this.depthMX) * this.config.hoverShift * shiftFactor;
    const shiftY = (0.5 - this.depthMY) * this.config.hoverShift * 0.5 * shiftFactor;
    const tilt = this.config.tiltAmount * shiftFactor;

    // Appear state transitions (exact from scene.json)
    const opProgress = Math.min(Math.max(sec - 0.1, 0) / 0.5, 1.0);
    const opacity = this.easeOutQuart(opProgress);

    const exProgress = Math.min(sec / 0.8, 1.0);
    const exposure = -0.5 + 0.5 * this.easeInOutQuart(exProgress);

    const mrProgress = Math.min(sec / 1.0, 1.0);
    const mixRadius = 1.0 + (0.44 - 1.0) * this.easeInOutCubic(mrProgress);

    const spProgress = Math.min(sec / 0.9, 1.0);
    const speed = 0.35 + (0.12 - 0.35) * this.easeInOutQuart(spProgress);

    // Frame accumulation at 24fps base
    this.fbmAccTime += speed * dt * this.baseFps;
    this.ditherAccTime += 0.5 * dt * this.baseFps;

    // ─────────────────────────────────────────────────────────────────
    // PASS 1: Portrait + Depth Map Occlusion Raymarching -> FBO A
    // ─────────────────────────────────────────────────────────────────
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fboA.fb);
    gl.viewport(0, 0, this.fboA.w, this.fboA.h);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.progImage);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texPortrait);
    gl.uniform1i(this.u(this.progImage, 'uSourceImage'), 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.texDepth);
    gl.uniform1i(this.u(this.progImage, 'uDepthMap'), 1);

    gl.uniform2f(this.u(this.progImage, 'uResolution'), this.fboA.w, this.fboA.h);
    gl.uniform2f(this.u(this.progImage, 'uMousePos'), this.depthMX, this.depthMY);
    gl.uniform2f(this.u(this.progImage, 'uShift'), shiftX, shiftY);
    gl.uniform1f(this.u(this.progImage, 'uTiltAmount'), tilt);
    gl.uniform1f(this.u(this.progImage, 'uHover'), this.hoverAmount);
    gl.uniform1f(this.u(this.progImage, 'uParallaxStrength'), this.config.parallaxStrength);
    gl.uniform1f(this.u(this.progImage, 'uExposure'), exposure);
    gl.uniform1f(this.u(this.progImage, 'uOpacity'), opacity);
    gl.uniform1f(this.u(this.progImage, 'uScale'), this.config.scale);
    gl.uniform2f(this.u(this.progImage, 'uOffset'), 0.0, this.config.offsetY);
    this.drawQuad();

    // ─────────────────────────────────────────────────────────────────
    // PASS 2: Warped FBM Flame/Fluid Drift Distortion -> FBO B
    // ─────────────────────────────────────────────────────────────────
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fboB.fb);
    gl.viewport(0, 0, this.fboB.w, this.fboB.h);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.progFBM);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.fboA.tex);
    gl.uniform1i(this.u(this.progFBM, 'uTexture'), 0);

    gl.uniform2f(this.u(this.progFBM, 'uResolution'), this.fboB.w, this.fboB.h);
    gl.uniform2f(this.u(this.progFBM, 'uMousePos'), this.fbmMX, this.fbmMY);
    gl.uniform1f(this.u(this.progFBM, 'uTime'), this.fbmAccTime);
    gl.uniform1f(this.u(this.progFBM, 'uMixRadius'), mixRadius);
    gl.uniform1f(this.u(this.progFBM, 'uIntensity'), this.config.fbmIntensity);
    gl.uniform1f(this.u(this.progFBM, 'uHover'), this.hoverAmount);
    gl.uniform1f(this.u(this.progFBM, 'uFbmMouseFollow'), this.config.fbmMouseFollow);
    this.drawQuad();

    // ─────────────────────────────────────────────────────────────────
    // PASS 3: Dither & Film Grain -> Screen
    // ─────────────────────────────────────────────────────────────────
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.width, this.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.progDither);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.fboB.tex);
    gl.uniform1i(this.u(this.progDither, 'uTexture'), 0);

    gl.uniform1f(this.u(this.progDither, 'uTime'), this.ditherAccTime);
    gl.uniform1f(this.u(this.progDither, 'uDitherAmount'), this.config.ditherAmount);
    this.drawQuad();
  }

  destroy() {
    this.isRunning = false;
    const gl = this.gl;
    if (this.fboA) {
      gl.deleteFramebuffer(this.fboA.fb);
      gl.deleteTexture(this.fboA.tex);
    }
    if (this.fboB) {
      gl.deleteFramebuffer(this.fboB.fb);
      gl.deleteTexture(this.fboB.tex);
    }
    if (this.texPortrait) gl.deleteTexture(this.texPortrait);
    if (this.texDepth) gl.deleteTexture(this.texDepth);
  }
}
