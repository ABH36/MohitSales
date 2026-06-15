const fs = require('fs');

fetch('https://mohitscpl.com/')
  .then(res => res.text())
  .then(html => {
    // Find the main-menu nav block
    const menuStart = html.indexOf('class="main-menu');
    if (menuStart === -1) {
      console.log('Main menu class not found');
      return;
    }
    const navStart = html.lastIndexOf('<nav', menuStart);
    const navEnd = html.indexOf('</nav>', menuStart) + 6;
    const navHtml = html.substring(navStart, navEnd);
    console.log(navHtml);
    fs.writeFileSync('scratch/original_menu.html', navHtml);
  })
  .catch(err => console.error(err));
