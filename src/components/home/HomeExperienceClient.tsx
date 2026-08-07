"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { MotionPathPlugin } from "gsap/dist/MotionPathPlugin";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import ObserveSignalField from "./ObserveSignalField";
import ExpressConnectionField from "./ExpressConnectionField";
import CreativeRingField from "./CreativeRingField";
import { HomeColumnsListStage } from "./HomeColumnsListStage";
import { HomeRecentPostsStage } from "./HomeRecentPostsStage";
import { HOME_DOM_LAYOUT, HOME_STAGE_SCROLL } from "./homeTimeline";
import { CREATE_RING_SCROLL_OFFSET, CREATE_STAGE_SCROLL_OFFSET } from "./scrollTimings";
import { SITE_WARM_BACKGROUND, SITE_WARM_BACKGROUND_THREE } from "@/lib/site-theme";
import { startRouteTransition } from "@/lib/route-transition";
import { NAV_LINKS } from "@/components/layout/navLinks";
import type { Post } from "@/types";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
}

const expressConnectionScroll = {
  start: 875,
  end: 1230 + CREATE_STAGE_SCROLL_OFFSET,
};

const channelEntries = [
  { id: "tech", label: "Tech", href: "/blog/tech", svg: "/home-experience/titles/channels/tech.svg", scale: 0.00115 },
  { id: "life", label: "Life", href: "/blog/life", svg: "/home-experience/titles/channels/life.svg", scale: 0.00128 },
  { id: "finance", label: "Finance", href: "/blog/finance", svg: "/home-experience/titles/channels/finance.svg", scale: 0.00086 },
  { id: "creative", label: "Creative", href: "/blog/creative", svg: "/home-experience/titles/channels/creative.svg", scale: 0.00078 },
] as const;

const channelItemLayout = [
  { x: 0, y: 0, z: 0, center: 0.22 },
  { x: 0, y: -2, z: 0, center: 0.38 },
  { x: -0.1, y: -4.5, z: 0, center: 0.58 },
  { x: 0, y: -7, z: 0, center: 0.78 },
] as const;

const channelSnapPoints = channelItemLayout.map(({ center }) => center);
const channelCenterWindow = 0.18;
const channelActionWindow = 0.055;

type ChannelEntry = (typeof channelEntries)[number];
type ChannelId = ChannelEntry["id"];

const CHANNEL_HOVER_EVENT = "home:channel-hover";

function dispatchChannelHover(channelId: ChannelId | null) {
  window.dispatchEvent(
    new CustomEvent(CHANNEL_HOVER_EVENT, {
      detail: { channelId },
    })
  );
}

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
    name: "creative",
    from: { x: 0.783, y: 14.749, z: 13.3 },
    to: { x: 4.024, y: 22.301, z: 7.031 },
    scrollRange: { start: 1245 + CREATE_STAGE_SCROLL_OFFSET, end: 1440 + CREATE_STAGE_SCROLL_OFFSET },
    ease: "power2.inOut",
  },
  {
    name: "post-creative",
    from: { x: 4.024, y: 22.301, z: 7.031 },
    to: { x: 23.346, y: 20.432, z: 2.102 },
    scrollRange: { start: 1545 + CREATE_RING_SCROLL_OFFSET, end: 1740 + CREATE_RING_SCROLL_OFFSET },
    ease: "power2.inOut",
  },
  {
    name: "about",
    from: { x: 23.346, y: 20.432, z: 2.102 },
    to: { x: 23.346, y: 18.432, z: 2.102 },
    scrollRange: HOME_STAGE_SCROLL.about,
    ease: "power2.inOut",
  },
  {
    name: "channel-approach",
    from: { x: 23.346, y: 18.432, z: 2.102 },
    to: { x: 23.312, y: 14.16, z: 4.024 },
    scrollRange: { start: HOME_STAGE_SCROLL.about.end, end: HOME_STAGE_SCROLL.channelCamera.start },
    ease: "power2.inOut",
  },
  {
    name: "channels",
    from: { x: 23.312, y: 14.16, z: 4.024 },
    to: { x: 23.292, y: 11.443, z: 4.236 },
    scrollRange: HOME_STAGE_SCROLL.channelCamera,
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
    name: "creative",
    from: { x: 15.777, y: 12.603, z: -0.428 },
    to: { x: 17.443, y: 20.712, z: 0.431 },
    scrollRange: { start: 1245 + CREATE_STAGE_SCROLL_OFFSET, end: 1440 + CREATE_STAGE_SCROLL_OFFSET },
    ease: "power2.inOut",
  },
  {
    name: "post-creative",
    from: { x: 17.443, y: 20.712, z: 0.431 },
    to: { x: 23.342, y: 20.293, z: 1.263 },
    scrollRange: { start: 1545 + CREATE_RING_SCROLL_OFFSET, end: 1740 + CREATE_RING_SCROLL_OFFSET },
    ease: "power2.inOut",
  },
  {
    name: "about",
    from: { x: 23.342, y: 20.293, z: 1.263 },
    to: { x: 23.342, y: 18.293, z: 1.263 },
    scrollRange: HOME_STAGE_SCROLL.about,
    ease: "power2.inOut",
  },
  {
    name: "channel-approach",
    from: { x: 23.342, y: 18.293, z: 1.263 },
    to: { x: 23.292, y: 14.01, z: 2.097 },
    scrollRange: { start: HOME_STAGE_SCROLL.about.end, end: HOME_STAGE_SCROLL.channelCamera.start },
    ease: "power2.inOut",
  },
  {
    name: "channels",
    from: { x: 23.292, y: 14.01, z: 2.097 },
    to: { x: 23.272, y: 11.293, z: 2.309 },
    scrollRange: HOME_STAGE_SCROLL.channelCamera,
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

const ScrollSpacer = ({ vh }: { vh: number }) => (
  <div aria-hidden="true" style={{ height: `${vh}vh` }} />
);

function ChannelRailLinks() {
  const router = useRouter();
  const [activeChannel, setActiveChannel] = useState<ChannelEntry | null>(null);
  const [transitionHref, setTransitionHref] = useState<string | null>(null);

  useEffect(() => {
    let frameId = 0;

    const getScrollDepth = (percent: number) => {
      return Math.min(window.innerWidth * (percent / 100), window.innerHeight * (percent / 100));
    };

    const updateActiveChannel = () => {
      frameId = 0;

      const start = getScrollDepth(HOME_STAGE_SCROLL.channels.start);
      const end = getScrollDepth(HOME_STAGE_SCROLL.channels.end);
      const progress = (window.scrollY - start) / (end - start);

      if (progress < 0 || progress > 1) {
        if (!transitionHref) setActiveChannel(null);
        return;
      }

      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;
      channelItemLayout.forEach((layout, index) => {
        const distance = Math.abs(progress - layout.center);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      if (!transitionHref) {
        setActiveChannel(closestDistance <= channelActionWindow ? channelEntries[closestIndex] : null);
      }
    };

    const scheduleUpdate = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateActiveChannel);
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [transitionHref]);

  useEffect(() => {
    if (!activeChannel || transitionHref) {
      dispatchChannelHover(null);
    }

    return () => dispatchChannelHover(null);
  }, [activeChannel, transitionHref]);

  const handleNavigate = () => {
    if (!activeChannel || transitionHref) return;

    dispatchChannelHover(null);
    setTransitionHref(activeChannel.href);
    window.setTimeout(() => {
      startRouteTransition(activeChannel.href);
      router.push(activeChannel.href);
    }, 560);
  };

  return (
    <div className="fixed inset-0 z-30 pointer-events-none" aria-hidden={!activeChannel && !transitionHref}>
      <AnimatePresence>
        {activeChannel && !transitionHref && (
          <motion.button
            key={activeChannel.id}
            type="button"
            aria-label={`进入${activeChannel.label}频道`}
            onClick={handleNavigate}
            onPointerEnter={() => dispatchChannelHover(activeChannel.id)}
            onPointerLeave={() => dispatchChannelHover(null)}
            onFocus={() => dispatchChannelHover(activeChannel.id)}
            onBlur={() => dispatchChannelHover(null)}
            className="pointer-events-auto absolute left-1/2 top-[52%] h-[28vh] min-h-40 w-[82vw] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-sm bg-transparent outline-none md:h-[30vh] md:w-[70vw] lg:w-[62vw] focus-visible:ring-1 focus-visible:ring-[#0a0c20]/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {transitionHref && (
          <motion.div
            className="fixed inset-0 z-[80] pointer-events-none"
            initial="idle"
            animate="active"
            variants={{
              idle: {},
              active: {},
            }}
          >
            <motion.div
              className="absolute inset-y-0 left-0 w-full bg-[#f0eee7]"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              transition={{ duration: 0.56, ease: [0.76, 0, 0.24, 1] }}
            />
            <motion.div
              className="absolute inset-y-0 left-0 w-px bg-[#0a0c20]/25"
              initial={{ x: "-100vw", opacity: 0 }}
              animate={{ x: "100vw", opacity: [0, 0.7, 0] }}
              transition={{ duration: 0.56, ease: [0.76, 0, 0.24, 1] }}
            />
            <motion.div
              className="absolute left-1/2 top-1/2 flex h-14 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-end text-[#0a0c20]"
              initial={{ x: -28, opacity: 0 }}
              animate={{ x: 120, opacity: [0, 1, 0] }}
              transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
            >
              <svg aria-hidden="true" viewBox="0 0 72 144" className="h-16 w-10" fill="none">
                <path
                  d="M18 22L54 72L18 122"
                  stroke="currentColor"
                  strokeWidth="7"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                />
              </svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const friendLinks: Array<{ label: string; href: string; description?: string }> = [
  { label: "lprota.dev", href: "https://lprota.dev" },
];

interface HomeExperienceClientProps {
  recentPosts?: Post[];
  columnPostCounts?: Record<string, number>;
}

export default function HomeExperienceClient({ recentPosts = [], columnPostCounts = {} }: HomeExperienceClientProps) {
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
    let glass: THREE.MeshPhysicalMaterial;

    const mixers: THREE.AnimationMixer[] = [];
    const rotationObjects: { mesh: THREE.Object3D; speed: number; axis: "x" | "y" | "z" }[] = [];
    const floatObjects: { mesh: THREE.Object3D; baseHeight: number; speed: number; range: number }[] = [];

    let createGroup: THREE.Group | null = null;
    let expressGroup: THREE.Group | null = null;
    let observeGroup: THREE.Group | null = null;
    let channelTitleGroup: THREE.Group | null = null;
    const channelTitleModels = channelEntries.map((entry) => ({
      ...entry,
      model: null as THREE.Group | null,
      layout: channelItemLayout[channelEntries.findIndex((item) => item.id === entry.id)],
      baseRotation: new THREE.Euler(),
      hoverAmount: 0,
    }));
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let hoveredChannelId: ChannelId | null = null;
    const handleChannelHover = (event: Event) => {
      hoveredChannelId = (event as CustomEvent<{ channelId: ChannelId | null }>).detail.channelId;
    };
    window.addEventListener(CHANNEL_HOVER_EVENT, handleChannelHover);
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
    dracoLoader.setDecoderPath("/home-experience/runtime/draco/");
    const glbLoader = new GLTFLoader(loadingManager);
    glbLoader.setDRACOLoader(dracoLoader);

    // Initial asset preloading chain
    hdri1 = textureLoader.load("/home-experience/environment/studio.webp", () => {
      hdri1.mapping = THREE.EquirectangularReflectionMapping;
      hdri1.colorSpace = THREE.SRGBColorSpace;

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

      loadModels();
    });

    const loadModels = () => {
      // 1. Cyclorama Background Plane
      const bgTex = textureLoader.load("/home-experience/backgrounds/stage.webp");
      bgTex.colorSpace = THREE.SRGBColorSpace;
      glbLoader.load("/home-experience/models/background.glb", (gltf) => {
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
      loadSvg("/home-experience/titles/start.svg", [0.008, 0.008, 0.008], [-0.13, -7.35, 20], [-0.05675, -0.04535, -0.00257]);

      // 3. Stage 3 title: Creative
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

      loadSvg("/home-experience/titles/create.svg",
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

      loadSvg("/home-experience/titles/express.svg",
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
        .to(".express-connection-field", { autoAlpha: 0, duration: 0.1, ease: "none" }, 1.18);

      ScrollTrigger.create({
        trigger: "body",
        start: () => getScrollDepth(1440 + CREATE_STAGE_SCROLL_OFFSET) + " top",
        end: () => getScrollDepth(HOME_STAGE_SCROLL.about.start) + " top",
        invalidateOnRefresh: true,
        onEnter: () => {
          if (expressGroup) expressGroup.visible = false;
        },
        onEnterBack: () => {
          if (expressGroup) expressGroup.visible = false;
        },
        onLeaveBack: () => {
          if (expressGroup) expressGroup.visible = true;
        },
      });

      // 5. Stage 1 title: Observe
      observeGroup = new THREE.Group();
      observeGroup.position.set(3.1, 1.6, 14);
      if (!isDesktop) observeGroup.position.set(3.3, 4.0, 14);
      scene.add(observeGroup);

      loadSvg("/home-experience/titles/observe.svg",
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
        { start: 0.07, live: 0.24, endX: "-7.2vw", endY: "-4.6vh", scale: 0.92 },
        { start: 0.19, live: 0.24, endX: "6.8vw", endY: "-4.1vh", scale: 0.88 },
        { start: 0.31, live: 0.24, endX: "-6.2vw", endY: "4.8vh", scale: 0.9 },
        { start: 0.43, live: 0.24, endX: "7.5vw", endY: "4.6vh", scale: 0.86 },
        { start: 0.55, live: 0.24, endX: "4.8vw", endY: "-5.5vh", scale: 0.9 },
        { start: 0.67, live: 0.23, endX: "-8vw", endY: "3.4vh", scale: 0.86 },
        { start: 0.79, live: 0.18, endX: "5.8vw", endY: "3.6vh", scale: 0.84 },
        { start: 0.89, live: 0.15, endX: "-4.6vw", endY: "5.7vh", scale: 0.82 },
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

      // 6. Channel entry titles: adapted from the original Noomo awards rail.
      // Each item has a fixed authored position; the rail itself travels upward.
      channelTitleGroup = new THREE.Group();
      channelTitleGroup.position.set(
        isDesktop ? 23.15 : 23.16,
        isDesktop ? 6.5 : 18.04,
        isDesktop ? -10 : -1.46
      );
      channelTitleGroup.rotation.set(-0.0776, 0.0103, 0.0008);
      channelTitleGroup.visible = false;
      scene.add(channelTitleGroup);

      const channelRailYCalibration = 1.8;
      const channelRailStartY = isDesktop ? 6.5 + channelRailYCalibration : 18.04;
      const channelRailEndY = isDesktop ? 18 + channelRailYCalibration : 18.04;
      const channelActiveColor = new THREE.Color(0x0a0c20);
      const channelMutedColor = new THREE.Color(0x6f7685);

      const updateChannelTitleModels = (progress: number) => {
        if (channelTitleGroup) {
          channelTitleGroup.position.y = THREE.MathUtils.lerp(channelRailStartY, channelRailEndY, progress);
        }

        channelTitleModels.forEach((entry) => {
          if (!entry.model) return;

          const distanceFromCenter = Math.abs(progress - entry.layout.center);
          const centerWeight = THREE.MathUtils.clamp(1 - distanceFromCenter / channelCenterWindow, 0, 1);
          const opacity = THREE.MathUtils.clamp(0.16 + centerWeight * 0.82, 0.08, 0.98);
          const scale = entry.scale * (isDesktop ? 1 : 0.72) * (0.82 + centerWeight * 0.3);
          const color = new THREE.Color().lerpColors(channelMutedColor, channelActiveColor, centerWeight);

          entry.model.visible = opacity > 0.01;
          entry.model.position.set(
            isDesktop ? entry.layout.x : entry.layout.x * 0.5,
            isDesktop ? entry.layout.y : entry.layout.y * 0.72,
            isDesktop ? entry.layout.z : entry.layout.z
          );
          entry.baseRotation.set(
            THREE.MathUtils.degToRad(THREE.MathUtils.lerp(-2, 0, centerWeight)),
            THREE.MathUtils.degToRad(THREE.MathUtils.lerp(40, 0, centerWeight)),
            THREE.MathUtils.degToRad(THREE.MathUtils.lerp(-5, 0, centerWeight))
          );
          entry.model.rotation.copy(entry.baseRotation);
          entry.model.scale.set(scale, -scale, scale);
          (entry.model.userData.materials as THREE.MeshStandardMaterial[]).forEach((material) => {
            material.opacity = opacity;
            material.color.copy(color);
            material.roughness = 0.36 - centerWeight * 0.08;
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

      const addChannelAccent = (url: string, locations: Array<{ x: number; y: number; z: number; rx: number; ry: number; rz: number; scale?: number }>) => {
        glbLoader.load(url, (gltf) => {
          locations.forEach((loc) => {
            const clone = gltf.scene.clone();
            const scale = (loc.scale ?? 0.12) * (isDesktop ? 1 : 0.72);
            clone.scale.set(scale, scale, scale);
            clone.position.set(loc.x, loc.y, loc.z);
            clone.rotation.set(loc.rx, loc.ry, loc.rz);
            clone.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                (child as THREE.Mesh).material = glass;
              }
            });
            channelTitleGroup!.add(clone);
            floatObjects.push({ mesh: clone, baseHeight: loc.y, speed: 0.9 + Math.abs(loc.x) * 0.18, range: 0.035 });
          });
        });
      };

      addChannelAccent("/home-experience/models/Like.glb", [
        { x: 1.38, y: 0.42, z: -0.62, rx: 0.73, ry: 3.17, rz: 6.06 },
        { x: -1.18, y: -2.08, z: -0.84, rx: 4.57, ry: 0.3, rz: 1.37 },
        { x: 1.12, y: -4.38, z: -0.72, rx: 2.3, ry: 1.17, rz: 2.27 },
      ]);
      addChannelAccent("/home-experience/models/heart.glb", [
        { x: -1.32, y: -0.78, z: -0.66, rx: 2.29, ry: 6.11, rz: 2.287, scale: 0.105 },
        { x: 1.42, y: -3.02, z: -0.9, rx: 1.072, ry: 1.49, rz: 3.47, scale: 0.105 },
        { x: -1.16, y: -5.56, z: -0.7, rx: 2.78, ry: 4.69, rz: 0.2, scale: 0.105 },
      ]);
      addChannelAccent("/home-experience/models/goblet.glb", [
        { x: -1.48, y: 0.2, z: -0.82, rx: 4.47, ry: 2.36, rz: 2.02, scale: 0.1 },
        { x: 1.58, y: -1.72, z: -0.88, rx: 3.53, ry: 3.75, rz: 2.33, scale: 0.1 },
        { x: -1.52, y: -4.78, z: -0.9, rx: 2.436, ry: 5.86, rz: 5.66, scale: 0.1 },
      ]);

      ScrollTrigger.create({
        trigger: "body",
        start: () => getScrollDepth(HOME_STAGE_SCROLL.channels.start) + " top",
        end: () => getScrollDepth(HOME_STAGE_SCROLL.channels.end) + " top",
        scrub: true,
        snap: {
          snapTo: channelSnapPoints,
          directional: false,
          inertia: false,
          delay: 0.08,
          duration: { min: 0.16, max: 0.36 },
          ease: "power2.out",
        },
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

    };

    // 8. Core Camera + focusTarget Scroll Timelines
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

      channelTitleModels.forEach((entry) => {
        if (!entry.model) return;

        const hoverTarget = hoveredChannelId === entry.id && !prefersReducedMotion ? 1 : 0;
        entry.hoverAmount = THREE.MathUtils.damp(entry.hoverAmount, hoverTarget, 12, delta);
        entry.model.rotation.set(
          entry.baseRotation.x + Math.sin(elapsed * 5.2) * 0.006 * entry.hoverAmount,
          entry.baseRotation.y + Math.sin(elapsed * 4.3) * 0.018 * entry.hoverAmount,
          entry.baseRotation.z + Math.sin(elapsed * 5.8) * 0.008 * entry.hoverAmount
        );
      });

      // Update camera matrix to look at target
      camera.lookAt(lookTarget);
      renderer.render(scene, camera);
    };
    animate();

    // 13. Window Resize Handler
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
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
      window.removeEventListener(CHANNEL_HOVER_EVENT, handleChannelHover);
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

      {/* 3. WEBGL STAGE CANVAS CONTAINER */}
      <div ref={containerRef} id="main-scene" className="fixed inset-0 z-0 pointer-events-none opacity-0" />
      <ObserveSignalField />
      <ExpressConnectionField />
      <CreativeRingField />
      <ChannelRailLinks />

      {/* 4. SCROLL CONTAINER TRACK */}
      <div ref={scrollContainerRef} className="relative z-10 w-full">
        {/* Stage 0: Hero Overlay */}
        <section id="hero" className="sticky top-0 w-full h-screen flex flex-col justify-end p-12 md:p-24 pointer-events-none">
          <div className="max-w-xl text-left transform translate-y-[-20%] pointer-events-auto hero-text opacity-0">
            {/* Stage 0 texts removed per request */}
          </div>
        </section>

        {/* Stage 1: Observe content placeholder. */}
        <ScrollSpacer vh={HOME_DOM_LAYOUT.observeSpacerVh} />

        {/* Stage 2: Express content placeholder. */}
        <ScrollSpacer vh={HOME_DOM_LAYOUT.expressSpacerVh} />
        <section
          className="sticky top-0 w-full pointer-events-none"
          style={{ height: `${HOME_DOM_LAYOUT.expressStickyVh}vh` }}
        />

        {/* Stage 3: Create content placeholder. */}
        <ScrollSpacer vh={HOME_DOM_LAYOUT.createSpacerVh} />
        <section
          className="sticky top-0 w-full pointer-events-none"
          style={{ height: `${HOME_DOM_LAYOUT.createStickyVh}vh` }}
        />

        {/* Stage 4: About */}
        <ScrollSpacer vh={HOME_DOM_LAYOUT.aboutLeadSpacerVh} />
        <section
          aria-labelledby="home-about-title"
          className="home-about-stage relative z-20 flex min-h-screen w-full items-center p-8 md:p-16 lg:p-24 pointer-events-none"
          style={{ minHeight: `${HOME_DOM_LAYOUT.aboutSectionVh}vh` }}
        >
          <div className="w-full text-left text-[#0a0c20]">
            <div className="space-y-7 text-2xl font-medium leading-[1.35] tracking-tight md:space-y-9 md:text-4xl lg:space-y-10 lg:text-5xl">
              <h2 id="home-about-title">
                我是阿松
              </h2>
              <p>
                我致力于探索新技术，让生活变得更有趣、更丰富、更有质感。
              </p>
              <p>我喜欢旅行、收集，也享受接触新事物的过程。</p>
              <p>这里是我的数字花园，记录我想记录的内容。</p>
            </div>
          </div>
        </section>

        {/* Stage 5: Channels */}
        <ScrollSpacer vh={HOME_DOM_LAYOUT.channelLeadSpacerVh} />
        <section
          aria-labelledby="home-channels-title"
          className="home-channels-intro-stage relative z-20 w-full overflow-visible pointer-events-none"
          style={{
            height: `${HOME_DOM_LAYOUT.channelIntroSectionVh}vh`,
            marginTop: `-${HOME_DOM_LAYOUT.channelIntroOverlapVh}vh`,
          }}
        >
          <div className="sticky top-0 z-10 flex h-screen items-center justify-center px-8 text-center text-[#0a0c20] md:px-12 lg:px-16">
            <div className="max-w-5xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0a0c20]/55">
                Channels
              </p>
              <h2
                id="home-channels-title"
                className="mt-2 text-3xl font-semibold uppercase leading-[0.95] tracking-tight md:text-4xl lg:text-5xl"
              >
                进入不同内容路径
              </h2>
            </div>
          </div>
        </section>

        {/* Stage 6: Columns list */}
        <ScrollSpacer vh={HOME_DOM_LAYOUT.channelRailSpacerVh} />
        <HomeColumnsListStage postCounts={columnPostCounts} />
        <HomeRecentPostsStage posts={recentPosts} />

        {/* Stage 7: Contact */}
        <section
          aria-labelledby="home-contact-title"
          className="home-contact-stage relative z-20 w-full px-8 pb-10 pt-16 md:px-12 md:pb-14 md:pt-20 lg:px-16 lg:pb-16"
        >
          <footer className="min-h-[420px] w-full text-[#0a0c20] md:min-h-[460px]">
            <div className="grid min-h-[inherit] gap-16 pt-8 md:grid-cols-2 md:gap-12 md:pt-10">
              <div className="flex min-h-[320px] flex-col justify-between md:min-h-0">
                <nav
                  aria-label="页脚主导航"
                  className="pointer-events-auto flex flex-col items-start gap-3 text-xl font-medium leading-none tracking-tight md:text-2xl"
                >
                  {NAV_LINKS.map((linkItem) => (
                    <Link
                      key={linkItem.label}
                      href={linkItem.href}
                      className="transition-colors hover:text-[#0a0c20]/55"
                    >
                      {linkItem.label}
                    </Link>
                  ))}
                </nav>

                <div>
                  <h2 id="home-contact-title" className="text-3xl font-semibold tracking-tight md:text-4xl">
                    大盈若冲
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-6 text-[#0a0c20]/60 md:text-base">
                    写作、技术实验与长期观察的个人站点。
                  </p>
                </div>
              </div>

              <div className="flex min-h-[320px] flex-col justify-between md:min-h-0 md:items-end md:text-right">
                <div className="md:w-[min(22rem,100%)]">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0a0c20]/45">
                      Friends
                    </p>
                  </div>

                  <div className="mt-5">
                    {friendLinks.length > 0 ? (
                      <nav
                        aria-label="友情链接"
                        className="pointer-events-auto flex flex-col items-start gap-3 text-xl font-medium leading-none tracking-tight md:items-end md:text-2xl"
                      >
                        {friendLinks.map((friend) => (
                          <Link
                            key={friend.href}
                            href={friend.href}
                            className="transition-colors hover:text-[#0a0c20]/55"
                          >
                            {friend.label}
                          </Link>
                        ))}
                      </nav>
                    ) : (
                      <p className="max-w-xs text-xl font-medium leading-tight tracking-tight text-[#0a0c20]/45 md:text-2xl">
                        友链整理中
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex w-full flex-col gap-3 text-sm font-medium text-[#0a0c20]/50 md:items-end">
                  <p className="uppercase tracking-[0.18em]">© 2026 Asong</p>
                  <Link className="pointer-events-auto transition-colors hover:text-[#0a0c20]" href="/blog">
                    查看全部文章
                  </Link>
                </div>
              </div>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}
