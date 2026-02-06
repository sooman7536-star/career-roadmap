const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'db/data/assets.json');

console.log('Reading data from:', dataPath);

if (!fs.existsSync(dataPath)) {
    console.error('Data file not found:', dataPath);
    process.exit(1);
}

let assets;
try {
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    assets = JSON.parse(rawData);
} catch (err) {
    console.error('Failed to parse JSON:', err);
    process.exit(1);
}

if (!Array.isArray(assets)) {
    console.error('Data is not an array.');
    process.exit(1);
}

// Group by group_code
const groups = {};
assets.forEach(asset => {
    // Try to determine group code
    let group = asset.group_code;

    // Fallback: check legacy uid
    if (!group && asset.uid) group = asset.uid;

    // Fallback: extract from asset_no (e.g., SV-LI-005 -> SV-LI)
    if (!group && asset.asset_no) {
        const parts = asset.asset_no.split('-');
        if (parts.length >= 2) {
            // Assume last part is number, rest is group
            parts.pop();
            group = parts.join('-');
        }
    }

    if (group) {
        if (!groups[group]) groups[group] = [];
        groups[group].push(asset);
    } else {
        console.warn(`[Skip] Asset ID ${asset.id} has no group code info.`);
    }
});

let changesCount = 0;

Object.keys(groups).forEach(group => {
    console.log(`Processing group: ${group}`);
    const groupAssets = groups[group];

    // Sort by current numeric part of asset_no
    groupAssets.sort((a, b) => {
        if (!a.asset_no || !b.asset_no) return 0;
        const numA = parseInt(a.asset_no.split('-').pop(), 10);
        const numB = parseInt(b.asset_no.split('-').pop(), 10);
        return numA - numB;
    });

    // Re-assign numbers
    groupAssets.forEach((asset, index) => {
        const newNum = index + 1;
        const newAssetNo = `${group}-${String(newNum).padStart(3, '0')}`;

        if (asset.asset_no !== newAssetNo) {
            console.log(`  [Reorder] ID ${asset.id}: ${asset.asset_no} -> ${newAssetNo}`);
            asset.asset_no = newAssetNo;

            // Ensure group_code is consistent
            if (!asset.group_code) asset.group_code = group;

            changesCount++;
        }
    });
});

if (changesCount > 0) {
    try {
        fs.writeFileSync(dataPath, JSON.stringify(assets, null, 2), 'utf-8');
        console.log(`Successfully updated ${changesCount} assets.`);
    } catch (err) {
        console.error('Failed to write file:', err);
    }
} else {
    console.log('No changes needed. All assets are already in order.');
}
