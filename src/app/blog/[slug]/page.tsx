import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { sanitizeHtml } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://mohit.bdm.co.in';

interface BlogDetailsPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: BlogDetailsPageProps): Promise<Metadata> {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: params.slug },
      select: {
        title: true,
        excerpt: true,
        metaTitle: true,
        metaDesc: true,
        coverImage: true,
        publishedAt: true,
        author: { select: { name: true } },
      },
    });

    if (!post) {
      return { title: 'Blog Post Not Found | Mohit Sales Corporation Pvt. Ltd.' };
    }

    const title = post.metaTitle || `${post.title} - Insights Blog | Mohit Sales Corporation`;
    const description = post.metaDesc || post.excerpt || 'Read this post on Mohit Sales Corporation Pvt. Ltd. blog.';
    const canonicalUrl = `${BASE_URL}/blog/${params.slug}`;

    return {
      title,
      description,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        type: 'article',
        title,
        description,
        url: canonicalUrl,
        siteName: 'Mohit Sales Corporation Pvt. Ltd.',
        images: post.coverImage
          ? [{ url: post.coverImage, width: 1200, height: 630, alt: post.title }]
          : undefined,
        publishedTime: post.publishedAt?.toISOString(),
        authors: post.author?.name ? [post.author.name] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: post.coverImage ? [post.coverImage] : undefined,
      },
    };
  } catch {
    return { title: 'Blog Insights | Mohit Sales Corporation' };
  }
}

export default async function BlogDetailsPage({ params }: BlogDetailsPageProps) {
  let post = null;
  let recentPosts: any[] = [];

  try {
    // Increment viewCount atomically for published post
    await prisma.blogPost.updateMany({
      where: { slug: params.slug, isPublished: true },
      data: { viewCount: { increment: 1 } }
    });

    post = await prisma.blogPost.findUnique({
      where: { slug: params.slug },
      include: {
        author: { select: { name: true, email: true } },
        category: { select: { name: true, slug: true } }
      }
    });

    if (post && post.isPublished) {
      recentPosts = await prisma.blogPost.findMany({
        where: {
          isPublished: true,
          id: { not: post.id }
        },
        orderBy: { publishedAt: 'desc' },
        take: 3,
        select: { id: true, title: true, slug: true, coverImage: true, publishedAt: true }
      });
    }
  } catch (error) {
    console.error('[Blog Details DB Fetch Error]:', error);
  }

  if (!post || !post.isPublished) {
    notFound();
    return null;
  }

  const categoryName = post.category?.name || 'General';
  const authorName = post.author?.name || 'Admin';
  const publishDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    : 'N/A';

  return (
    <main>
      {/* Breadcrumb section */}
      <section className="rs-breadcrumb-area rs-breadcrumb-one p-relative">
        <div 
          className="rs-breadcrumb-bg"
          style={{ backgroundImage: "url('/assets/images/inner-banner/about-us.png')", filter: "brightness(0.65)" }}
        ></div>
        <div className="container">
          <div className="row">
            <div className="w-full">
              <div className="rs-breadcrumb-content-wrapper">
                <div className="rs-breadcrumb-title-wrapper">
                  <h1 className="rs-breadcrumb-title" style={{ fontSize: '36px', lineHeight: '1.2' }}>{post.title}</h1>
                </div>
                <div className="rs-breadcrumb-menu">
                  <nav>
                    <ul>
                      <li><span><Link href="/">Home</Link></span></li>
                      <li><span><Link href="/blog">Blog</Link></span></li>
                      <li><span>Article Details</span></li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Blog Details Layout */}
      <section className="blog-details-section py-20 bg-gray-50">
        <div className="container">
          <div className="row g-5">
            {/* Left Column: Post Content */}
            <div className="col-lg-8 w-full">
              <div className="bg-white rounded-xl shadow-sm p-6 md:p-10 border border-gray-100">
                {/* Meta header */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
                  <span className="bg-[#f7931e] text-white text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
                    {categoryName}
                  </span>
                  <span className="flex items-center gap-1">
                    📅 {publishDate}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    👤 By {authorName}
                  </span>
                </div>

                {/* Cover Image */}
                {post.coverImage && (
                  <div className="relative rounded-lg overflow-hidden mb-8 max-h-[420px] bg-slate-100">
                    <img 
                      src={post.coverImage} 
                      alt={post.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                )}

                {/* Excerpt */}
                {post.excerpt && (
                  <blockquote className="border-l-4 border-[#f7931e] pl-4 italic text-gray-700 text-lg leading-relaxed mb-8 bg-orange-50/50 py-3 pr-2 rounded-r">
                    {post.excerpt}
                  </blockquote>
                )}

                {/* Main Content (Rich HTML supported) */}
                <div 
                  className="prose max-w-none text-slate-700 leading-relaxed text-[16px] space-y-6"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
                />

                {/* Tags footer */}
                {post.tags && (
                  <div className="mt-12 pt-6 border-t border-gray-100 flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-semibold text-slate-800 mr-2">Tags:</span>
                    {post.tags.split(',').map((t, idx) => (
                      <span key={idx} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded transition-colors duration-200 cursor-default">
                        #{t.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Sidebar */}
            <div className="col-lg-4 w-full">
              {/* Sticky wrapper */}
              <div className="sticky top-28 space-y-8">
                {/* Author Info */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h4 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <span>👤</span> About the Author
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#1e2e5e] text-white flex items-center justify-center font-bold text-lg">
                      {authorName[0].toUpperCase()}
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-800 text-[15px]">{authorName}</h5>
                      <p className="text-xs text-gray-500">Mohit SCPL Contributor</p>
                    </div>
                  </div>
                </div>

                {/* Recent / Related Articles */}
                {recentPosts.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h4 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                      <span>📝</span> Recent Insights
                    </h4>
                    <div className="space-y-4">
                      {recentPosts.map((rPost) => {
                        const rDateStr = rPost.publishedAt
                          ? new Date(rPost.publishedAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })
                          : '';

                        return (
                          <div className="flex gap-3 items-start group" key={rPost.id}>
                            <div className="w-16 h-16 rounded overflow-hidden bg-slate-100 flex-shrink-0">
                              {rPost.coverImage ? (
                                <img src={rPost.coverImage} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-[#1e2e5e] text-white text-[10px] font-bold flex items-center justify-center">
                                  MSC
                                </div>
                              )}
                            </div>
                            <div className="flex-grow">
                              <h5 className="font-semibold text-slate-800 text-sm leading-snug group-hover:text-[#f7931e] transition-colors duration-200 line-clamp-2">
                                <Link href={`/blog/${rPost.slug}`}>{rPost.title}</Link>
                              </h5>
                              <span className="text-[11px] text-gray-500 mt-1 block">{rDateStr}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Back to Blog List */}
                <div className="bg-gradient-to-br from-[#1e2e5e] to-[#2d4080] text-white rounded-xl p-6 text-center shadow-lg">
                  <h4 className="font-bold text-lg mb-2">Need premium wires & cables?</h4>
                  <p className="text-xs text-gray-200 mb-4 leading-relaxed">We are the authorized distributor of Polycab and Dowells, supplying Indore & beyond.</p>
                  <Link href="/contact-us" className="inline-block bg-[#f7931e] text-white font-semibold text-xs px-4 py-2 rounded uppercase tracking-wider hover:bg-[#c1272d] transition-colors duration-300">
                    Send Enquiry &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
