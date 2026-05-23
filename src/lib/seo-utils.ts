import type { Post, ChannelConfig, ColumnConfig, ChannelsConfig } from "@/types";

interface SiteConfig {
  name: string;
  description: string;
  url: string;
  author: { name: string; email: string; url: string };
  social: { twitter: string; github: string };
}

const SITE_CONFIG: SiteConfig = {
  name: "阿松的个人网站",
  description: "阿松的个人博客，分享技术、生活和理财心得",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  author: {
    name: "阿松",
    email: "contact@example.com",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  },
  social: {
    twitter: "@asong",
    github: "https://github.com/asong",
  },
};

interface ListItemElement {
  "@type": "ListItem";
  position: number;
  name: string;
  item?: string;
}

interface BreadcrumbList {
  "@type": "BreadcrumbList";
  itemListElement: ListItemElement[];
}

interface SchemaPerson {
  "@type": "Person";
  name: string;
  url: string;
}

interface SchemaArticle {
  "@type": "Article";
  name: string;
  description?: string;
  url: string;
  datePublished?: string;
  author: SchemaPerson;
  keywords?: string;
}

interface SchemaItemList {
  "@type": "ItemList";
  name: string;
  description?: string;
  numberOfItems: number;
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    item: SchemaArticle;
  }>;
}

interface SchemaCollectionPage {
  "@context": "https://schema.org";
  "@type": "CollectionPage";
  name: string;
  description?: string;
  url: string;
  mainEntity: SchemaItemList;
  breadcrumb: BreadcrumbList;
  publisher: SchemaPerson;
}

export function generateChannelStructuredData(
  channelKey: string,
  channelConfig: ChannelConfig,
  posts: Post[] = []
): SchemaCollectionPage {
  const channelUrl = `${SITE_CONFIG.url}/blog/${channelKey}`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${channelConfig.name} | ${SITE_CONFIG.name}`,
    description: channelConfig.description,
    url: channelUrl,
    mainEntity: {
      "@type": "ItemList",
      name: `${channelConfig.name}文章列表`,
      description: channelConfig.description,
      numberOfItems: posts.length,
      itemListElement: posts.slice(0, 10).map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Article",
          name: post.title,
          description: post.excerpt,
          url: `${SITE_CONFIG.url}/blog/${post.slug}`,
          datePublished: post.date,
          author: {
            "@type": "Person",
            name: post.author || SITE_CONFIG.author.name,
          },
        },
      })) as any,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "首页", item: SITE_CONFIG.url },
        { "@type": "ListItem", position: 2, name: "博客", item: `${SITE_CONFIG.url}/blog` },
        { "@type": "ListItem", position: 3, name: channelConfig.name, item: channelUrl },
      ],
    },
    publisher: {
      "@type": "Person",
      name: SITE_CONFIG.author.name,
      url: SITE_CONFIG.author.url,
    },
  };
}

export function generateColumnStructuredData(
  channelKey: string,
  columnKey: string,
  channelConfig: ChannelConfig,
  columnConfig: ColumnConfig,
  posts: Post[] = []
): SchemaCollectionPage {
  const columnUrl = `${SITE_CONFIG.url}/blog/${channelKey}/${columnKey}`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${columnConfig.name} | ${channelConfig.name} | ${SITE_CONFIG.name}`,
    description: columnConfig.description,
    url: columnUrl,
    mainEntity: {
      "@type": "ItemList",
      name: `${columnConfig.name}专栏文章`,
      description: columnConfig.description,
      numberOfItems: posts.length,
      itemListElement: posts.slice(0, 10).map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Article",
          name: post.title,
          description: post.excerpt,
          url: `${SITE_CONFIG.url}/blog/${channelKey}/${columnKey}/${post.slug}`,
          datePublished: post.date,
          author: {
            "@type": "Person",
            name: post.author || SITE_CONFIG.author.name,
          },
          keywords: post.tags?.join(", "),
        },
      })) as any,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "首页", item: SITE_CONFIG.url },
        { "@type": "ListItem", position: 2, name: "博客", item: `${SITE_CONFIG.url}/blog` },
        { "@type": "ListItem", position: 3, name: channelConfig.name, item: `${SITE_CONFIG.url}/blog/${channelKey}` },
        { "@type": "ListItem", position: 4, name: columnConfig.name, item: columnUrl },
      ],
    },
    publisher: {
      "@type": "Person",
      name: SITE_CONFIG.author.name,
      url: SITE_CONFIG.author.url,
    },
  };
}

export function generateArticleStructuredData(
  post: Post,
  channelKey: string,
  columnKey: string,
  channelConfig: ChannelConfig,
  columnConfig: ColumnConfig
) {
  const articleUrl = `${SITE_CONFIG.url}/blog/${channelKey}/${columnKey}/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    url: articleUrl,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: post.author || SITE_CONFIG.author.name,
      url: SITE_CONFIG.author.url,
    },
    publisher: {
      "@type": "Person",
      name: SITE_CONFIG.author.name,
      url: SITE_CONFIG.author.url,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    image: post.coverImage
      ? {
          "@type": "ImageObject",
          url: post.coverImage.startsWith("http")
            ? post.coverImage
            : `${SITE_CONFIG.url}${post.coverImage}`,
          width: 1200,
          height: 630,
        }
      : undefined,
    keywords: post.tags?.join(", "),
    articleSection: columnConfig.name,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "首页", item: SITE_CONFIG.url },
        { "@type": "ListItem", position: 2, name: "博客", item: `${SITE_CONFIG.url}/blog` },
        { "@type": "ListItem", position: 3, name: channelConfig.name, item: `${SITE_CONFIG.url}/blog/${channelKey}` },
        { "@type": "ListItem", position: 4, name: columnConfig.name, item: `${SITE_CONFIG.url}/blog/${channelKey}/${columnKey}` },
        { "@type": "ListItem", position: 5, name: post.title, item: articleUrl },
      ],
    },
  };
}

interface MetadataOptions {
  title: string;
  description?: string;
  url: string;
  image?: string;
  type?: string;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
  section?: string;
}

export function generateEnhancedMetadata(options: MetadataOptions) {
  const {
    title,
    description,
    url,
    image,
    type = "website",
    publishedTime,
    modifiedTime,
    authors,
    tags,
    section,
  } = options;

  const fullTitle = title.includes(SITE_CONFIG.name)
    ? title
    : `${title} | ${SITE_CONFIG.name}`;
  const ogImageUrl = image
    ? image.startsWith("http")
      ? image
      : `${SITE_CONFIG.url}${image}`
    : `${SITE_CONFIG.url}/default-og-image.png`;

  return {
    title: fullTitle,
    description,
    keywords: tags?.join(", "),
    authors: authors
      ? authors.map((author) => ({ name: author }))
      : [{ name: SITE_CONFIG.author.name }],
    creator: SITE_CONFIG.author.name,
    publisher: SITE_CONFIG.author.name,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "zh_CN",
      type,
      publishedTime,
      modifiedTime,
      authors: authors || [SITE_CONFIG.author.name],
      section,
      tags,
    },
    twitter: {
      card: "summary_large_image" as const,
      title: fullTitle,
      description,
      images: [ogImageUrl],
      creator: SITE_CONFIG.social.twitter,
    },
    alternates: {
      canonical: url,
    },
  };
}

export function generateStructuredDataScript(structuredData: unknown): string {
  return `<script type="application/ld+json">${JSON.stringify(structuredData, null, 2)}</script>`;
}

export function generateSitemapData(
  posts: Post[],
  channelsConfig: ChannelsConfig
) {
  const urls: Array<{
    url: string;
    lastModified: Date;
    changeFrequency: string;
    priority: number;
  }> = [];

  urls.push({
    url: SITE_CONFIG.url,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1.0,
  });

  urls.push({
    url: `${SITE_CONFIG.url}/blog`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  });

  Object.entries(channelsConfig).forEach(([channelKey, channelConfig]) => {
    urls.push({
      url: `${SITE_CONFIG.url}/blog/${channelKey}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });
    Object.keys(channelConfig.columns || {}).forEach((columnKey) => {
      urls.push({
        url: `${SITE_CONFIG.url}/blog/${channelKey}/${columnKey}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    });
  });

  posts.forEach((post) => {
    urls.push({
      url: `${SITE_CONFIG.url}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  });

  return urls;
}

export { SITE_CONFIG };
