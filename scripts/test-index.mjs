import { getOrBuildPostsIndex } from '../src/lib/post-index.js';

console.log('Starting index build...');
try {
    const index = getOrBuildPostsIndex();
    console.log('Index built successfully!');
    console.log('Item count:', index.items.length);
} catch (e) {
    console.error('Index build failed:', e);
}
