"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { CREATE_STAGE_SCROLL_OFFSET } from "./scrollTimings";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const GALLERY_ITEM_COUNT = 8;
const GALLERY_ASPECT_RATIO = 0.8;

const GALLERY_IMAGE_URL = "/home-experience/stages/create/poster.webp";

const DESKTOP_GALLERY_SCALE = 0.67;
const MOBILE_GALLERY_SCALE = 0.72;
const DESKTOP_GALLERY_Y_OFFSET = -0.5;
const MOBILE_GALLERY_Y_OFFSET = -0.36;

const vertexShader = [
  "varying vec2 vUv;",
  "void main() {",
  "  vUv = uv;",
  "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
  "}",
].join("\n");

const fragmentShader = [
  "uniform sampler2D uTexture;",
  "uniform float uOpacity;",
  "uniform float uBorderRadius;",
  "uniform float uAspect;",
  "varying vec2 vUv;",
  "",
  "float roundedBoxSDF(vec2 p, vec2 b, float r) {",
  "  vec2 q = abs(p) - b + r;",
  "  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;",
  "}",
  "",
  "void main() {",
  "  vec4 texel = texture2D(uTexture, vUv);",
  "",
  "  vec2 centered = vUv - 0.5;",
  "  centered.x *= uAspect;",
  "",
  "  vec2 boxSize = vec2(0.5 * uAspect, 0.5);",
  "  float d = roundedBoxSDF(centered, boxSize, uBorderRadius);",
  "  float alpha = 1.0 - step(0.0, d);",
  "",
  "  gl_FragColor = vec4(texel.rgb, texel.a * alpha * uOpacity);",
  "}",
].join("\n");

interface GalleryStageValues {
  appear: number;
  zoom: number;
  vertical: number;
}

type GalleryShaderMaterial = THREE.ShaderMaterial & {
  uniforms: {
    uTexture: { value: THREE.Texture };
    uOpacity: { value: number };
    uBorderRadius: { value: number };
    uAspect: { value: number };
  };
};

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function clamp01(value: number) {
  return THREE.MathUtils.clamp(value, 0, 1);
}

function mapRange(value: number, inMin: number, inMax: number, outMin = 0, outMax = 1) {
  const normalized = clamp01((value - inMin) / (inMax - inMin));
  return outMin + (outMax - outMin) * normalized;
}

function easeInOutCubic(value: number) {
  const t = clamp01(value);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function galleryStageFromProgress(progress: number): GalleryStageValues {
  const p = clamp01(progress);
  const earlyAppear = mapRange(p, 0, 0.08, 0, 0.1);
  const fullAppear = mapRange(p, 0.2, 0.58, 0.1, 1);
  const appear = p < 0.2 ? earlyAppear : fullAppear;

  return {
    appear: clamp01(appear),
    zoom: easeInOutCubic(mapRange(p, 0.34, 0.82)),
    vertical: easeInOutCubic(mapRange(p, 0.76, 1)),
  };
}

class GalleryStage {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly scene: THREE.Scene;
  private readonly displayGroup: THREE.Group;
  private readonly tiltGroup: THREE.Group;
  private readonly group: THREE.Group;
  private readonly meshes: THREE.Mesh<THREE.PlaneGeometry, GalleryShaderMaterial>[] = [];
  private readonly textures: THREE.Texture[] = [];
  private readonly radius = 2.05;
  private time = 0;
  private uAppear = 0;
  private uZoom = 0;
  private curMouseX = 0;
  private curMouseY = 0;
  private verticalOffset = 0;
  private loaded = false;

  constructor(renderer: THREE.WebGLRenderer, width: number, height: number) {
    this.renderer = renderer;
    this.camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 100);
    this.camera.position.set(0, 0, 10);
    this.scene = new THREE.Scene();
    this.displayGroup = new THREE.Group();
    this.tiltGroup = new THREE.Group();
    this.group = new THREE.Group();

    this.scene.add(this.displayGroup);
    this.displayGroup.add(this.tiltGroup);
    this.tiltGroup.add(this.group);
    this.applyViewportFrame(width);
  }

  async init() {
    const textureLoader = new THREE.TextureLoader();

    const texture = await new Promise<THREE.Texture>((resolve, reject) => {
      textureLoader.load(
        GALLERY_IMAGE_URL,
        (loadedTexture) => {
          loadedTexture.colorSpace = THREE.SRGBColorSpace;
          loadedTexture.minFilter = THREE.LinearFilter;
          loadedTexture.magFilter = THREE.LinearFilter;
          loadedTexture.generateMipmaps = false;
          resolve(loadedTexture);
        },
        undefined,
        reject,
      );
    });

    this.textures.push(texture);

    for (let index = 0; index < GALLERY_ITEM_COUNT; index += 1) {
      const panelWidth = (2 * Math.PI * this.radius) / GALLERY_ITEM_COUNT;
      const panelHeight = panelWidth / GALLERY_ASPECT_RATIO;
      const geometry = new THREE.PlaneGeometry(panelWidth, panelHeight, 32, 1);
      geometry.computeVertexNormals();

      const material = new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        uniforms: {
          uTexture: { value: texture },
          uOpacity: { value: 0 },
          uBorderRadius: { value: 0.07 },
          uAspect: { value: panelWidth / panelHeight },
        },
        vertexShader,
        fragmentShader,
      }) as GalleryShaderMaterial;

      const mesh = new THREE.Mesh(geometry, material);
      mesh.frustumCulled = false;

      const angle = (index / GALLERY_ITEM_COUNT) * Math.PI * 2;
      mesh.position.x = Math.sin(angle) * this.radius;
      mesh.position.z = -Math.cos(angle) * this.radius;
      mesh.lookAt(0, 0, 0);
      mesh.userData.index = index;
      mesh.userData.distFromCenter = Math.min(index, GALLERY_ITEM_COUNT - index);

      this.group.add(mesh);
      this.meshes.push(mesh);
    }

    this.loaded = true;
    this.layout(this.uAppear);
  }

  layout(value = 0) {
    if (!this.loaded) return;

    const appear = THREE.MathUtils.clamp(value, 0, 1);
    const firstPanelDuration = 0.1;
    const panelFadeDuration = 0.08;
    const panelStagger = 0.06;

    this.meshes.forEach((mesh) => {
      const distFromCenter = Number(mesh.userData.distFromCenter);
      let opacity = 0;

      if (distFromCenter === 0) opacity = appear / firstPanelDuration;
      else if (appear > firstPanelDuration) {
        const revealProgress = (appear - firstPanelDuration) / (1 - firstPanelDuration);
        const delay = (distFromCenter - 1) * panelStagger;
        opacity = (revealProgress - delay) / panelFadeDuration;
      }

      mesh.material.uniforms.uOpacity.value = THREE.MathUtils.clamp(opacity, 0, 1);
    });
  }

  setBorderRadius(value: number) {
    this.meshes.forEach((mesh) => {
      mesh.material.uniforms.uBorderRadius.value = value;
    });
  }

  setZoom(value: number) {
    const fromFov = 70;
    const toFov = 66.5;
    this.camera.fov = fromFov - (fromFov - toFov) * value;
    this.camera.updateProjectionMatrix();
  }

  setVerticalOffset(value: number) {
    this.verticalOffset = value;
    const fov = this.camera.fov * (Math.PI / 180);
    const cameraZ = this.camera.position.z;
    const viewportHeight = 2 * Math.tan(fov / 2) * cameraZ;
    this.tiltGroup.position.y = value * viewportHeight;
  }

  update(delta: number, mouse: THREE.Vector2, appear: number, zoom: number, rotation = 1) {
    if (!this.loaded) return;

    this.time += delta;
    this.uAppear = appear;
    this.uZoom = zoom;
    this.curMouseX = THREE.MathUtils.lerp(this.curMouseX, mouse.x, 0.08);
    this.curMouseY = THREE.MathUtils.lerp(this.curMouseY, mouse.y, 0.08);

    this.layout(this.uAppear);
    this.camera.position.z = THREE.MathUtils.lerp(0, 8, this.uZoom);
    this.tiltGroup.rotation.x = THREE.MathUtils.lerp(0, rotation, easeOutCubic(this.uZoom));
    this.tiltGroup.rotation.y = THREE.MathUtils.lerp(0, Math.PI, easeOutCubic(this.uZoom)) + this.verticalOffset * Math.PI;
  }

  onResize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.applyViewportFrame(width);
  }

  render() {
    if (!this.loaded) return;
    this.renderer.clearDepth();
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.meshes.forEach((mesh) => {
      mesh.geometry.dispose();
      mesh.material.dispose();
    });
    this.textures.forEach((texture) => texture.dispose());
  }

  private applyViewportFrame(width: number) {
    const isDesktop = width >= 1024;
    const scale = isDesktop ? DESKTOP_GALLERY_SCALE : MOBILE_GALLERY_SCALE;
    const yOffset = isDesktop ? DESKTOP_GALLERY_Y_OFFSET : MOBILE_GALLERY_Y_OFFSET;

    this.displayGroup.scale.set(scale, scale, 1);
    this.displayGroup.position.set(0, yOffset, 0);
  }
}

export default function CreativeRingField() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let width = window.innerWidth;
    let height = window.innerHeight;
    const getScrollDepth = (percent: number) => Math.min(width * (percent / 100), height * (percent / 100));

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const gallery = new GalleryStage(renderer, width, height);
    const clock = new THREE.Clock();
    const mouse = new THREE.Vector2(0, 0);
    const scrollState = { progress: 0 };
    let frame = 0;
    let disposed = false;
    let timeline: gsap.core.Timeline | null = null;
    let visibilityTrigger: ScrollTrigger | null = null;

    const render = () => {
      if (disposed) return;

      const delta = clock.getDelta();
      const stage = galleryStageFromProgress(scrollState.progress);
      gallery.setVerticalOffset(stage.vertical);
      gallery.update(delta, mouse, stage.appear, stage.zoom, 1);
      gallery.render();
      frame = requestAnimationFrame(render);
    };

    gallery
      .init()
      .then(() => {
        if (disposed) return;

        gallery.setBorderRadius(0);
        gallery.setZoom(1);

        timeline = gsap.timeline({
          scrollTrigger: {
            trigger: "body",
            start: () => getScrollDepth(1525 + CREATE_STAGE_SCROLL_OFFSET) + " top",
            end: () => getScrollDepth(1925 + CREATE_STAGE_SCROLL_OFFSET) + " top",
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              scrollState.progress = self.progress;
            },
          },
        });
        timeline.to(scrollState, { progress: 1, duration: 1, ease: "none" });

        gsap.set(container, { autoAlpha: 0 });
        visibilityTrigger = ScrollTrigger.create({
          trigger: "body",
          start: () => getScrollDepth(1500 + CREATE_STAGE_SCROLL_OFFSET) + " top",
          end: () => getScrollDepth(1950 + CREATE_STAGE_SCROLL_OFFSET) + " top",
          onEnter: () => gsap.to(container, { autoAlpha: 1, duration: 0.16, ease: "none" }),
          onEnterBack: () => gsap.to(container, { autoAlpha: 1, duration: 0.16, ease: "none" }),
          onLeave: () => gsap.to(container, { autoAlpha: 0, duration: 0.16, ease: "none" }),
          onLeaveBack: () => gsap.to(container, { autoAlpha: 0, duration: 0.16, ease: "none" }),
          invalidateOnRefresh: true,
        });

        render();
      })
      .catch((error) => {
        console.error("Failed to load creative gallery stage:", error);
      });

    const handlePointerMove = (event: PointerEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      renderer.setSize(width, height);
      gallery.onResize(width, height);
      ScrollTrigger.refresh();
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("resize", handleResize);

    return () => {
      disposed = true;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frame);
      timeline?.kill();
      visibilityTrigger?.kill();
      gallery.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="creative-ring-field fixed inset-0 z-20 pointer-events-none opacity-0"
      aria-hidden="true"
    />
  );
}
