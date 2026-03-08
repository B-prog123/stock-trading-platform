const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
                results = results.concat(walk(fullPath));
            }
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.jsx')) {
                results.push(fullPath);
            }
        }
    });
    return results;
}

const files = walk('.');
let changedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace ₹${...} with ₹${...}
    content = content.replace(/\$\$\{/g, '₹${');

    // Replace ₹ followed by number with ₹ and number
    content = content.replace(/\$([0-9])/g, '₹₹1');

    // Replace (₹ ) with (₹ )
    content = content.replace(/\(\$\)/g, '(₹)');

    // Replace (\$) with (₹) in texts like "Investment Amount (₹)"
    content = content.replace(/\(\$\)/g, '(₹)');

    // Replace ₹  with ₹ 
    content = content.replace(/\₹ /g, '₹ ');

    // Replace IndianRupee component with IndianRupee component
    content = content.replace(/IndianRupee/g, 'IndianRupee');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changedFiles++;
        console.log('Modified:', file);
    }
});

console.log('Total files modified:', changedFiles);
