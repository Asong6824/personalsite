/*
 * Adapted from ThreeUI's Meng To Sketchbook Community renderer.
 * The page-strip geometry, spring motion, lighting and magnifier remain
 * intentionally imperative so React never re-renders animation frames.
 */

export function createSketchbookRenderer(host, pages, options = {}) {
  if (!host || pages.length < 2) {
    throw new Error("TravelSketchbook requires a host and at least two pages.");
  }
  const pageIds = new Set();
  for (const page of pages) {
    if (!page.id || !page.title || !page.place || !page.image || !page.alt) {
      throw new Error("Every sketchbook page requires id, title, place, image and alt.");
    }
    if (pageIds.has(page.id)) {
      throw new Error(`TravelSketchbook page id must be unique: ${page.id}.`);
    }
    pageIds.add(page.id);
  }

  const abortController = new AbortController();
  const signal = abortController.signal;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobileMedia = window.matchMedia("(max-width: 640px)");
  const pageList = pages.map((page) => ({
    ...page,
    url: mobileMedia.matches && page.mobileImage ? page.mobileImage : page.image,
  }));
  const pageCount = pageList.length;

  const required = (selector) => {
    const element = host.querySelector(selector);
    if (!element) throw new Error(`TravelSketchbook is missing ${selector}.`);
    return element;
  };

  const wrap = required("#sbWrap");
  const stage = required("#sbStage");
  const sb3d = required("#sb3d");
  const book = required("#sbBook");
  const captionBox = required("#sbCaptions");
  const hint = required("#sbHint");
  const loupe = required("#loupe");
  const zoomWrap = required("#zoomWrap");
  const zoomInner = required("#zoomInner");
  const zoomRead = required("#zRead");
  const loupeButton = required("#loupeBtn");
  const zoomInButton = required("#zIn");
  const zoomOutButton = required("#zOut");
  const plateList = required("#plateList");

  const initialIndex = Math.max(
    0,
    pageList.findIndex((page) => page.id === options.initialPageId),
  );

  const STRIP_COUNT = 18;
  const PAGE_SPAN = 0.449;
  const PEAK_CURL = 0.6;
  const TILT_X = 4.5;
  const TILT_Y = 7;
  const ZOOM_MIN = 0.9;
  const ZOOM_MAX = 1.5;
  const MAGNIFICATION = 2.3;

  let index = initialIndex;
  let turn = null;
  let strips = [];
  let captionOut = null;
  let captionIn = null;
  let spring = null;
  let animationFrame = null;
  let previousFrameTime = 0;
  let drag = null;
  let disposed = false;
  let lastNotifiedPageId = null;
  let idleHandle = null;
  let idleHandleType = null;

  const view = { rx: 0, ry: 0, z: 1, targetRx: 0, targetRy: 0, targetZ: 1 };
  let viewActive = false;
  let lastZoom = 1;
  let loupeOn = true;
  let loupeX = null;
  let loupeY = null;
  let loupeGrab = null;
  let loupeTarget = null;

  function element(tag, className) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  function imageElement(pageIndex, side) {
    const image = new Image();
    image.className = `sb-half-img ${side}`;
    image.draggable = false;
    image.alt = "";
    image.src = pageList[pageIndex].url;
    return image;
  }

  function halfElement(position, pageIndex) {
    const half = element("div", `sb-half ${position}`);
    half.appendChild(imageElement(pageIndex, position));
    half.appendChild(element("div", `gutter-shade ${position}`));
    return half;
  }

  function buildCurl(direction, from, to) {
    strips = [];
    const curl = element("div", `curl ${direction}`);
    curl.style.setProperty("--n", STRIP_COUNT);
    curl.style.setProperty("--span", PAGE_SPAN);
    let stripHost = curl;

    for (let stripIndex = 0; stripIndex < STRIP_COUNT; stripIndex += 1) {
      const strip = element("div", "strip");
      strip.style.setProperty("--i", stripIndex);
      const gutter = "calc(var(--bw) * 0.5)";
      const stripWidth = `calc(var(--bw) * ${PAGE_SPAN} / ${STRIP_COUNT})`;
      const fromOffset = `calc(-1 * (${gutter} + ${stripIndex} * ${stripWidth}))`;
      const toOffset = `calc(${stripIndex + 1} * ${stripWidth} - ${gutter})`;
      const front = element("div", "face front");
      const back = element("div", "face back");

      const dress = (face, url, xPosition) => {
        face.style.backgroundImage = `url(${JSON.stringify(url)})`;
        face.style.backgroundPositionX = xPosition;
      };

      dress(front, pageList[from].url, direction === "next" ? fromOffset : toOffset);
      dress(back, pageList[to].url, direction === "next" ? toOffset : fromOffset);
      front.appendChild(element("div", "sh"));
      front.appendChild(element("div", "gl"));
      back.appendChild(element("div", "sh"));
      back.appendChild(element("div", "gl"));
      strip.appendChild(front);
      strip.appendChild(back);
      if (stripIndex === STRIP_COUNT - 1) strip.classList.add("edge");
      stripHost.appendChild(strip);
      stripHost = strip;
      strips.push(strip);
    }

    return curl;
  }

  function fadeCaption(progress) {
    if (!captionOut || !captionIn) return;
    const outgoing = 1 - Math.max(0, Math.min(1, (progress - 0.1) / 0.28));
    const incoming = Math.max(0, Math.min(1, (progress - 0.56) / 0.3));
    captionOut.style.opacity = outgoing.toFixed(3);
    captionIn.style.opacity = incoming.toFixed(3);
  }

  function applyTurn(progress) {
    const theta = Math.PI * progress;
    const beta = PEAK_CURL * Math.sin(Math.PI * progress);
    const degrees = 180 / Math.PI;
    const totalTheta = theta + beta;
    const thetaDelta = (2 * beta) / STRIP_COUNT;

    sb3d.style.setProperty("--tt", `${(totalTheta * degrees).toFixed(2)}deg`);
    sb3d.style.setProperty("--td", `${(thetaDelta * degrees).toFixed(3)}deg`);
    sb3d.style.setProperty("--shade", Math.sin(Math.PI * progress).toFixed(3));
    fadeCaption(progress);

    for (let stripIndex = 0; stripIndex < strips.length; stripIndex += 1) {
      const nearLight = Math.abs(Math.cos(totalTheta - stripIndex * thetaDelta));
      const farLight = Math.abs(Math.cos(totalTheta - (stripIndex + 1) * thetaDelta));
      const style = strips[stripIndex].style;
      style.setProperty("--lit", nearLight.toFixed(3));
      style.setProperty("--a1", ((1 - nearLight) * 0.62).toFixed(3));
      style.setProperty("--a2", ((1 - farLight) * 0.62).toFixed(3));
    }
  }

  function notifyPageChange() {
    const page = pageList[index];
    if (lastNotifiedPageId === page.id) return;
    lastNotifiedPageId = page.id;
    options.onPageChange?.(page, index);
  }

  function renderCaption() {
    captionBox.textContent = "";
    captionOut = null;
    captionIn = null;

    if (turn) {
      captionOut = element("p", "sb-caption live");
      captionOut.textContent = pageList[turn.from].title;
      captionIn = element("p", "sb-caption live");
      captionIn.textContent = pageList[turn.to].title;
      captionBox.appendChild(captionOut);
      captionBox.appendChild(captionIn);
      fadeCaption(turn.t);
      return;
    }

    const page = pageList[index];
    const block = element("div", "sb-caption-block");
    const title = element("p", "sb-caption");
    title.textContent = page.title;
    block.appendChild(title);

    const metadata = [page.place, page.date].filter(Boolean).join(" · ");
    if (metadata) {
      const meta = element("p", "sb-caption-meta");
      meta.textContent = metadata;
      block.appendChild(meta);
    }

    if (page.excerpt) {
      const excerpt = element("p", "sb-caption-excerpt");
      excerpt.textContent = page.excerpt;
      block.appendChild(excerpt);
    }

    if (page.href) {
      const openButton = element("button", "sb-open");
      openButton.type = "button";
      openButton.textContent = "阅读这段旅程 →";
      openButton.setAttribute("aria-label", `阅读${page.title}`);
      openButton.onclick = () => options.onPageOpen?.(page, index);
      block.appendChild(openButton);
    }

    captionBox.appendChild(block);
  }

  function renderMarks() {
    const current = turn ? turn.to : index;
    plateList.querySelectorAll(".plate").forEach((button, pageIndex) => {
      button.setAttribute("aria-current", pageIndex === current ? "true" : "false");
    });
  }

  function layout() {
    sb3d.style.setProperty("--bw", `${book.clientWidth}px`);
  }

  function syncZoomLayer() {
    zoomInner.textContent = "";
    for (const child of book.children) {
      if (child.classList.contains("sb-zone")) continue;
      zoomInner.appendChild(child.cloneNode(true));
    }
  }

  function loupeSize() {
    return Math.round(Math.max(165, Math.min(262, book.clientWidth * 0.235)));
  }

  function bookBox() {
    return { x: 0, y: 0, width: book.clientWidth, height: book.clientHeight };
  }

  function placeLoupe() {
    if (loupeX === null || loupeY === null) return;
    const box = bookBox();
    if (!box.width) return;
    const radius = loupeSize() / 2;
    const bezel = radius * 2 * 0.058;
    loupe.style.setProperty("--lr", `${radius * 2}px`);
    loupe.style.transform = `translate3d(${(loupeX - radius).toFixed(1)}px,${(loupeY - radius).toFixed(1)}px,0)`;
    if (loupeOn) loupe.classList.add("on");

    const zoom = view.z;
    const centerX = box.width / 2;
    const centerY = box.height / 2;
    const x0 = centerX + (box.width * 0.051 - centerX) * zoom;
    const x1 = centerX + (box.width * 0.949 - centerX) * zoom;
    const y0 = centerY + (box.height * 0.218 - centerY) * zoom;
    const y1 = centerY + (box.height * 0.782 - centerY) * zoom;
    const nearestX = Math.max(x0, Math.min(loupeX, x1));
    const nearestY = Math.max(y0, Math.min(loupeY, y1));
    const inside = loupeX > x0 && loupeX < x1 && loupeY > y0 && loupeY < y1
      ? Math.min(loupeX - x0, x1 - loupeX, loupeY - y0, y1 - loupeY)
      : -Math.hypot(loupeX - nearestX, loupeY - nearestY);
    const visibility = Math.max(0, Math.min(1, (inside + radius * 0.3) / (radius * 0.55)));

    zoomWrap.style.opacity = (loupeOn ? visibility : 0).toFixed(3);
    if (visibility <= 0.002) return;
    const maskRadius = (radius - bezel).toFixed(1);
    const mask = `radial-gradient(circle ${maskRadius}px at ${loupeX.toFixed(1)}px ${loupeY.toFixed(1)}px,#000 calc(100% - 1px),transparent 100%)`;
    zoomWrap.style.webkitMaskImage = mask;
    zoomWrap.style.maskImage = mask;
    const pageX = centerX + (loupeX - centerX) / zoom;
    const pageY = centerY + (loupeY - centerY) / zoom;
    const scale = MAGNIFICATION * zoom;
    zoomInner.style.transform = `translate(${(loupeX - pageX * scale).toFixed(1)}px,${(loupeY - pageY * scale).toFixed(1)}px) scale(${scale.toFixed(4)})`;
  }

  function restLoupe() {
    const box = bookBox();
    loupeX = box.x + box.width * 0.88;
    loupeY = box.y + box.height * 0.855;
    placeLoupe();
  }

  function shoveLoupe(direction) {
    if (!loupeOn || loupeX === null || loupeY === null || loupeGrab) return;
    const box = bookBox();
    const normalizedX = (box.width / 2 + (loupeX - box.x - box.width / 2) / view.z) / box.width;
    const normalizedY = (box.height / 2 + (loupeY - box.y - box.height / 2) / view.z) / box.height;
    if (normalizedX < 0.02 || normalizedX > 0.98 || normalizedY < 0.17 || normalizedY > 0.83) return;
    loupeTarget = {
      x: box.x + box.width * (direction === "next" ? 0.12 : 0.88),
      y: box.y + box.height * 0.855,
    };
    kick();
  }

  function easeLoupe() {
    if (!loupeTarget) return false;
    if (loupeGrab) {
      loupeTarget = null;
      return false;
    }
    const dx = loupeTarget.x - loupeX;
    const dy = loupeTarget.y - loupeY;
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
      loupeX = loupeTarget.x;
      loupeY = loupeTarget.y;
      loupeTarget = null;
      placeLoupe();
      return false;
    }
    loupeX += dx * 0.17;
    loupeY += dy * 0.17;
    placeLoupe();
    return true;
  }

  function paint() {
    book.textContent = "";
    if (!turn) {
      const full = element("div", "sb-full");
      const image = new Image();
      image.src = pageList[index].url;
      image.alt = pageList[index].alt;
      image.draggable = false;
      full.appendChild(image);
      book.appendChild(full);
      sb3d.style.setProperty("--shade", "0");
    } else {
      const isNext = turn.dir === "next";
      book.appendChild(halfElement("left", isNext ? turn.from : turn.to));
      book.appendChild(halfElement("right", isNext ? turn.to : turn.from));
      book.appendChild(buildCurl(turn.dir, turn.from, turn.to));
      applyTurn(turn.t);
    }

    const previousZone = element("button", "sb-zone sb-prev");
    const nextZone = element("button", "sb-zone sb-next");
    previousZone.type = "button";
    nextZone.type = "button";
    previousZone.setAttribute("aria-label", "上一页");
    nextZone.setAttribute("aria-label", "下一页");
    book.appendChild(previousZone);
    book.appendChild(nextZone);
    layout();
    renderCaption();
    renderMarks();
    syncZoomLayer();
    placeLoupe();
    if (!turn) notifyPageChange();
  }

  function animateTo(target, onDone, stiffness = 150, damping = 22) {
    spring = { kind: "spring", velocity: 0, target, done: onDone, stiffness, damping };
    kick();
  }

  function tick(now) {
    animationFrame = null;
    if (disposed) return;
    const deltaTime = Math.min(0.032, (now - previousFrameTime) / 1000 || 0.016);
    previousFrameTime = now;

    if (spring && turn) {
      const currentSpring = spring;
      const offset = turn.t - currentSpring.target;
      currentSpring.velocity += (-currentSpring.stiffness * offset - currentSpring.damping * currentSpring.velocity) * deltaTime;
      turn.t += currentSpring.velocity * deltaTime;
      if (Math.abs(turn.t - currentSpring.target) < 0.002 && Math.abs(currentSpring.velocity) < 0.02) {
        turn.t = currentSpring.target;
        spring = null;
        applyTurn(turn.t);
        currentSpring.done?.();
      } else {
        applyTurn(turn.t);
      }
    }

    updateViewSpring();
    const loupeMoved = easeLoupe();
    if ((spring || viewActive || loupeMoved) && animationFrame === null) {
      animationFrame = window.requestAnimationFrame(tick);
    }
  }

  function kick() {
    if (animationFrame !== null || disposed) return;
    previousFrameTime = window.performance.now();
    animationFrame = window.requestAnimationFrame(tick);
  }

  function applyView() {
    sb3d.style.setProperty("--rx", `${view.rx.toFixed(2)}deg`);
    sb3d.style.setProperty("--ry", `${view.ry.toFixed(2)}deg`);
    sb3d.style.setProperty("--zoom", view.z.toFixed(3));
    if (view.z !== lastZoom) {
      lastZoom = view.z;
      placeLoupe();
    }
  }

  function updateViewSpring() {
    const easing = 0.14;
    let moved = false;
    for (const [currentKey, targetKey] of [
      ["rx", "targetRx"],
      ["ry", "targetRy"],
      ["z", "targetZ"],
    ]) {
      const distance = view[targetKey] - view[currentKey];
      if (Math.abs(distance) > 0.0006) {
        view[currentKey] += distance * easing;
        moved = true;
      } else {
        view[currentKey] = view[targetKey];
      }
    }
    if (moved) applyView();
    viewActive = moved;
    return moved;
  }

  function syncZoom() {
    zoomRead.textContent = `${Math.round(view.targetZ * 100)}%`;
    zoomOutButton.disabled = view.targetZ <= ZOOM_MIN + 0.001;
    zoomInButton.disabled = view.targetZ >= ZOOM_MAX - 0.001;
  }

  function setView(rotationX, rotationY, zoom) {
    view.targetRx = Math.max(-TILT_X, Math.min(TILT_X, rotationX));
    view.targetRy = Math.max(-TILT_Y, Math.min(TILT_Y, rotationY));
    view.targetZ = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom));
    viewActive = true;
    syncZoom();
    kick();
  }

  function tiltTo(clientX, clientY) {
    if (drag) return;
    const rect = book.getBoundingClientRect();
    if (!rect.width) return;
    const normalizedX = Math.max(-1, Math.min(1, (clientX - (rect.left + rect.width / 2)) / (rect.width * 0.62)));
    const normalizedY = Math.max(-1, Math.min(1, (clientY - (rect.top + rect.height / 2)) / (rect.height * 0.9)));
    setView(-normalizedY * TILT_X, normalizedX * TILT_Y, view.targetZ);
  }

  function startTurn(direction, progress = 0) {
    spring = null;
    if (turn) {
      index = turn.to;
      turn = null;
    }
    shoveLoupe(direction);
    const from = index;
    turn = {
      dir: direction,
      from,
      to: direction === "next" ? (from + 1) % pageCount : (from - 1 + pageCount) % pageCount,
      t: progress,
    };
    paint();
  }

  function commit() {
    if (!turn) return;
    if (reducedMotion) {
      index = turn.to;
      turn = null;
      paint();
      return;
    }
    animateTo(1, () => {
      index = turn.to;
      turn = null;
      paint();
    }, 170, 26);
  }

  function cancel() {
    if (!turn) return;
    animateTo(0, () => {
      turn = null;
      paint();
    });
  }

  function step(direction) {
    if (turn) {
      index = turn.to;
      turn = null;
    }
    startTurn(direction);
    commit();
  }

  function goTo(pageIndex) {
    if (pageIndex === index && !turn) return;
    if (turn) {
      index = turn.to;
      turn = null;
    }
    const forward = (pageIndex - index + pageCount) % pageCount;
    const backward = (index - pageIndex + pageCount) % pageCount;
    if (Math.min(forward, backward) === 1) {
      step(forward === 1 ? "next" : "prev");
      return;
    }
    index = pageIndex;
    paint();
  }

  function buildIndex() {
    plateList.textContent = "";
    pageList.forEach((page, pageIndex) => {
      const item = element("li");
      const button = element("button", "plate");
      const number = element("span", "n");
      const title = element("span", "t");
      const place = element("span", "p");
      button.type = "button";
      number.textContent = String(pageIndex + 1).padStart(2, "0");
      title.textContent = page.title;
      place.textContent = page.place;
      button.append(number, title, place);
      button.addEventListener("click", () => {
        goTo(pageIndex);
        required("#sketchbook").scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
      }, { signal });
      item.appendChild(button);
      plateList.appendChild(item);
    });
  }

  function preload(page) {
    return new Promise((resolve) => {
      const image = new Image();
      image.src = page.url;
      if (image.decode) {
        image.decode().catch(() => undefined).finally(resolve);
      } else {
        image.onload = resolve;
        image.onerror = resolve;
      }
    });
  }

  function preloadRemaining(priorityIndices) {
    const load = () => {
      pageList.forEach((page, pageIndex) => {
        if (!priorityIndices.has(pageIndex)) preload(page);
      });
    };

    if ("requestIdleCallback" in window) {
      idleHandleType = "idle";
      idleHandle = window.requestIdleCallback(load, { timeout: 1800 });
    } else {
      idleHandleType = "timeout";
      idleHandle = window.setTimeout(load, 350);
    }
  }

  function hideHint() {
    hint.classList.add("gone");
  }

  window.addEventListener("resize", () => {
    layout();
    loupeX = null;
    restLoupe();
  }, { signal });
  window.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "touch") tiltTo(event.clientX, event.clientY);
  }, { passive: true, signal });
  window.addEventListener("pointerout", (event) => {
    if (!event.relatedTarget) setView(0, 0, view.targetZ);
  }, { signal });
  window.addEventListener("blur", () => setView(0, 0, view.targetZ), { signal });
  window.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target;
    if (target instanceof HTMLElement && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
    event.preventDefault();
    hideHint();
    step(event.key === "ArrowRight" ? "next" : "prev");
  }, { signal });

  stage.addEventListener("dblclick", () => setView(view.targetRx, view.targetRy, 1), { signal });
  stage.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    const target = event.target instanceof Element ? event.target : null;
    const onBook = target?.closest(".sb-zone");
    if (!onBook) return;
    event.preventDefault();
    stage.setPointerCapture(event.pointerId);
    hideHint();
    const rect = book.getBoundingClientRect();
    const direction = (event.clientX - rect.left) / rect.width > 0.5 ? "next" : "prev";
    startTurn(direction);
    drag = {
      dir: direction,
      startX: event.clientX,
      width: rect.width,
      moved: 0,
      velocity: 0,
      previousTime: window.performance.now(),
    };
  }, { signal });
  stage.addEventListener("pointermove", (event) => {
    if (!drag) return;
    const deltaX = event.clientX - drag.startX;
    drag.moved = Math.max(drag.moved, Math.abs(deltaX));
    const raw = (drag.dir === "next" ? -deltaX : deltaX) / (drag.width * 0.62);
    const progress = Math.max(0, Math.min(1, raw));
    const now = window.performance.now();
    drag.velocity = (progress - (turn?.t ?? 0)) / Math.max(0.001, (now - drag.previousTime) / 1000);
    drag.previousTime = now;
    if (turn) {
      turn.t = progress;
      applyTurn(progress);
    }
  }, { signal });
  const endDrag = () => {
    if (!drag) return;
    const completedDrag = drag;
    drag = null;
    if (!turn) return;
    if (completedDrag.moved < 6) {
      commit();
      return;
    }
    if (turn.t > 0.42 || completedDrag.velocity > 1.1) commit();
    else cancel();
  };
  stage.addEventListener("dragstart", (event) => event.preventDefault(), { signal });
  stage.addEventListener("selectstart", (event) => event.preventDefault(), { signal });
  stage.addEventListener("pointerup", endDrag, { signal });
  stage.addEventListener("pointercancel", endDrag, { signal });

  loupe.addEventListener("pointerdown", (event) => {
    if (!loupeOn || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    loupeTarget = null;
    loupeGrab = { clientX: event.clientX, clientY: event.clientY, x: loupeX, y: loupeY };
    loupe.classList.add("held");
    loupe.setPointerCapture(event.pointerId);
    hideHint();
  }, { signal });
  loupe.addEventListener("pointermove", (event) => {
    if (!loupeGrab) return;
    const box = bookBox();
    const radius = loupeSize() / 2;
    loupeX = Math.max(box.x - radius * 0.7, Math.min(box.x + box.width + radius * 0.7, loupeGrab.x + event.clientX - loupeGrab.clientX));
    loupeY = Math.max(box.y - radius * 0.7, Math.min(box.y + box.height + radius, loupeGrab.y + event.clientY - loupeGrab.clientY));
    placeLoupe();
  }, { signal });
  const dropLoupe = () => {
    loupeGrab = null;
    loupe.classList.remove("held");
  };
  loupe.addEventListener("pointerup", dropLoupe, { signal });
  loupe.addEventListener("pointercancel", dropLoupe, { signal });

  required("#sbLeft").addEventListener("click", () => step("prev"), { signal });
  required("#sbRight").addEventListener("click", () => step("next"), { signal });
  required("#heroDown").addEventListener("click", () => {
    required("#about").scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  }, { signal });
  required("#navTop").addEventListener("click", () => {
    required("#sketchbook").scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  }, { signal });
  required("#navJournal").addEventListener("click", () => {
    required("#plates").scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  }, { signal });
  required("#navAbout").addEventListener("click", () => {
    required("#about").scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  }, { signal });

  loupeButton.addEventListener("click", () => {
    loupeOn = !loupeOn;
    loupeButton.setAttribute("aria-pressed", String(loupeOn));
    loupe.classList.toggle("on", loupeOn);
    if (loupeOn && loupeX === null) restLoupe();
  }, { signal });
  zoomInButton.addEventListener("click", () => {
    setView(view.targetRx, view.targetRy, view.targetZ * 1.16);
    hideHint();
  }, { signal });
  zoomOutButton.addEventListener("click", () => {
    setView(view.targetRx, view.targetRy, view.targetZ / 1.16);
    hideHint();
  }, { signal });

  const resizeObserver = new ResizeObserver(layout);
  resizeObserver.observe(book);
  buildIndex();
  paint();
  applyView();

  const priorityIndices = new Set([
    index,
    (index - 1 + pageCount) % pageCount,
    (index + 1) % pageCount,
  ]);
  const ready = Promise.all([...priorityIndices].map((pageIndex) => preload(pageList[pageIndex])))
    .then(() => document.fonts?.ready?.catch(() => undefined))
    .then(() => {
      if (disposed) return;
      syncZoom();
      restLoupe();
      options.onReady?.();
      preloadRemaining(priorityIndices);
    })
    .catch((reason) => {
      if (disposed) return;
      const message = reason instanceof Error ? reason.message : "手绘本初始化失败";
      options.onError?.(message);
      throw reason;
    });

  return {
    ready,
    previous: () => step("prev"),
    next: () => step("next"),
    goTo: (pageId) => {
      const pageIndex = pageList.findIndex((page) => page.id === pageId);
      if (pageIndex >= 0) goTo(pageIndex);
    },
    openCurrent: () => options.onPageOpen?.(pageList[index], index),
    dispose: () => {
      disposed = true;
      abortController.abort();
      resizeObserver.disconnect();
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
      if (idleHandle !== null && idleHandleType === "idle" && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleHandle);
      } else if (idleHandle !== null) {
        window.clearTimeout(idleHandle);
      }
      animationFrame = null;
      spring = null;
      drag = null;
    },
  };
}
