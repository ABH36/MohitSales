/**
 * Menu slug → thumbnail for the Products mega-menu rows, so ranges show a
 * real product photo (like the approved mock) instead of a line icon.
 *
 * Sources: the DB category/product images where they exist (baked in here —
 * the menu tree itself is static, see Header.tsx), topped up with the same
 * Cloudinary assets the catalogue/landing pages already use for the hubs the
 * DB has no image for. Rows without an entry fall back to their category
 * icon, so a missing image can never break the menu.
 */
const MENU_IMAGES: Record<string, string> = {
  // Brands
  'polycab': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783166553/mohit/logo/polycab-logo.png',
  'dowells': 'https://res.cloudinary.com/da2dmtm9b/image/upload/f_auto,q_auto/mohit/logo/dowells-logo.png',

  // Fans
  'polycab/fans': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167953/mohit/our_products/polycab/polycab_fans.png',
  'fans/ceiling-fans': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783166438/mohit/our_products/fans/ceiling_fans/ceiling_fan.png',
  'fans/table-fans': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783166481/mohit/our_products/fans/table_fans/ELANZA-PT01.png',
  'fans/wall-fans': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783166526/mohit/our_products/fans/wall_fans/Elanza-PW01-Wall-Fan-2.png',
  'fans/pedestal-fans': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783166475/mohit/our_products/fans/pedestal_fans/Elanza-PP01-Pedestal-Fan-1.png',
  'fans/exhaust-fans': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783166458/mohit/our_products/fans/exhaust_fans/domestic_fan/polycab-exhaust-fan.png',
  'fans/air-circulator': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783166429/mohit/our_products/fans/air_circulator/Air-Circulator-Pedestal-Fan-1.png',
  'fans/farrata-fans': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783166469/mohit/our_products/fans/farrata_fans/Maruth-Oscillating-Fan-Pedestal-Fan-1.png',

  // Wires
  'polycab-wires': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167956/mohit/our_products/polycab/polycab_wires.png',
  'industries/cables-by-type/others/building-wires': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167956/mohit/our_products/polycab/polycab_wires.png',
  'industries/cables-by-type/others/domestic-appliance-and-lighting-cable': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167950/mohit/our_products/polycab/polycab_cable.png',
  'wires/polycab-suprema': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1784641282/mohit/catalog/wire-polycab-suprema.webp',
  'wires/polycab-optima-plus': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1784641283/mohit/catalog/wire-polycab-optima-plus.webp',
  'wires/polycab-primma': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1784641284/mohit/catalog/wire-polycab-primma.webp',
  'wires/polycab-green-wire': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1784641285/mohit/catalog/wire-polycab-green-wire.webp',
  'wires/lf-fr-180m-wires': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1784641286/mohit/catalog/wire-lf-fr-180m-wires.webp',

  // Lighting
  'lighting/led-bulb': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1784641137/mohit/catalog/led-bulb-range.webp',
  'lighting/downlight': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1784641146/mohit/catalog/downlight-range.webp',
  'lighting/panel-light': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1784641159/mohit/catalog/panel-light-range.webp',
  'lighting/led-batten': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1784641169/mohit/catalog/led-batten-range.webp',
  'lighting/led-cob': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1784641192/mohit/catalog/led-cob-range.webp',
  'lighting/outdoor-lights': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1784641174/mohit/catalog/outdoor-lights-range.webp',
  'lighting/rope-and-strip-lights': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1784641185/mohit/catalog/rope-and-strip-lights-range.webp',

  // Switches & Accessories
  'switches-accessories/etira': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1784641212/mohit/catalog/etira-range.webp',
  'switches-accessories/levana': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1784641246/mohit/catalog/levana-range.webp',
  'switches-accessories/plastic-modular-boxes': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1784641256/mohit/catalog/plastic-modular-boxes-range.webp',
  'switches-accessories/accessories': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1784641259/mohit/catalog/accessories-range.webp',

  // Water heaters
  'home-appliances/water-heaters': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783166521/mohit/our_products/home_appliances/water_heaters/5.png',
  'home-appliances/water-heaters/instant-water-heaters': 'https://res.cloudinary.com/da2dmtm9b/image/upload/f_auto,q_auto/v1783244576/mohit/our_products/home_appliances/water_heaters/instant-feature.png',
  'home-appliances/water-heaters/storage-water-heaters': 'https://res.cloudinary.com/da2dmtm9b/image/upload/f_auto,q_auto/v1783235362/mohit/our_products/home_appliances/water_heaters/storage_water_heaters/6.png',

  // Switchgear
  'polycab/switchgears': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167955/mohit/our_products/polycab/polycab_switchgears.png',
  'switchgears/mcb': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167955/mohit/our_products/polycab/polycab_switchgears.png',
  'switchgears/mcb-switch': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1784643364/mohit/catalog/mcb-changeover-switch.webp',
  'switchgears/rccb': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1784643366/mohit/catalog/rccb.webp',
  'switchgears/rcbo': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1784643365/mohit/catalog/rcbo.webp',
  'switchgears/isolator': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1784643363/mohit/catalog/isolator.webp',
  'switchgears/accl': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1784643362/mohit/catalog/accl.webp',
  'switchgears/distribution-board': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1784641287/mohit/catalog/switchgear-distribution-board.webp',

  // Home appliances
  'polycab/home-appliances': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167949/mohit/our_products/polycab/home_appliances.png',
  'home-appliances/irons': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783166518/mohit/our_products/home_appliances/iron/steam-iron.png',
  'home-appliances/coolers': 'https://res.cloudinary.com/da2dmtm9b/image/upload/f_auto,q_auto/v1783244293/mohit/our_products/home_appliances/coolers/1.png',

  // Conduit
  'polycab/conduit-and-accessories': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167951/mohit/our_products/polycab/polycab_conduit_and_accessories.png',
  'conduit-accessories/upvc-conduit': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783234334/mohit/our_products/conduit_accessories/upvc_conduit/conduits_table.png',
  'conduit-accessories/concealed-box': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783166426/mohit/our_products/conduit_accessories/concealed_box/metal.png',

  // Industrial cable hubs
  'industries': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167950/mohit/our_products/polycab/polycab_cable.png',
  'industries/cables-by-application': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167845/mohit/catalogue/cables.png',
  'industries/cables-by-standards': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167956/mohit/our_products/polycab/polycab_wires.png',
  'industries/cables-by-type': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167950/mohit/our_products/polycab/polycab_cable.png',

  // Renewables
  'polycab/solar': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167953/mohit/our_products/polycab/polycab_solar.png',
  'solar/solar-panel': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783166527/mohit/our_products/solar/Mono_Crystalline.png',
  'solar/solar-grid-tie-inverter': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783166552/mohit/our_products/solar/single_phase/single-phase-v2.png',
  'solar/solar-dc-cable': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783166523/mohit/our_products/solar/solar-dc-cable.png',
  'solar/dc-mcb': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783166551/mohit/our_products/solar/DC-MCB-2.png',

  // Dowells
  'dowells/cable-terminal': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167919/mohit/our_products/dowells/cable_terminal_dowells.png',
  'dowells/gland': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167927/mohit/our_products/dowells/gland_dowells.png',
  'dowells/crimping-tool': 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167925/mohit/our_products/dowells/crimping_tool_dowells.png',
};

export function menuImage(slug: string): string | null {
  return MENU_IMAGES[slug] ?? null;
}
