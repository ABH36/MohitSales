async function main() {
  const url = 'http://localhost:3001/industries/cables-by-type/others/rubber-cable/polycab-h05s-uh05s-k-bsen-50525-2-41-sc-300500v-ac';
  console.log('Fetching', url);
  const res = await fetch(url);
  console.log('Status:', res.status);
  console.log('Headers:', Object.fromEntries(res.headers.entries()));
  const html = await res.text();
  console.log('HTML Length:', html.length);
  // Log first 1000 characters
  console.log('HTML Start:', html.substring(0, 1000));
}

main().catch(console.error);
