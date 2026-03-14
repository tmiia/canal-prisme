uniform sampler2D uTexture;
uniform float uOpacity;
uniform vec2 uParallaxOffset;
uniform float uZoomFactor;

varying vec2 vUv;

void main() {
    vec2 uv = (vUv - 0.5) / uZoomFactor + 0.5;
    uv += uParallaxOffset;
    vec4 tex = texture2D(uTexture, uv);
    gl_FragColor = vec4(tex.rgb, tex.a * uOpacity);
}