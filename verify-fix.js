
const fs = require('fs');
const path = require('path');

// Mock process.cwd and other necessary parts if needed, but we can just import the file if we handle ESM correctly.
// Since the project is using ESM (import/export), we should use .mjs or handle it.
// However, the previous attempt with .mjs failed due to import issues with aliases or relative paths not being standard node resolution.
// I will use the isolated logic approach again as it is most reliable without setting up a full build environment.

const postsDirectory = path.join(process.cwd(), 'content/blog');

function getAllFiles(dir, baseDir = dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllFiles(fullPath, baseDir));
        } else {
            results.push(path.relative(baseDir, fullPath));
        }
    });
    return results;
}

console.log('Scanning content/blog...');
const files = getAllFiles(postsDirectory);
console.log('Files found:', files);

const target = 'verification-test/verify-me.mdx';
if (files.includes(target)) {
    console.log('\n✅ SUCCESS: Found ' + target);
} else {
    console.error('\n❌ FAILURE: Did not find ' + target);
    process.exit(1);
}
