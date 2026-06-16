const bcrypt = require('bcryptjs');

async function main() {
  const hash = '$2a$12$XUGmOCdqELZHzNjJ9o/hxOrCoxeOS4Q7yerxGnBF6hnjYUgrS1IYu';
  const match = await bcrypt.compare('Admin@2024!', hash);
  console.log('Password matches Admin@2024!:', match);
}

main().catch(console.error);
