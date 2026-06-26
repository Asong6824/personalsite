import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const archivedNotionApiEnabled = process.env.ENABLE_ARCHIVED_NOTION_API === '1';

function titleText(obj) {
  const arr = obj?.title || [];
  return Array.isArray(arr) ? arr.map(x => x.plain_text).join('') : '';
}

export async function GET() {
  try {
    if (!archivedNotionApiEnabled) {
      return NextResponse.json(
        { error: 'Notion integration is archived. Set ENABLE_ARCHIVED_NOTION_API=1 to run the legacy endpoint locally.' },
        { status: 410 }
      );
    }

    const NOTION_TOKEN = process.env.NOTION_TOKEN;
    if (!NOTION_TOKEN) {
      return NextResponse.json({ error: 'Missing NOTION_TOKEN' }, { status: 500 });
    }
    const client = new Client({ auth: NOTION_TOKEN });

    const resp = await client.search({
      filter: { property: 'object', value: 'data_source' },
      page_size: 100,
    });
    const results = resp.results || [];

    const databases = [];
    for (const db of results) {
      const id = db.id;
      const title = titleText(db);
      let properties = [];
      try {
        const detail = await client.dataSources.retrieve({ data_source_id: id });
        properties = Object.keys(detail.properties || {});
      } catch (_) {
        properties = [];
      }
      databases.push({ id, title, properties });
    }

    return NextResponse.json({ databases }, { status: 200 });
  } catch (e) {
    console.error('[notion/list-dbs] error', e);
    const msg = e?.message || 'unknown';
    const status = e?.status || 500;
    return NextResponse.json({ error: 'failed to list databases', details: msg }, { status });
  }
}
