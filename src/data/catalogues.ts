import type { CatalogueItem } from '@/components/CatalogueGrid';

/**
 * Centralized catalogue (PDF download) data for the `*-catalogue` pages.
 * Previously each item array was hard-coded inline in its page component and the
 * surrounding markup was duplicated six times; the markup now lives in
 * <CatalogueGrid> and the data lives here, so adding/editing a catalogue entry
 * is a one-line change in one file.
 */
const CDN = 'https://res.cloudinary.com/da2dmtm9b/image/upload';

export const cablesCatalogue: CatalogueItem[] = [
  { title: 'Uninyvin Cable', category: 'Cable', image: `${CDN}/v1783167861/mohit/catalogue/cables_catalogue/Uninyvin-Cable.jpg`, pdf: '/assets/images/catalogue/cables_catalogue/pdf/Uninyvin-cable.pdf' },
  { title: 'LT-Cable', category: 'Cable', image: `${CDN}/v1783167857/mohit/catalogue/cables_catalogue/LT-Cable.jpg`, pdf: '/assets/images/catalogue/cables_catalogue/pdf/LT-Cable-Catalog.pdf' },
  { title: 'HT-Cable', category: 'Cable', image: `${CDN}/v1783167853/mohit/catalogue/cables_catalogue/HT-Cable.jpg`, pdf: '/assets/images/catalogue/cables_catalogue/pdf/HT-Cable-Catalogue.pdf' },
  { title: 'Fire-Survival-Cable', category: 'Cable', image: `${CDN}/v1783167852/mohit/catalogue/cables_catalogue/Fire-Survival-Cable.jpg`, pdf: '/assets/images/catalogue/cables_catalogue/pdf/Fire-Survival-Cable-Brochure-Artwork_2.pdf' },
  { title: 'EHV', category: 'Cable', image: `${CDN}/v1783167851/mohit/catalogue/cables_catalogue/EHV-Thumb.png`, pdf: '/assets/images/catalogue/cables_catalogue/pdf/Polycab-EHV.pdf' },
  { title: 'Cables & Wires Z', category: 'Cable', image: `${CDN}/v1783167856/mohit/catalogue/cables_catalogue/LDC-Img.png`, pdf: '/assets/images/catalogue/cables_catalogue/pdf/CABLES_HANDBOOK_ORD-10061-V12_FOR-WEB.pdf' },
  { title: 'Rubber Cable Catalogue', category: 'Cable', image: `${CDN}/v1783167859/mohit/catalogue/cables_catalogue/Rubber-Cable.png`, pdf: '/assets/images/catalogue/cables_catalogue/pdf/Rubber-Cable-Catalogue.pdf' },
  { title: 'BMS Cable', category: 'Cable', image: `${CDN}/v1783167846/mohit/catalogue/cables_catalogue/BMS-Cable.png`, pdf: '/assets/images/catalogue/cables_catalogue/pdf/BMS-Cable-Brochure_v3.pdf' },
  { title: 'Telephone Wire', category: 'Cable', image: `${CDN}/v1783167862/mohit/catalogue/cables_catalogue/telephone_wire.jpg`, pdf: '/assets/images/catalogue/cables_catalogue/pdf/Polycab-Telephone-wire.pdf' },
  { title: 'Optical Fiber Cables (OFC)', category: 'Cable', image: `${CDN}/v1783167858/mohit/catalogue/cables_catalogue/OPTICAL-FIBER-CABLES.jpg`, pdf: '/assets/images/catalogue/cables_catalogue/pdf/OPTICAL-FIBER-CABLES.pdf' },
  { title: 'Lan Cables', category: 'Cable', image: `${CDN}/v1783167863/mohit/catalogue/cables_catalogue/telephone_wires.jpg`, pdf: '/assets/images/catalogue/cables_catalogue/pdf/LAN-Cable.pdf' },
  { title: 'Instrumentation Cable Catalogue', category: 'Cable', image: `${CDN}/v1783167855/mohit/catalogue/cables_catalogue/Instrumentation-Cable.jpg`, pdf: '/assets/images/catalogue/cables_catalogue/pdf/Instrumentation-Cable.pdf' },
  { title: 'Co-axial Wires', category: 'Cable', image: `${CDN}/v1783167849/mohit/catalogue/cables_catalogue/Coaxial.jpg`, pdf: '/assets/images/catalogue/cables_catalogue/pdf/Polycab-Coaxial-Cable.pdf' },
  { title: 'CCTV Cable', category: 'Cable', image: `${CDN}/v1783167847/mohit/catalogue/cables_catalogue/CCTV-CABLE.jpg`, pdf: '/assets/images/catalogue/cables_catalogue/pdf/Polycab-CCTV.pdf' },
  { title: 'Submersible Cables (Flat)', category: 'Cable', image: `${CDN}/v1783167860/mohit/catalogue/cables_catalogue/SUBMERSIBLE-CABLE.jpg`, pdf: '/assets/images/catalogue/cables_catalogue/pdf/SUBMERSIBLE-CABLE.pdf' },
  // This 4.6 MB catalogue was sitting in public/ unreferenced — served fine on a
  // direct URL but was not listed anywhere, so no customer could reach it.
  // Reusing the cables-handbook thumbnail; swap in a dedicated cover when we have one.
  // Percent-encoded on purpose: the filename has spaces. Browsers would encode
  // them anyway, but crawlers and CDNs are less forgiving, and the file is left
  // renamed-as-is in case anything already links to it directly.
  { title: 'Cable Laying Catalogue', category: 'Cable', image: `${CDN}/v1783167856/mohit/catalogue/cables_catalogue/LDC-Img.png`, pdf: '/assets/images/catalogue/Cable%20Laying%20catalogue_Ord%2017709.pdf' },
];

export const solarCatalogue: CatalogueItem[] = [
  { title: 'Solar Grid Tie Inverter 2kw_6kw', category: 'Solar', image: `${CDN}/v1783167878/mohit/catalogue/solar_catalogue/SOLAR-GRID-TIE-INVERTER-2KW-6KW-1.png`, pdf: '/assets/images/catalogue/solar_catalogue/pdf/SOLAR-GRID-TIE-INVERTER-2KW-6KW.pdf' },
  { title: 'Solar Grid Tie String Inverter 3 Phase 5kw_30kw', category: 'Solar', image: `${CDN}/v1783167880/mohit/catalogue/solar_catalogue/SOLAR-GRID-TIE-INVERTER-3-PHASE-5KW-30KW-1.png`, pdf: '/assets/images/catalogue/solar_catalogue/pdf/SOLAR-GRID-TIE-INVERTER-3-PHASE-5KW-30KW.pdf' },
  { title: 'Solar Grid Tie String Inverter 25kw_40kw-5g', category: 'Solar', image: `${CDN}/v1783167881/mohit/catalogue/solar_catalogue/Solar-grid-three-phase-tie-25kw-1-1.png`, pdf: '/assets/images/catalogue/solar_catalogue/pdf/Solar-Catalogue_PSIT-25KW-40KW-5G.pdf' },
  { title: 'Solar Grid Tie String Inverter 50kw_60kw', category: 'Solar', image: `${CDN}/v1783167882/mohit/catalogue/solar_catalogue/Solar-grid-three-phase-tie-50kw-60KW-string-inverter-1.png`, pdf: '/assets/images/catalogue/solar_catalogue/pdf/string-inverter_50KW-60KW.pdf' },
  { title: 'Solar Grid Tie String Inverter 80kw_110kw-5g', category: 'Solar', image: `${CDN}/v1783167883/mohit/catalogue/solar_catalogue/Solar-grid-three-phase-tie-80kw-110KW-5G-string-inverter-1.png`, pdf: '/assets/images/catalogue/solar_catalogue/pdf/Final-Solar-Leaflet-80kw-110kw-5G.pdf' },
  // No 255K EHV leaflet was ever supplied, so this pointed at the 80–110kW one —
  // a customer asking for 255K specs downloaded the wrong product's sheet.
  // Falls back to the general solar catalogue until Polycab sends the leaflet.
  { title: 'Solar Grid Tie String Inverter 255k-ehv-5g', category: 'Solar', image: `${CDN}/v1783167876/mohit/catalogue/solar_catalogue/06-Grid-Tie-Solar-Inverter_3-Phase_-255K-EHV-5G-2-2-294x420.png`, pdf: '/assets/images/catalogue/solar_catalogue/pdf/Polycab-Solar-Catalogue.pdf' },
  { title: 'Solar Cable', category: 'Solar', image: `${CDN}/v1783167877/mohit/catalogue/solar_catalogue/08-Solar-Cable-Brochure-2-211x300-1.png`, pdf: '/assets/images/catalogue/solar_catalogue/pdf/SOLAR-CABLE.pdf' },
  // A PV module that was showing a string-inverter photo and handing out the
  // 50–60kW inverter datasheet. Neither asset for the module was ever supplied;
  // pointing at the general solar catalogue (which does cover PV modules) until
  // Polycab sends the module leaflet and a real photo — both are on the request.
  { title: 'Polycrystalline Solar Module', category: 'Solar', image: `${CDN}/v1783167884/mohit/catalogue/solar_catalogue/first_page.jpg`, pdf: '/assets/images/catalogue/solar_catalogue/pdf/Polycab-Solar-Catalogue.pdf' },
  { title: 'Polycab Solar Catalogue', category: 'Solar', image: `${CDN}/v1783167884/mohit/catalogue/solar_catalogue/first_page.jpg`, pdf: '/assets/images/catalogue/solar_catalogue/pdf/Polycab-Solar-Catalogue.pdf' },
  { title: 'Solar Catalogue(Grid Tie Inverter, PV Module, Solar DC Cables)', category: 'Solar', image: `${CDN}/v1783167885/mohit/catalogue/solar_catalogue/solar_catalogue.png`, pdf: '/assets/images/catalogue/solar_catalogue/pdf/REI-Cat-oct3-2023.pdf' },
];

export const fansCatalogue: CatalogueItem[] = [
  { title: 'Polycab Fans Range Catalogue', category: 'Fan', image: `${CDN}/v1783167868/mohit/catalogue/fans/Fans-Range-Catalogue.png`, pdf: '/assets/images/catalogue/fans/pdf/Fans-Range-Catalogue-2024.pdf' },
  { title: 'Silencio Mini Catalogue', category: 'Fan', image: `${CDN}/v1783167869/mohit/catalogue/fans/Updated_Silencio_Mini.jpg`, pdf: '/assets/images/catalogue/fans/pdf/A5_SIZE-Silencio_Mini.pdf' },
];

export const conduitCatalogue: CatalogueItem[] = [
  { title: 'UPVC Conduits And Fittings', category: 'Conduits And Accessories', image: `${CDN}/v1783167865/mohit/catalogue/conduit_catalogue/upvc-conduit.png`, pdf: '/assets/images/catalogue/conduit_catalogue/pdf/upvc-conduits-and-fittings.pdf' },
];

export const homeAppliancesCatalogue: CatalogueItem[] = [
  { title: 'Water Heaters', category: 'Appliances', image: `${CDN}/v1783167874/mohit/catalogue/home_appliances_catalogue/water_heater.png`, pdf: '/assets/images/catalogue/home_appliances_catalogue/pdf/Water-Heater-Brochure-2023.pdf' },
  { title: 'Coolers', category: 'Appliances', image: `${CDN}/v1783167872/mohit/catalogue/home_appliances_catalogue/coolers.jpg`, pdf: '/assets/images/catalogue/home_appliances_catalogue/pdf/Polycab-Cooler-Catalogue_2020.pdf' },
  { title: 'Irons', category: 'Appliances', image: `${CDN}/v1783167873/mohit/catalogue/home_appliances_catalogue/iron.png`, pdf: '/assets/images/catalogue/home_appliances_catalogue/pdf/Polycab-Iron-Catalogue_2020.pdf' },
];

export const switchgearCatalogue: CatalogueItem[] = [
  { title: 'Mini MCB', category: 'Switchgear', image: `${CDN}/v1783167887/mohit/catalogue/switchgear_catalogue/Mini-MCB.jpg`, pdf: '/assets/images/catalogue/switchgear_catalogue/pdf/Small_PC012-Polycab-mini-MCB.pdf' },
];
