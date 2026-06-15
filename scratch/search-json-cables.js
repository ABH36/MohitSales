const fs = require('fs');
const path = require('path');

const jsonPath = path.join(process.cwd(), 'content-export.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

console.log('Searching content-export.json for cables-by-type:');
const matches = data.filter(item => item.path.toLowerCase().includes('cables-by-type'));

console.log(`Found ${matches.length} matches`);
for (const match of matches.slice(0, 15)) {
  console.log(`- Path: ${match.path}`);
  console.log(`  Title: ${match.heading || match.title}`);
  console.log(`  Image: ${match.imageSrc || 'None'}`);
  if (match.cards) {
    console.log(`  Cards count: ${match.cards.length}`);
    const cardsWithImage = match.cards.filter(c => c.image);
    console.log(`  Cards with image: ${cardsWithImage.length}`);
    if (cardsWithImage.length > 0) {
      console.log(`    First card image: ${cardsWithImage[0].image}`);
    }
  }
}
