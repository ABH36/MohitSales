const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const coolersCards = [
  {
    image: "/assets/images/our_products/home_appliances/coolers/1.png",
    title: "COOLER Features 1",
    details: "",
    link: "/contact-us.php",
    features: [
      "/assets/images/our_products/home_appliances/coolers/2.png",
      "/assets/images/our_products/home_appliances/coolers/3.png"
    ]
  },
  {
    image: "/assets/images/our_products/home_appliances/coolers/4.png",
    title: "COOLER Features 2",
    details: "",
    link: "/contact-us.php",
    features: [
      "/assets/images/our_products/home_appliances/coolers/5.png",
      "/assets/images/our_products/home_appliances/coolers/6.png"
    ]
  },
  {
    image: "/assets/images/our_products/home_appliances/coolers/7.png",
    title: "COOLER Features 3",
    details: "",
    link: "/contact-us.php",
    features: [
      "/assets/images/our_products/home_appliances/coolers/8.png",
      "/assets/images/our_products/home_appliances/coolers/9.png"
    ]
  }
];

const instantHeatersCards = [
  {
    image: "/assets/images/our_products/home_appliances/water_heaters/instant-feature.png",
    title: "Instant Features",
    details: "",
    link: "/contact-us.php",
    features: []
  },
  {
    image: "/assets/images/our_products/home_appliances/water_heaters/instant-table.png",
    title: "Instant Specifications",
    details: "",
    link: "/contact-us.php",
    features: []
  }
];

const storageHeatersCards = [
  {
    image: "/assets/images/our_products/home_appliances/water_heaters/storage_water_heaters/6.png",
    title: "Storage Series 1",
    details: "",
    link: "/contact-us.php",
    features: [
      "/assets/images/our_products/home_appliances/water_heaters/storage_water_heaters/7.png",
      "/assets/images/our_products/home_appliances/water_heaters/storage_water_heaters/8.png"
    ]
  },
  {
    image: "/assets/images/our_products/home_appliances/water_heaters/storage_water_heaters/9.png",
    title: "Storage Series 2",
    details: "",
    link: "/contact-us.php",
    features: [
      "/assets/images/our_products/home_appliances/water_heaters/storage_water_heaters/10.png",
      "/assets/images/our_products/home_appliances/water_heaters/storage_water_heaters/11.png"
    ]
  },
  {
    image: "/assets/images/our_products/home_appliances/water_heaters/storage_water_heaters/12.png",
    title: "Storage Series 3",
    details: "",
    link: "/contact-us.php",
    features: [
      "/assets/images/our_products/home_appliances/water_heaters/storage_water_heaters/13.png",
      "/assets/images/our_products/home_appliances/water_heaters/storage_water_heaters/14.png"
    ]
  },
  {
    image: "/assets/images/our_products/home_appliances/water_heaters/storage_water_heaters/15.png",
    title: "Storage Series 4",
    details: "",
    link: "/contact-us.php",
    features: [
      "/assets/images/our_products/home_appliances/water_heaters/storage_water_heaters/16.png",
      "/assets/images/our_products/home_appliances/water_heaters/storage_water_heaters/17.png"
    ]
  },
  {
    image: "/assets/images/our_products/home_appliances/water_heaters/storage_water_heaters/18.png",
    title: "Storage Series 5",
    details: "",
    link: "/contact-us.php",
    features: [
      "/assets/images/our_products/home_appliances/water_heaters/storage_water_heaters/19.png",
      "/assets/images/our_products/home_appliances/water_heaters/storage_water_heaters/20.png"
    ]
  }
];

async function main() {
  console.log('--- STARTING SYNC ---');

  // 1. Coolers (polycab prefix)
  const coolersPolycab = await prisma.product.updateMany({
    where: { slug: 'polycab/home-appliances/coolers' },
    data: {
      imageSrc: "/assets/images/our_products/home_appliances/coolers/1.png",
      features: JSON.stringify(coolersCards)
    }
  });
  console.log('Updated polycab/home-appliances/coolers count:', coolersPolycab.count);

  // 2. Coolers (no prefix)
  const coolersNoPrefix = await prisma.product.updateMany({
    where: { slug: 'home-appliances/coolers' },
    data: {
      imageSrc: "/assets/images/our_products/home_appliances/coolers/1.png",
      features: JSON.stringify(coolersCards)
    }
  });
  console.log('Updated home-appliances/coolers count:', coolersNoPrefix.count);

  // 3. Instant Water Heaters
  const instantHeaters = await prisma.product.updateMany({
    where: { slug: 'polycab/home-appliances/water-heaters/instant-water-heaters' },
    data: {
      imageSrc: "/assets/images/our_products/home_appliances/water_heaters/instant-feature.png",
      features: JSON.stringify(instantHeatersCards)
    }
  });
  console.log('Updated polycab/home-appliances/water-heaters/instant-water-heaters count:', instantHeaters.count);

  // 4. Storage Water Heaters
  const storageHeaters = await prisma.product.updateMany({
    where: { slug: 'polycab/home-appliances/water-heaters/storage-water-heaters' },
    data: {
      imageSrc: "/assets/images/our_products/home_appliances/water_heaters/storage_water_heaters/6.png",
      features: JSON.stringify(storageHeatersCards)
    }
  });
  console.log('Updated polycab/home-appliances/water-heaters/storage-water-heaters count:', storageHeaters.count);

  console.log('--- SYNC COMPLETED ---');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
