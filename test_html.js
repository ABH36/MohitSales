const http = require('http');

http.get('http://localhost:3000/cable-terminal/aluminium', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        const start = data.indexOf('<div class="product-card">');
        const end = data.indexOf('<div class="col-md-4 mt-4">', start + 10);
        console.log(data.substring(start, end > -1 ? end : start + 1000));
    });
});
