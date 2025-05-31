// src/components/features/RecentPosts.jsx
import Link from 'next/link';
import { getSortedPostsData } from '@/lib/post'; // 确保路径正确
import { format, parseISO } from 'date-fns'; // format 用于显示，parseISO 用于确保日期对象
import { zhCN } from 'date-fns/locale';

// 从您手动添加/转换的 tweet-card.jsx 文件中导入 MagicTweet 和其他可能需要的组件
// (确保这些组件已从该文件中导出)
import { MagicTweet, TweetHeader, TweetBody, TweetMedia, Twitter, Verified, truncate } from "@/components/magicui/tweet-card";
// enrichTweet 主要用于处理文本中的链接、提及等，并格式化媒体。
// 如果我们手动构造 entities 和 media，可能不完全需要它，或者只用它处理文本。
// 但 MagicTweet 内部可能直接期望 enrichTweet 的输出结构。
// 为了简单起见，我们先尝试手动构造，如果不行再看 enrichTweet。
// 实际上，MagicTweet 和它的子组件 TweetHeader, TweetBody, TweetMedia 是直接使用 enrichedTweet 对象的字段。
// 我们需要模拟这个 enrichedTweet 对象的结构。

// 默认的作者信息
const DEFAULT_AUTHOR_NAME = "您的名字/博客名";
const DEFAULT_AUTHOR_HANDLE = "@您的Handle";
const DEFAULT_AVATAR_URL = "https://blog-assets-asong.tos-cn-beijing.volces.com/avatar.jpg"; // 确保此图片存在于 public 目录下

export default function RecentPosts() {
    const allPosts = getSortedPostsData();
    const recentPosts = allPosts.slice(0, 3);

    if (recentPosts.length === 0) {
        return null;
    }

    return (
        <section id="recentposts" className="mt-32">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                    最新博文
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-start justify-items-center">
                    {recentPosts.map((post) => {
                        const { slug, title, date, excerpt, author, coverImage, tags } = post; // 'post' 来自 getSortedPostsData，已经是扁平结构
                        const postLink = `/blog/${slug}`;

                        // 手动构造一个符合 MagicTweet 及其子组件期望的 "enrichedTweet" 对象结构
                        const mockEnrichedTweet = {
                            user: {
                                name: author || DEFAULT_AUTHOR_NAME,

                                profile_image_url_https: DEFAULT_AVATAR_URL, // 同样，可配置
                                url: "#", // 作者链接，可以指向您的"关于我"或留空/用'#'
                                verified: false, // 或根据您的实际情况
                                is_blue_verified: false,
                            },
                            // 对于 TweetBody，它期望一个 entities 数组。
                            // 如果只是简单文本，可以创建一个只包含一个 text 类型的 entity。
                            entities: [
                                {
                                    type: "text",
                                    text: excerpt ? `${excerpt.substring(0, 120)}${excerpt.length > 120 ? '...' : ''}` : title,
                                }
                                // 如果您的 excerpt/title 中包含链接或提及，需要更复杂的 entities 构造
                                // 或者修改 TweetBody 组件以更简单地处理纯文本。
                            ],
                            text: excerpt ? `${excerpt.substring(0, 120)}${excerpt.length > 120 ? '...' : ''}` : title, // TweetMedia 的 alt 文本可能用到
                            photos: coverImage ? [{ url: coverImage, type: "photo" }] : undefined,
                            video: undefined, // 假设博客文章没有视频
                            url: postLink, // 这会作为 TweetHeader 右上角 Twitter 图标的链接
                            created_at: date ? parseISO(date) : new Date(), // TweetHeader 会用这个来显示时间
                            // Magic UI 的 TweetCard 用 date-fns 的 formatDistanceToNowStrict
                            // 它期望一个 Date 对象或可被 new Date() 解析的字符串/数字
                        };

                        return (
                            <Link href={postLink} key={slug} className="block w-full max-w-md">
                                <MagicTweet
                                    tweet={mockEnrichedTweet} // MagicTweet 期望的 prop 名是 tweet
                                    className="min-h-[200px] cursor-pointer transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-sky-500/50" // 确保卡片有最小高度并可交互
                                    // components prop 是 react-tweet 用的，这里可能不需要，除非 MagicTweet 内部也用
                                />
                            </Link>
                        );
                    })}
                </div>
                {allPosts.length > recentPosts.length && (
                    <div className="text-center mt-12">
                        <Link href="/blog"
                              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300">
                            查看所有博文
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}