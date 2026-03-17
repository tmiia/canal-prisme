uniform sampler2D uTexture;
uniform float uOpacity;
uniform vec2 uParallaxOffset;
uniform float uZoomFactor;
uniform float uPlaneAspect;
uniform float uTextureAspect;

varying vec2 vUv;

void main() {
    vec2 coverScale = vec2(1.0);
    if (uTextureAspect > uPlaneAspect) {
        coverScale.x = uPlaneAspect / uTextureAspect;
    } else {
        coverScale.y = uTextureAspect / uPlaneAspect;
    }

    vec2 uv = (vUv - 0.5) * coverScale / uZoomFactor + 0.5;
    uv += uParallaxOffset;
    vec4 tex = texture2D(uTexture, uv);
    gl_FragColor = vec4(tex.rgb, tex.a * uOpacity);
}