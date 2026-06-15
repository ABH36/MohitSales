const fs = require('fs');
const html = fs.readFileSync('temp-output.html', 'utf-8');

console.log('Sidebar links:');
const sidebarMatches = html.match(/class="sidebar-tabs"[^>]*>([\s\S]*?)<\/ul>/);
if (sidebarMatches) {
  const links = sidebarMatches[1].match(/href="([^"]+)"/g);
  console.log(links);
}

console.log('Card heights:');
const cheerio = require('cheerio');
const $ = cheerio.load(html);
$('.cables-card').each((i, el) => {
  if (i === 0) {
    console.log('Card 1 HTML:', $.html(el));
  }
});
