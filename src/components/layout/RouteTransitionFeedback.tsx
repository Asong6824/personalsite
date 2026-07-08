"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { NAV_LINKS } from "./navLinks";

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

  if (nextPath === currentPath && url.hash) {
    return null;
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

export default function RouteTransitionFeedback() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const prefetchedHrefsRef = useRef(new Set<string>());

  useEffect(() => {
    if (!isNavigating) {
      return;
    }

    const settleTimer = window.setTimeout(() => {
      setIsNavigating(false);
    }, 320);

    return () => window.clearTimeout(settleTimer);
  }, [pathname, searchParams, isNavigating]);

  useEffect(() => {
    if (!isNavigating) {
      return;
    }

    const fallbackTimer = window.setTimeout(() => {
      setIsNavigating(false);
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
        setIsNavigating(true);
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
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <span
      aria-hidden="true"
      className="site-route-progress"
      data-active={isNavigating}
    />
  );
}
