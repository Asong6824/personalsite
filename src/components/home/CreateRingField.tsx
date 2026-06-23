"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CARD_ITEMS = [
  { title: "Essays", meta: "writing", color: "#f45f46" },
  { title: "Interfaces", meta: "tools", color: "#f7f7f2" },
  { title: "Images", meta: "visual", color: "#f7f7f2" },
  { title: "Systems", meta: "structure", color: "#f45f46" },
  { title: "Station Stamps", meta: "life", color: "#f7f7f2" },
  { title: "Market Method", meta: "finance", color: "#f7f7f2" },
  { title: "Notion Zen", meta: "product", color: "#f45f46" },
  { title: "Post Index", meta: "archive", color: "#f7f7f2" },
];

type CardPose = {
  x: number;
  y: number;
  z: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  opacity: number;
};

function createCardTexture(item: (typeof CARD_ITEMS)[number], isBack = false) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext("2d")!;
  const isRed = item.color !== "#f7f7f2";

  ctx.fillStyle = item.color;
  ctx.beginPath();
  ctx.roundRect(0, 0, canvas.width, canvas.height, 54);
  ctx.fill();

  ctx.fillStyle = isRed ? "rgba(255, 244, 239, 0.2)" : "rgba(10, 12, 32, 0.06)";
  ctx.beginPath();
  ctx.roundRect(38, 38, canvas.width - 76, canvas.height - 168, 42);
  ctx.fill();

  if (isBack) {
    ctx.strokeStyle = isRed ? "rgba(255, 244, 239, 0.28)" : "rgba(10, 12, 32, 0.08)";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.roundRect(62, 62, canvas.width - 124, canvas.height - 124, 48);
    ctx.stroke();
  } else {
    ctx.fillStyle = isRed ? "#fff4ef" : "#0a0c20";
    ctx.font = "600 76px Arial";
    ctx.fillText(item.title, 64, 492);

    ctx.fillStyle = isRed ? "rgba(255, 244, 239, 0.72)" : "rgba(10, 12, 32, 0.44)";
    ctx.font = "600 30px Arial";
    ctx.fillText(item.meta.toUpperCase(), 68, 548);
  }

  ctx.fillStyle = isRed ? "rgba(255, 244, 239, 0.28)" : "rgba(10, 12, 32, 0.08)";
  ctx.beginPath();
  ctx.arc(854, 126, 56, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function lerp(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}

function clamp01(value: number) {
  return gsap.utils.clamp(0, 1, value);
}

function applyPose(card: THREE.Object3D, pose: CardPose) {
  card.position.set(pose.x, pose.y, pose.z);
  card.rotation.set(pose.rotationX, pose.rotationY, pose.rotationZ);
  card.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const material = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      material.opacity = pose.opacity;
    }
  });
}

export default function CreateRingField() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const getScrollDepth = (percent: number) => Math.min(width * (percent / 100), height * (percent / 100));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 11);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    containerRef.current.appendChild(renderer.domElement);

    const ringGroup = new THREE.Group();
    ringGroup.position.set(0.15, -0.22, -1.05);
    scene.add(ringGroup);

    const geometry = new THREE.PlaneGeometry(2.7, 1.68, 1, 1);
    const edgeGeometry = new THREE.BoxGeometry(2.72, 1.7, 0.055);
    const cards = CARD_ITEMS.map((item, index) => {
      const group = new THREE.Group();
      const frontMaterial = new THREE.MeshBasicMaterial({
        map: createCardTexture(item),
        transparent: true,
        opacity: 0,
        side: THREE.FrontSide,
        depthTest: true,
        depthWrite: true,
      });
      const backMaterial = new THREE.MeshBasicMaterial({
        map: createCardTexture(item, true),
        transparent: true,
        opacity: 0,
        side: THREE.FrontSide,
        depthTest: true,
        depthWrite: true,
      });
      const edgeMaterial = new THREE.MeshBasicMaterial({
        color: item.color,
        transparent: true,
        opacity: 0,
        depthTest: true,
        depthWrite: true,
      });
      const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
      const front = new THREE.Mesh(geometry, frontMaterial);
      const back = new THREE.Mesh(geometry, backMaterial);
      front.position.z = 0.031;
      back.position.z = -0.031;
      back.rotation.y = Math.PI;
      group.add(edge, front, back);
      group.renderOrder = index;
      ringGroup.add(group);
      return group;
    });

    const updateCards = (progress: number) => {
      const easeInOut = gsap.parseEase("power2.inOut");
      const easeOut = gsap.parseEase("power2.out");
      const rotate = clamp01((progress - 0.58) / 0.24);
      const ringRadius = width > 1024 ? 4.05 : 2.6;
      const streamStartX = width > 1024 ? -8.7 : -5.4;
      const curlGateX = width > 1024 ? 2.65 : 1.25;
      const exitX = width > 1024 ? 8.8 : 5.4;
      const enterBase = 0.02;
      const enterStagger = 0.035;
      const enterDuration = 0.22;
      const curlBase = 0.34;
      const curlStagger = 0.04;
      const curlDuration = 0.18;
      const lastCurlEnd = curlBase + (CARD_ITEMS.length - 1) * curlStagger + curlDuration;
      const exitBase = lastCurlEnd + 0.025;
      const exitStagger = 0.012;
      const exitDuration = 0.09;

      ringGroup.rotation.y = easeInOut(rotate) * Math.PI * 2;

      cards.forEach((card, index) => {
        const enter = clamp01((progress - (enterBase + index * enterStagger)) / enterDuration);
        const curl = clamp01((progress - (curlBase + index * curlStagger)) / curlDuration);
        const exit = clamp01((progress - (exitBase + index * exitStagger)) / exitDuration);
        const enterEase = easeOut(enter);
        const curlEase = easeInOut(curl);
        const exitEase = easeInOut(exit);
        const normalized = index / CARD_ITEMS.length;
        const angle = normalized * Math.PI * 2 - Math.PI / 2;
        const streamOffset = index * (width > 1024 ? 0.12 : 0.06);
        const approachX = lerp(streamStartX, curlGateX + streamOffset, enterEase);
        const ringX = Math.cos(angle) * ringRadius;
        const ringZ = Math.sin(angle) * ringRadius;
        const ringRotationY = -angle + Math.PI / 2;
        const outX = exitX + index * 0.18;

        const approachPose: CardPose = {
          x: approachX,
          y: 0,
          z: 0,
          rotationX: 0,
          rotationY: 0,
          rotationZ: lerp(-0.05, 0, enterEase),
          opacity: clamp01(enter * 1.35),
        };

        const ringPose: CardPose = {
          x: ringX,
          y: Math.sin(angle * 2) * 0.12,
          z: ringZ,
          rotationX: 0,
          rotationY: ringRotationY,
          rotationZ: 0,
          opacity: 1,
        };

        const exitPose: CardPose = {
          x: outX,
          y: 0,
          z: 0,
          rotationX: 0,
          rotationY: 0,
          rotationZ: 0.035,
          opacity: 0,
        };

        const curledPose: CardPose = {
          x: lerp(approachPose.x, ringPose.x, curlEase),
          y: lerp(approachPose.y, ringPose.y, curlEase),
          z: lerp(approachPose.z, ringPose.z, curlEase),
          rotationX: 0,
          rotationY: lerp(approachPose.rotationY, ringPose.rotationY, curlEase),
          rotationZ: lerp(approachPose.rotationZ, ringPose.rotationZ, curlEase),
          opacity: approachPose.opacity,
        };

        const finalPose: CardPose = {
          x: lerp(curledPose.x, exitPose.x, exitEase),
          y: lerp(curledPose.y, exitPose.y, exitEase),
          z: lerp(curledPose.z, exitPose.z, exitEase),
          rotationX: 0,
          rotationY: lerp(curledPose.rotationY, exitPose.rotationY, exitEase),
          rotationZ: lerp(curledPose.rotationZ, exitPose.rotationZ, exitEase),
          opacity: lerp(curledPose.opacity, exitPose.opacity, exitEase),
        };

        card.traverse((child) => {
          child.renderOrder = Math.round(1000 - finalPose.z * 100);
        });
        applyPose(card, finalPose);
      });
    };

    updateCards(0);

    const scrollState = { progress: 0 };
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: "body",
        start: () => getScrollDepth(1525) + " top",
        end: () => getScrollDepth(1925) + " top",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => updateCards(self.progress),
      },
    });
    timeline.to(scrollState, { progress: 1, duration: 1, ease: "none" });

    gsap.set(containerRef.current, { autoAlpha: 0 });
    const visibilityTrigger = ScrollTrigger.create({
      trigger: "body",
      start: () => getScrollDepth(1500) + " top",
      end: () => getScrollDepth(1950) + " top",
      onEnter: () => gsap.to(containerRef.current, { autoAlpha: 1, duration: 0.16, ease: "none" }),
      onEnterBack: () => gsap.to(containerRef.current, { autoAlpha: 1, duration: 0.16, ease: "none" }),
      onLeave: () => gsap.to(containerRef.current, { autoAlpha: 0, duration: 0.16, ease: "none" }),
      onLeaveBack: () => gsap.to(containerRef.current, { autoAlpha: 0, duration: 0.16, ease: "none" }),
      invalidateOnRefresh: true,
    });

    let frame = 0;
    const render = () => {
      frame = requestAnimationFrame(render);
      renderer.render(scene, camera);
    };
    render();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frame);
      timeline.kill();
      visibilityTrigger.kill();
      geometry.dispose();
      edgeGeometry.dispose();
      cards.forEach((card) => {
        card.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const material = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
            material.map?.dispose();
            material.dispose();
          }
        });
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="create-ring-field fixed inset-0 z-20 pointer-events-none opacity-0"
      aria-hidden="true"
    />
  );
}
