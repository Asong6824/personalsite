export const ROUTE_TRANSITION_START_EVENT = "site:route-transition-start";

export interface RouteTransitionStartDetail {
  href: string;
}

export function startRouteTransition(href: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<RouteTransitionStartDetail>(ROUTE_TRANSITION_START_EVENT, {
      detail: { href },
    }),
  );
}
