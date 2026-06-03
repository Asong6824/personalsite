"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { MotionPathPlugin } from "gsap/dist/MotionPathPlugin";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { Volume2, VolumeX, ArrowRight, Play } from "lucide-react";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
}

// Coordinate arrays for camera and look-at targets (Stages 0-8)
const cameraStages = [
  {
    name: "joystick",
    from: { x: 2.093, y: -4.505, z: 44.601 },
    to: { x: -2.484, y: 3.733, z: 30.641 },
    scrollRange: { start: 0, end: 200 },
    ease: "power2.inOut",
  },
  {
    name: "middle",
    from: { x: -2.484, y: 3.733, z: 30.641 },
    to: { x: -1.475, y: 9.953, z: 18.201 },
    scrollRange: { start: 205, end: 400 },
    ease: "power2.inOut",
  },
  {
    name: "space",
    from: { x: -1.475, y: 9.953, z: 18.201 },
    to: { x: 0.783, y: 14.749, z: 13.3 },
    scrollRange: { start: 405, end: 600 },
    ease: "power2.inOut",
  },
  {
    name: "bunny",
    from: { x: 0.783, y: 14.749, z: 13.3 },
    to: { x: 4.024, y: 22.301, z: 7.031 },
    scrollRange: { start: 605, end: 800 },
    ease: "power2.inOut",
  },
  {
    name: "seo",
    from: { x: 4.024, y: 22.301, z: 7.031 },
    to: { x: 23.346, y: 20.432, z: 2.102 },
    scrollRange: { start: 805, end: 1000 },
    ease: "power2.inOut",
  },
  {
    name: "video",
    from: { x: 23.346, y: 20.432, z: 2.102 },
    to: {
      desktop: { x: 23.321, y: 15.607, z: 3.911 },
      mobile: { x: 23.346, y: 20.432, z: 2.102 }
    },
    scrollRange: { start: 1005, end: 1250 },
    ease: "power2.inOut",
  },
  {
    name: "reviews",
    from: {
      desktop: { x: 23.321, y: 15.607, z: 3.911 },
      mobile: { x: 23.346, y: 20.432, z: 2.102 }
    },
    to: {
      desktop: { x: 23.312, y: 14.16, z: 4.024 },
      mobile: { x: 23.346, y: 20.432, z: 2.102 }
    },
    scrollRange: { start: 1300, end: 1500 },
    ease: "power2.inOut",
  },
  {
    name: "awards",
    from: {
      desktop: { x: 23.312, y: 14.16, z: 4.024 },
      mobile: { x: 23.346, y: 20.432, z: 2.102 }
    },
    to: {
      desktop: { x: 23.292, y: 11.443, z: 4.236 },
      mobile: { x: 23.346, y: 20.432, z: 2.102 }
    },
    scrollRange: { start: 1600, end: 1800 },
    ease: "power2.inOut",
  },
];

const targetStages = [
  {
    name: "joystick",
    from: { x: 4.093, y: -7.005, z: 0.601 },
    to: { x: 7.958, y: -0.55, z: 1.019 },
    scrollRange: { start: 0, end: 200 },
    ease: "power2.inOut",
  },
  {
    name: "middle",
    from: { x: 7.958, y: -0.55, z: 1.019 },
    to: { x: 14.485, y: 5.069, z: -2.278 },
    scrollRange: { start: 205, end: 400 },
    ease: "power2.inOut",
  },
  {
    name: "space",
    from: { x: 14.485, y: 5.069, z: -2.278 },
    to: { x: 15.777, y: 12.603, z: -0.428 },
    scrollRange: { start: 405, end: 600 },
    ease: "power2.inOut",
  },
  {
    name: "bunny",
    from: { x: 15.777, y: 12.603, z: -0.428 },
    to: { x: 17.443, y: 20.712, z: 0.431 },
    scrollRange: { start: 605, end: 800 },
    ease: "power2.inOut",
  },
  {
    name: "seo",
    from: { x: 17.443, y: 20.712, z: 0.431 },
    to: { x: 23.342, y: 20.293, z: 1.263 },
    scrollRange: { start: 805, end: 1000 },
    ease: "power2.inOut",
  },
  {
    name: "video",
    from: { x: 23.342, y: 20.293, z: 1.263 },
    to: {
      desktop: { x: 23.301, y: 15.457, z: 1.984 },
      mobile: { x: 23.342, y: 20.293, z: 1.263 }
    },
    scrollRange: { start: 1005, end: 1250 },
    ease: "power2.inOut",
  },
  {
    name: "reviews",
    from: {
      desktop: { x: 23.301, y: 15.457, z: 1.984 },
      mobile: { x: 23.342, y: 20.293, z: 1.263 }
    },
    to: {
      desktop: { x: 23.292, y: 14.01, z: 2.097 },
      mobile: { x: 23.342, y: 20.293, z: 1.263 }
    },
    scrollRange: { start: 1300, end: 1500 },
    ease: "power2.inOut",
  },
  {
    name: "awards",
    from: {
      desktop: { x: 23.292, y: 14.01, z: 2.097 },
      mobile: { x: 23.342, y: 20.293, z: 1.263 }
    },
    to: {
      desktop: { x: 23.272, y: 11.293, z: 2.309 },
      mobile: { x: 23.342, y: 20.293, z: 1.263 }
    },
    scrollRange: { start: 1600, end: 1800 },
    ease: "power2.inOut",
  },
];

// Helper to determine responsive object properties
const getResponsiveVal = (val: any, isDesktop: boolean) => {
  if (typeof val === "number") return val;
  if (!val) return 0;
  return isDesktop ? val.desktop : val.mobile;
};

const getResponsivePos = (pos: any, isDesktop: boolean) => {
  if ("x" in pos && typeof pos.x === "number") return pos;
  return {
    x: getResponsiveVal(pos.x, isDesktop),
    y: getResponsiveVal(pos.y, isDesktop),
    z: getResponsiveVal(pos.z, isDesktop),
  };
};

export default function NoomoPageClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [mounted, setMounted] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Initialize audio
    audioRef.current = new Audio("https://noomoagency.com/music/noomo_music.mp3");
    audioRef.current.loop = true;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlayingAudio(!isPlayingAudio);
  };

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const isDesktop = width > 1024;

    // Responsive viewport units
    const vw = (v: number) => width * (v / 100);
    const vh = (v: number) => height * (v / 100);
    const getScrollDepth = (percent: number) => Math.min(vw(percent), vh(percent));

    let d5 = 0, d100 = 0, d200 = 0, d280 = 0, d300 = 0, d400 = 0, d500 = 0, d600 = 0, d750 = 0, d800 = 0, d950 = 0, d1050 = 0, d1080 = 0, d1100 = 0, d1260 = 0, d1380 = 0, d1500 = 0, d1700 = 0, d2100 = 0;
    const updateScrollThresholds = () => {
      d5 = getScrollDepth(5);
      d100 = getScrollDepth(100);
      d200 = getScrollDepth(200);
      d280 = getScrollDepth(280);
      d300 = getScrollDepth(300);
      d400 = getScrollDepth(400);
      d500 = getScrollDepth(500);
      d600 = getScrollDepth(600);
      d750 = getScrollDepth(750);
      d800 = getScrollDepth(800);
      d950 = getScrollDepth(950);
      d1050 = getScrollDepth(1050);
      d1080 = getScrollDepth(1080);
      d1100 = getScrollDepth(1100);
      d1260 = getScrollDepth(1260);
      d1380 = getScrollDepth(1380);
      d1500 = getScrollDepth(1500);
      d1700 = getScrollDepth(1700);
      d2100 = getScrollDepth(2100);
    };
    updateScrollThresholds();

    // 1. Initialise Three.js Components
    const clock = new THREE.Clock();
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcad1fc);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.01, 1000);
    camera.position.set(2.093, -4.505, 44.601);
    camera.setFocalLength(60);

    const renderer = new THREE.WebGLRenderer({
      powerPreference: "high-performance",
      premultipliedAlpha: false,
      stencil: false,
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);

    // 2. Set Up Lighting
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.01);
    dirLight.color.setHSL(0.1, 1, 0.95);
    dirLight.position.set(1, 1.75, 0).multiplyScalar(30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    const shD = 50;
    dirLight.shadow.camera.left = -shD;
    dirLight.shadow.camera.right = shD;
    dirLight.shadow.camera.top = shD;
    dirLight.shadow.camera.bottom = -shD;
    dirLight.shadow.camera.far = 3500;
    dirLight.shadow.bias = -0.0001;
    scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // 3. Load Environment Maps and Setup Glass Materials
    const textureLoader = new THREE.TextureLoader();
    let hdri1: THREE.Texture;
    let hdri2: THREE.Texture;
    let glass: THREE.MeshPhysicalMaterial;
    let glass2: THREE.MeshPhysicalMaterial;

    const mixers: THREE.AnimationMixer[] = [];
    const rotationObjects: { mesh: THREE.Object3D; speed: number; axis: "x" | "y" | "z" }[] = [];
    const floatObjects: { mesh: THREE.Object3D; baseHeight: number; speed: number; range: number }[] = [];

    // Raycaster for interactive sound toggle
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let interactiveReelGroup: THREE.Group | null = null;
    let playButtonMesh: THREE.Object3D | null = null;
    let soundOffMesh: THREE.Object3D | null = null;
    let isVideoMuted = true;
    let handleReelClick: ((event: MouseEvent) => void) | null = null;

    let joystickGroup: THREE.Group | null = null;
    let coinbaseGroup: THREE.Group | null = null;
    let salesforceGroup: THREE.Group | null = null;
    let jellyfishGroup: THREE.Group | null = null;
    let videoMesh: THREE.Mesh | null = null;
    let reviewGroup: THREE.Group | null = null;
    let awardsGroup: THREE.Group | null = null;

    // Track camera lookAt targets via GSAP proxy
    const lookTarget = new THREE.Vector3(4.093, -7.005, 0.601);

    // Dynamic SVG Loader wrapper
    const loadSvg = (url: string, scale: [number, number, number], pos: [number, number, number], rot: [number, number, number], color = 0x0a0c20, parent: THREE.Object3D = scene) => {
      const loader = new SVGLoader();
      loader.load(url, (data) => {
        const group = new THREE.Group();
        group.scale.set(scale[0], scale[1], scale[2]);
        group.position.set(pos[0], pos[1], pos[2]);
        group.rotation.set(rot[0], rot[1], rot[2]);

        data.paths.forEach((path) => {
          const fill = path.userData.style.fill;
          if (fill !== undefined && fill !== "none") {
            const material = new THREE.MeshBasicMaterial({
              color: color,
              side: THREE.DoubleSide,
              depthWrite: true,
            });
            const shapes = SVGLoader.createShapes(path);
            shapes.forEach((shape) => {
              const geometry = new THREE.ShapeGeometry(shape);
              const mesh = new THREE.Mesh(geometry, material);
              group.add(mesh);
            });
          }
        });
        parent.add(group);
      });
    };

    // Load Manager
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      setLoadingProgress(Math.round((itemsLoaded / itemsTotal) * 100));
    };
    loadingManager.onLoad = () => {
      setIsLoading(false);
      // Fade in main scene and let smoother run
      gsap.to("#main-scene", { opacity: 1, duration: 0.5 });
      gsap.to(".hero-text", { opacity: 1, duration: 0.4, delay: 0.5 });
    };

    const dracoLoader = new DRACOLoader(loadingManager);
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.5/");
    const glbLoader = new GLTFLoader(loadingManager);
    glbLoader.setDRACOLoader(dracoLoader);

    // Initial asset preloading chain
    hdri1 = textureLoader.load("/noomo/hdri/1.jpeg", () => {
      hdri1.mapping = THREE.EquirectangularReflectionMapping;
      hdri1.colorSpace = THREE.SRGBColorSpace;

      hdri2 = textureLoader.load("/noomo/hdri/h4.jpeg", () => {
        hdri2.mapping = THREE.EquirectangularReflectionMapping;
        hdri2.colorSpace = THREE.SRGBColorSpace;

        // Initialize materials
        glass = new THREE.MeshPhysicalMaterial({
          roughness: 0.3,
          transmission: 1,
          thickness: 0.3,
          ior: 1.5,
          reflectivity: 0.77,
          color: 0xffffff,
          clearcoat: 1,
          clearcoatRoughness: 0.12,
          envMap: hdri1,
          envMapIntensity: 1.2,
        });

        glass2 = new THREE.MeshPhysicalMaterial({
          roughness: 0.3,
          transmission: 1,
          thickness: 0.3,
          ior: 1.5,
          reflectivity: 0.77,
          color: 0xffffff,
          clearcoat: 1,
          clearcoatRoughness: 0.12,
          envMap: hdri2,
          envMapIntensity: 1.2,
        });

        // Start loading the models
        loadModels();
      });
    });

    const loadModels = () => {
      // 1. Cyclorama Background Plane
      const bgTex = textureLoader.load("/noomo/backTexture/beckground_04min.jpeg");
      bgTex.colorSpace = THREE.SRGBColorSpace;
      glbLoader.load("/noomo/models/BG2.glb", (gltf) => {
        const bgScene = gltf.scene;
        bgScene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.material = new THREE.MeshBasicMaterial({ map: bgTex, side: THREE.DoubleSide });
          }
        });
        bgScene.position.set(4, -25, -20);
        bgScene.scale.set(7, 7, 7);
        scene.add(bgScene);

        // Backdrop GSAP Timelines
        const bgTl = gsap.timeline({
          scrollTrigger: {
            trigger: "body",
            start: () => getScrollDepth(0) + " top",
            end: () => getScrollDepth(200) + " top",
            scrub: true,
            invalidateOnRefresh: true,
          }
        });
        bgTl.fromTo(bgScene.position, { x: 4, y: -25, z: -20 }, { x: 16, y: -16, z: -20, ease: "power2.inOut" });

        const bgRotTl = gsap.timeline({
          scrollTrigger: {
            trigger: "body",
            start: () => getScrollDepth(0) + " top",
            end: () => getScrollDepth(200) + " top",
            scrub: true,
            invalidateOnRefresh: true,
          }
        });
        bgRotTl.fromTo(bgScene.rotation, { y: 0 }, { y: -0.87266, ease: "power2.inOut" });
      });

      // 2. Load Platform-O and distribute clones
      glbLoader.load("/noomo/models/Platform-O.glb", (gltf) => {
        const platformBase = gltf.scene;
        platformBase.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) (child as THREE.Mesh).material = glass;
        });

        // Stage 0 Platform removed per request


        // Stage 1 (Joystick) Platform
        const p1 = platformBase.clone();
        p1.position.set(20, 19.37, -1);
        p1.scale.set(0.5, 0.5, 0.5);
        p1.rotation.set(Math.PI / 2, 0, 1.13);
        p1.traverse((child) => { if ((child as THREE.Mesh).isMesh) (child as THREE.Mesh).material = glass2; });
        scene.add(p1);

        // Stage 2 (Coinbase) Platform
        const p2 = platformBase.clone();
        p2.position.set(7, 6.97, 7.1);
        p2.scale.set(0.6, 0.6, 0.6);
        p2.rotation.set(Math.PI / 2, 0, 2 * Math.PI * (22 / 360));
        p2.traverse((child) => { if ((child as THREE.Mesh).isMesh) (child as THREE.Mesh).material = glass2; });
        scene.add(p2);

        // Stage 3 (Salesforce Cloud / Cards) Platform
        const p3 = platformBase.clone();
        p3.position.set(11.95, 12.01, 3);
        p3.scale.set(0.4, 0.4, 0.4);
        p3.rotation.set(Math.PI / 2, 0, 0);
        p3.traverse((child) => { if ((child as THREE.Mesh).isMesh) (child as THREE.Mesh).material = glass2; });
        scene.add(p3);

        // Stage 4 (Jellyfish) Platform removed because it was positioned in Stage 0 viewport space
      });

      // 3. Stage 0 O/N Letters removed per request

      // Load Title SVG for Hero (Chinese text left-aligned, right side up with positive Y scale)
      loadSvg("/noomo/svgtitle/startTitle.svg", [0.008, 0.008, 0.008], [-0.13, -7.35, 20], [-0.05675, -0.04535, -0.00257]);

      // 4. Stage 1 Joystick Retro Gaming (homeBunnyCase)
      joystickGroup = new THREE.Group();
      joystickGroup.position.set(20, 19.5, -1);
      if (!isDesktop) joystickGroup.position.set(20.3, 21.9, -1);
      scene.add(joystickGroup);

      // Always visible — camera movement handles what's in view

      // Svg Title for Retro Gaming
      loadSvg("/noomo/svgtitle/BespokeSvg.svg", 
        isDesktop ? [0.009, -0.009, 0.009] : [0.004, -0.004, 0.004],
        isDesktop ? [3.8722, 2.3926, -6.0889] : [0, 1.3, -3],
        [-0.23628, -1.1024, -0.21163],
        0x0a0c20,
        joystickGroup
      );

      glbLoader.load("/noomo/models/Dendy3.glb", (gltf) => {
        const consoleScene = gltf.scene;
        consoleScene.scale.set(1.2, 1.2, 1.2);
        consoleScene.position.set(0, 1.12, 0);
        consoleScene.rotation.y = 2 * Math.PI * (-50 / 360);
        consoleScene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const mat = mesh.material as any;
            mat.envMap = hdri1;
            mat.envMapIntensity = 4;
            mat.side = THREE.DoubleSide;
          }
        });
        const mixer = new THREE.AnimationMixer(consoleScene);
        const action = mixer.clipAction(gltf.animations[0]);
        action.timeScale = 0.5;
        action.play();
        mixers.push(mixer);
        joystickGroup.add(consoleScene);

        // Pause console animation loop occasionally like the original site
        mixer.addEventListener("loop", () => {
          action.paused = true;
          setTimeout(() => { action.paused = false; }, 1000);
        });
      });

      glbLoader.load("/noomo/models/Plug.glb", (gltf) => {
        const plugScene = gltf.scene;
        plugScene.scale.set(0.3, 0.3, 0.3);
        plugScene.position.set(2.836, 1.6, 2.317);
        plugScene.rotation.set(-3.091, -0.976, 3.01);
        plugScene.traverse((c) => { if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).material = glass; });
        joystickGroup.add(plugScene);
        rotationObjects.push({ mesh: plugScene, speed: Math.PI * 2 / 20, axis: "y" });

        gsap.fromTo(plugScene.position,
          { y: 1.4 },
          {
            y: 1.9,
            ease: "power2.inOut",
            scrollTrigger: {
              trigger: "body",
              start: () => getScrollDepth(805) + " top",
              end: () => getScrollDepth(1000) + " top",
              scrub: true,
              invalidateOnRefresh: true,
            }
          }
        );
      });

      glbLoader.load("/noomo/models/lightning.glb", (gltf) => {
        const lightningScene = gltf.scene;
        lightningScene.scale.set(0.2, 0.2, 0.2);
        lightningScene.position.set(0.211, 1.404, -3.576);
        lightningScene.rotation.set(-0.042, -0.726, -0.063);
        lightningScene.traverse((c) => { if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).material = glass; });
        joystickGroup.add(lightningScene);
        floatObjects.push({ mesh: lightningScene, baseHeight: 1.404, speed: 1.5, range: 0.1 });
      });

      // Animate whole joystick group exiting
      gsap.to(joystickGroup.children, {
        x: "+=10",
        z: "+=15",
        duration: 1.5,
        ease: "back.in(1.2)",
        stagger: 0.03,
        scrollTrigger: {
          trigger: "body",
          start: () => getScrollDepth(800) + " top",
          toggleActions: "play none none reverse"
        }
      });

      // 5. Stage 2 Coinbase Gold Ball (homeMiddleCase)
      coinbaseGroup = new THREE.Group();
      coinbaseGroup.position.set(7, 7, 7.1);
      if (!isDesktop) coinbaseGroup.position.set(7.2, 8.3, 7.1);
      scene.add(coinbaseGroup);

      // Always visible — camera movement handles what's in view

      loadSvg("/noomo/svgtitle/InteractiveSvg.svg",
        isDesktop ? [0.0067, -0.0067, 0.0067] : [0.003, -0.003, 0.003],
        isDesktop ? [-1.83, 1.473, -4.7] : [-0.25, 1.3, -3],
        [-0.2341, -0.6486, -0.143],
        0x0a0c20,
        coinbaseGroup
      );

      glbLoader.load("/noomo/models/CoinbaseBall2.glb", (gltf) => {
        const ballScene = gltf.scene;
        ballScene.scale.set(0.65, 0.65, 0.65);
        ballScene.position.set(0, 0.8, 0);
        ballScene.rotation.y = 2 * Math.PI * (-20 / 360);
        ballScene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const mat = mesh.material as any;
            mat.envMap = hdri1;
            mat.envMapIntensity = 2.5;
            mat.color = new THREE.Color(16571986).convertLinearToSRGB();
            mat.roughness = 0.3;
            mat.normalScale = new THREE.Vector2(2, 2);
          }
        });
        coinbaseGroup.add(ballScene);
        rotationObjects.push({ mesh: ballScene, speed: Math.PI * 2 / 30, axis: "y" });
        floatObjects.push({ mesh: ballScene, baseHeight: 0.8, speed: 1.5, range: 0.1 });
      });

      glbLoader.load("/noomo/models/Bitcoin.glb", (gltf) => {
        const btcScene = gltf.scene;
        btcScene.scale.set(0.15, 0.15, 0.15);
        btcScene.position.set(-0.75, 1.544, -3.26);
        btcScene.rotation.set(-0.122, -0.345, -0.154);
        btcScene.traverse((c) => { if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).material = glass; });
        coinbaseGroup.add(btcScene);
        rotationObjects.push({ mesh: btcScene, speed: Math.PI * 2 / 30, axis: "y" });
      });

      glbLoader.load("/noomo/models/Sun.glb", (gltf) => {
        const sunScene = gltf.scene;
        sunScene.scale.set(0.16, 0.16, 0.16);
        sunScene.position.set(2.5, 0.884, 1.146);
        sunScene.rotation.set(-0.212, -0.928, -0.184);
        sunScene.traverse((c) => { if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).material = glass; });
        coinbaseGroup.add(sunScene);
        floatObjects.push({ mesh: sunScene, baseHeight: 0.884, speed: 1.2, range: 0.15 });
      });

      // Animate Coinbase Group exiting
      gsap.to(coinbaseGroup.children, {
        x: "+=10",
        z: "+=8",
        duration: 1.5,
        ease: "back.in(1.2)",
        stagger: 0.03,
        scrollTrigger: {
          trigger: "body",
          start: () => getScrollDepth(400) + " top",
          toggleActions: "play none none reverse"
        }
      });

      // 6. Stage 3 Salesforce Cloud / Cards (homeSpaceCase)
      salesforceGroup = new THREE.Group();
      salesforceGroup.position.set(11.95, 12.1, 3);
      if (!isDesktop) salesforceGroup.position.set(11.95, 14.1, 3);
      scene.add(salesforceGroup);

      // Always visible — camera movement handles what's in view

      loadSvg("/noomo/svgtitle/enterpriseSvg.svg",
        isDesktop ? [0.0067, -0.0067, 0.0067] : [0.0045, -0.0045, 0.0045],
        isDesktop ? [-1.9, 2.3, -3.71] : [0.9, 1.3, -3],
        [-0.155, -0.8234, -0.1141],
        0x0a0c20,
        salesforceGroup
      );

      glbLoader.load("/noomo/models/Cards2Anim.glb", (gltf) => {
        const cardsScene = gltf.scene;
        cardsScene.scale.set(0.6, 0.6, 0.6);
        cardsScene.position.set(0, 0.6, 0);
        cardsScene.rotation.set(2 * Math.PI * (20 / 360), 0, 2 * Math.PI * (20 / 360));
        cardsScene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const mat = mesh.material as any;
            mat.envMap = hdri1;
            mat.envMapIntensity = 4;
          }
        });
        // Configure specific children materials to match original blue look
        const cMat0 = (cardsScene.children[0]?.children[0] as any)?.material;
        const cMat1 = (cardsScene.children[0]?.children[1] as any)?.material;
        const cMat2 = (cardsScene.children[0]?.children[2] as any)?.material;
        if (cMat0) {
          cMat0.metalness = 0.34;
          cMat0.roughness = 0.24;
          cMat0.thickness = 0.61;
          cMat0.clearcoat = 0;
          cMat0.reflectivity = 0.48;
          cMat0.color = new THREE.Color("#0040ff").convertLinearToSRGB();
        }
        if (cMat1) {
          cMat1.metalness = 0.34;
          cMat1.roughness = 0.24;
          cMat1.thickness = 0.61;
          cMat1.clearcoat = 0;
          cMat1.reflectivity = 0.48;
        }
        if (cMat2) {
          cMat2.metalness = 0.34;
          cMat2.roughness = 0.24;
          cMat2.thickness = 0.61;
          cMat2.clearcoat = 0;
          cMat2.reflectivity = 0.48;
        }

        const mixer = new THREE.AnimationMixer(cardsScene);
        gltf.animations.forEach((clip) => {
          const action = mixer.clipAction(clip);
          action.timeScale = 0.5;
          action.play();
        });
        mixers.push(mixer);
        salesforceGroup.add(cardsScene);
      });

      glbLoader.load("/noomo/models/Rocket.glb", (gltf) => {
        const rocketScene = gltf.scene;
        rocketScene.scale.set(0.22, 0.22, 0.22);
        rocketScene.position.set(4.59, 1.817, -0.38);
        rocketScene.rotation.set(0, -0.509, 0);
        rocketScene.traverse((c) => { if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).material = glass; });
        salesforceGroup.add(rocketScene);
        floatObjects.push({ mesh: rocketScene, baseHeight: 1.817, speed: 1.0, range: 0.15 });
      });

      glbLoader.load("/noomo/models/Eye.glb", (gltf) => {
        const eyeScene = gltf.scene;
        eyeScene.scale.set(0.25, 0.25, 0.25);
        eyeScene.position.set(-0.82, 1.0, -2.17);
        eyeScene.rotation.set(0, -0.491, 0);
        eyeScene.traverse((c) => { if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).material = glass; });
        salesforceGroup.add(eyeScene);
        rotationObjects.push({ mesh: eyeScene, speed: -Math.PI * 2 / 30, axis: "y" });
      });

      // Animate Salesforce Group exiting
      gsap.to(salesforceGroup.children, {
        x: "+=10",
        z: "+=8",
        duration: 1.5,
        ease: "back.in(1.2)",
        stagger: 0.03,
        scrollTrigger: {
          trigger: "body",
          start: () => getScrollDepth(600) + " top",
          toggleActions: "play none none reverse"
        }
      });

      // 7. Stage 4 Jellyfish (homeOrcadCase)
      jellyfishGroup = new THREE.Group();
      jellyfishGroup.position.set(3.1, 1.6, 14);
      if (!isDesktop) jellyfishGroup.position.set(3.3, 4.0, 14);
      scene.add(jellyfishGroup);

      // Always visible — camera movement handles what's in view

      loadSvg("/noomo/svgtitle/tech.svg",
        isDesktop ? [0.0085, 0.0085, 0.0085] : [0.004, 0.004, 0.004],
        isDesktop ? [-0.19, 0.42, -4.7] : [0.22, 0.73, -3],
        [-0.1436, -0.3357, -0.0476],
        0x0a0c20,
        jellyfishGroup
      );

      glbLoader.load("/noomo/models/Jellyfish.glb", (gltf) => {
        const jellyScene = gltf.scene;
        jellyScene.scale.set(0.6, 0.6, 0.6);
        jellyScene.position.set(0, 0.3, 0);
        jellyScene.rotation.set(2 * Math.PI * (45 / 360), 0, 2 * Math.PI * (-30 / 360));
        
        // Transparent glowing material for Jellyfish body
        jellyScene.traverse((c) => {
          if ((c as THREE.Mesh).isMesh) {
            const mesh = c as THREE.Mesh;
            // First child is outer cap, second is inner tentacles
            if (mesh.name.includes("Cap") || mesh.name.includes("body") || mesh.parent?.name.includes("Cap")) {
              mesh.material = new THREE.MeshPhysicalMaterial({
                roughness: 0.2,
                transmission: 0.9,
                thickness: 0.4,
                ior: 1.4,
                color: new THREE.Color("#ff2adf").convertLinearToSRGB(),
                transparent: true,
                opacity: 0.7,
              });
            } else {
              mesh.material = new THREE.MeshPhysicalMaterial({
                roughness: 0.3,
                transmission: 0.8,
                thickness: 0.2,
                color: new THREE.Color("#ff2adf").convertLinearToSRGB(),
                transparent: true,
                opacity: 0.5,
              });
            }
          }
        });

        const mixer = new THREE.AnimationMixer(jellyScene);
        const action = mixer.clipAction(gltf.animations[0]);
        action.play();
        mixers.push(mixer);
        jellyfishGroup.add(jellyScene);
        floatObjects.push({ mesh: jellyScene, baseHeight: 0.3, speed: 1.2, range: 0.20 });
        rotationObjects.push({ mesh: jellyScene, speed: Math.PI * 2 / 60, axis: "y" });
      });

      glbLoader.load("/noomo/models/HeartLocation.glb", (gltf) => {
        const heartScene = gltf.scene;
        heartScene.scale.set(0.22, 0.22, 0.22);
        heartScene.position.set(3.8, 0.3867, -0.6);
        heartScene.rotation.set(-0.268, 0.0309, -0.206);
        heartScene.traverse((c) => { if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).material = glass; });
        jellyfishGroup.add(heartScene);
        floatObjects.push({ mesh: heartScene, baseHeight: 0.3867, speed: 1.5, range: 0.1 });
      });

      glbLoader.load("/noomo/models/Clouds.glb", (gltf) => {
        const cloudsScene = gltf.scene;
        cloudsScene.scale.set(0.25, 0.25, 0.25);
        cloudsScene.position.set(-3, 0.6, 0.5);
        cloudsScene.rotation.y = 2 * Math.PI * (10 / 360);
        cloudsScene.traverse((c) => { if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).material = glass; });
        jellyfishGroup.add(cloudsScene);
        rotationObjects.push({ mesh: cloudsScene, speed: Math.PI * 2 / 30, axis: "y" });
      });

      // 8. Stage 5 Video Plane Showcase (videoPlane)
      const videoNode = document.createElement("video");
      videoNode.src = "https://noomo-website.cdn.prismic.io/noomo-website/aHDVIEMqNJQqHyXy_Showreel2025.mp4";
      videoNode.crossOrigin = "anonymous";
      videoNode.loop = true;
      videoNode.muted = true;
      videoNode.playsInline = true;
      videoNode.load();
      videoNode.play().catch(() => {});

      const videoTex = new THREE.VideoTexture(videoNode);
      videoTex.colorSpace = THREE.SRGBColorSpace;
      videoTex.minFilter = THREE.LinearFilter;
      videoTex.magFilter = THREE.LinearFilter;

      const videoMat = new THREE.ShaderMaterial({
        uniforms: {
          texture1: { value: videoTex },
          res: { value: new THREE.Vector4(1600 / 2, 900 / 2, 1, 1) },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          uniform sampler2D texture1;
          uniform vec4 res;
          void main() {
            vec2 uv = vUv;
            vec2 myUV = (uv - vec2(0.5)) * res.zw + vec2(0.5);
            vec4 color = texture2D(texture1, myUV);
            gl_FragColor = color;
          }
        `,
      });

      const videoGeom = new THREE.PlaneGeometry(16 / 8, 9 / 8, 1);
      videoMesh = new THREE.Mesh(videoGeom, videoMat);
      videoMesh.position.set(23.3, 15, -4);
      videoMesh.rotation.set(2 * Math.PI * (-10 / 360), 2 * Math.PI * (30 / 360), 0);
      videoMesh.visible = false;
      scene.add(videoMesh);

      // Play & Mute Button meshes
      interactiveReelGroup = new THREE.Group();
      interactiveReelGroup.position.set(23.3, 15.25, -2);
      interactiveReelGroup.visible = false;
      scene.add(interactiveReelGroup);

      const buttonContainerGroup = new THREE.Group();
      interactiveReelGroup.add(buttonContainerGroup);

      glbLoader.load("/noomo/models/playWithMesh.glb", (gltf) => {
        playButtonMesh = gltf.scene;
        playButtonMesh.rotation.set(0, 2 * Math.PI * (-20 / 360), 0);
        playButtonMesh.scale.set(0.12, 0.12, 0.12);
        playButtonMesh.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.name.includes("text")) {
              mesh.material = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
            } else {
              mesh.material = glass;
            }
          }
        });
        buttonContainerGroup.add(playButtonMesh);
      });

      glbLoader.load("/noomo/models/SoundOff.glb", (gltf) => {
        soundOffMesh = gltf.scene;
        soundOffMesh.rotation.set(0, 2 * Math.PI * (-20 / 360), 0);
        soundOffMesh.scale.set(0, 0, 0); // Scale down initially
        soundOffMesh.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            (child as THREE.Mesh).material = glass;
          }
        });
        buttonContainerGroup.add(soundOffMesh);
      });

      // Wobble buttons
      floatObjects.push({ mesh: buttonContainerGroup, baseHeight: 0, speed: 1.5, range: 0.05 });
      rotationObjects.push({ mesh: buttonContainerGroup, speed: Math.PI * 2 / 100, axis: "y" });

      // Video Stage Entrance ScrollTriggers
      gsap.fromTo(videoMesh.rotation,
        { x: 2 * Math.PI * (-15 / 360), y: 2 * Math.PI * (40 / 360), z: 0 },
        {
          x: -0.07768,
          y: 0.01034,
          z: 0.0008,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: "body",
            start: () => getScrollDepth(1080) + " top",
            end: () => getScrollDepth(1260) + " top",
            scrub: true,
          }
        }
      );

      gsap.fromTo(videoMesh.position,
        { x: 23.25, y: 15.15, z: -3 },
        {
          x: 23.27,
          y: 15.3,
          z: 0,
          ease: "power1.inOut",
          scrollTrigger: {
            trigger: "body",
            start: () => getScrollDepth(1120) + " top",
            end: () => getScrollDepth(1260) + " top",
            scrub: true,
          }
        }
      );

      gsap.fromTo(interactiveReelGroup.position,
        { x: 23.3, y: 15.25, z: -2 },
        {
          x: 23.3,
          y: 15.4,
          z: 1,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: "body",
            start: () => getScrollDepth(1110) + " top",
            end: () => getScrollDepth(1270) + " top",
            scrub: true,
          }
        }
      );

      // Auto mute on scroll leave
      ScrollTrigger.create({
        trigger: "body",
        start: () => getScrollDepth(1070) + " top",
        end: () => getScrollDepth(1450) + " top",
        onLeave: () => { muteReelVideo(); },
        onLeaveBack: () => { muteReelVideo(); }
      });

      const muteReelVideo = () => {
        isVideoMuted = true;
        videoNode.muted = true;
        gsap.to(playButtonMesh!.scale, { x: 0.12, y: 0.12, z: 0.12, duration: 1, ease: "power2.inOut" });
        gsap.to(soundOffMesh!.scale, { x: 0, y: 0, z: 0, duration: 1, ease: "power2.inOut" });
        gsap.to(buttonContainerGroup.position, { x: 0, y: 0, duration: 1, ease: "power2.inOut" });
      };

      const unmuteReelVideo = () => {
        isVideoMuted = false;
        videoNode.muted = false;
        gsap.to(playButtonMesh!.scale, { x: 0, y: 0, z: 0, duration: 1, ease: "power1.inOut" });
        gsap.to(soundOffMesh!.scale, { x: 0.08, y: 0.08, z: 0.08, duration: 1, ease: "power1.inOut" });
        gsap.to(buttonContainerGroup.position, { x: -0.7, y: -0.35, duration: 1, ease: "power1.inOut" });
      };

      // Handle interactive click of showreel sound
      handleReelClick = (event: MouseEvent) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        if (playButtonMesh && soundOffMesh) {
          const intersects = raycaster.intersectObjects([playButtonMesh, soundOffMesh], true);
          if (intersects.length > 0) {
            if (isVideoMuted) {
              unmuteReelVideo();
              // Scroll page to align
              gsap.to(window, {
                scrollTo: getScrollDepth(1270),
                duration: 1,
                ease: "power2.inOut",
              });
            } else {
              muteReelVideo();
            }
          }
        }
      };
      window.addEventListener("click", handleReelClick);

      // 9. Stage 6 Testimonials Reviews Card Stream (testimonalsText)
      reviewGroup = new THREE.Group();
      reviewGroup.position.set(20.8, 11, -5);
      reviewGroup.visible = false;
      scene.add(reviewGroup);

      // Load Title SVG for Reviews
      loadSvg("/noomo/svgtitle/revTitle.svg", [0.0033, -0.0033, 0.0033], [-0.1, 0, 0], [-0.07768, 0.01034, 0.0008], 0x0a0c20, reviewGroup);

      // Path translation proxy object (prevents DOM layout bindings)
      const reviewCardsProxies = [
        { x: 10, y: -4 },
        { x: 10, y: -4 },
        { x: 10, y: -4 },
        { x: 10, y: -4 }
      ];

      const reviewConfigs = [
        {
          name: "first",
          texture: "/noomo/revs/rev1.png",
          rotationY: 120,
          motionPathScroll: { start: 1300, end: 1750 },
          rotationYScroll: { start: 1320, end: 1770 },
          rotationXZScroll: { start: 1500, end: 1850 },
        },
        {
          name: "second",
          texture: "/noomo/revs/rev2.png",
          rotationY: 120,
          motionPathScroll: { start: 1325, end: 1775 },
          rotationYScroll: { start: 1345, end: 1795 },
          rotationXZScroll: { start: 1525, end: 1875 },
        },
        {
          name: "third",
          texture: "/noomo/revs/rev3.png",
          rotationY: 130,
          motionPathScroll: { start: 1350, end: 1800 },
          rotationYScroll: { start: 1370, end: 1820 },
          rotationXZScroll: { start: 1550, end: 1900 },
        },
        {
          name: "fourth",
          texture: "/noomo/revs/rev4.png",
          rotationY: 140,
          motionPathScroll: { start: 1375, end: 1825 },
          rotationYScroll: { start: 1395, end: 1845 },
          rotationXZScroll: { start: 1575, end: 1925 },
        },
      ];

      glbLoader.load("/noomo/models/netrixtest3.glb", (gltf) => {
        const cardBase = gltf.scene;

        reviewConfigs.forEach((config, i) => {
          const cardClone = cardBase.clone();
          const tex = textureLoader.load(config.texture);
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = 16;

          const innerGroup = cardClone.children[0]?.children;
          if (innerGroup) {
            // Backing plate is glass
            (innerGroup[0] as THREE.Mesh).material = glass;
            // Face gets review texture
            (innerGroup[1] as THREE.Mesh).material = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 1 });
          }

          cardClone.position.set(10, -4, 0.2);
          cardClone.scale.set(0.13, -0.13, 0.13);
          cardClone.rotation.set(2 * Math.PI * (-8 / 360), 2 * Math.PI * (config.rotationY / 360), 2 * Math.PI * (3 / 360));
          reviewGroup.add(cardClone);

          // Animate review card floating wobble
          const innerPos = cardClone.children[0]?.position;
          if (innerPos) {
            gsap.to(innerPos, {
              y: "random([0.3, 0.4, 0.5])",
              duration: "random([2, 2.5, 3])",
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut"
            });
          }

          // Motion Path animation linked to scroll
          gsap.to(reviewCardsProxies[i], {
            ease: "none",
            motionPath: {
              path: [
                { x: 10, y: -4 },
                { x: 3.2, y: -1 },
                { x: -7, y: -4 }
              ],
              useRadians: true
            },
            scrollTrigger: {
              trigger: "body",
              start: () => getScrollDepth(config.motionPathScroll.start) + " top",
              end: () => getScrollDepth(config.motionPathScroll.end) + " top",
              scrub: true,
              onUpdate: () => {
                cardClone.position.x = reviewCardsProxies[i].x;
                cardClone.position.y = reviewCardsProxies[i].y;
              }
            }
          });

          // Y-axis rotation step on scroll
          gsap.to(cardClone.rotation, {
            y: 0.0103, // target center rotation
            ease: "power2.out",
            scrollTrigger: {
              trigger: "body",
              start: () => getScrollDepth(config.rotationYScroll.start) + " top",
              end: () => getScrollDepth(config.rotationYScroll.end) + " top",
              scrub: true,
            }
          });

          // X/Z rotation step on scroll
          gsap.to(cardClone.rotation, {
            x: -0.0776,
            z: 0.0008,
            ease: "power2.out",
            scrollTrigger: {
              trigger: "body",
              start: () => getScrollDepth(config.rotationXZScroll.start) + " top",
              end: () => getScrollDepth(config.rotationXZScroll.end) + " top",
              scrub: true,
            }
          });
        });
      });

      // Review group entrance trigger
      gsap.fromTo(reviewGroup.position,
        { x: 20.8, y: 11, z: -5 },
        {
          x: 20.8,
          y: 14.3,
          z: -5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "body",
            start: () => getScrollDepth(1380) + " top",
            end: () => getScrollDepth(1500) + " top",
            scrub: true,
          }
        }
      );

      // Reviews text page layout scroll translation
      gsap.fromTo(".testimonails-text",
        { y: "190vh" },
        {
          y: "24vh",
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: "body",
            start: () => getScrollDepth(1300) + " top",
            end: () => getScrollDepth(1500) + " top",
            scrub: true,
          }
        }
      );
      gsap.fromTo(".testimonails-text",
        { y: "24vh" },
        {
          y: "-55vh",
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: "body",
            start: () => getScrollDepth(1600) + " top",
            end: () => getScrollDepth(1800) + " top",
            scrub: true,
          }
        }
      );

      // 10. Stage 7 Awards Trophies and Floating shapes (sceneOldAwards)
      awardsGroup = new THREE.Group();
      awardsGroup.position.set(24, 7.5, -10);
      awardsGroup.rotation.set(-0.0776, 0.0103, 0.0008);
      awardsGroup.visible = false;
      scene.add(awardsGroup);

      // Logo Planes for Awards
      const logoPlanes: THREE.Mesh[] = [];
      const loadAwardPlane = (url: string, pos: [number, number, number], rot: [number, number, number], index: number) => {
        textureLoader.load(url, (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.6 });
          const geom = new THREE.PlaneGeometry(tex.image.width / 600, tex.image.height / 600, 1);
          const mesh = new THREE.Mesh(geom, mat);
          mesh.position.set(pos[0], pos[1], pos[2]);
          mesh.rotation.set(rot[0], rot[1], rot[2]);
          awardsGroup.add(mesh);
          logoPlanes[index] = mesh;
        });
      };

      const arRot: [number, number, number] = [2 * Math.PI * (-2 / 360), 2 * Math.PI * (40 / 360), 2 * Math.PI * (-5 / 360)];
      loadAwardPlane("/noomo/awards/Webby.png", [0, 0, 0], arRot, 0);
      loadAwardPlane("/noomo/awards/reddot.png", [0, -2, 0], arRot, 1);
      loadAwardPlane("/noomo/awards/SFDesignweek.png", [-0.1, -4.5, 0], arRot, 2);
      loadAwardPlane("/noomo/awards/awwwards.png", [0, -7, 0], arRot, 3);

      // Load Trophy Meshes
      let webbyTrophy: THREE.Object3D;
      let reddotTrophy: THREE.Object3D;
      let sfdfTrophy: THREE.Object3D;
      let awwwardsTrophy: THREE.Object3D;

      glbLoader.load("/noomo/models/webbby.glb", (gltf) => {
        webbyTrophy = gltf.scene;
        webbyTrophy.scale.set(0, 0, 0); // hidden initially
        webbyTrophy.position.set(-0.1, -0.5, 1);
        webbyTrophy.rotation.set(2 * Math.PI * (-4 / 360), 0, 2 * Math.PI * (-10 / 360));
        webbyTrophy.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const mat = mesh.material as any;
            mat.envMap = hdri1;
            mat.envMapIntensity = 1.8;
          }
        });
        awardsGroup.add(webbyTrophy);
        rotationObjects.push({ mesh: webbyTrophy, speed: Math.PI * 2 / 10, axis: "y" });
      });

      glbLoader.load("/noomo/models/reddot.glb", (gltf) => {
        reddotTrophy = gltf.scene;
        reddotTrophy.scale.set(0, 0, 0);
        reddotTrophy.position.set(-0.1, -2.1, 1);
        reddotTrophy.rotation.set(2 * Math.PI * (-4 / 360), 0, 2 * Math.PI * (-10 / 360));
        reddotTrophy.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const mat = mesh.material as any;
            mat.envMap = hdri1;
            mat.envMapIntensity = 5;
          }
        });
        awardsGroup.add(reddotTrophy);
        rotationObjects.push({ mesh: reddotTrophy, speed: Math.PI * 2 / 10, axis: "y" });
      });

      glbLoader.load("/noomo/models/SFDF_op1.glb", (gltf) => {
        sfdfTrophy = gltf.scene;
        sfdfTrophy.scale.set(0, 0, 0);
        sfdfTrophy.position.set(-0.1, -4.5, 1);
        sfdfTrophy.rotation.set(2 * Math.PI * (-15 / 360), 2 * Math.PI * (170 / 360), 2 * Math.PI * (-7 / 360));
        sfdfTrophy.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const mat = mesh.material as any;
            mat.envMap = hdri1;
            mat.envMapIntensity = 4;
          }
        });
        awardsGroup.add(sfdfTrophy);
        floatObjects.push({ mesh: sfdfTrophy, baseHeight: -4.5, speed: 1.2, range: 0.1 });
        rotationObjects.push({ mesh: sfdfTrophy, speed: Math.PI * 2 / 80, axis: "y" });
      });

      glbLoader.load("/noomo/models/awwwardsModel.glb", (gltf) => {
        awwwardsTrophy = gltf.scene;
        awwwardsTrophy.scale.set(0, 0, 0);
        awwwardsTrophy.position.set(-0.1, -7.1, 1);
        awwwardsTrophy.rotation.set(2 * Math.PI * (-8 / 360), 2 * Math.PI * (10 / 360), 2 * Math.PI * (-10 / 360));
        awwwardsTrophy.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const mat = mesh.material as any;
            mat.envMap = hdri1;
            mat.envMapIntensity = 1.8;
          }
        });
        awardsGroup.add(awwwardsTrophy);
        floatObjects.push({ mesh: awwwardsTrophy, baseHeight: -7.1, speed: 1.2, range: 0.1 });
        rotationObjects.push({ mesh: awwwardsTrophy, speed: Math.PI * 2 / 80, axis: "y" });
      });

      // Load Floating Glass Accolades
      const floatConfigs = [
        { name: "Like", count: 9 },
        { name: "heart", count: 10 },
        { name: "goblet", count: 10 }
      ];

      // Exact floating accolades locations extracted from temp_index.js
      const likesLocs = [
        { xP: 3.091, yP: -1.02, zP: -1.038, rX: 0.73, rY: 3.17, rZ: 6.06 },
        { xP: 3.244, yP: -3.03, zP: -2.654, rX: 1.13, rY: 2.84, rZ: 2.22 },
        { xP: -0.28, yP: -0.09, zP: -2.796, rX: 4.57, rY: 0.3, rZ: 1.37 },
        { xP: 3.384, yP: -5.76, zP: -3.829, rX: 5.86, rY: 3.27, rZ: 0.97 },
        { xP: -3.28, yP: -0.11, zP: -3.537, rX: 2.83, rY: 2.11, rZ: 5.37 },
        { xP: 1.288, yP: -4.03, zP: -3.399, rX: 5.28, rY: 2.06, rZ: 0.789 },
        { xP: 0.79, yP: -2.364, zP: -2.993, rX: 1.78, rY: 3.69, rZ: 4.56 },
        { xP: 2.494, yP: -4.116, zP: -1.981, rX: 2.3, rY: 1.17, rZ: 2.27 },
        { xP: 1.4, yP: -9.3, zP: -3, rX: 0.2, rY: 0.1, rZ: 2.27 }
      ];
      const heartLocs = [
        { xP: -0.638, yP: -4.8, zP: -1.18, rX: 0.109, rY: 0.26, rZ: 4.78 },
        { xP: -2.2, yP: -3.82, zP: -3.035, rX: 2.55, rY: 0.24, rZ: 5.18 },
        { xP: 3.27, yP: -2.28, zP: -1.63, rX: 1.072, rY: 1.49, rZ: 3.47 },
        { xP: 1.0, yP: -0.6, zP: -2.32, rX: 3.05, rY: 0.3, rZ: 5.89 },
        { xP: -2.18, yP: -0.58, zP: -1.56, rX: 2.29, rY: 6.11, rZ: 2.287 },
        { xP: -2.16, yP: -6.43, zP: -2.68, rX: 2.49, rY: 1.35, rZ: 5.77 },
        { xP: -3.48, yP: -3.23, zP: -2.92, rX: 1.964, rY: 3.85, rZ: 0.83 },
        { xP: -1.35, yP: -6.86, zP: -3.95, rX: 2.78, rY: 4.69, rZ: 0.2 },
        { xP: 2, yP: -7.5, zP: -2, rX: 1.2, rY: 3, rZ: 0.2 },
        { xP: -3, yP: -9.4, zP: -3.1, rX: 0.5, rY: 0.2, rZ: 0.4 }
      ];
      const gobletLocs = [
        { xP: -3.98, yP: -1.52, zP: -1.66, rX: 4.47, rY: 2.36, rZ: 2.02 },
        { xP: 2.73, yP: -2.41, zP: -2.68, rX: 3.53, rY: 3.75, rZ: 2.33 },
        { xP: 0.299, yP: -2.49, zP: -3.262, rX: 4.44, rY: 0.56, rZ: 5.0 },
        { xP: -2.91, yP: -4.88, zP: -2.246, rX: 4.63, rY: 1.61, rZ: 2.15 },
        { xP: 3.165, yP: -4.12, zP: -2.499, rX: 0.319, rY: 3.23, rZ: 1.71 },
        { xP: 1.86, yP: -3.35, zP: -3.06, rX: 1.78, rY: 2.3, rZ: 1.27 },
        { xP: -2.88, yP: -6.846, zP: -3.439, rX: 2.436, rY: 5.86, rZ: 5.66 },
        { xP: 2.88, yP: -8.84, zP: -2, rX: 0.124, rY: 1.123, rZ: 0.1 },
        { xP: -0.4, yP: -9.246, zP: -2, rX: 1.1, rY: 1.123, rZ: 0.1 }
      ];

      glbLoader.load("/noomo/models/Like.glb", (gltf) => {
        likesLocs.forEach((loc) => {
          const clone = gltf.scene.clone();
          clone.scale.set(0.15, 0.15, 0.15);
          clone.position.set(loc.xP, loc.yP + 1, loc.zP);
          clone.rotation.set(loc.rX, loc.rY, loc.rZ);
          clone.traverse((c) => { if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).material = glass; });
          awardsGroup.add(clone);
        });
      });

      glbLoader.load("/noomo/models/heart.glb", (gltf) => {
        heartLocs.forEach((loc) => {
          const clone = gltf.scene.clone();
          clone.scale.set(0.15, 0.15, 0.15);
          clone.position.set(loc.xP, loc.yP + 1, loc.zP);
          clone.rotation.set(loc.rX, loc.rY, loc.rZ);
          clone.traverse((c) => { if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).material = glass; });
          awardsGroup.add(clone);
        });
      });

      glbLoader.load("/noomo/models/goblet.glb", (gltf) => {
        gobletLocs.forEach((loc) => {
          const clone = gltf.scene.clone();
          clone.scale.set(0.15, 0.15, 0.15);
          clone.position.set(loc.xP, loc.yP + 1, loc.zP);
          clone.rotation.set(loc.rX, loc.rY, loc.rZ);
          clone.traverse((c) => { if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).material = glass; });
          awardsGroup.add(clone);
        });
      });

      // Awards Group Entrance ScrollTriggers
      gsap.fromTo(awardsGroup.position,
        { x: 23.15, y: 6.5, z: -10 },
        {
          x: 23.15,
          y: 18,
          z: -10,
          ease: "none",
          scrollTrigger: {
            trigger: "body",
            start: () => getScrollDepth(1700) + " top",
            end: () => getScrollDepth(2100) + " top",
            scrub: true,
          }
        }
      );

      gsap.fromTo(awardsGroup.position,
        { x: 23.15, y: 18, z: -10 },
        {
          x: 23.15,
          y: 21,
          z: -10,
          ease: "none",
          scrollTrigger: {
            trigger: "body",
            start: () => getScrollDepth(2100) + " top",
            end: () => getScrollDepth(2200) + " top",
            scrub: true,
          }
        }
      );

      // Trophies scale entry triggers on scroll
      const triggerTrophyEntry = (trophyMesh: THREE.Object3D, logoPlaneMesh: THREE.Mesh, scaleVal: number, startPct: number, endPct: number) => {
        ScrollTrigger.create({
          trigger: "body",
          start: () => getScrollDepth(startPct) + " top",
          end: () => getScrollDepth(endPct) + " top",
          onEnter: () => {
            if (trophyMesh) gsap.to(trophyMesh.scale, { x: scaleVal, y: scaleVal, z: scaleVal, duration: 0.4, ease: "power2.inOut" });
            if (logoPlaneMesh) gsap.to(logoPlaneMesh.material, { opacity: 1, duration: 0.4, ease: "power2.inOut" });
          },
          onLeaveBack: () => {
            if (trophyMesh) gsap.to(trophyMesh.scale, { x: 0, y: 0, z: 0, duration: 0.4, ease: "power2.inOut" });
            if (logoPlaneMesh) gsap.to(logoPlaneMesh.material, { opacity: 0.6, duration: 0.4, ease: "power2.inOut" });
          }
        });
      };

      // Set timers to ensure meshes are fully initialized before registering triggers
      setTimeout(() => {
        triggerTrophyEntry(webbyTrophy, logoPlanes[0], 0.8, 1810, 1880);
        triggerTrophyEntry(reddotTrophy, logoPlanes[1], 0.35, 1880, 1950);
        triggerTrophyEntry(sfdfTrophy, logoPlanes[2], 0.4, 1950, 2020);
        triggerTrophyEntry(awwwardsTrophy, logoPlanes[3], 0.35, 2020, 2110);
      }, 2000);

      // Rotating trophies animations scroll triggers
      gsap.fromTo(arRot, // Animate logo mesh rotation on scroll
        { x: arRot[0], y: arRot[1], z: arRot[2] },
        {
          x: 0, y: 0, z: 0,
          ease: "none",
          scrollTrigger: {
            trigger: "body",
            start: () => getScrollDepth(1750) + " top",
            end: () => getScrollDepth(1830) + " top",
            scrub: true,
          },
          onUpdate: function () {
            if (logoPlanes[0]) logoPlanes[0].rotation.set(this.targets()[0].x, this.targets()[0].y, this.targets()[0].z);
          }
        }
      );
    };

    // 11. Core Camera + focusTarget Scroll Timelines
    const masterCamTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: () => getScrollDepth(1800) + " top",
        scrub: true,
        invalidateOnRefresh: true,
      }
    });

    const masterTargetTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: () => getScrollDepth(1800) + " top",
        scrub: true,
        invalidateOnRefresh: true,
      }
    });

    // Populate camera stages
    cameraStages.forEach((stage, idx) => {
      const fromPos = getResponsivePos(stage.from, isDesktop);
      const toPos = getResponsivePos(stage.to, isDesktop);
      
      masterCamTimeline.fromTo(camera.position,
        fromPos,
        {
          ...toPos,
          ease: stage.ease,
          immediateRender: false,
          scrollTrigger: {
            trigger: "body",
            start: () => getScrollDepth(stage.scrollRange.start) + " top",
            end: () => getScrollDepth(stage.scrollRange.end) + " top",
            scrub: true,
            invalidateOnRefresh: true,
          }
        }
      );
    });

    // Populate controls/focus target stages
    targetStages.forEach((stage, idx) => {
      const fromPos = getResponsivePos(stage.from, isDesktop);
      const toPos = getResponsivePos(stage.to, isDesktop);

      masterTargetTimeline.fromTo(lookTarget,
        fromPos,
        {
          ...toPos,
          ease: stage.ease,
          immediateRender: false,
          scrollTrigger: {
            trigger: "body",
            start: () => getScrollDepth(stage.scrollRange.start) + " top",
            end: () => getScrollDepth(stage.scrollRange.end) + " top",
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: () => {
              camera.lookAt(lookTarget);
            }
          }
        }
      );
    });

    // Tech Channel overlay fade ScrollTrigger
    gsap.timeline({
      scrollTrigger: {
        trigger: "body",
        start: () => getScrollDepth(150) + " top",
        end: () => getScrollDepth(250) + " top",
        scrub: true,
        invalidateOnRefresh: true,
      }
    })
    .fromTo("#tech-channel-overlay", { opacity: 0 }, { opacity: 1, duration: 0.4 })
    .to("#tech-channel-overlay", { opacity: 1, duration: 0.2 })
    .to("#tech-channel-overlay", { opacity: 0, duration: 0.4 });

    // 12. Main Render Tick Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Update GLB mixers
      mixers.forEach((mixer) => mixer.update(delta));

      // Constant slow rotations
      rotationObjects.forEach((obj) => {
        obj.mesh.rotation[obj.axis] += delta * obj.speed;
      });

      // Float wobble animations
      floatObjects.forEach((obj) => {
        obj.mesh.position.y = obj.baseHeight + Math.sin(elapsed * obj.speed) * obj.range;
      });

      // The 4 main case groups (joystick, coinbase, salesforce, jellyfish) are always visible.
      // The camera movement naturally controls what appears in the viewport — no scroll-based toggling needed.
      // Only toggle visibility for elements that are genuinely off-scene and need lazy activation:
      const currentScroll = window.scrollY;
      if (videoMesh) {
        videoMesh.visible = currentScroll >= d1080 && currentScroll <= d1260;
      }
      if (interactiveReelGroup) {
        interactiveReelGroup.visible = currentScroll >= d1080 && currentScroll <= d1260;
      }
      if (reviewGroup) {
        reviewGroup.visible = currentScroll >= d1380 && currentScroll <= d1500;
      }
      if (awardsGroup) {
        awardsGroup.visible = currentScroll >= d1700 && currentScroll <= d2100;
      }

      // Update camera matrix to look at target
      camera.lookAt(lookTarget);
      renderer.render(scene, camera);
    };
    animate();

    // 13. Window Resize Handler
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      updateScrollThresholds();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", handleResize);

    // Initial ScrollTrigger refresh delay
    setTimeout(() => { ScrollTrigger.refresh(); }, 1000);

    // 14. Cleanup function on component unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (handleReelClick) {
        window.removeEventListener("click", handleReelClick);
      }

      // Kill ScrollTriggers and contexts
      ScrollTrigger.getAll().forEach((t) => t.kill());
      
      // Dispose materials/geometries recursively
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
        }
      });

      if (renderer) {
        renderer.forceContextLoss();
        renderer.dispose();
        renderer.domElement.remove();
      }
    };
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#cad1fc]">
        <span className="text-xs font-semibold tracking-widest text-[#0a0c20] uppercase animate-pulse">
          Initializing WebGL...
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full text-[#0a0c20]">
      {/* 1. LOADING SCREEN */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#cad1fc] transition-opacity duration-700">
          <div className="w-64 h-1 bg-slate-300/40 rounded-full overflow-hidden relative">
            <div 
              className="absolute left-0 top-0 h-full bg-[#0a0c20] transition-all duration-300 ease-out" 
              style={{ width: `${loadingProgress}%` }} 
            />
          </div>
          <span className="mt-4 text-xs font-semibold tracking-widest text-[#0a0c20] uppercase">
            Loading Experience ({loadingProgress}%)
          </span>
        </div>
      )}

      {/* 2. AUDIO TOGGLE BUTTON */}
      <div className="fixed top-6 right-6 z-40 flex items-center gap-3">
        <button
          onClick={toggleAudio}
          className="p-3 bg-white/40 border border-white/20 backdrop-blur-md rounded-full shadow-lg text-[#0a0c20] hover:bg-white/60 transition-all duration-300"
        >
          {isPlayingAudio ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>

      <div className="fixed top-6 left-6 z-40">
        <span className="font-bold tracking-tighter text-lg text-[#0a0c20]">
          松涛 × NOOMO
        </span>
      </div>

      {/* 3. WEBGL STAGE CANVAS CONTAINER */}
      <div ref={containerRef} id="main-scene" className="fixed inset-0 z-0 pointer-events-none opacity-0" />

      {/* FIXED OVERLAYS */}
      {/* Fixed Technology Channel Overlay */}
      <div
        id="tech-channel-overlay"
        className="fixed inset-0 z-30 pointer-events-none flex flex-col justify-end p-12 md:p-24 opacity-0"
      >
        <div className="flex w-full h-full items-end justify-end">
          <div className="max-w-md text-left pb-4 pointer-events-auto">
            <span className="text-xs font-bold tracking-wider text-[#0a0c20] uppercase">Tech Channel / 技术频道</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2 text-[#0a0c20]">
              技术是浪漫的。
            </h2>
            <div className="mt-4 space-y-4 text-sm text-slate-700 leading-relaxed">
              <p>
                我曾经把它理解为竞赛、求职、刷题和标准答案。走过一段弯路之后，才慢慢意识到，技术真正值得追问的，不是如何通过筛选，而是如何创造工具，如何扩展人的能力，如何让自己和他人的生活变得更好。
              </p>
              <p className="font-semibold text-slate-800">
                谦逊，自驱，持续。这是我现在面对技术的姿态
              </p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-12 md:bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <Link
            href="/blog/tech"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#0a0c20] text-white text-xs font-bold tracking-wider uppercase shadow-lg hover:bg-pink-700 hover:scale-105 transition-all duration-300"
          >
            访问技术频道
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* 4. SCROLL CONTAINER TRACK */}
      <div ref={scrollContainerRef} className="relative z-10 w-full h-[2500vh]">
        {/* Stage 0: Hero Overlay */}
        <section className="sticky top-0 w-full h-screen flex flex-col justify-end p-12 md:p-24 pointer-events-none">
          <div className="max-w-xl text-left transform translate-y-[-20%] pointer-events-auto hero-text opacity-0">
            {/* Stage 0 texts removed per request */}
          </div>
        </section>

        {/* Stage 1: Jellyfish / Immersive Lab Section */}
        <div className="h-[200vh]" />
        <section className="sticky top-0 w-full h-screen pointer-events-none" />

        {/* Stage 2: Coinbase Case Section */}
        <div className="h-[200vh]" />
        <section className="sticky top-0 w-full h-screen flex items-center justify-end p-12 md:p-24 pointer-events-none">
          <div className="max-w-md text-left bg-white/10 p-8 rounded-3xl border border-white/15 backdrop-blur-lg shadow-xl pointer-events-auto">
            <span className="text-xs font-bold tracking-wider text-amber-700 uppercase">Case Study</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2 uppercase text-[#0a0c20]">
              Coinbase × GSW
            </h2>
            <p className="mt-4 text-sm text-slate-700">
              An immersive web celebration for fans to mint and trade commemorative NFTs in a golden-themed WebGL playground.
            </p>
          </div>
        </section>

        {/* Stage 3: Salesforce Cards Section */}
        <div className="h-[200vh]" />
        <section className="sticky top-0 w-full h-screen flex items-center justify-start p-12 md:p-24 pointer-events-none">
          <div className="max-w-md text-left bg-white/10 p-8 rounded-3xl border border-white/15 backdrop-blur-lg shadow-xl pointer-events-auto">
            <span className="text-xs font-bold tracking-wider text-sky-700 uppercase">Enterprise UX</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2 uppercase text-[#0a0c20]">
              Salesforce 360 Platform
            </h2>
            <p className="mt-4 text-sm text-slate-700">
              Visualizing complex Salesforce cloud integrations through glossy 3D interactive tiles and nested glass platforms.
            </p>
          </div>
        </section>

        {/* Stage 4: Joystick / Custom Section */}
        <div className="h-[200vh]" />
        <section className="sticky top-0 w-full h-screen flex items-center justify-start p-12 md:p-24 pointer-events-none">
          <div className="max-w-md text-left bg-white/10 p-8 rounded-3xl border border-white/15 backdrop-blur-lg shadow-xl pointer-events-auto">
            <span className="text-xs font-bold tracking-wider text-indigo-700 uppercase">Gaming Dynamics</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2 uppercase text-[#0a0c20]">
              Playful Interactions
            </h2>
            <p className="mt-4 text-sm text-slate-700">
              Interactive 3D hand-drawn controllers and retro plug physics that turn standard browsing layouts into physical storytelling systems.
            </p>
          </div>
        </section>

        {/* Stage 5: Video Showcases Section */}
        <div className="h-[200vh]" />
        <section className="sticky top-0 w-full h-screen flex items-center justify-center p-12 pointer-events-none">
          <div className="w-full max-w-4xl bg-white/10 p-8 rounded-3xl border border-white/15 backdrop-blur-lg shadow-xl flex flex-col md:flex-row gap-8 items-center pointer-events-auto">
            <div className="flex-1">
              <span className="text-xs font-bold tracking-wider text-indigo-700 uppercase">Cinematic Showcases</span>
              <h2 className="text-3xl font-extrabold mt-2 uppercase text-[#0a0c20]">
                Motion Graphics
              </h2>
              <p className="mt-4 text-sm text-slate-700">
                Connecting WebGL with traditional HTML video frames seamlessly. Users hover and play interactive 3D video slots built within the rendering engine.
              </p>
              <div className="mt-6 flex gap-4">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-[#0a0c20] text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-slate-800 transition-colors duration-300">
                  <Play size={12} fill="white" />
                  <span>Play Reel</span>
                </button>
              </div>
            </div>
            <div className="flex-1 w-full aspect-video rounded-2xl overflow-hidden relative border border-slate-900/10 shadow-inner">
              <iframe
                className="absolute inset-0 w-full h-full object-cover"
                src="https://player.vimeo.com/video/805175960?background=1&autoplay=1&loop=1&byline=0&title=0"
                allow="autoplay; fullscreen"
                title="Case Reel"
              />
            </div>
          </div>
        </section>

        {/* Stage 6: Testimonials Reviews Section */}
        <div className="h-[200vh]" />
        <section className="sticky top-0 w-full h-screen flex items-center justify-start p-12 md:p-24 pointer-events-none">
          <div className="w-full max-w-2xl bg-white/10 p-8 rounded-3xl border border-white/15 backdrop-blur-lg shadow-xl pointer-events-auto flex flex-col gap-6 testimonails-text">
            <span className="text-xs font-bold tracking-wider text-rose-700 uppercase">Reviews</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/40 p-5 rounded-2xl border border-white/20 backdrop-blur-md">
                <p className="text-xs italic text-slate-800">
                  &ldquo;Noomo does such incredible and thoughtful work. I have been at this almost 25 years and have never been more impressed with an agency.&rdquo;
                </p>
                <div className="mt-3">
                  <h4 className="text-xs font-bold text-[#0a0c20]">Wallis Mills</h4>
                  <span className="text-[10px] text-slate-600">Director of Marketing, Network Tech</span>
                </div>
              </div>
              <div className="bg-white/40 p-5 rounded-2xl border border-white/20 backdrop-blur-md">
                <p className="text-xs italic text-slate-800">
                  &ldquo;The entire Noomo team have been an exceptional and trusted creative partner in shaping our global products. I have full confidence in them.&rdquo;
                </p>
                <div className="mt-3">
                  <h4 className="text-xs font-bold text-[#0a0c20]">David Grau</h4>
                  <span className="text-[10px] text-slate-600">Director Global Product Design, Cadence</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stage 7: Awards & Footer */}
        <div className="h-[200vh]" />
        <section className="sticky top-0 w-full h-screen flex flex-col justify-between p-12 md:p-24 pointer-events-none">
          <div className="max-w-md bg-white/10 p-8 rounded-3xl border border-white/15 backdrop-blur-lg shadow-xl pointer-events-auto">
            <span className="text-xs font-bold tracking-wider text-yellow-700 uppercase">Accolades</span>
            <h2 className="text-3xl font-extrabold tracking-tight mt-2 uppercase text-[#0a0c20]">
              Awwwards & Webby
            </h2>
            <p className="mt-4 text-sm text-slate-700">
              Honored with Webby design awards, Red Dot recognition, and Awwwards trophies for our forward-looking digital craftsmanship.
            </p>
          </div>
          
          <div className="w-full bg-[#0a0c20] text-white p-8 rounded-3xl border border-white/10 pointer-events-auto flex flex-col md:flex-row justify-between items-center gap-6 mt-12">
            <div className="text-left">
              <h3 className="text-xl font-bold tracking-tight uppercase">Let&apos;s create together</h3>
              <p className="text-xs text-slate-400 mt-1">Replicating WebGL aesthetics with Google DeepMind Antigravity.</p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-white text-[#0a0c20] text-xs font-bold uppercase tracking-widest rounded-full hover:bg-slate-100 transition-colors duration-300">
              <span>Start Project</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
