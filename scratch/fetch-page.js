const cheerio = require('cheerio');

async function main() {
  const url = 'http://localhost:3001/industries/cables-by-type/others/rubber-cable/polycab-h05s-uh05s-k-bsen-50525-2-41-sc-300500v-ac';
  console.log('Fetching', url);
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);
  
  console.log('\n=== Elements with text "Send Enquiry" ===');
  $(':contains("Send Enquiry")').each((i, el) => {
    // only print if it has no children with the same text to get the deepest element
    const text = $(el).clone().children().remove().end().text().trim();
    if (text.includes('Send Enquiry')) {
      console.log(`Tag: ${el.tagName}, class: ${$(el).attr('class') || 'none'}`);
      console.log('Outer HTML snippet:', $.html(el).substring(0, 300));
    }
  });

  console.log('\n=== Elements with text "Download Datasheet" ===');
  $(':contains("Download Datasheet")').each((i, el) => {
    const text = $(el).clone().children().remove().end().text().trim();
    if (text.includes('Download Datasheet')) {
      console.log(`Tag: ${el.tagName}, class: ${$(el).attr('class') || 'none'}`);
      console.log('Outer HTML snippet:', $.html(el).substring(0, 300));
    }
  });

  console.log('\n=== Parent containers of rs-btn ===');
  $('.rs-btn').each((i, el) => {
    console.log(`Button tag: ${el.tagName}, class: ${$(el).attr('class') || 'none'}`);
    console.log('Parent HTML snippet:', $.html($(el).parent()).substring(0, 300));
  });
}

main().catch(console.error);
