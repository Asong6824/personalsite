/* eslint-disable @next/next/no-img-element */
import { Suspense } from "react"; // Assuming useState might be needed if Skeleton implies loading state elsewhere
import { getTweet } from "react-tweet/api";

import { cn } from "@/lib/utils";


const Verified = ({ className, ...props }) => (
    <svg
        aria-label="Verified Account"
        viewBox="0 0 24 24"
        className={className}
        {...props}
    >
        <g fill="currentColor">
            <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
        </g>
    </svg>
);

export const truncate = (str, length) => {
    if (!str || str.length <= length) return str;
    return `${str.slice(0, length - 3)}...`;
};

const Skeleton = ({
                      className,
                      ...props
                  }) => {
    return (
        <div className={cn("rounded-md bg-primary/10 animate-pulse", className)} {...props} />
    );
};

export const TweetSkeleton = ({
                                  className,
                                  ...props
                              }) => (
    <div
        className={cn(
            "flex w-full max-w-lg flex-col gap-2 rounded-lg border bg-background p-4", // Assuming bg-background for better visibility
            className,
        )}
        {...props}
    >
        <div className="flex flex-row gap-2 items-center">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex flex-col gap-1 w-full">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
            </div>
        </div>
        <Skeleton className="h-16 w-full mt-2" />
        <Skeleton className="h-8 w-2/3 mt-1" />
    </div>
);

export const TweetNotFound = ({
                                  className,
                                  ...props
                              }) => (
    <div
        className={cn(
            "flex w-full max-w-lg flex-col items-center justify-center gap-2 rounded-lg border bg-background p-4 text-destructive", // Assuming theme colors
            className,
        )}
        {...props}
    >
        <h3>Tweet not found</h3>
        <p className="text-sm">The tweet may have been deleted or the ID is incorrect.</p>
    </div>
);

// EnrichedTweet type is not defined in JS, so we rely on the object structure
export const TweetHeader = ({ tweet }) => (
    <div className="flex flex-row justify-between items-center tracking-tight">
        <div className="flex items-center space-x-2">
            {/* 1. 包裹头像的 <a> 标签改为 div (不再是链接) */}
            <div className="flex-shrink-0"> {/* 使用 div 包裹图片，可以保持原有布局 */}
                <img
                    title={`Profile picture of ${tweet.user.name}`}
                    alt={tweet.user.screen_name}
                    height={48}
                    width={48}
                    src={tweet.user.profile_image_url_https}
                    className="overflow-hidden rounded-full border border-transparent" // 移除了 hover:opacity-90，因为它不再是可交互链接
                />
            </div>
            <div className="flex flex-col">
                {/* 2. 包裹作者名的 <a> 标签改为 div 或 span (不再是链接) */}
                <div className="flex items-center whitespace-nowrap font-semibold text-foreground"> {/* 保留样式 */}
                    {truncate(tweet.user.name, 20)}
                    {(tweet.user.verified || tweet.user.is_blue_verified) && (
                        <Verified className="ml-1 inline size-4 text-blue-500" />
                    )}
                </div>

            </div>
        </div>
        {/* 4. (如果存在) 处理 TweetHeader 右上角的 Twitter 图标链接 */}
        {/* 如果您的 TweetHeader 原本右上角有一个 Twitter 图标链接到 tweet.url (即您的博客文章链接),
            那么这个 <a> 标签也需要处理。由于整个卡片已经是链接了，这个小图标链接到同样的地方是多余的。
            您可以将其移除，或者如果只是想显示图标，则移除 <a> 标签，只保留 <Twitter /> 图标本身。
            如果您提供的 "完整版" 不包含这个右上角的 Twitter 图标，则无需担心此点。
            假设您之前的版本有这个，可以这样修改：
        */}
        {/* <div title="View Post">  // 或者直接移除，因为整个卡片可点
            <span className="sr-only">Link to post</span>
            <Twitter className="size-5 text-[#1DA1F2]" />
        </div>
        */}
    </div>
);

// EnrichedTweet type is not defined in JS
export const TweetBody = ({ tweet }) => (
    // text-foreground for better theme adaptability
    <div className="break-words whitespace-pre-wrap text-sm font-normal leading-normal tracking-tight text-foreground">
        {tweet.entities.map((entity, idx) => {
            switch (entity.type) {
                case "url":
                    return (
                        <a
                            key={idx}
                            href={entity.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline" // Standard link styling
                        >
                            {entity.text}
                        </a>
                    );
                case "symbol": // $Cashtag
                    return (
                        <a
                            key={idx}
                            href={entity.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                        >
                            {entity.text}
                        </a>
                    );
                case "hashtag":
                    return (
                        <a
                            key={idx}
                            href={entity.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                        >
                            {entity.text}
                        </a>
                    );
                case "mention":
                    return (
                        <a
                            key={idx}
                            href={entity.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                        >
                            {entity.text}
                        </a>
                    );
                case "text":
                    // Using dangerouslySetInnerHTML is okay here because enrichTweet sanitizes it.
                    // However, if enrichTweet is not guaranteed to sanitize, this is a security risk.
                    // For pure JS conversion, we trust the input from enrichTweet.
                    return (
                        <span
                            key={idx}
                            dangerouslySetInnerHTML={{ __html: entity.text }}
                        />
                    );
                default:
                    // Fallback for unknown entity types, or you can choose to render nothing
                    return <span key={idx}>{entity.text}</span>;
            }
        })}
    </div>
);

// EnrichedTweet type is not defined in JS
export const TweetMedia = ({ tweet }) => {
    // Check if media (photos or video) exists
    const hasPhotos = tweet.photos && tweet.photos.length > 0;
    const hasVideo = tweet.video && tweet.video.variants && tweet.video.variants.length > 0;
    // Check for card thumbnail as a fallback
    // Optional chaining for safety, in case tweet.card or subsequent properties are undefined
    const cardThumbnailUrl = tweet?.card?.binding_values?.thumbnail_image_large?.image_value?.url;

    if (!hasVideo && !hasPhotos && !cardThumbnailUrl) return null;

    return (
        <div className="mt-2 flex aspect-video max-h-[400px] items-center justify-center overflow-hidden rounded-lg border shadow-sm">
            {hasVideo && (
                <video
                    poster={tweet.video.poster}
                    autoPlay
                    loop
                    muted
                    playsInline // Important for iOS
                    className="h-full w-full object-contain" // object-contain to see the whole video
                >
                    {/* 添加对 variants[0] 是否存在的检查 */}
                    {tweet.video.variants && tweet.video.variants[0] && (
                        <source src={tweet.video.variants[0].src} type={tweet.video.variants[0].type} />
                    )}
                    Your browser does not support the video tag.
                </video>
            )}
            {hasPhotos && !hasVideo && ( // Show photos only if no video
                <div className="relative flex h-full w-full transform-gpu snap-x snap-mandatory gap-0 overflow-x-auto">
                    {tweet.photos.map((photo) => (
                        // 移除了包裹 img 的 <a> 标签
                        <div key={photo.url} className="shrink-0 snap-center snap-always h-full w-full">
                            <img
                                src={photo.url}
                                title={"Photo by " + (tweet.user?.name || 'User')} // 使用可选链访问 user.name
                                alt={((tweet.text || 'Tweet media content').substring(0, 50)) + "..."} // 使用可选链访问 text
                                className="h-full w-full object-contain" // object-contain to see whole image
                            />
                        </div>
                    ))}
                </div>
            )}
            {!hasVideo && !hasPhotos && cardThumbnailUrl && (
                // 移除了包裹 img 的 <a> 标签
                <div className="h-full w-full">
                    <img
                        src={cardThumbnailUrl}
                        className="h-full w-full object-contain"
                        alt={tweet.card?.binding_values?.title?.string_value || ((tweet.text || 'Card media content').substring(0,50)) + "..." }
                    />
                </div>
            )}
        </div>
    );
};

// Tweet, TwitterComponents types are not defined in JS
export const MagicTweet = ({
                               tweet, // 这个 tweet 对象现在是由 RecentPosts.jsx 构造的 "enriched" 版本
                               components,
                               className,
                               ...props
                           }) => {
    // const enrichedTweet = enrichTweet(tweet); // <--- 移除或注释掉这一行
    const enrichedTweet = tweet; // <--- 直接使用传入的 tweet 对象

    return (
        <div
            className={cn(
                "relative flex w-full max-w-lg flex-col gap-3 overflow-hidden rounded-lg border bg-background p-4 shadow-sm backdrop-blur-md",
                className,
            )}
            {...props}
        >
            <TweetHeader tweet={enrichedTweet} />
            <TweetBody tweet={enrichedTweet} />
            <TweetMedia tweet={enrichedTweet} />
        </div>
    );
};

