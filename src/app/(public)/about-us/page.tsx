import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import Reveal from '@/components/Reveal';
import { sanitizeHtml } from '@/lib/utils';
import { cld } from '@/lib/cloudinary';

import { Metadata } from 'next';
import { getSeoMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/about-us', {
    title: 'About Us | Mohit Sales Corporation Pvt. Ltd.',
    description: 'About Mohit Sales Corporation Pvt. Ltd. - Authorised Distributor of Polycab and Dowells',
  });
}


const FALLBACK_ABOUT_US = {
  title: 'About Mohit Sales Corporation Pvt. Ltd.',
  content: `<p>Founded in <strong>1997</strong>, Mohit Sales Corporation Pvt. Ltd. has grown into a trusted and leading name in the electrical distribution industry. With <strong> 27+ years of experience</strong>, we specialize in delivering high-quality electrical products and solutions across multiple sectors.</p>
<p>As an <strong>Authorised Distributor of Polycab and Dowells</strong> we ensure our customers receive genuine products backed by technical expertise, timely supply, and reliable after-sales support. Our strong industry presence, expert team, and customer-centric approach have enabled us to consistently meet the evolving needs of contractors, industries, retailers, and infrastructure projects.</p>
<p>Mohit Sales Corporation continues to build a reputation for trust, quality, and professionalism—values that form the foundation of our long-standing success.</p>`,
  imageUrl: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167900/mohit/inner-banner/about-us.png',
};

/**
 * The company profile used to be its own page. It carried one paragraph plus
 * the profile PDF, and the paragraph repeated what this page already says, so
 * it lived on in the navigation without earning a place there.
 *
 * Its content is still read from the same `company-profile` CMS row rather than
 * copied in, so the admin CMS tab of that name keeps working exactly as before
 * and edits made there still show up here.
 */
const FALLBACK_PROFILE_PDF = '/assets/images/pdf/MOHIT%20CATALOGUE.pdf';

export default async function AboutUsPage() {
  const [cmsAbout, cmsProfile] = await Promise.all([
    prisma.cmsSection.findUnique({
      where: { page_section: { page: 'about-us', section: 'content' } },
    }).catch(() => null),
    prisma.cmsSection.findUnique({
      where: { page_section: { page: 'company-profile', section: 'content' } },
    }).catch(() => null),
  ]);

  let aboutData = FALLBACK_ABOUT_US;
  /**
   * Photos managed from the CMS. Entries with no URL are dropped rather than
   * rendered as broken images — the admin adds a row before uploading into it,
   * so a half-filled row is a normal state to save from.
   */
  let gallery: { url: string; caption: string }[] = [];
  if (cmsAbout?.content) {
    try {
      const parsed = JSON.parse(cmsAbout.content);
      aboutData = {
        title: parsed.title || FALLBACK_ABOUT_US.title,
        content: parsed.content || FALLBACK_ABOUT_US.content,
        imageUrl: parsed.imageUrl || FALLBACK_ABOUT_US.imageUrl,
      };
      if (Array.isArray(parsed.gallery)) {
        gallery = parsed.gallery
          .filter((g: any) => g && typeof g.url === 'string' && g.url.trim())
          .map((g: any) => ({ url: g.url.trim(), caption: String(g.caption || '').trim() }));
      }
    } catch {}
  }

  // The first photo goes beside the intro; anything further runs in a grid.
  const heroImage = gallery[0] || null;
  const restImages = gallery.slice(1);

  // Same fallback the standalone page used, so the download keeps working while
  // the CMS row's own PDF field is still empty.
  let profilePdf = FALLBACK_PROFILE_PDF;
  if (cmsProfile?.content) {
    try {
      const parsed = JSON.parse(cmsProfile.content);
      profilePdf = parsed.extraField || FALLBACK_PROFILE_PDF;
    } catch {}
  }

  return (
    <main>
      {/* breadcrumb area start */}
      <section className="rs-breadcrumb-area rs-breadcrumb-one p-relative">
        <div 
          className="rs-breadcrumb-bg"
          style={{ backgroundImage: `url('${aboutData.imageUrl}')` }}
        ></div>
        <div className="container">
          <div className="row">
            <div className="w-full">
              <div className="rs-breadcrumb-content-wrapper">
                <div className="rs-breadcrumb-title-wrapper">
                  <h1 className="rs-breadcrumb-title">About Us</h1>
                </div>
                <div className="rs-breadcrumb-menu">
                  <nav>
                    <ul>
                      <li><span><Link href="/">Home</Link></span></li>
                      <li><span>About Us</span></li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* breadcrumb area end */}

      <section className="about-inner">
        <div className="container">
          <div className="row">
            <div className="about-heading">
              <h2>About Us</h2>
            </div>
            <div className="about-inner-content"></div>
            
            <div className="prabhat-about" id="prabhat-wire-llp">
              <h3>{aboutData.title}</h3>
              {/* Intro sits beside the first photo. Holding the copy to a
                  readable measure left the right half of the page empty, which
                  is exactly the space a picture belongs in — so the first
                  gallery image fills it and the rest run in the grid below.
                  With no photos uploaded the text simply keeps its measure and
                  the column collapses. */}
              <div className={heroImage ? 'about-intro-row' : undefined}>
                {/* Width-constrained only. The inner HTML is whatever an admin
                    saved in the CMS, so its own styling is left alone — the
                    lines simply ran 155 characters wide, roughly double what is
                    comfortable to read. */}
                <div
                  className="about-intro-copy"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(aboutData.content) }}
                />

                {heroImage && (
                  <figure className="about-intro-figure">
                    <img
                      src={cld(heroImage.url)}
                      alt={heroImage.caption || 'Mohit Sales Corporation'}
                    />
                    {heroImage.caption && <figcaption>{heroImage.caption}</figcaption>}
                  </figure>
                )}
              </div>

              {/* Figures a buyer scans for, taken from the copy above rather
                  than invented: 27+ years is stated in the intro, the two brands
                  are the ones in the table, and eight is the length of the
                  industries list further down. */}
              <Reveal>
                <div className="about-stats">
                  <div className="about-stat">
                    <span className="about-stat-value">27<sup>+</sup></span>
                    <span className="about-stat-label">Years in electrical distribution</span>
                  </div>
                  <div className="about-stat">
                    <span className="about-stat-value">2</span>
                    <span className="about-stat-label">Authorised brands — Polycab &amp; Dowells</span>
                  </div>
                  <div className="about-stat">
                    <span className="about-stat-value">8</span>
                    <span className="about-stat-label">Industries served</span>
                  </div>
                </div>
              </Reveal>

              {/* Photos beyond the first. Hidden entirely when there are none,
                  so the page reads exactly as it did before any were uploaded. */}
              {restImages.length > 0 && (
                <Reveal>
                  <div className="about-gallery">
                    {restImages.map((img, i) => (
                      <figure key={i} className="about-gallery-item">
                        <img
                          src={cld(img.url)}
                          alt={img.caption || 'Mohit Sales Corporation'}
                          loading="lazy"
                        />
                        {img.caption && <figcaption>{img.caption}</figcaption>}
                      </figure>
                    ))}
                  </div>
                </Reveal>
              )}

              <Reveal>
              <div className="core-values llp">
                <h4>Our Authorised Brands & Product Portfolio</h4>
                <div className="brand-table-wrapper">
                  <table className="brand-table">
                    <thead>
                      <tr>
                        <th>Brand</th>
                        <th>Products</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="brand-name polycab">Polycab</td>
                        <td>
                          <ul>
                            <li>Cables</li>
                            <li>Switchgears</li>
                            <li>Fans</li>
                            <li>Solar Products</li>
                            <li>Conduits & Accessories</li>
                            <li>Home Appliances</li>
                          </ul>
                        </td>
                      </tr>
                      <tr>
                        <td className="brand-name dowells">Dowells</td>
                        <td>
                          <ul>
                            <li>Cable Terminals</li>
                            <li>Cable Glands</li>
                            <li>Crimping Tools</li>
                          </ul>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              </Reveal>

              {/* Vision + Mission — paired, because they answer the same
                  question from two angles and used to read as two more
                  identical bullet lists in a run of five. */}
              <Reveal>
                <div className="about-pair">
                  <div className="about-pair-card">
                    <span className="about-pair-icon"><i className="fa-solid fa-eye" aria-hidden="true"></i></span>
                    <h4>Vision</h4>
                    <p>To be the most trusted and preferred electrical distribution company in India by delivering innovative, reliable, and sustainable electrical solutions that empower industries, infrastructure, and homes.</p>
                  </div>

                  <div className="about-pair-card">
                    <span className="about-pair-icon"><i className="fa-solid fa-bullseye" aria-hidden="true"></i></span>
                    <h4>Mission</h4>
                    <ul className="about-tick-list">
                      <li>To provide <strong>top-quality electrical products</strong> through strong partnerships with leading brands.</li>
                      <li>To ensure <strong>unmatched customer satisfaction</strong> with timely delivery, expert guidance, and professional service.</li>
                      <li>To strengthen our network and deliver <strong>cost-effective, safe, and energy-efficient solutions.</strong></li>
                      <li>To embrace new technologies and market trends to support the nation's <strong>electrical and infrastructure growth.</strong></li>
                    </ul>
                  </div>
                </div>
              </Reveal>

              {/* Core values as cards — six one-line bullets were impossible to
                  tell apart at a glance. */}
              <Reveal>
                <div className="about-section-head">
                  <h4>Core Values</h4>
                </div>
                <div className="about-values-grid">
                  {[
                    { icon: 'fa-shield-halved', title: 'Integrity', text: 'We commit to transparency and ethical business practices.' },
                    { icon: 'fa-award', title: 'Quality', text: 'We deliver only genuine and reliable products from top global brands.' },
                    { icon: 'fa-headset', title: 'Customer Focus', text: 'Your requirements drive our actions.' },
                    { icon: 'fa-clock', title: 'Reliability', text: 'On-time supply and trustworthy service, always.' },
                    { icon: 'fa-lightbulb', title: 'Innovation', text: 'Adapting to new technologies and market needs.' },
                    { icon: 'fa-handshake', title: 'Long-Term Relationships', text: 'Building partnerships backed by trust and performance.' },
                  ].map((v) => (
                    <div key={v.title} className="about-value-card">
                      <span className="about-value-icon"><i className={`fa-solid ${v.icon}`} aria-hidden="true"></i></span>
                      <h5>{v.title}</h5>
                      <p>{v.text}</p>
                    </div>
                  ))}
                </div>
              </Reveal>

              {/* The last two lists are plain enumerations, so they become chips
                  in two columns rather than 13 more stacked arrow bullets. */}
              <Reveal>
                <div className="about-columns">
                  <div>
                    <div className="about-section-head"><h4>Why Choose Us?</h4></div>
                    <ul className="about-chip-list">
                      <li><i className="fa-solid fa-check" aria-hidden="true"></i>27+ years of industry expertise</li>
                      <li><i className="fa-solid fa-check" aria-hidden="true"></i>Authorised distributor for leading global brands</li>
                      <li><i className="fa-solid fa-check" aria-hidden="true"></i>Wide product range with strong inventory and fast delivery</li>
                      <li><i className="fa-solid fa-check" aria-hidden="true"></i>Technical product knowledge and support</li>
                      <li><i className="fa-solid fa-check" aria-hidden="true"></i>Trusted by contractors, industries, and infrastructure developers</li>
                    </ul>
                  </div>

                  <div>
                    <div className="about-section-head"><h4>Industries We Serve</h4></div>
                    <ul className="about-chip-list">
                      <li><i className="fa-solid fa-check" aria-hidden="true"></i>Residential &amp; Commercial Projects</li>
                      <li><i className="fa-solid fa-check" aria-hidden="true"></i>Industrial Manufacturing</li>
                      <li><i className="fa-solid fa-check" aria-hidden="true"></i>Infrastructure &amp; Construction</li>
                      <li><i className="fa-solid fa-check" aria-hidden="true"></i>Renewable Energy Projects</li>
                      <li><i className="fa-solid fa-check" aria-hidden="true"></i>Oil &amp; Gas</li>
                      <li><i className="fa-solid fa-check" aria-hidden="true"></i>OEMs</li>
                      <li><i className="fa-solid fa-check" aria-hidden="true"></i>EPC Contractors</li>
                      <li><i className="fa-solid fa-check" aria-hidden="true"></i>Retail Electrical Markets</li>
                    </ul>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Company profile — the paragraph the old page carried is deliberately
          not repeated here; this page already covers it. What was worth keeping
          is the downloadable profile, so it closes the page as its own block. */}
      {profilePdf && (
        <section className="about-profile-download">
          <div className="container">
            <div className="about-profile-card">
              <div className="about-profile-copy">
                <h3>Company Profile</h3>
                <p>
                  Our full company profile — credentials, product portfolio and
                  authorisations — in a single PDF you can share with your team.
                </p>
              </div>
              <a
                href={profilePdf}
                className="about-profile-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-solid fa-file-pdf" aria-hidden="true"></i>
                Download PDF Profile
              </a>
            </div>
          </div>
        </section>
      )}

    </main>
  );
}
