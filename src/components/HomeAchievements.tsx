'use client';

import React, { useEffect, useState, useRef } from 'react';
import SplitText from './SplitText';

interface AnimatedCounterProps {
  target: number;
  duration?: number;
}

function AnimatedCounter({ target, duration = 2000 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutQuad: slowing down as it approaches target
      const easeProgress = progress * (2 - progress);
      setCount(Math.floor(easeProgress * target));

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [hasStarted, target, duration]);

  return <span ref={elementRef}>{count}</span>;
}

export default function HomeAchievements() {
  return (
    <div className="rs-counter-area rs-counter-one section-space counter_sec">
      <div className="container">
        <div className="row g-5 section-title-space justify-content-center top scroll-reveal" data-delay="0">
          <div className="w-full">
            <div className="rs-section-title-wrapper text-center">
              <span className="rs-section-subtitle has-theme-orange">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="15" viewBox="0 0 11 15" fill="none">
                  <path d="M3.14286 10L0 15L8.78104e-07 0L3.14286 5V10Z" fill="#1E2E5E"></path>
                  <path fillRule="evenodd" clipRule="evenodd" d="M6.28571 10L3.14286 15L3.14286 10L4.71428 7.5L3.14286 5L3.14286 0L6.28571 5L6.28571 10ZM6.28571 10L7.85714 7.5L6.28571 5V0L11 7.5L6.28571 15V10Z" fill="#1E2E5E"></path>
                </svg>
                Our Achievements
              </span>
              <h2 className="rs-section-title rs-split-text-enable split-in-fade"><SplitText text="Milestones That Define Our Success" /></h2>
            </div>
          </div>
        </div>
        <div className="row g-5 scroll-reveal" data-delay="200">
          <div className="col-lg-3 col-md-6 col-sm-6 col-xs-6">
            <div className="rs-counter-item">
              <div className="rs-counter-inner">
                <div className="rs-counter-number-wrapper">
                  <span className="rs-counter-number">
                    <AnimatedCounter target={5000} />
                  </span>
                  <span className="prefix">+</span>
                </div>
                <span className="rs-counter-title">Happy Clients</span>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 col-sm-6 col-xs-6">
            <div className="rs-counter-item">
              <div className="rs-counter-inner">
                <div className="rs-counter-number-wrapper">
                  <span className="rs-counter-number">
                    <AnimatedCounter target={100} />
                  </span>
                  <span className="prefix">+</span>
                </div>
                <span className="rs-counter-title">Team Strength</span>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 col-sm-6 col-xs-6">
            <div className="rs-counter-item">
              <div className="rs-counter-inner">
                <div className="rs-counter-number-wrapper">
                  <span className="rs-counter-number">
                    <AnimatedCounter target={27} />
                  </span>
                  <span className="prefix">+</span>
                </div>
                <span className="rs-counter-title">Years of Experience</span>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 col-sm-6 col-xs-6">
            <div className="rs-counter-item">
              <div className="rs-counter-inner">
                <div className="rs-counter-number-wrapper">
                  <span className="rs-counter-number">
                    <AnimatedCounter target={20} />
                  </span>
                  <span className="prefix">+</span>
                </div>
                <span className="rs-counter-title">States Covered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

