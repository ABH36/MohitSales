const fs = require('fs'); const txt = fs.readFileSync('legacy_content/industries/cables-by-application/mobility-infrastructure.php', 'utf-8'); console.log(txt.match(/href="([^"]+)"/g).slice(0, 10));
