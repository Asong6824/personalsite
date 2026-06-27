import { CREATE_RING_SCROLL_OFFSET } from "./scrollTimings";

export const HOME_SCROLL_TRACK_VH = 4500;

export const HOME_STAGE_SCROLL = {
  about: {
    start: 1745 + CREATE_RING_SCROLL_OFFSET,
    end: 1795 + CREATE_RING_SCROLL_OFFSET,
  },
  channels: {
    start: 1800 + CREATE_RING_SCROLL_OFFSET,
    end: 2100 + CREATE_RING_SCROLL_OFFSET,
  },
  contact: {
    start: 3040 + CREATE_RING_SCROLL_OFFSET,
    end: 3640 + CREATE_RING_SCROLL_OFFSET,
  },
} as const;

export const HOME_DOM_LAYOUT = {
  observeSpacerVh: 200,
  expressSpacerVh: 600,
  expressStickyVh: 100,
  createSpacerVh: 200,
  createStickyVh: 100,
  aboutLeadSpacerVh: 1205,
  aboutSectionVh: 100,
  channelLeadSpacerVh: 5,
  channelIntroOverlapVh: 50,
  channelIntroSectionVh: 260,
  channelRailSpacerVh: 90,
  columnsSectionVh: 100,
  contactLeadSpacerVh: 200,
} as const;

export const HOME_DOM_STAGE_START = {
  about:
    100 +
    HOME_DOM_LAYOUT.observeSpacerVh +
    HOME_DOM_LAYOUT.expressSpacerVh +
    HOME_DOM_LAYOUT.expressStickyVh +
    HOME_DOM_LAYOUT.createSpacerVh +
    HOME_DOM_LAYOUT.createStickyVh +
    HOME_DOM_LAYOUT.aboutLeadSpacerVh,
  channels:
    100 +
    HOME_DOM_LAYOUT.observeSpacerVh +
    HOME_DOM_LAYOUT.expressSpacerVh +
    HOME_DOM_LAYOUT.expressStickyVh +
    HOME_DOM_LAYOUT.createSpacerVh +
    HOME_DOM_LAYOUT.createStickyVh +
    HOME_DOM_LAYOUT.aboutLeadSpacerVh +
    HOME_DOM_LAYOUT.aboutSectionVh +
    HOME_DOM_LAYOUT.channelLeadSpacerVh -
    HOME_DOM_LAYOUT.channelIntroOverlapVh,
  columns:
    100 +
    HOME_DOM_LAYOUT.observeSpacerVh +
    HOME_DOM_LAYOUT.expressSpacerVh +
    HOME_DOM_LAYOUT.expressStickyVh +
    HOME_DOM_LAYOUT.createSpacerVh +
    HOME_DOM_LAYOUT.createStickyVh +
    HOME_DOM_LAYOUT.aboutLeadSpacerVh +
    HOME_DOM_LAYOUT.aboutSectionVh +
    HOME_DOM_LAYOUT.channelLeadSpacerVh -
    HOME_DOM_LAYOUT.channelIntroOverlapVh +
    HOME_DOM_LAYOUT.channelIntroSectionVh +
    HOME_DOM_LAYOUT.channelRailSpacerVh,
} as const;
