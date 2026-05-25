import { stamps, navLinks, socialLinks } from "@/data/stamps";
import StampsPageClient from "@/components/stamps/StampsPageClient";

export const metadata = {
  title: "駅スタンプ | 日本行纪 | 阿松的个人网站",
  description: "我的日本车站印章收藏，记录每一次旅途的印记。",
};

export default function JapanStampsPage() {
  return (
    <StampsPageClient
      stamps={stamps}
      navLinks={navLinks}
      socialLinks={socialLinks}
    />
  );
}
