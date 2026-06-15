# UI and Asset Extraction Report (Phase 2)

This report maps every page, layout section, carousel slider, interactive component, and asset in the legacy PHP codebase (`C:\Users\abhay\Desktop\clone`), providing the visual preservation blueprint for the Next.js target.

---

## 1. Page Mapping & Migration Index

We map every page in the legacy codebase to its respective Next.js page route:

| Legacy PHP Page Path | Converted Next.js Route | Type | Primary Components / Layout Sections |
| :--- | :--- | :---: | :--- |
| `index.php` | `src/app/page.tsx` | Dynamic | Desktop/Mobile banner sliders, Why Choose Us grid, Products slider (Polycab), Industries We Serve slider, Video slider (`myVideoSwiper`), Contact Form. |
| `about-us.php` | `src/app/about-us/page.tsx` | Static | Inner header breadcrumb banner, Vision, Mission, Brand Portfolio table. |
| `polycab.php` | `src/app/polycab/page.tsx` | Static | Brand info grid, dynamic links list. |
| `dowells.php` | `src/app/dowells/page.tsx` | Static | Brand info grid, download catalogue button layout. |
| `contact-us.php` | `src/app/contact-us/page.tsx`| Form | Google Map iframe, Contact Info cards, Captcha-protected Inquiry Form. |
| `certificates.php` | `src/app/certificates/page.tsx`| Gallery | Certificates download grid, PDF attachments. |
| `achievements.php` | `src/app/achievements/page.tsx`| List | Achievements list and counter. |
| `pricelist.php` | `src/app/pricelist/page.tsx` | Tabs | Tab-pane downloads matrix. |
| `catalogue.php` | `src/app/catalogue/page.tsx` | List | Catalogue list matching tab items. |
| `switchgears.php` | `src/app/switchgears/page.tsx`| Brand | Switchgear catalog card grids. |
| `fans.php` | `src/app/fans/page.tsx` | Brand | Fans catalog list. |
| `solar.php` | `src/app/solar/page.tsx` | Brand | Solar modules catalog. |
| `gland.php` | `src/app/gland/page.tsx` | Brand | Gland catalog list. |
| `home-appliances.php` | `src/app/home-appliances/page.tsx` | Brand | Home appliances catalog. |
| `cable-terminal.php` | `src/app/cable-terminal/page.tsx` | Brand | Cable terminal catalog lists. |
| `crimping-tool.php` | `src/app/crimping-tool/page.tsx` | Brand | Crimping tools card grids. |
| `conduit-accessories.php` | `src/app/conduit-accessories/page.tsx` | Brand | Conduits lists. |

---

## 2. Component Layout Structure

### A. Navigation & Header Component
- **Left Section**: Curved White Logo Badge (`.rs-header-left.index`). Includes `assets/images/logo/msc_logo_without_bg.png` (PNG logo with transparent background). Width: 250px.
- **Center Section**: Navigation Menu links using **Outfit** font, white text. Dropdown layouts for products:
  - **Polycab**: Cables by Application, Standards, Type, Switchgears, Fans, Solar, Conduit & Accessories, Home Appliances.
  - **Dowells**: Cable Terminal, Gland, Crimping Tool.
- **Right Section**: Mobile hamburger menu button. Language selector/subdomain dropdown triggers (Phase 8).
- **Behavior**: Translucent over banners, becomes white with a shadow and locks to the top on scroll down > 50px. Hides when scrolling down, reappears when scrolling up.

### B. Hero Banners
1. **Desktop Banner Carousel** (`.banner_sec.desktop`): Swiper-controlled slides with background-image mapping, click handlers redirection.
2. **Mobile Banner Carousel** (`.banner_sec.mobile`): Swiper slides with custom mobile-proportioned dimensions (`assets/images/banner/mobile/*.png`).

### C. Counter Section (Achievements / Homepage)
- Live numbers animation using `odometer.js` and `waypoints.js` bound to standard elements. Count parameters defined on `data-count` attributes.

---

## 3. Media Asset Directory

| Asset Category | Source Folder | Target Folder | Key Assets Included |
| :--- | :--- | :--- | :--- |
| **Logos** | `assets/images/logo/` | `/public/assets/images/logo/` | `msc_logo_without_bg.png`, `polycab-logo.png` |
| **Banners (Desktop)** | `assets/images/banner/desktop/` | `/public/assets/images/banner/desktop/` | `cable.png`, `polycab.png`, `fans.png`, `solar_product.png`, `switchgear.png`, `wire.png`, `dowells.png` |
| **Banners (Mobile)** | `assets/images/banner/mobile/` | `/public/assets/images/banner/mobile/` | `cable.png`, `polycab_banner.png`, `fans.png`, `solar_product.png`, `switchgear.png`, `wire.png`, `dowells.png` |
| **PDF Documents** | `assets/images/pdf/` | `/public/assets/images/pdf/` | `MOHIT CATALOGUE.pdf` |

---

## 4. Visual Preservation Plan (99%+ Parity)

1. **Curved White Logo Badge Layout**: Position absolute inside the layout wrapper. Must use strict top-left pinning, custom white background with rounded bottom-right corners (`border-bottom-right-radius: 40px`), ensuring exact height and width mapping to prevent layout shifts.
2. **Mobile Nav Parity (MeanMenu)**: Replicate layout expand animation. Mobile drawer shifts from left to right, background overlay transparent grey (`rgba(0,0,0,0.5)`).
3. **Counter and Number Scrolling**: Replicate pure CSS/React transitions for smooth number ticking (odometer emulation) instead of layout shifting.
4. **Spacing & Grids**: Ensure containers use standard Bootstrap width thresholds (1140px maximum on desktop grids) mapped inside Tailwind grids to preserve exact alignment.
