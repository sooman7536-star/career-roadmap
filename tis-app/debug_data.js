const fs = require('fs');
const path = require('path');

const assetsPath = path.join(__dirname, 'server', 'db', 'data', 'assets.json');
const assetsData = JSON.parse(fs.readFileSync(assetsPath, 'utf8'));

console.log('Total Assets:', assetsData.length);

const categories = {};
assetsData.forEach(a => {
    categories[a.main_category] = (categories[a.main_category] || 0) + 1;
});

console.log('Categories found in data:', categories);

const serverAssets = assetsData.filter(a => a.main_category === 'server');
console.log('Server Assets count (strict match):', serverAssets.length);

if (serverAssets.length > 0) {
    console.log('First Server Asset Example:', JSON.stringify(serverAssets[0], null, 2));
} else {
    console.log('No server assets found with strict match "server"');
    // Check for "Server" or other variants
    const serverAssetsInsensitive = assetsData.filter(a => a.main_category && a.main_category.toLowerCase() === 'server');
    console.log('Server Assets count (case-insensitive):', serverAssetsInsensitive.length);
    if (serverAssetsInsensitive.length > 0) {
        console.log('Example of case-mismatch:', serverAssetsInsensitive[0].main_category);
    }
}
