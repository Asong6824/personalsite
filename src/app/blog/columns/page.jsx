import { CHANNELS_CONFIG } from '@/lib/channels';
import { getPostsByColumn } from '@/lib/post';
import ColumnsPageClient from '@/components/features/ColumnsPageClient';

export default async function ColumnsPage() {
  // 服务端获取所有频道下所有专栏的文章数据
  const allColumns = [];
  
  for (const channelKey of Object.keys(CHANNELS_CONFIG)) {
    for (const columnKey of Object.keys(CHANNELS_CONFIG[channelKey].columns)) {
      const posts = getPostsByColumn(channelKey, columnKey);
      const columnConfig = CHANNELS_CONFIG[channelKey].columns[columnKey];
      
      allColumns.push({
        name: columnConfig.name,
        description: columnConfig.description,
        channel: CHANNELS_CONFIG[channelKey].name,
        channelKey,
        columnKey,
        articleCount: posts.length,
        href: `/blog/${channelKey}/${columnKey}`,
        cover: columnConfig.cover || null
      });
    }
  }
  
  return <ColumnsPageClient allColumnsData={allColumns} />;
}