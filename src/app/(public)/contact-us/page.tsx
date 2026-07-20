'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePublicSettings } from '@/components/PublicSettingsContext';
import { useCaptcha } from '@/components/useCaptcha';
import { cld } from '@/lib/cloudinary';


export default function ContactUsPage() {
  const { getSetting } = usePublicSettings();
  const [formData, setFormData] = useState({
    name: '',
    cname: '',
    email: '',
    mobile: '',
    message: '',
    captchaInput: ''
  });
  
  const { svg: captchaSvg, token: captchaToken, refresh: generateCaptcha } = useCaptcha();
  const [file, setFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Gap 2: Auto-fill product context from URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const product = params.get('product');
      if (product) {
        setFormData(prev => ({ 
          ...prev, 
          message: `I am interested in: ${product}\n\n` 
        }));
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!formData.captchaInput) {
      setStatusMessage({ type: 'error', text: 'Captcha code is required.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const postData = new FormData();
      postData.append('name', formData.name);
      postData.append('cname', formData.cname);
      postData.append('email', formData.email);
      postData.append('mobile', formData.mobile);
      postData.append('message', formData.message);
      postData.append('captchaInput', formData.captchaInput);
      postData.append('captchaToken', captchaToken);
      if (file) {
        postData.append('file', file);
      }

      const res = await fetch('/api/inquiries', {
        method: 'POST',
        body: postData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ type: 'success', text: 'Thank you! Your enquiry has been sent successfully.' });
        setFormData({ name: '', cname: '', email: '', mobile: '', message: '', captchaInput: '' });
        setFile(null);
        generateCaptcha();
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Failed to submit the form. Please try again.' });
        setFormData(prev => ({ ...prev, captchaInput: '' }));
        generateCaptcha();
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'An unexpected error occurred. Please try again later.' });
      setFormData(prev => ({ ...prev, captchaInput: '' }));
      generateCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main>


      {/* breadcrumb area start */}
      <section className="rs-breadcrumb-area rs-breadcrumb-one p-relative">
        <div 
          className="rs-breadcrumb-bg"
          style={{ backgroundImage: `url('${cld('https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167903/mohit/inner-banner/contact-us.png')}')` }}
        ></div>
        <div className="container">
          <div className="row">
            <div className="w-full">
              <div className="rs-breadcrumb-content-wrapper">
                <div className="rs-breadcrumb-title-wrapper">
                  <h1 className="rs-breadcrumb-title">Contact Us</h1>
                </div>
                <div className="rs-breadcrumb-menu">
                  <nav>
                    <ul>
                      <li><span><Link href="/">Home</Link></span></li>
                      <li><span>Contact Us</span></li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* breadcrumb area end */}

      {/* contact area start */}
      <section className="rs-contact-area section-space rs-contact-nine">
        <div className="container">
          <div className="row contact justify-content-center">
            <div className="col-lg-3">
              <div className="rs-contact-item">
                <div className="rs-contact-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="22" viewBox="0 0 18 22" fill="none">
                    <path d="M9 18.8995L13.9497 13.9497C16.6834 11.2161 16.6834 6.78392 13.9497 4.05025C11.2161 1.31658 6.78392 1.31658 4.05025 4.05025C1.31658 6.78392 1.31658 11.2161 4.05025 13.9497L9 18.8995ZM9 21.7279L2.63604 15.364C-0.87868 11.8492 -0.87868 6.15076 2.63604 2.63604C6.15076 -0.87868 11.8492 -0.87868 15.364 2.63604C18.8787 6.15076 18.8787 11.8492 15.364 15.364L9 21.7279ZM9 11C10.1046 11 11 10.1046 11 9C11 7.89543 10.1046 7 9 7C7.8954 7 7 7.89543 7 9C7 10.1046 7.8954 11 9 11ZM9 13C6.79086 13 5 11.2091 5 9C5 6.79086 6.79086 5 9 5C11.2091 5 13 6.79086 13 9C13 11.2091 11.2091 13 9 13Z" fill="#737373"></path>
                  </svg>
                </div>
                <div className="rs-contact-content">
                  <h5 className="rs-contact-title">Address </h5>
                  <a target="_blank" rel="noopener noreferrer" href={getSetting('google_maps_embed') || "https://maps.app.goo.gl/3oEyjo8ZYNDEhECH6"}>
                    <span style={{ whiteSpace: 'pre-line' }}>
                      {getSetting('contact_address', '54/2/16 & 54/2/18 Siddharth Farms\nLasudia Mori Dewas Naka\nIndore-452010')}
                    </span>
                  </a>
                </div>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="rs-contact-item">
                <div className="rs-contact-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24" width="512" height="512">
                    <path d="M12,0A12,12,0,1,0,24,12,12.013,12.013,0,0,0,12,0Zm0,22A10,10,0,1,1,22,12,10.011,10.011,0,0,1,12,22Z"></path>
                    <path d="M12,6a1,1,0,0,0-1,1v4.325L7.629,13.437a1,1,0,0,0,1.062,1.7l3.84-2.4A1,1,0,0,0,13,11.879V7A1,1,0,0,0,12,6Z"></path>
                  </svg>
                </div>
                <div className="rs-contact-content">
                  <h5 className="rs-contact-title">Opening Hour </h5>
                  <p> Mon - Sat 10.00 AM - 06.30 PM <br/></p>
                </div>
              </div>
            </div>
            
            <div className="col-lg-3">
              <div className="rs-contact-item">
                <div className="rs-contact-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M22.3338 20.6286C23.0854 19.6211 23.6012 18.4577 23.8431 17.2242C24.085 15.9907 24.0468 14.7186 23.7314 13.5019C23.416 12.2851 22.8314 11.1547 22.0207 10.1941C21.21 9.23346 20.194 8.46713 19.0476 7.95164C18.7979 6.51497 18.224 5.15411 17.3695 3.97247C16.515 2.79083 15.4025 1.8195 14.1163 1.13228C12.8302 0.445066 11.4044 0.0600458 9.94712 0.00647694C8.48989 -0.047092 7.03962 0.232199 5.7065 0.82313C4.37338 1.41406 3.1925 2.30108 2.25358 3.41679C1.31465 4.53251 0.642389 5.84756 0.287871 7.26202C-0.0666478 8.67649 -0.0940951 10.1532 0.207615 11.5798C0.509324 13.0065 1.13225 14.3456 2.02907 15.4954L0.361996 17.1505C0.19558 17.3192 0.0828473 17.5333 0.0380233 17.766C-0.00680069 17.9987 0.0182925 18.2394 0.110137 18.4578C0.200111 18.6768 0.352903 18.8643 0.549258 18.9966C0.745613 19.129 0.976743 19.2002 1.21352 19.2014H8.03772C8.71732 20.6341 9.78879 21.8451 11.1281 22.6941C12.4674 23.5431 14.0198 23.9954 15.6055 23.9987H22.8015C23.0383 23.9975 23.2694 23.9263 23.4658 23.794C23.6621 23.6616 23.8149 23.4741 23.9049 23.2551C23.9967 23.0367 24.0218 22.796 23.977 22.5633C23.9322 22.3307 23.8194 22.1165 23.653 21.9478L22.3338 20.6286ZM7.21018 15.6034C7.21183 16.005 7.2439 16.4059 7.30613 16.8027H4.10391L4.52368 16.3949C4.63609 16.2834 4.72531 16.1508 4.7862 16.0047C4.84709 15.8585 4.87844 15.7017 4.87844 15.5434C4.87844 15.3851 4.84709 15.2283 4.7862 15.0822C4.72531 14.936 4.63609 14.8034 4.52368 14.6919C3.85152 14.0271 3.31865 13.235 2.95622 12.3619C2.59378 11.4887 2.40906 10.5521 2.41285 9.60672C2.41285 7.69823 3.171 5.8679 4.52051 4.51839C5.87002 3.16888 7.70035 2.41073 9.60884 2.41073C11.098 2.40178 12.5526 2.85974 13.768 3.72024C14.9835 4.58073 15.8987 5.8005 16.3851 7.20806C16.1212 7.20806 15.8694 7.20806 15.6055 7.20806C13.3789 7.20806 11.2435 8.09256 9.66911 9.66699C8.09469 11.2414 7.21018 13.3768 7.21018 15.6034ZM19.8511 21.6L19.9111 21.66H15.6055C14.2183 21.6575 12.8748 21.1742 11.804 20.2923C10.7332 19.4104 10.0012 18.1845 9.73285 16.8235C9.46447 15.4625 9.67626 14.0505 10.3321 12.8282C10.988 11.6058 12.0474 10.6486 13.3298 10.1197C14.6123 9.59076 16.0384 9.52283 17.3653 9.92746C18.6922 10.3321 19.8378 11.1842 20.6069 12.3387C21.376 13.4932 21.721 14.8787 21.5832 16.2591C21.4454 17.6394 20.8333 18.9293 19.8511 19.909C19.6252 20.1304 19.4958 20.4322 19.4913 20.7485C19.492 20.9072 19.5241 21.0642 19.5859 21.2103C19.6477 21.3565 19.7378 21.489 19.8511 21.6V21.6Z" fill="#616161"></path>
                  </svg>
                </div>
                <div className="rs-contact-content">
                  <h5 className="rs-contact-title">Call Us </h5>
                  <a href={`tel:${getSetting('contact_phone_1', '+919522952267').replace(/[^+\d]/g, '')}`}>
                    {getSetting('contact_phone_1', '+91 9522952267')}
                  </a>
                </div>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="rs-contact-item">
                <div className="rs-contact-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
                    <path d="M23.7225 18.5848C23.1074 17.9453 22.3655 17.6034 21.5792 17.6034C20.7993 17.6034 20.051 17.9389 19.4106 18.5784L17.4068 20.573C17.242 20.4843 17.0771 20.402 16.9186 20.3197C16.6903 20.2057 16.4747 20.0981 16.2908 19.9841C14.4139 18.7937 12.7081 17.2424 11.0722 15.2353C10.2795 14.2348 9.74688 13.3927 9.36008 12.5379C9.88004 12.063 10.362 11.5691 10.8312 11.0943C11.0087 10.917 11.1863 10.7333 11.3638 10.556C12.6955 9.22637 12.6955 7.50412 11.3638 6.17444L9.63274 4.44585C9.43617 4.24957 9.23326 4.04695 9.04303 3.84433C8.66256 3.45176 8.26308 3.04652 7.85091 2.66662C7.23583 2.05876 6.50028 1.73584 5.72667 1.73584C4.95307 1.73584 4.20483 2.05876 3.57072 2.66662C3.56438 2.67295 3.56438 2.67295 3.55804 2.67928L1.40209 4.85109C0.590443 5.66156 0.127549 6.64932 0.0260924 7.79538C-0.126092 9.64427 0.419236 11.3665 0.837743 12.4936C1.86499 15.2606 3.39952 17.825 5.68862 20.573C8.46599 23.8845 11.8077 26.4995 15.625 28.3421C17.0834 29.0323 19.0301 29.8491 21.2051 29.9884C21.3383 29.9947 21.4778 30.001 21.6046 30.001C23.0694 30.001 24.2995 29.4755 25.2634 28.4307C25.2697 28.4181 25.2824 28.4117 25.2887 28.3991C25.6185 28.0002 25.9989 27.6393 26.3984 27.253C26.6711 26.9934 26.9501 26.7212 27.2227 26.4362C27.8505 25.784 28.1802 25.0242 28.1802 24.2454C28.1802 23.4603 27.8442 22.7068 27.2037 22.0736L23.7225 18.5848ZM25.9926 25.2522C25.9862 25.2522 25.9862 25.2585 25.9926 25.2522C25.7453 25.5181 25.4916 25.7587 25.219 26.0247C24.8068 26.4172 24.3883 26.8288 23.9952 27.291C23.3547 27.9749 22.6001 28.2978 21.6109 28.2978C21.5158 28.2978 21.4144 28.2978 21.3192 28.2914C19.436 28.1711 17.6858 27.4366 16.3732 26.8098C12.7842 25.0749 9.63274 22.6118 7.0139 19.4902C4.85161 16.8879 3.40586 14.4818 2.44836 11.8984C1.85865 10.3218 1.64305 9.0934 1.73817 7.93468C1.80158 7.19386 2.08692 6.57967 2.61323 6.05413L4.77552 3.89499C5.08623 3.60372 5.41596 3.44543 5.73935 3.44543C6.13884 3.44543 6.46223 3.68604 6.66514 3.88865C6.67148 3.89499 6.67782 3.90132 6.68417 3.90765C7.07097 4.26856 7.43875 4.64214 7.82555 5.04104C8.02212 5.24366 8.22503 5.44628 8.42795 5.65523L10.159 7.38381C10.8312 8.05498 10.8312 8.6755 10.159 9.34667C9.97515 9.5303 9.79761 9.71392 9.61372 9.89121C9.08107 10.4357 8.57379 10.9423 8.02212 11.4362C8.00944 11.4488 7.99676 11.4552 7.99042 11.4678C7.44509 12.0124 7.54654 12.5442 7.66068 12.9051C7.66702 12.9241 7.67336 12.9431 7.67971 12.9621C8.12992 14.0512 8.76402 15.077 9.72785 16.299L9.7342 16.3053C11.4843 18.4581 13.3296 20.1361 15.365 21.4214C15.625 21.5861 15.8913 21.719 16.145 21.8457C16.3732 21.9596 16.5888 22.0673 16.7727 22.1812C16.7981 22.1939 16.8235 22.2129 16.8488 22.2256C17.0644 22.3332 17.2673 22.3839 17.4766 22.3839C18.0029 22.3839 18.3326 22.0546 18.4404 21.947L20.609 19.7815C20.8246 19.5662 21.1671 19.3066 21.5665 19.3066C21.9597 19.3066 22.2831 19.5535 22.4796 19.7688C22.486 19.7752 22.486 19.7752 22.4923 19.7815L25.9862 23.2703C26.6394 23.9162 26.6394 24.581 25.9926 25.2522Z" fill="white"></path>
                    <path d="M16.2163 7.13613C17.8777 7.41473 19.3869 8.19988 20.5917 9.40292C21.7964 10.606 22.5764 12.1129 22.8617 13.7719C22.9315 14.1898 23.2929 14.481 23.7051 14.481C23.7558 14.481 23.8002 14.4747 23.8509 14.4684C24.3202 14.3924 24.6309 13.9492 24.5548 13.4806C24.2124 11.4734 23.2612 9.64353 21.8091 8.19355C20.357 6.74356 18.5245 5.79379 16.5144 5.45187C16.0451 5.37589 15.6076 5.68615 15.5252 6.14837C15.4427 6.61059 15.7471 7.06015 16.2163 7.13613Z" fill="white"></path>
                    <path d="M29.9883 13.2338C29.4239 9.92864 27.864 6.92103 25.4671 4.52761C23.0702 2.13419 20.0582 0.576563 16.7482 0.0130318C16.2853 -0.0692817 15.8478 0.247309 15.7654 0.709531C15.6893 1.17808 16 1.61498 16.4692 1.69729C19.4241 2.19751 22.1191 3.59683 24.2623 5.73065C26.4056 7.8708 27.8006 10.5618 28.3016 13.5124C28.3713 13.9303 28.7328 14.2216 29.1449 14.2216C29.1956 14.2216 29.24 14.2153 29.2908 14.2089C29.7537 14.1393 30.0707 13.6961 29.9883 13.2338Z" fill="white"></path>
                  </svg>
                </div>
                <div className="rs-contact-content">
                  <h5 className="rs-contact-title">Mail Us</h5>
                  <a href={`mailto:${getSetting('contact_email', 'info@mohitscpl.com')}`}>
                    {getSetting('contact_email', 'info@mohitscpl.com')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* contact area end */}

      {/* contact form area start */}
      <section className="rs-contact-form-area rs-contact-ten section-space-bottom" id="contact-us-form">
        <div className="container">
          <div className="row justify-content-center">
            <div className="w-full">
              <div className="rs-contact-form">
                <h3 className="rs-contact-form-title">Get in Touch</h3>
                <p className="descrip">Whether you have questions, feedback, or just want to say hello, we're always happy to hear from you. Choose a convenient method below to get in touch.</p>
                
                <form id="enquiry-form" onSubmit={handleSubmit}>
                  <div className="row g-5">
                    <div className="col-md-6">
                      <div className="rs-contact-input">
                        <input id="name" name="name" type="text" placeholder="Full Name" required value={formData.name} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="rs-contact-input">
                        <input id="cname" name="cname" type="text" placeholder="Company Name" required value={formData.cname} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="rs-contact-input">
                        <input id="email" name="email" type="email" placeholder="Email Address" required value={formData.email} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="rs-contact-input">
                        <input id="mobile" name="mobile" type="text" placeholder="Phone Number" required value={formData.mobile} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="w-full">
                      <div className="rs-contact-input">
                        <textarea id="message" name="message" placeholder="Write Your Message" required value={formData.message} onChange={handleChange}></textarea>
                      </div>
                    </div>

                    <div className="col-md-6 d-flex justify-content-start">
                      <div className="rs-contact-input text-center">
                        <input type="file" name="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp" onChange={handleFileChange} />
                      </div>
                    </div>
                    
                    <div className="rs-contact-input col-md-6 d-flex align-items-center gap-2">
                      {isMounted && captchaSvg && (
                        <div 
                          className="captcha-box" 
                          id="captchaValue2" 
                          style={{ display: 'inline-flex', padding: 0, overflow: 'hidden', height: '40px', background: '#f1f5f9' }}
                          dangerouslySetInnerHTML={{ __html: captchaSvg }} 
                        />
                      )}
                      <span className="captcha-refresh" id="refreshCaptcha2" style={{cursor: 'pointer'}} onClick={generateCaptcha}>Refresh</span>
                      <input type="text" name="captchaInput" id="captcha_input" className="form-control" placeholder="Type the number here" required value={formData.captchaInput} onChange={handleChange} />
                    </div>

                    <div className="w-full">
                      <div className="rs-contact-btn">
                        <button type="submit" className="rs-btn has-theme-orange" disabled={isSubmitting}>
                          {isSubmitting ? 'Sending...' : 'Send Message'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                <div id="form-messages" className="mt-4">
                  {statusMessage && (
                    <div className={`p-4 rounded-md font-medium text-center ${statusMessage.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                      {statusMessage.text}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>
      {/* contact form area end */}
    </main>
  );
}
