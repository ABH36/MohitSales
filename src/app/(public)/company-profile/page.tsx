import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';

import { Metadata } from 'next';
import { getSeoMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/company-profile', {
    title: 'Company Profile | Mohit Sales Corporation Pvt. Ltd.',
    description: 'Learn about Mohit Sales Corporation Pvt. Ltd. - Authorized Polycab & Dowells distributor. View and download our complete company profile brochure.',
  });
}

const FALLBACK_COMPANY_PROFILE = {
  title: 'Company Profile',
  content: '<p>Mohit Sales Corporation Pvt. Ltd. is a trusted name in the electrical distribution industry. With over 27+ years of experience, we deliver high-quality electrical products and customized solutions to diverse sectors. As an Authorised Distributor of Polycab and Dowells, we ensure our customers receive only genuine, certified products that meet the highest industry standards.</p>',
  imageUrl: '/assets/images/inner-banner/company-profile.png',
  extraField: '/assets/images/pdf/MOHIT CATALOGUE.pdf',
};

export default async function CompanyProfilePage() {
  const cmsProfile = await prisma.cmsSection.findUnique({
    where: { page_section: { page: 'company-profile', section: 'content' } },
  }).catch(() => null);

  let profileData = FALLBACK_COMPANY_PROFILE;
  if (cmsProfile?.content) {
    try {
      const parsed = JSON.parse(cmsProfile.content);
      profileData = {
        title: parsed.title || FALLBACK_COMPANY_PROFILE.title,
        content: parsed.content || FALLBACK_COMPANY_PROFILE.content,
        imageUrl: parsed.imageUrl || FALLBACK_COMPANY_PROFILE.imageUrl,
        extraField: parsed.extraField || FALLBACK_COMPANY_PROFILE.extraField,
      };
    } catch {}
  }

  return (
    <main>
      {/* breadcrumb area start */}
      <section className="rs-breadcrumb-area rs-breadcrumb-one p-relative">
        <div 
          className="rs-breadcrumb-bg"
          style={{ backgroundImage: `url('${profileData.imageUrl}')` }}
        ></div>
        <div className="container">
          <div className="row">
            <div className="w-full">
              <div className="rs-breadcrumb-content-wrapper">
                <div className="rs-breadcrumb-title-wrapper">
                  <h1 className="rs-breadcrumb-title">Company Profile</h1>
                </div>
                <div className="rs-breadcrumb-menu">
                  <nav>
                    <ul>
                      <li><span><Link href="/">Home</Link></span></li>
                      <li><span>Company Profile</span></li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* breadcrumb area end */}

      <section className="about-inner pt-100 pb-100">
        <div className="container">
          <div className="row">
            <div className="about-heading mb-4">
              <h2>{profileData.title}</h2>
            </div>
            
            <div className="prabhat-about w-full" id="company-profile-content">
              <div className="mb-5" dangerouslySetInnerHTML={{ __html: profileData.content }} />

              {profileData.extraField && (
                <div className="d-flex justify-content-start mt-4">
                  <a 
                    href={profileData.extraField} 
                    className="catalogue-btn px-4 py-3 text-white rounded d-inline-flex align-items-center gap-2" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ background: '#1e2e5e', textDecoration: 'none', fontWeight: 600 }}
                  >
                    <i className="fa-solid fa-file-pdf"></i> Download PDF Profile
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
