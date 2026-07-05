'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function HomeContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    cname: '',
    email: '',
    mobile: '',
    message: '',
    captchaInput: ''
  });

  const [captcha, setCaptcha] = useState('1234');
  const [file, setFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Google Maps IntersectionObserver (lazy render) ──
  const [showMap, setShowMap] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Start loading 200px before visible
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const generateCaptcha = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setCaptcha(code);
  };

  useEffect(() => {
    generateCaptcha();
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

    if (formData.captchaInput !== captcha) {
      setStatusMessage({ type: 'error', text: 'Captcha code mismatch. Please check and try again.' });
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
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'An unexpected error occurred. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rs-contact-area rs-contact-one section-space has-theme-orange p-relative contact_us_sec">
      <div
        className="rs-contact-bg-thumb"
        data-background="https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167841/mohit/bg/contact-form-bg.webp"
        style={{ backgroundImage: "url('/assets/images/bg/contact-bg-04.png')" }}
      ></div>
      <div className="container">
        <div className="row align-items-xl-center g-5">
          {/* Left: Map */}
          <div className="col-xl-5 col-lg-5">
            <div className="rs-contact-wrapper">
              <div className="contact-map" ref={mapContainerRef}>
                {showMap ? (
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d7357.08999728618!2d75.90854!3d22.782261!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39631da62f44dfe1%3A0xb76224f845182eed!2sSiddharth%20Farms!5e0!3m2!1sen!2sin!4v1768201690028!5m2!1sen!2sin"
                    width="500"
                    height="580"
                    style={{ border: 0, width: '100%', borderRadius: '12px' }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '580px',
                      borderRadius: '12px',
                      background: '#e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#9ca3af',
                      fontSize: '14px',
                    }}
                  >
                    Loading map...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="col-xl-7 col-lg-7">
            <div className="rs-contact-form">
              <div
                className="rs-contact-form-bg-thumb"
                data-background="https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167839/mohit/bg/contact-bg-03.png"
                style={{ backgroundImage: "url('https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167839/mohit/bg/contact-bg-03.png')" }}
              ></div>
              <h3 className="rs-contact-form-title">Get in Touch</h3>
              <p className="descrip">
                We&apos;re here to assist you. Please fill out the form below and our team will get back to you promptly.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="rs-contact-input">
                      <input
                        name="name"
                        type="text"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="rs-contact-input">
                      <input
                        name="cname"
                        type="text"
                        placeholder="Company Name"
                        value={formData.cname}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="rs-contact-input">
                      <input
                        name="email"
                        type="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="rs-contact-input">
                      <input
                        name="mobile"
                        type="text"
                        placeholder="Phone Number"
                        value={formData.mobile}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="w-full">
                    <div className="rs-contact-input">
                      <textarea
                        name="message"
                        placeholder="Write Your Message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                      ></textarea>
                    </div>
                  </div>

                  <div className="w-full d-flex justify-content-start">
                    <div className="rs-contact-input text-center">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.png"
                        onChange={handleFileChange}
                        style={{ fontSize: '14px', color: '#fff' }}
                      />
                    </div>
                  </div>

                  <div className="rs-contact-input w-full d-flex align-align-items-center gap-2">
                    <span
                      className="captcha-box"
                      style={{
                        display: 'inline-block',
                        padding: '10px 16px',
                        background: '#fff',
                        border: '2px dashed #ccc',
                        fontWeight: 700,
                        letterSpacing: '4px',
                        fontSize: '18px',
                        color: '#1e2e5e',
                        borderRadius: '6px',
                        userSelect: 'none'
                      }}
                    >
                      {captcha}
                    </span>
                    <span
                      className="captcha-refresh"
                      onClick={generateCaptcha}
                      style={{
                        cursor: 'pointer',
                        color: '#fff',
                        marginLeft: '8px',
                        textDecoration: 'underline',
                        fontSize: '14px'
                      }}
                    >
                      Refresh
                    </span>
                    <input
                      type="text"
                      name="captchaInput"
                      className="form-control"
                      placeholder="Type the number here"
                      value={formData.captchaInput}
                      onChange={handleChange}
                      required
                      style={{ maxWidth: '220px' }}
                    />
                  </div>

                  {statusMessage && (
                    <div className="w-full">
                      <div
                        style={{
                          padding: '14px 20px',
                          borderRadius: '8px',
                          fontSize: '15px',
                          fontWeight: 500,
                          background: statusMessage.type === 'success' ? '#d1fae5' : '#fee2e2',
                          color: statusMessage.type === 'success' ? '#065f46' : '#991b1b',
                          border: `1px solid ${statusMessage.type === 'success' ? '#a7f3d0' : '#fca5a5'}`
                        }}
                      >
                        {statusMessage.text}
                      </div>
                    </div>
                  )}

                  <div className="w-full">
                    <div className="rs-contact-btn">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rs-btn black-bg"
                      >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
