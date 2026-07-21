import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { searchProducts, SEARCH_MIN_QUERY } from '@/lib/search';
import { cld } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

const FALLBACK_IMAGE =
  'https://res.cloudinary.com/da2dmtm9b/image/upload/f_auto,q_auto/mohit/logo/msc_logo_without_bg.png';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { q?: string };
}): Promise<Metadata> {
  const q = (searchParams?.q || '').trim();
  return {
    title: q
      ? `Search: ${q} - Mohit Sales Corporation Pvt. Ltd.`
      : 'Search Products - Mohit Sales Corporation Pvt. Ltd.',
    description: 'Search Polycab and Dowells cables, wires, switchgear and accessories by name, standard or voltage.',
    // Result pages carry no unique content of their own.
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams?.q || '').trim();
  const results = q.length >= SEARCH_MIN_QUERY ? await searchProducts(q, 50) : [];

  return (
    <main>
      <section className="rs-breadcrumb-area rs-breadcrumb-one p-relative">
        <div
          className="rs-breadcrumb-bg"
          style={{
            backgroundImage: `url('${cld('https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167906/mohit/inner-banner/products.png')}')`,
          }}
        ></div>
        <div className="container">
          <div className="row">
            <div className="w-full">
              <div className="rs-breadcrumb-content-wrapper">
                <div className="rs-breadcrumb-title-wrapper">
                  <h1 className="rs-breadcrumb-title">Search</h1>
                </div>
                <div className="rs-breadcrumb-menu">
                  <nav>
                    <ul>
                      <li><span><Link href="/">Home</Link></span></li>
                      <li><span>Search</span></li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="search-results-section" style={{ padding: '60px 0' }}>
        <div className="container">
          <form action="/search" method="get" className="search-page-form" role="search">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search by product, standard (IS 7098) or voltage (11kV)…"
              aria-label="Search products"
              className="search-page-input"
            />
            <button type="submit" className="search-page-submit">Search</button>
          </form>

          {q.length < SEARCH_MIN_QUERY ? (
            <p className="search-hint">
              Type at least {SEARCH_MIN_QUERY} characters. You can search by product name,
              standard (e.g. <strong>IS 7098</strong>) or voltage (e.g. <strong>11kV</strong>).
            </p>
          ) : results.length === 0 ? (
            <div className="search-empty">
              <h2>No products matched “{q}”</h2>
              <p>
                Try a shorter or more general term — a standard number like <strong>IS 694</strong>,
                a voltage like <strong>1100V</strong>, or a product family like <strong>armoured cable</strong>.
              </p>
              <Link href="/contact-us" className="rs-btn has-theme-orange has-bg enquiry-btn">
                Ask us instead
              </Link>
            </div>
          ) : (
            <>
              <p className="search-count">
                <strong>{results.length}</strong> {results.length === 1 ? 'product' : 'products'} for “{q}”
              </p>
              <div className="search-results-grid">
                {results.map((r) => (
                  <Link key={r.slug} href={`/${r.slug}`} className="search-result-card">
                    <div className="search-result-thumb">
                      <img
                        src={r.imageSrc ? cld(r.imageSrc) : cld(FALLBACK_IMAGE)}
                        alt={r.title}
                        loading="lazy"
                      />
                    </div>
                    <div className="search-result-title">{r.title}</div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
