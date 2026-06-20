const cheerio = require('cheerio');

const html = `<div class="enquiry-btn">
    <div class="rs-banner-btn">
        <a class="rs-btn has-theme-orange" href="/contact-us">Send Enquiry</a>
    </div>
    <div class="rs-banner-btn">
        <a class="rs-btn has-theme-orange" href="/assets/images/datasheet/defence-and-armaments-industry/polycab-h05s-uh05s-k-bsen-50525-2-41-sc-300500v-ac.pdf">Download Datasheet</a>
    </div>
</div>`;

const contextUrl = '/contact-us?product=Test';

let cleanHtml = html;
const $ = cheerio.load(cleanHtml, null, false);
$('.enquiry-btn').each((_, elem) => {
  const container = $(elem);
  const links = container.find('.rs-banner-btn a');
  if (links.length > 0) {
    const wrapper = $('<div class="product-actions mt-4 w-full flex flex-wrap gap-3"></div>');
    links.each((_, linkElem) => {
      const link = $(linkElem);
      const href = link.attr('href') || '#';
      const text = link.text().trim();
      
      if (text.toLowerCase().includes('datasheet') || href.toLowerCase().includes('.pdf')) {
        const newLink = $(`<a class="border-2 border-[#1e2e5e] text-[#1e2e5e] rounded-[4px] px-6 py-2.5 font-medium text-[15px] inline-flex items-center justify-center transition-all duration-300 w-auto min-w-[140px] h-[45px] whitespace-nowrap hover:bg-[#1e2e5e] hover:text-white hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(30,46,94,0.25)]" target="_blank" rel="noopener noreferrer"></a>`);
        newLink.attr('href', href);
        newLink.text('Download Datasheet');
        wrapper.append(newLink);
      } else {
        const newLink = $(`<a class="bg-gradient-to-br from-[#f7931e] to-[#c1272d] text-white rounded-[4px] px-6 py-2.5 font-medium text-[15px] inline-flex items-center justify-center transition-all duration-300 w-auto min-w-[140px] h-[45px] whitespace-nowrap hover:bg-none hover:bg-[#1e2e5e] hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(30,46,94,0.25)]"></a>`);
        newLink.attr('href', contextUrl);
        newLink.text('Send Enquiry');
        wrapper.append(newLink);
      }
    });
    container.replaceWith(wrapper);
  }
});
cleanHtml = $.html();
console.log('Resulting HTML:\n', cleanHtml);
