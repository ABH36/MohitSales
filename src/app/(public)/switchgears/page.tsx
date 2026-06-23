import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Switchgears - Mohit Sales Corporation Pvt. Ltd.',
  description: 'Polycab Switchgears - MCB, RCCB, RCBO, Isolators, DB, MCB Changeover Switch, ACCL - Mohit Sales Corporation Pvt. Ltd.',
};

export default function SwitchgearsPage() {

  const features = [
    {
      title: 'POSITIVE CONTACT POSITION INDICATION:',
      desc: 'Red and Green flag indications provided below the knob give a clear visual confirmation of positive electrical ON/OFF contact status. This indication remains clearly visible irrespective of mounting orientation or knob position — even from a distance.',
      image: '/assets/images/switchgears/1.png',
      imgRight: false
    },
    {
      title: 'ATTRACTIVE LABEL HOLDER:',
      desc: 'Polycab MCB is provided with smoke grey coloured label holder which is positioned on top of the knob for inserting labels for circuit identification and hence reducing maintenance down time.',
      image: '/assets/images/switchgears/2.png',
      imgRight: true
    },
    {
      title: 'LARGE & DUAL TERMINATING TERMINAL SIZE:',
      desc: 'Polycab MCBs can accommodate cables upto 35sq.mm cross section area thus making it suitable for copper as well as aluminium cables. Both cable and busbar can be terminated at the incomer.',
      image: '/assets/images/switchgears/3.png',
      imgRight: false
    },
    {
      title: 'BI-STABLE DIN CLIP POSITION:',
      desc: 'Convenience of mounting on Din Rail is easy with Polycab MCB. And also, The MCBs can be easily changed from a bank of devices connected by a busbar without disturbing your existing wiring.',
      image: '/assets/images/switchgears/4.png',
      imgRight: true
    },
    {
      title: 'AIR CIRCULATION:',
      desc: 'When two or more poles are placed adjacent to each other, the designed depression in the body cover forms a tunnel and serves as paths for air circulation thus hot air is expelled out faster resulting in reduced body temperatures.',
      image: '/assets/images/switchgears/5.png',
      imgRight: false
    },
    {
      title: 'EASE OF CLAMPING:',
      desc: 'Input and output clamps on the MCB is provided with combi-head screws which have both the standard slot as well as double head which can be tightened by standard screwdriver as well as Philip screwdriver thus catering to tool availability.',
      image: '/assets/images/switchgears/6.png',
      imgRight: true
    },
    {
      title: 'ENERGY LIMITING CLASS-3:',
      desc: 'Rapid arc quenching mechanism in our MCB ensures extinguishing of the arc within quarter cycle (3 to 5 milliseconds) thus minimizing the energy flow through the circuit. This ensures minimizing risk of fire and maximizing the life of your equipment.',
      image: '/assets/images/switchgears/7.png',
      imgRight: false
    },
    {
      title: 'ENHANCED SAFETY:',
      desc: 'Finger proof terminals are designed to eliminate accidental contact with live part complying with IP 20 protection category. Install, operate and maintain our MCBs with confidence.',
      image: '/assets/images/switchgears/8.png',
      imgRight: true
    },
    {
      title: 'HIGH QUALITY CONTACT TIPS:',
      desc: 'Silver graphite anti-weld contact tips ensure higher life and maximum safety against contact welding thus enhancing safety and life of the device.',
      image: '/assets/images/switchgears/9.png',
      imgRight: false
    },
    {
      title: 'AESTHETICALLY DESIGNED WITH SAFETY:',
      desc: 'Aesthetically designed Flame Retardant body ensures safety in case of accidental fire.',
      image: '/assets/images/switchgears/10.png',
      imgRight: true
    }
  ];

  const mcbCards = [
    { title: 'MCB', image: '/assets/images/switchgears/MCB.jpg', link: '/switchgears/mcb' },
    { title: 'Isolators', image: '/assets/images/switchgears/ISOLATOR.png', link: '/switchgears/isolator' },
    { title: 'RCCB', image: '/assets/images/switchgears/RCCB.png', link: '/switchgears/rccb' },
    { title: 'RCBO', image: '/assets/images/switchgears/RCBO.png', link: '/switchgears/rcbo' },
    { title: 'DB', image: '/assets/images/switchgears/DB.png', link: '#' },
    { title: 'MCB Changeover Switch', image: '/assets/images/switchgears/MCB-chnageover-switch.png', link: '/switchgears/mcb-switch' },
    { title: 'ACCL', image: '/assets/images/switchgears/ACCL.png', link: '/switchgears/accl' }
  ];

  return (
    <main>

      {/* Breadcrumb Area */}
      <section className="rs-breadcrumb-area rs-breadcrumb-one p-relative">
        <div
          className="rs-breadcrumb-bg"
          style={{ backgroundImage: "url('/assets/images/inner-banner/products.png')" }}
        ></div>
        <div className="container">
          <div className="row">
            <div className="w-full">
              <div className="rs-breadcrumb-content-wrapper">
                <div className="rs-breadcrumb-title-wrapper">
                  <h1 className="rs-breadcrumb-title">Switchgears</h1>
                </div>
                <div className="rs-breadcrumb-menu">
                  <nav>
                    <ul>
                      <li><span><Link href="/">Home</Link></span></li>
                      <li><span><Link href="/polycab">Polycab</Link></span></li>
                      <li><span>Switchgears</span></li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="catalogue-section">
        <div className="container">

          <div className="section-title text-center mb-5">
            <h2>Switchgears</h2>
          </div>

          {/* Intro Row */}
          <div className="row">
            <div className="col-md-8">
              <div className="switchgears_content">
                <p>
                  Protect your home, hearth and your loved ones with Polycab MCBs and RCCBs. Made with the highest quality Nylon that is with glass filled fire resistant material. Polycab switch gear is high strength, eco-friendly with high melting points and dielectric strength. Our Distribution boxes are available in standard and designer shades with a smooth glossy finish thanks to our 7-tank powder coating process. All boxes have a 100 Ampere Bus Bar with a capacity of 10 Amperes. Who says safe has to be boring?
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="image-box">
                <img src="/assets/images/switchgears/Polyshield-Logo.png" alt="Polycab Distribution Box" />
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          {features.map((feat, idx) => (
            <div key={idx} className="row mt-4">
              <div className="w-full">
                <div className="feature-card">
                  {!feat.imgRight && (
                    <div className="feature-image">
                      <img src={feat.image} alt={feat.title} />
                    </div>
                  )}
                  <div className="feature-content">
                    <h2>{feat.title}</h2>
                    <p>{feat.desc}</p>
                  </div>
                  {feat.imgRight && (
                    <div className="feature-image">
                      <img src={feat.image} alt={feat.title} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

        </div>

        {/* MCB Cards Grid */}
        <div className="container mt-4">
          <div className="row mt-4">
            {mcbCards.slice(0, 3).map((card, idx) => (
              <div key={idx} className="col-md-4">
                <div className="mcb-card">
                  <Link href={card.link}>
                    <div className="mcb-image">
                      <img src={card.image} alt={card.title} />
                    </div>
                    <div className="mcb-content">
                      <div className="mcb-title">{card.title}</div>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="row mt-4">
            {mcbCards.slice(3, 6).map((card, idx) => (
              <div key={idx} className="col-md-4">
                <div className="mcb-card">
                  <Link href={card.link}>
                    <div className="mcb-image">
                      <img src={card.image} alt={card.title} />
                    </div>
                    <div className="mcb-content">
                      <div className="mcb-title">{card.title}</div>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="row mt-4">
            {mcbCards.slice(6).map((card, idx) => (
              <div key={idx} className="col-md-4">
                <div className="mcb-card">
                  <Link href={card.link}>
                    <div className="mcb-image">
                      <img src={card.image} alt={card.title} />
                    </div>
                    <div className="mcb-content">
                      <div className="mcb-title">{card.title}</div>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

    </main>
  );
}
