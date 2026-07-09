"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ROUTE_TRANSITION_START_EVENT,
  type RouteTransitionStartDetail,
} from "@/lib/route-transition";
import { NAV_LINKS } from "./navLinks";

function getCurrentRouteKey() {
  return `${window.location.pathname}${window.location.search}`;
}

function getInternalNavigationHref(anchor: HTMLAnchorElement) {
  const rawHref = anchor.getAttribute("href");

  if (!rawHref || rawHref.startsWith("#")) {
    return null;
  }

  if (anchor.target && anchor.target !== "_self") {
    return null;
  }

  if (anchor.hasAttribute("download")) {
    return null;
  }

  const url = new URL(rawHref, window.location.href);

  if (url.origin !== window.location.origin) {
    return null;
  }

  const currentPath = `${window.location.pathname}${window.location.search}`;
  const nextPath = `${url.pathname}${url.search}`;

  if (nextPath === currentPath) {
    return null;
  }

  return nextPath;
}

export default function RouteTransitionFeedback() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const prefetchedHrefsRef = useRef(new Set<string>());
  const navigationOriginRef = useRef<string | null>(null);
  const routeKey = `${pathname}${searchParams.size ? `?${searchParams.toString()}` : ""}`;

  const beginNavigation = useCallback((href: string) => {
    const currentRouteKey = getCurrentRouteKey();
    const targetUrl = new URL(href, window.location.href);
    const targetRouteKey = `${targetUrl.pathname}${targetUrl.search}`;

    if (targetRouteKey === currentRouteKey) {
      return;
    }

    navigationOriginRef.current = currentRouteKey;
    setIsNavigating(true);
  }, []);

  useEffect(() => {
    if (!isNavigating || !navigationOriginRef.current || routeKey === navigationOriginRef.current) {
      return;
    }

    const settleTimer = window.setTimeout(() => {
      setIsNavigating(false);
      navigationOriginRef.current = null;
    }, 180);

    return () => window.clearTimeout(settleTimer);
  }, [isNavigating, routeKey]);

  useEffect(() => {
    if (!isNavigating) {
      return;
    }

    const fallbackTimer = window.setTimeout(() => {
      setIsNavigating(false);
      navigationOriginRef.current = null;
    }, 7000);

    return () => window.clearTimeout(fallbackTimer);
  }, [isNavigating]);

  useEffect(() => {
    const prefetchHref = (href: string | null) => {
      if (!href || prefetchedHrefsRef.current.has(href)) {
        return;
      }

      prefetchedHrefsRef.current.add(href);
      router.prefetch(href);
    };

    const prefetchPrimaryRoutes = () => {
      NAV_LINKS.forEach((linkItem) => {
        prefetchHref(linkItem.href);
      });
    };

    const cancelInitialPrefetch =
      "requestIdleCallback" in window
        ? (() => {
            const idleCallbackId = window.requestIdleCallback(prefetchPrimaryRoutes, { timeout: 2200 });
            return () => window.cancelIdleCallback(idleCallbackId);
          })()
        : (() => {
            const timeoutId = setTimeout(prefetchPrimaryRoutes, 900);
            return () => clearTimeout(timeoutId);
          })();

    const handlePointerIntent = (event: PointerEvent | FocusEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a");

      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      prefetchHref(getInternalNavigationHref(anchor));
    };

    document.addEventListener("pointerover", handlePointerIntent, { passive: true });
    document.addEventListener("focusin", handlePointerIntent);

    return () => {
      cancelInitialPrefetch();
      document.removeEventListener("pointerover", handlePointerIntent);
      document.removeEventListener("focusin", handlePointerIntent);
    };
  }, [router]);

  useEffect(() => {
    const handleProgrammaticNavigation = (event: Event) => {
      const customEvent = event as CustomEvent<RouteTransitionStartDetail>;

      if (customEvent.detail?.href) {
        beginNavigation(customEvent.detail.href);
      }
    };

    window.addEventListener(ROUTE_TRANSITION_START_EVENT, handleProgrammaticNavigation);

    const startNavigationFeedback = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a");

      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      const href = getInternalNavigationHref(anchor);

      if (href) {
        beginNavigation(href);
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      startNavigationFeedback(event);
    };

    const handleClick = (event: MouseEvent) => {
      startNavigationFeedback(event);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener(ROUTE_TRANSITION_START_EVENT, handleProgrammaticNavigation);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("click", handleClick);
    };
  }, [beginNavigation]);

  return (
    <span
      aria-hidden="true"
      className="site-route-progress"
      data-active={isNavigating}
    />
  );
}
