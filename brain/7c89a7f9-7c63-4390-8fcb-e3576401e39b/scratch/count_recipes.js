const fs = require('fs');
const content = fs.readFileSync('src/js/data.js', 'utf8');

// Use a regex to find all "id": X, matches
const matches = content.match(/"id":\s*(\d+)/g);
if (matches) {
    const ids = matches.map(m => parseInt(m.match(/\d+/)[0]));
    console.log('Total Recipes:', ids.length);
    console.log('Unique Recipes:', new Set(ids).size);
    console.log('Max ID:', Math.max(...ids));
    
    // Check for missing IDs
    const sortedIds = ids.sort((a, b) => a - b);
    const missing = [];
    for (let i = 1; i <= sortedIds[sortedIds.length - 1]; i++) {
        if (!ids.includes(i)) missing.push(i);
    }
    if (missing.length > 0) console.log('Missing IDs:', missing);
    else console.log('No IDs missing.');
} else {
    console.log('No IDs found.');
}
