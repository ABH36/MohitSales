const fs = require('fs');
const content = fs.readFileSync('public/assets/css/main.css', 'utf8');
const regex = /\.main-menu[^{}]*\{[^{}]*\}/gi;
let match;
console.log('Matches for .main-menu:');
while ((match = regex.exec(content)) !== null) {
  console.log(match[0]);
}

console.log('\nSearching for submenu rules:');
const regex2 = /\.submenu[^{}]*\{[^{}]*\}/gi;
while ((match = regex2.exec(content)) !== null) {
  console.log(match[0]);
}
