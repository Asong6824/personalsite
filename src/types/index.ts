// 核心类型定义

export interface PostFrontmatter {
  title: string;
  date: string;
  author?: string;
  tags?: string[];
  excerpt?: string;
  description?: string;
  brief?: string;
  coverImage?: string;
  heroVideo?: string;
  videoUrl?: string;
  pinned?: boolean;
  channel?: 'tech' | 'life' | 'finance' | 'creative';
  column?: string;
  columnSlug?: string;
  music?: string | string[];
  hidden?: boolean;
  slug?: string;
  nextReads?: Array<string | NextReadConfig>;
}

export interface NextReadConfig {
  slug: string;
  reason?: string;
}

export interface Post {
  slug: string;
  title: string;
  date: string;
  author?: string;
  tags: string[];
  excerpt?: string;
  coverImage?: string;
  pinned: boolean;
  content?: string;
  channel: string;
  column: string;
  columnSlug?: string;
  music?: string | string[];
  hidden?: boolean;
  rel?: string;
}

export interface ColumnConfig {
  name: string;
  description: string;
  cover?: string;
  coverImage?: string;
  featured?: boolean;
}

export interface ChannelConfig {
  name: string;
  description: string;
  icon?: string;
  columns: Record<string, ColumnConfig>;
}

export interface ChannelsConfig {
  tech: ChannelConfig;
  life: ChannelConfig;
  finance: ChannelConfig;
  creative: ChannelConfig;
}

export interface PostIndexEntry {
  slug: string;
  title: string;
  date: string;
  author?: string;
  tags: string[];
  excerpt?: string;
  coverImage?: string;
  pinned?: boolean;
  channel?: string;
  column?: string;
  rel: string;
  hidden?: boolean;
}

export interface PostIndex {
  posts: PostIndexEntry[];
  updatedAt: string;
}

export interface DatasetPoint {
  t: string;
  v: number;
}

export interface DatasetSeries {
  key: string;
  label?: string;
  name?: string;
  unit?: string;
  points: DatasetPoint[];
}

export interface Dataset {
  id: string;
  type: 'timeseries' | 'categorical';
  name: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  version?: number;
  granularity?: string;
  series?: DatasetSeries[];
  items?: Array<{
    key: string;
    label?: string;
    value: number;
    group?: string;
    color?: string;
  }>;
}

export interface StockData {
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
