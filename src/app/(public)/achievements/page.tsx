'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function AchievementsPage() {
  const [lightboxImage, setLightboxImage] = useState<{ src: string; caption: string } | null>(null);

  const achievements = [
    {
      title: 'APPRECIATION AWARD',
      image: '/assets/images/certificate/certificate.png',
      caption: 'APPRECIATION AWARD'
    },
    {
      title: 'LEGACY EXCELLENCE AWARD (FY 2022-23)',
      image: '/assets/images/certificate/award.jpg',
      caption: 'LEGACY EXCELLENCE AWARD (FY 2022-23)'
    }
  ];

  return (
    <main>
      {/* breadcrumb area start */}
      <section className="rs-breadcrumb-area rs-breadcrumb-one p-relative">
        <div 
          className="rs-breadcrumb-bg"
          style={{ backgroundImage: "url('/assets/images/inner-banner/achievement.png')" }}
        ></div>
        <div className="container">
          <div className="row">
            <div className="w-full">
              <div className="rs-breadcrumb-content-wrapper">
                <div className="rs-breadcrumb-title-wrapper">
                  <h1 className="rs-breadcrumb-title">Achievements</h1>
                </div>
                <div className="rs-breadcrumb-menu">
                  <nav>
                    <ul>
                      <li><span><Link href="/">Home</Link></span></li>
                      <li><span>Achievements</span></li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* breadcrumb area end */}

      <section className="certificate-inner">
        <div className="container">
          <div className="certificate-heading">
            <div className="row certificate">
              {achievements.map((ach, idx) => (
                <div key={idx} className="col-lg-4 col-md-6 mb-4">
                  <div className="certificate-card">
                    <div 
                      className="certificate-img cursor-pointer"
                      onClick={() => setLightboxImage({ src: ach.image, caption: ach.caption })}
                    >
                      <img 
                        src={ach.image} 
                        alt={ach.title} 
                      />
                    </div>
                    <div className="certificate-title">
                      <h6>{ach.title}</h6>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 z-[99999] flex flex-col align-items-center justify-content-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white text-4xl hover:text-orange-500 transition-colors"
            onClick={() => setLightboxImage(null)}
          >
            &times;
          </button>
          <div className="max-w-4xl max-h-[80vh] d-flex align-align-items-center justify-content-center" onClick={(e) => e.stopPropagation()}>
            <img 
              src={lightboxImage.src} 
              alt={lightboxImage.caption} 
              className="max-h-full max-w-full object-contain rounded shadow-2xl"
            />
          </div>
          <div className="text-white text-lg mt-4 font-semibold text-center">{lightboxImage.caption}</div>
        </div>
      )}
    </main>
  );
}
