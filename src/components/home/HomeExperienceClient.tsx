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
import ObserveSignalField from "./ObserveSignalField";
import ExpressConnectionField from "./ExpressConnectionField";
import CreateRingField from "./CreateRingField";
import { CREATE_RING_SCROLL_OFFSET, CREATE_STAGE_SCROLL_OFFSET } from "./scrollTimings";
import { SITE_WARM_BACKGROUND, SITE_WARM_BACKGROUND_THREE } from "@/lib/site-theme";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
}

const expressConnectionScroll = {
  start: 875,
  end: 1230 + CREATE_STAGE_SCROLL_OFFSET,
};

const channelEntryScroll = {
  start: 2040 + CREATE_RING_SCROLL_OFFSET,
  end: 2340 + CREATE_RING_SCROLL_OFFSET,
};

const channelEntries = [
  { id: "tech", label: "TECH", href: "/blog/tech", svg: "/home-experience/svgtitle/channel-tech.svg", scale: 0.00115 },
  { id: "life", label: "LIFE", href: "/blog/life", svg: "/home-experience/svgtitle/channel-life.svg", scale: 0.00125 },
  { id: "finance", label: "FINANCE", href: "/blog/finance", svg: "/home-experience/svgtitle/channel-finance.svg", scale: 0.00078 },
  { id: "design", label: "DESIGN", href: "/blog/create", svg: "/home-experience/svgtitle/channel-design.svg", scale: 0.00088 },
] as const;

// Coordinate arrays for camera and look-at targets.
// The first three post-hero beats are Observe -> Express -> Create; the
// path changes after Create as the page enters the about/channels/contact area.
const cameraStages = [
  {
    name: "observe",
    from: { x: 2.093, y: -4.505, z: 44.601 },
    to: { x: -2.484, y: 3.733, z: 30.641 },
    scrollRange: { start: 0, end: 200 },
    ease: "power2.inOut",
  },
  {
    name: "express",
    from: { x: -2.484, y: 3.733, z: 30.641 },
    to: { x: 0.783, y: 14.749, z: 13.3 },
    scrollRange: { start: 625, end: 820 },
    ease: "power2.inOut",
  },
  {
    name: "create",
    from: { x: 0.783, y: 14.749, z: 13.3 },
    to: { x: 4.024, y: 22.301, z: 7.031 },
    scrollRange: { start: 1245 + CREATE_STAGE_SCROLL_OFFSET, end: 1440 + CREATE_STAGE_SCROLL_OFFSET },
    ease: "power2.inOut",
  },
  {
    name: "post-create",
    from: { x: 4.024, y: 22.301, z: 7.031 },
    to: { x: 23.346, y: 20.432, z: 2.102 },
    scrollRange: { start: 1545 + CREATE_RING_SCROLL_OFFSET, end: 1740 + CREATE_RING_SCROLL_OFFSET },
    ease: "power2.inOut",
  },
  {
    name: "about",
    from: { x: 23.346, y: 20.432, z: 2.102 },
    to: { x: 23.346, y: 18.432, z: 2.102 },
    scrollRange: { start: 1745 + CREATE_RING_SCROLL_OFFSET, end: 1990 + CREATE_RING_SCROLL_OFFSET },
    ease: "power2.inOut",
  },
  {
    name: "channels",
    from: { x: 23.346, y: 18.432, z: 2.102 },
    to: { x: 23.346, y: 18.432, z: 2.102 },
    scrollRange: { start: 2040 + CREATE_RING_SCROLL_OFFSET, end: 2240 + CREATE_RING_SCROLL_OFFSET },
    ease: "power2.inOut",
  },
  {
    name: "contact",
    from: { x: 23.346, y: 18.432, z: 2.102 },
    to: { x: 23.346, y: 18.432, z: 2.102 },
    scrollRange: { start: 2340 + CREATE_RING_SCROLL_OFFSET, end: 2540 + CREATE_RING_SCROLL_OFFSET },
    ease: "power2.inOut",
  },
];

const targetStages = [
  {
    name: "observe",
    from: { x: 4.093, y: -7.005, z: 0.601 },
    to: { x: 7.958, y: -0.55, z: 1.019 },
    scrollRange: { start: 0, end: 200 },
    ease: "power2.inOut",
  },
  {
    name: "express",
    from: { x: 7.958, y: -0.55, z: 1.019 },
    to: { x: 15.777, y: 12.603, z: -0.428 },
    scrollRange: { start: 625, end: 820 },
    ease: "power2.inOut",
  },
  {
    name: "create",
    from: { x: 15.777, y: 12.603, z: -0.428 },
    to: { x: 17.443, y: 20.712, z: 0.431 },
    scrollRange: { start: 1245 + CREATE_STAGE_SCROLL_OFFSET, end: 1440 + CREATE_STAGE_SCROLL_OFFSET },
    ease: "power2.inOut",
  },
  {
    name: "post-create",
    from: { x: 17.443, y: 20.712, z: 0.431 },
    to: { x: 23.342, y: 20.293, z: 1.263 },
    scrollRange: { start: 1545 + CREATE_RING_SCROLL_OFFSET, end: 1740 + CREATE_RING_SCROLL_OFFSET },
    ease: "power2.inOut",
  },
  {
    name: "about",
    from: { x: 23.342, y: 20.293, z: 1.263 },
    to: { x: 23.342, y: 18.293, z: 1.263 },
    scrollRange: { start: 1745 + CREATE_RING_SCROLL_OFFSET, end: 1990 + CREATE_RING_SCROLL_OFFSET },
    ease: "power2.inOut",
  },
  {
    name: "channels",
    from: { x: 23.342, y: 18.293, z: 1.263 },
    to: { x: 23.342, y: 18.293, z: 1.263 },
    scrollRange: { start: 2040 + CREATE_RING_SCROLL_OFFSET, end: 2240 + CREATE_RING_SCROLL_OFFSET },
    ease: "power2.inOut",
  },
  {
    name: "contact",
    from: { x: 23.342, y: 18.293, z: 1.263 },
    to: { x: 23.342, y: 18.293, z: 1.263 },
    scrollRange: { start: 2340 + CREATE_RING_SCROLL_OFFSET, end: 2540 + CREATE_RING_SCROLL_OFFSET },
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

export default function HomeExperienceClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const isDesktop = width > 1024;

    // Responsive viewport units
    const vw = (v: number) => width * (v / 100);
    const vh = (v: number) => height * (v / 100);
    const getScrollDepth = (percent: number) => Math.min(vw(percent), vh(percent));

    let dVideoStart = 0, dVideoEnd = 0, dReviewsStart = 0, dReviewsEnd = 0, dAwardsStart = 0, dAwardsEnd = 0;
    const updateScrollThresholds = () => {
      dVideoStart = getScrollDepth(1820 + CREATE_RING_SCROLL_OFFSET);
      dVideoEnd = getScrollDepth(2000 + CREATE_RING_SCROLL_OFFSET);
      dReviewsStart = getScrollDepth(2120 + CREATE_RING_SCROLL_OFFSET);
      dReviewsEnd = getScrollDepth(2240 + CREATE_RING_SCROLL_OFFSET);
      dAwardsStart = getScrollDepth(2440 + CREATE_RING_SCROLL_OFFSET);
      dAwardsEnd = getScrollDepth(2840 + CREATE_RING_SCROLL_OFFSET);
    };
    updateScrollThresholds();

    // 1. Initialise Three.js Components
    const clock = new THREE.Clock();
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(SITE_WARM_BACKGROUND_THREE);

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

    let createGroup: THREE.Group | null = null;
    let expressGroup: THREE.Group | null = null;
    let observeGroup: THREE.Group | null = null;
    let channelTitleGroup: THREE.Group | null = null;
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

    const createSvgTextModel = (data: { paths: any[] }, scale: number, color = 0x0a0c20) => {
      const group = new THREE.Group();
      const materials: THREE.MeshStandardMaterial[] = [];

      data.paths.forEach((path) => {
        const shapes = SVGLoader.createShapes(path);
        shapes.forEach((shape) => {
          const geometry = new THREE.ExtrudeGeometry(shape, {
            depth: 10,
            bevelEnabled: true,
            bevelThickness: 0.8,
            bevelSize: 0.8,
            bevelSegments: 1,
          });
          const material = new THREE.MeshStandardMaterial({
            color,
            roughness: 0.42,
            metalness: 0.08,
            transparent: true,
            opacity: 0,
          });
          const mesh = new THREE.Mesh(geometry, material);
          group.add(mesh);
          materials.push(material);
        });
      });

      const bounds = new THREE.Box3().setFromObject(group);
      const center = bounds.getCenter(new THREE.Vector3());
      group.children.forEach((child) => {
        child.position.x -= center.x;
        child.position.y -= center.y;
        child.position.z -= center.z;
      });
      group.scale.set(scale, -scale, scale);
      group.userData.materials = materials;
      return group;
    };

    const loadSvgTextModel = (
      url: string,
      scale: number,
      onLoad: (model: THREE.Group) => void,
      color = 0x0a0c20
    ) => {
      const loader = new SVGLoader();
      loader.load(url, (data) => {
        onLoad(createSvgTextModel(data, scale, color));
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
    hdri1 = textureLoader.load("/home-experience/hdri/1.jpeg", () => {
      hdri1.mapping = THREE.EquirectangularReflectionMapping;
      hdri1.colorSpace = THREE.SRGBColorSpace;

      hdri2 = textureLoader.load("/home-experience/hdri/h4.jpeg", () => {
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

        // Start loading the models
        loadModels();
      });
    });

    const loadModels = () => {
      // The former showcase/reviews/awards scenes remain in this file only as a
      // temporary migration reference. They are not loaded while the three
      // replacement stages are intentionally content-empty.
      const shouldLoadLegacyFinalStageVisuals = false;

      // 1. Cyclorama Background Plane
      const bgTex = textureLoader.load("/home-experience/backTexture/background-f0eee7.png");
      bgTex.colorSpace = THREE.SRGBColorSpace;
      glbLoader.load("/home-experience/models/BG2.glb", (gltf) => {
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

      // 2. Stage display models removed; only title SVGs remain on the camera path.

      // Load Title SVG for Hero (Chinese text left-aligned, right side up with positive Y scale)
      loadSvg("/home-experience/svgtitle/startTitle.svg", [0.008, 0.008, 0.008], [-0.13, -7.35, 20], [-0.05675, -0.04535, -0.00257]);

      // 3. Stage 3 title: Create
      createGroup = new THREE.Group();
      const createHomePosition = isDesktop
        ? { x: 20, y: 19.5, z: -1 }
        : { x: 20.3, y: 21.9, z: -1 };
      const createParkedPosition = isDesktop
        ? { x: 16.35, y: 21.65, z: -1.18 }
        : { x: 18.7, y: 22.9, z: -1.12 };
      const createParkedScale = isDesktop ? 0.54 : 0.68;

      createGroup.position.set(createHomePosition.x, createHomePosition.y, createHomePosition.z);
      scene.add(createGroup);

      loadSvg("/home-experience/svgtitle/create.svg",
        isDesktop ? [0.009, -0.009, 0.009] : [0.004, -0.004, 0.004],
        isDesktop ? [3.8722, 2.3926, -6.0889] : [0, 1.3, -3],
        [-0.23628, -1.1024, -0.21163],
        0x0a0c20,
        createGroup
      );

      gsap.fromTo(createGroup.position,
        createHomePosition,
        {
          ...createParkedPosition,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: "body",
            start: () => getScrollDepth(1445 + CREATE_STAGE_SCROLL_OFFSET) + " top",
            end: () => getScrollDepth(1525 + CREATE_STAGE_SCROLL_OFFSET) + " top",
            scrub: true,
            invalidateOnRefresh: true,
          }
        }
      );
      gsap.fromTo(createGroup.scale,
        { x: 1, y: 1, z: 1 },
        {
          x: createParkedScale,
          y: createParkedScale,
          z: createParkedScale,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: "body",
            start: () => getScrollDepth(1445 + CREATE_STAGE_SCROLL_OFFSET) + " top",
            end: () => getScrollDepth(1525 + CREATE_STAGE_SCROLL_OFFSET) + " top",
            scrub: true,
            invalidateOnRefresh: true,
          }
        }
      );
      gsap.fromTo(createGroup.position,
        createParkedPosition,
        {
          ...createHomePosition,
          ease: "power2.inOut",
          immediateRender: false,
          scrollTrigger: {
            trigger: "body",
            start: () => getScrollDepth(1950 + CREATE_STAGE_SCROLL_OFFSET) + " top",
            end: () => getScrollDepth(2035 + CREATE_STAGE_SCROLL_OFFSET) + " top",
            scrub: true,
            invalidateOnRefresh: true,
          }
        }
      );
      gsap.fromTo(createGroup.scale,
        { x: createParkedScale, y: createParkedScale, z: createParkedScale },
        {
          x: 1,
          y: 1,
          z: 1,
          ease: "power2.inOut",
          immediateRender: false,
          scrollTrigger: {
            trigger: "body",
            start: () => getScrollDepth(1950 + CREATE_STAGE_SCROLL_OFFSET) + " top",
            end: () => getScrollDepth(2035 + CREATE_STAGE_SCROLL_OFFSET) + " top",
            scrub: true,
            invalidateOnRefresh: true,
          }
        }
      );

      // 4. Stage 2 title: Express
      expressGroup = new THREE.Group();
      expressGroup.position.set(11.95, 12.1, 3);
      if (!isDesktop) expressGroup.position.set(11.95, 14.1, 3);
      scene.add(expressGroup);

      loadSvg("/home-experience/svgtitle/express.svg",
        isDesktop ? [0.0067, -0.0067, 0.0067] : [0.0045, -0.0045, 0.0045],
        isDesktop ? [-1.9, 2.3, -3.71] : [0.9, 1.3, -3],
        [-0.155, -0.8234, -0.1141],
        0x0a0c20,
        expressGroup
      );

      gsap.fromTo(expressGroup.position,
        {
          x: isDesktop ? 11.95 : 11.95,
          y: isDesktop ? 12.1 : 14.1,
          z: 3,
        },
        {
          x: isDesktop ? 10.8 : 12.1,
          y: isDesktop ? 13.75 : 14.7,
          z: 3,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: "body",
            start: () => getScrollDepth(825) + " top",
            end: () => getScrollDepth(905) + " top",
            scrub: true,
            invalidateOnRefresh: true,
          }
        }
      );
      gsap.fromTo(expressGroup.scale,
        { x: 1, y: 1, z: 1 },
        {
          x: isDesktop ? 0.62 : 0.78,
          y: isDesktop ? 0.62 : 0.78,
          z: isDesktop ? 0.62 : 0.78,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: "body",
            start: () => getScrollDepth(825) + " top",
            end: () => getScrollDepth(905) + " top",
            scrub: true,
            invalidateOnRefresh: true,
          }
        }
      );

      const expressEdges = gsap.utils.toArray<SVGPathElement>(".express-edge");
      const expressNodes = gsap.utils.toArray<SVGGElement>(".express-node");
      gsap.set(".express-connection-field", { autoAlpha: 0 });
      gsap.set(".express-legend", { autoAlpha: 0, x: 24 });
      expressEdges.forEach((edge) => {
        const length = edge.getTotalLength();
        gsap.set(edge, { strokeDasharray: length, strokeDashoffset: length, opacity: 0 });
      });
      gsap.set(expressNodes, { autoAlpha: 0, scale: 0.72, transformOrigin: "center center" });

      const expressTl = gsap.timeline({
        scrollTrigger: {
          trigger: "body",
          start: () => getScrollDepth(expressConnectionScroll.start) + " top",
          end: () => getScrollDepth(expressConnectionScroll.end) + " top",
          scrub: true,
          invalidateOnRefresh: true,
        }
      });
      expressTl
        .to(".express-connection-field", { autoAlpha: 1, duration: 0.06, ease: "none" }, 0)
        .to(".express-node-level-0", { autoAlpha: 1, scale: 1, duration: 0.12, ease: "power1.out" }, 0.04)
        .to(".express-edge-level-1", { strokeDashoffset: 0, opacity: 1, duration: 0.28, stagger: 0.035, ease: "power1.inOut" }, 0.14)
        .to(".express-node-level-1", { autoAlpha: 1, scale: 1, duration: 0.16, stagger: 0.035, ease: "power1.out" }, 0.28)
        .to(".express-edge-level-2", { strokeDashoffset: 0, opacity: 1, duration: 0.34, stagger: 0.032, ease: "power1.inOut" }, 0.42)
        .to(".express-node-level-2", { autoAlpha: 1, scale: 1, duration: 0.16, stagger: 0.035, ease: "power1.out" }, 0.56)
        .to(".express-edge-level-3", { strokeDashoffset: 0, opacity: 0.72, duration: 0.22, stagger: 0.04, ease: "power1.inOut" }, 0.72)
        .to(".express-legend", { autoAlpha: 1, x: 0, duration: 0.16, ease: "power1.out" }, 0.78)
        .to(".express-connection-field", { autoAlpha: 0, duration: 0.1, ease: "none" }, 1.18);

      // 5. Stage 1 title: Observe
      observeGroup = new THREE.Group();
      observeGroup.position.set(3.1, 1.6, 14);
      if (!isDesktop) observeGroup.position.set(3.3, 4.0, 14);
      scene.add(observeGroup);

      loadSvg("/home-experience/svgtitle/observe.svg",
        isDesktop ? [0.0085, -0.0085, 0.0085] : [0.004, -0.004, 0.004],
        isDesktop ? [-0.19, 0.42, -4.7] : [0.22, 0.73, -3],
        [-0.1436, -0.3357, -0.0476],
        0x0a0c20,
        observeGroup
      );

      gsap.fromTo(observeGroup.position,
        {
          x: isDesktop ? 3.1 : 3.3,
          y: isDesktop ? 1.6 : 4.0,
          z: 14,
        },
        {
          x: isDesktop ? -0.15 : 1.45,
          y: isDesktop ? 3.65 : 6.05,
          z: 14,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: "body",
            start: () => getScrollDepth(205) + " top",
            end: () => getScrollDepth(285) + " top",
            scrub: true,
            invalidateOnRefresh: true,
          }
        }
      );
      gsap.fromTo(observeGroup.scale,
        { x: 1, y: 1, z: 1 },
        {
          x: isDesktop ? 0.56 : 0.72,
          y: isDesktop ? 0.56 : 0.72,
          z: isDesktop ? 0.56 : 0.72,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: "body",
            start: () => getScrollDepth(205) + " top",
            end: () => getScrollDepth(285) + " top",
            scrub: true,
            invalidateOnRefresh: true,
          }
        }
      );

      const observeSignalItems = gsap.utils.toArray<HTMLElement>(".observe-signal-item");
      gsap.set(".observe-signal-field", { autoAlpha: 0 });
      gsap.set(".observe-signal-core", { opacity: 0, scale: 0.94 });
      gsap.set(".observe-signal-crosshair", { opacity: 0 });
      gsap.set(observeSignalItems, {
        xPercent: -50,
        yPercent: -50,
        x: (_, target) => (target as HTMLElement).dataset.startX || "0vw",
        y: (_, target) => (target as HTMLElement).dataset.startY || "0vh",
        opacity: 0,
        scale: 0.86,
        filter: "blur(3px)",
      });

      const signalTimings = [
        { start: 0.07, live: 0.24, endX: "-7.2vw", endY: "-4.6vh", scale: 0.78 },
        { start: 0.19, live: 0.24, endX: "6.8vw", endY: "-4.1vh", scale: 0.72 },
        { start: 0.31, live: 0.24, endX: "-6.2vw", endY: "4.8vh", scale: 0.76 },
        { start: 0.43, live: 0.24, endX: "7.5vw", endY: "4.6vh", scale: 0.68 },
        { start: 0.55, live: 0.24, endX: "4.8vw", endY: "-5.5vh", scale: 0.74 },
        { start: 0.67, live: 0.23, endX: "-8vw", endY: "3.4vh", scale: 0.7 },
        { start: 0.79, live: 0.18, endX: "5.8vw", endY: "3.6vh", scale: 0.64 },
        { start: 0.89, live: 0.15, endX: "-4.6vw", endY: "5.7vh", scale: 0.58 },
      ];

      const observeSignalTl = gsap.timeline({
        scrollTrigger: {
          trigger: "body",
          start: () => getScrollDepth(245) + " top",
          end: () => getScrollDepth(610) + " top",
          scrub: true,
          invalidateOnRefresh: true,
        }
      });
      observeSignalTl
        .to(".observe-signal-field", { autoAlpha: 1, duration: 0.06, ease: "none" }, 0)
        .to(".observe-signal-crosshair", { opacity: 1, duration: 0.16, ease: "none" }, 0.03)
        .to(".observe-signal-core", { opacity: 1, scale: 1, duration: 0.16, ease: "power1.out" }, 0.1)
        .to(".observe-signal-core", { opacity: 0, scale: 0.86, duration: 0.16, ease: "power1.in" }, 0.9)
        .to(".observe-signal-crosshair", { opacity: 0, duration: 0.12, ease: "none" }, 0.92)
        .to(".observe-signal-field", { autoAlpha: 0, duration: 0.08, ease: "none" }, 0.97);

      observeSignalItems.forEach((item, index) => {
        const timing = signalTimings[index % signalTimings.length];
        observeSignalTl
          .to(item, {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.055,
            ease: "power1.out",
          }, timing.start)
          .to(item, {
            x: timing.endX,
            y: timing.endY,
            scale: timing.scale,
            duration: timing.live,
            ease: "power1.inOut",
          }, timing.start + 0.045)
          .to(item, {
            opacity: 0,
            scale: 0.34,
            filter: "blur(8px)",
            duration: 0.075,
            ease: "power1.in",
          }, timing.start + timing.live);
      });

      // 6. Channel entry titles: SVG-derived 3D word marks that rotate into
      // a neutral center pose while the channel stage scrolls past.
      channelTitleGroup = new THREE.Group();
      channelTitleGroup.position.set(
        isDesktop ? 23.34 : 23.28,
        isDesktop ? 18.24 : 18.08,
        isDesktop ? -1.72 : -1.38
      );
      channelTitleGroup.rotation.set(-0.0776, 0.0103, 0.0008);
      channelTitleGroup.visible = false;
      scene.add(channelTitleGroup);

      const channelTitleModels = channelEntries.map((entry) => ({
        ...entry,
        model: null as THREE.Group | null,
      }));
      const channelActiveColor = new THREE.Color(0x0a0c20);
      const channelMutedColor = new THREE.Color(0x687084);
      const channelSpacing = isDesktop ? 1.82 : 1.28;

      const updateChannelTitleModels = (progress: number) => {
        const activeIndex = progress * (channelTitleModels.length - 1);

        channelTitleModels.forEach((entry, index) => {
          if (!entry.model) return;

          const distanceFromCenter = index - activeIndex;
          const absoluteDistance = Math.abs(distanceFromCenter);
          const centerWeight = THREE.MathUtils.clamp(1 - absoluteDistance, 0, 1);
          const opacity = THREE.MathUtils.clamp(1 - absoluteDistance * 0.48, 0.08, 0.95);
          const scale = entry.scale * (isDesktop ? 1 : 0.74) * (1 + centerWeight * 0.08);
          const color = new THREE.Color().lerpColors(channelMutedColor, channelActiveColor, centerWeight);

          entry.model.visible = absoluteDistance < 1.7;
          entry.model.position.set(
            isDesktop ? distanceFromCenter * -0.08 : 0,
            -distanceFromCenter * channelSpacing,
            distanceFromCenter * -0.16
          );
          entry.model.rotation.set(
            -0.045 + absoluteDistance * 0.08,
            distanceFromCenter * 0.08,
            distanceFromCenter * -0.23
          );
          entry.model.scale.set(scale, -scale, scale);
          (entry.model.userData.materials as THREE.MeshStandardMaterial[]).forEach((material) => {
            material.opacity = opacity;
            material.color.copy(color);
          });
        });
      };

      channelTitleModels.forEach((entry) => {
        const entryScale = entry.scale * (isDesktop ? 1 : 0.74);

        loadSvgTextModel(entry.svg, entryScale, (model) => {
          model.name = `channel-title-${entry.id}`;
          model.visible = false;
          channelTitleGroup!.add(model);
          entry.model = model;
          updateChannelTitleModels(0);
        });
      });

      updateChannelTitleModels(0);
      ScrollTrigger.create({
        trigger: "body",
        start: () => getScrollDepth(channelEntryScroll.start) + " top",
        end: () => getScrollDepth(channelEntryScroll.end) + " top",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          updateChannelTitleModels(self.progress);
        },
        onEnter: () => {
          if (channelTitleGroup) channelTitleGroup.visible = true;
        },
        onEnterBack: () => {
          if (channelTitleGroup) channelTitleGroup.visible = true;
        },
        onLeave: () => {
          if (channelTitleGroup) channelTitleGroup.visible = false;
        },
        onLeaveBack: () => {
          if (channelTitleGroup) channelTitleGroup.visible = false;
        },
      });

      if (shouldLoadLegacyFinalStageVisuals) {
      // 8. Legacy Stage 5 Motion Plane Showcase (disabled)
      const reelCanvas = document.createElement("canvas");
      reelCanvas.width = 1600;
      reelCanvas.height = 900;
      const reelCtx = reelCanvas.getContext("2d");
      if (reelCtx) {
        const gradient = reelCtx.createLinearGradient(0, 0, 1600, 900);
        gradient.addColorStop(0, SITE_WARM_BACKGROUND);
        gradient.addColorStop(0.5, "#f7d7e9");
        gradient.addColorStop(1, "#0a0c20");
        reelCtx.fillStyle = gradient;
        reelCtx.fillRect(0, 0, 1600, 900);
        reelCtx.fillStyle = "rgba(255,255,255,0.38)";
        for (let i = 0; i < 9; i += 1) {
          reelCtx.beginPath();
          reelCtx.arc(260 + i * 150, 180 + Math.sin(i) * 90, 80 + i * 8, 0, Math.PI * 2);
          reelCtx.fill();
        }
        reelCtx.fillStyle = "#0a0c20";
        reelCtx.font = "700 82px Arial";
        reelCtx.fillText("且听松涛", 120, 710);
        reelCtx.font = "500 34px Arial";
        reelCtx.fillText("Interactive notes on code, design, life and markets", 124, 770);
      }

      const videoTex = new THREE.CanvasTexture(reelCanvas);
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

      glbLoader.load("/home-experience/models/playWithMesh.glb", (gltf) => {
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

      glbLoader.load("/home-experience/models/SoundOff.glb", (gltf) => {
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
            start: () => getScrollDepth(1820 + CREATE_RING_SCROLL_OFFSET) + " top",
            end: () => getScrollDepth(2000 + CREATE_RING_SCROLL_OFFSET) + " top",
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
            start: () => getScrollDepth(1860 + CREATE_RING_SCROLL_OFFSET) + " top",
            end: () => getScrollDepth(2000 + CREATE_RING_SCROLL_OFFSET) + " top",
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
            start: () => getScrollDepth(1850 + CREATE_RING_SCROLL_OFFSET) + " top",
            end: () => getScrollDepth(2010 + CREATE_RING_SCROLL_OFFSET) + " top",
            scrub: true,
          }
        }
      );

      // Auto mute on scroll leave
      ScrollTrigger.create({
        trigger: "body",
        start: () => getScrollDepth(1810 + CREATE_RING_SCROLL_OFFSET) + " top",
        end: () => getScrollDepth(2290 + CREATE_RING_SCROLL_OFFSET) + " top",
        onLeave: () => { muteReelVideo(); },
        onLeaveBack: () => { muteReelVideo(); }
      });

      const muteReelVideo = () => {
        isVideoMuted = true;
        gsap.to(playButtonMesh!.scale, { x: 0.12, y: 0.12, z: 0.12, duration: 1, ease: "power2.inOut" });
        gsap.to(soundOffMesh!.scale, { x: 0, y: 0, z: 0, duration: 1, ease: "power2.inOut" });
        gsap.to(buttonContainerGroup.position, { x: 0, y: 0, duration: 1, ease: "power2.inOut" });
      };

      const unmuteReelVideo = () => {
        isVideoMuted = false;
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
                scrollTo: getScrollDepth(2010 + CREATE_RING_SCROLL_OFFSET),
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
      loadSvg("/home-experience/svgtitle/revTitle.svg", [0.0033, -0.0033, 0.0033], [-0.1, 0, 0], [-0.07768, 0.01034, 0.0008], 0x0a0c20, reviewGroup);

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
          texture: "/home-experience/revs/rev1.png",
          rotationY: 120,
          motionPathScroll: { start: 2040 + CREATE_RING_SCROLL_OFFSET, end: 2490 + CREATE_RING_SCROLL_OFFSET },
          rotationYScroll: { start: 2060 + CREATE_RING_SCROLL_OFFSET, end: 2510 + CREATE_RING_SCROLL_OFFSET },
          rotationXZScroll: { start: 2240 + CREATE_RING_SCROLL_OFFSET, end: 2590 + CREATE_RING_SCROLL_OFFSET },
        },
        {
          name: "second",
          texture: "/home-experience/revs/rev2.png",
          rotationY: 120,
          motionPathScroll: { start: 2065 + CREATE_RING_SCROLL_OFFSET, end: 2515 + CREATE_RING_SCROLL_OFFSET },
          rotationYScroll: { start: 2085 + CREATE_RING_SCROLL_OFFSET, end: 2535 + CREATE_RING_SCROLL_OFFSET },
          rotationXZScroll: { start: 2265 + CREATE_RING_SCROLL_OFFSET, end: 2615 + CREATE_RING_SCROLL_OFFSET },
        },
        {
          name: "third",
          texture: "/home-experience/revs/rev3.png",
          rotationY: 130,
          motionPathScroll: { start: 2090 + CREATE_RING_SCROLL_OFFSET, end: 2540 + CREATE_RING_SCROLL_OFFSET },
          rotationYScroll: { start: 2110 + CREATE_RING_SCROLL_OFFSET, end: 2560 + CREATE_RING_SCROLL_OFFSET },
          rotationXZScroll: { start: 2290 + CREATE_RING_SCROLL_OFFSET, end: 2640 + CREATE_RING_SCROLL_OFFSET },
        },
        {
          name: "fourth",
          texture: "/home-experience/revs/rev4.png",
          rotationY: 140,
          motionPathScroll: { start: 2115 + CREATE_RING_SCROLL_OFFSET, end: 2565 + CREATE_RING_SCROLL_OFFSET },
          rotationYScroll: { start: 2135 + CREATE_RING_SCROLL_OFFSET, end: 2585 + CREATE_RING_SCROLL_OFFSET },
          rotationXZScroll: { start: 2315 + CREATE_RING_SCROLL_OFFSET, end: 2665 + CREATE_RING_SCROLL_OFFSET },
        },
      ];

      glbLoader.load("/home-experience/models/netrixtest3.glb", (gltf) => {
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
            start: () => getScrollDepth(2120 + CREATE_RING_SCROLL_OFFSET) + " top",
            end: () => getScrollDepth(2240 + CREATE_RING_SCROLL_OFFSET) + " top",
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
            start: () => getScrollDepth(2040 + CREATE_RING_SCROLL_OFFSET) + " top",
            end: () => getScrollDepth(2240 + CREATE_RING_SCROLL_OFFSET) + " top",
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
            start: () => getScrollDepth(2340 + CREATE_RING_SCROLL_OFFSET) + " top",
            end: () => getScrollDepth(2540 + CREATE_RING_SCROLL_OFFSET) + " top",
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
      loadAwardPlane("/home-experience/awards/Webby.png", [0, 0, 0], arRot, 0);
      loadAwardPlane("/home-experience/awards/reddot.png", [0, -2, 0], arRot, 1);
      loadAwardPlane("/home-experience/awards/SFDesignweek.png", [-0.1, -4.5, 0], arRot, 2);
      loadAwardPlane("/home-experience/awards/awwwards.png", [0, -7, 0], arRot, 3);

      // Load Trophy Meshes
      let webbyTrophy: THREE.Object3D;
      let reddotTrophy: THREE.Object3D;
      let sfdfTrophy: THREE.Object3D;
      let awwwardsTrophy: THREE.Object3D;

      glbLoader.load("/home-experience/models/webbby.glb", (gltf) => {
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

      glbLoader.load("/home-experience/models/reddot.glb", (gltf) => {
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

      glbLoader.load("/home-experience/models/SFDF_op1.glb", (gltf) => {
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

      glbLoader.load("/home-experience/models/awwwardsModel.glb", (gltf) => {
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

      glbLoader.load("/home-experience/models/Like.glb", (gltf) => {
        likesLocs.forEach((loc) => {
          const clone = gltf.scene.clone();
          clone.scale.set(0.15, 0.15, 0.15);
          clone.position.set(loc.xP, loc.yP + 1, loc.zP);
          clone.rotation.set(loc.rX, loc.rY, loc.rZ);
          clone.traverse((c) => { if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).material = glass; });
          awardsGroup.add(clone);
        });
      });

      glbLoader.load("/home-experience/models/heart.glb", (gltf) => {
        heartLocs.forEach((loc) => {
          const clone = gltf.scene.clone();
          clone.scale.set(0.15, 0.15, 0.15);
          clone.position.set(loc.xP, loc.yP + 1, loc.zP);
          clone.rotation.set(loc.rX, loc.rY, loc.rZ);
          clone.traverse((c) => { if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).material = glass; });
          awardsGroup.add(clone);
        });
      });

      glbLoader.load("/home-experience/models/goblet.glb", (gltf) => {
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
            start: () => getScrollDepth(2440 + CREATE_RING_SCROLL_OFFSET) + " top",
            end: () => getScrollDepth(2840 + CREATE_RING_SCROLL_OFFSET) + " top",
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
            start: () => getScrollDepth(2840 + CREATE_RING_SCROLL_OFFSET) + " top",
            end: () => getScrollDepth(2940 + CREATE_RING_SCROLL_OFFSET) + " top",
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
        triggerTrophyEntry(webbyTrophy, logoPlanes[0], 0.8, 2550 + CREATE_RING_SCROLL_OFFSET, 2620 + CREATE_RING_SCROLL_OFFSET);
        triggerTrophyEntry(reddotTrophy, logoPlanes[1], 0.35, 2620 + CREATE_RING_SCROLL_OFFSET, 2690 + CREATE_RING_SCROLL_OFFSET);
        triggerTrophyEntry(sfdfTrophy, logoPlanes[2], 0.4, 2690 + CREATE_RING_SCROLL_OFFSET, 2760 + CREATE_RING_SCROLL_OFFSET);
        triggerTrophyEntry(awwwardsTrophy, logoPlanes[3], 0.35, 2760 + CREATE_RING_SCROLL_OFFSET, 2850 + CREATE_RING_SCROLL_OFFSET);
      }, 2000);

      // Rotating trophies animations scroll triggers
      gsap.fromTo(arRot, // Animate logo mesh rotation on scroll
        { x: arRot[0], y: arRot[1], z: arRot[2] },
        {
          x: 0, y: 0, z: 0,
          ease: "none",
          scrollTrigger: {
            trigger: "body",
            start: () => getScrollDepth(2910 + CREATE_RING_SCROLL_OFFSET) + " top",
            end: () => getScrollDepth(2990 + CREATE_RING_SCROLL_OFFSET) + " top",
            scrub: true,
          },
          onUpdate: function () {
            if (logoPlanes[0]) logoPlanes[0].rotation.set(this.targets()[0].x, this.targets()[0].y, this.targets()[0].z);
          }
        }
      );
    };

      }

    // 11. Core Camera + focusTarget Scroll Timelines
    const masterCamTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: () => getScrollDepth(2540 + CREATE_RING_SCROLL_OFFSET) + " top",
        scrub: true,
        invalidateOnRefresh: true,
      }
    });

    const masterTargetTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: () => getScrollDepth(2540 + CREATE_RING_SCROLL_OFFSET) + " top",
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

    // Final information stages are viewport-fixed overlays. Their visibility is
    // tied to logical scroll ranges so they cannot drift through Create.
    const createInfoStageTimeline = (selector: string, start: number, end: number) => {
      gsap.timeline({
        scrollTrigger: {
          trigger: "body",
          start: () => getScrollDepth(start) + " top",
          end: () => getScrollDepth(end) + " top",
          scrub: true,
          invalidateOnRefresh: true,
        }
      })
        .fromTo(selector,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.12, ease: "power1.out" }
        )
        .to(selector, { autoAlpha: 1, y: 0, duration: 0.76, ease: "none" })
        .to(selector, { autoAlpha: 0, y: -24, duration: 0.12, ease: "power1.in" });
    };

    createInfoStageTimeline(".home-about-stage", 1745 + CREATE_RING_SCROLL_OFFSET, 1990 + CREATE_RING_SCROLL_OFFSET);
    createInfoStageTimeline(".home-channels-stage", channelEntryScroll.start, channelEntryScroll.end);
    createInfoStageTimeline(".home-contact-stage", 2340 + CREATE_RING_SCROLL_OFFSET, 2940 + CREATE_RING_SCROLL_OFFSET);

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

      // The 3 stage title groups are always visible.
      // The camera movement naturally controls what appears in the viewport, so no scroll-based toggling is needed.
      // Only toggle visibility for elements that are genuinely off-scene and need lazy activation:
      const currentScroll = window.scrollY;
      if (videoMesh) {
        videoMesh.visible = currentScroll >= dVideoStart && currentScroll <= dVideoEnd;
      }
      if (interactiveReelGroup) {
        interactiveReelGroup.visible = currentScroll >= dVideoStart && currentScroll <= dVideoEnd;
      }
      if (reviewGroup) {
        reviewGroup.visible = currentScroll >= dReviewsStart && currentScroll <= dReviewsEnd;
      }
      if (awardsGroup) {
        awardsGroup.visible = currentScroll >= dAwardsStart && currentScroll <= dAwardsEnd;
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
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        style={{ backgroundColor: SITE_WARM_BACKGROUND }}
      >
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
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-700"
          style={{ backgroundColor: SITE_WARM_BACKGROUND }}
        >
          <div className="w-64 h-1 bg-slate-300/40 rounded-full overflow-hidden relative">
            <div 
              className="absolute left-0 top-0 h-full bg-[#0a0c20] transition-all duration-300 ease-out" 
              style={{ width: `${loadingProgress}%` }} 
            />
          </div>
          <span className="mt-4 text-xs font-semibold tracking-widest text-[#0a0c20] uppercase">
            正在加载体验 ({loadingProgress}%)
          </span>
        </div>
      )}

      <div className="fixed top-6 left-6 z-40">
        <span className="font-bold tracking-tighter text-lg text-[#0a0c20]">
          且听松涛
        </span>
      </div>

      {/* 3. WEBGL STAGE CANVAS CONTAINER */}
      <div ref={containerRef} id="main-scene" className="fixed inset-0 z-0 pointer-events-none opacity-0" />
      <ObserveSignalField />
      <ExpressConnectionField />
      <CreateRingField />

      {/* 4. SCROLL CONTAINER TRACK */}
      <div ref={scrollContainerRef} className="relative z-10 w-full h-[3800vh]">
        {/* Stage 0: Hero Overlay */}
        <section className="sticky top-0 w-full h-screen flex flex-col justify-end p-12 md:p-24 pointer-events-none">
          <div className="max-w-xl text-left transform translate-y-[-20%] pointer-events-auto hero-text opacity-0">
            {/* Stage 0 texts removed per request */}
          </div>
        </section>

        {/* Stage 1: Observe content placeholder. */}
        <div className="h-[200vh]" />

        {/* Stage 2: Express content placeholder. */}
        <div className="h-[600vh]" />
        <section className="sticky top-0 w-full h-screen pointer-events-none" />

        {/* Stage 3: Create content placeholder. */}
        <div className="h-[200vh]" />
        <section className="sticky top-0 w-full h-screen pointer-events-none" />

        {/* Stage 4: About */}
        <div className="h-[200vh]" />
        <section
          aria-labelledby="home-about-title"
          className="home-about-stage invisible fixed inset-0 z-20 flex h-screen w-full items-center p-8 opacity-0 md:p-16 lg:p-24 pointer-events-none"
        >
          <div className="w-full rounded-[2rem] border border-[#0a0c20]/10 bg-white/10 p-8 backdrop-blur-sm md:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0a0c20]/55">About</p>
            <h2 id="home-about-title" className="mt-2 text-3xl font-semibold tracking-tight md:text-5xl">自我介绍</h2>
            <div className="mt-10 min-h-40" aria-hidden="true" />
          </div>
        </section>

        {/* Stage 5: Channels */}
        <div className="h-[920vh]" />
        <section
          aria-labelledby="home-channels-title"
          className="home-channels-stage invisible fixed inset-0 z-20 flex h-screen w-full flex-col items-start justify-end gap-8 px-8 pb-10 pt-24 opacity-0 pointer-events-none md:flex-row md:items-end md:justify-between md:px-16 md:pb-14 lg:px-24 lg:pb-20"
        >
          <div className="max-w-xs text-[#0a0c20]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0a0c20]/55">Channels</p>
            <h2 id="home-channels-title" className="mt-3 text-2xl font-semibold tracking-tight md:text-4xl">频道入口</h2>
          </div>

          <nav aria-label="首页频道入口" className="pointer-events-auto flex max-w-[18rem] flex-wrap gap-x-5 gap-y-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0a0c20]/55 md:max-w-none md:justify-end">
            {channelEntries.map((entry) => (
              <Link key={entry.id} className="transition-colors hover:text-[#0a0c20]" href={entry.href}>
                {entry.label}
              </Link>
            ))}
          </nav>
        </section>

        {/* Stage 6: Contact */}
        <div className="h-[200vh]" />
        <section
          aria-labelledby="home-contact-title"
          className="home-contact-stage invisible fixed inset-0 z-20 flex h-screen w-full items-end px-8 pb-10 pt-24 opacity-0 pointer-events-none md:px-16 md:pb-14 lg:px-24 lg:pb-20"
        >
          <footer className="w-full text-[#0a0c20]">
            <div className="grid gap-10 border-t border-[#0a0c20]/15 pt-8 md:grid-cols-[1.2fr_0.8fr_0.8fr] md:gap-12">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0a0c20]/55">Contact</p>
                <h2 id="home-contact-title" className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">且听松涛</h2>
                <p className="mt-4 max-w-xl text-sm leading-6 text-[#0a0c20]/65 md:text-base">
                  写作、技术实验与长期观察的个人站点。感谢你读到这里。
                </p>
              </div>

              <nav aria-label="首页页脚导航" className="pointer-events-auto flex flex-col gap-3 text-sm text-[#0a0c20]/70">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0a0c20]/45">Explore</p>
                <Link className="transition-colors hover:text-[#0a0c20]" href="/blog">博客</Link>
                <Link className="transition-colors hover:text-[#0a0c20]" href="/blog/tech">技术</Link>
                <Link className="transition-colors hover:text-[#0a0c20]" href="/blog/life">生活</Link>
              </nav>

              <div className="text-sm leading-6 text-[#0a0c20]/65">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0a0c20]/45">Connect</p>
                <p className="mt-3">欢迎从文章、项目和日常记录里继续认识我。</p>
                <p className="mt-6 text-xs uppercase tracking-[0.18em] text-[#0a0c20]/45">© 2026 Asong</p>
              </div>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}
