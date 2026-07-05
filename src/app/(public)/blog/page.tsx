import type { Metadata } from 'next';
import { getSeoMetadata } from '@/lib/seo';
import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { cld } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/blog', {
    title: 'Insights & News Blog | Mohit Sales Corporation Pvt. Ltd.',
    description: 'Explore our latest articles, electrical engineering updates, Polycab product releases, and industrial cable guides.',
  });
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { page?: string } | Promise<{ page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedSearchParams?.page || '1', 10) || 1);
  const limit = 12;
  const skip = (page - 1) * limit;

  let blogs: any[] = [];
  let totalCount = 0;

  try {
    const [fetchedBlogs, count] = await Promise.all([
      prisma.blogPost.findMany({
        where: { isPublished: true },
        include: {
          author: { select: { name: true, email: true } },
          category: { select: { name: true, slug: true } }
        },
        orderBy: { publishedAt: 'desc' },
        skip: skip,
        take: limit,
      }),
      prisma.blogPost.count({
        where: { isPublished: true },
      })
    ]);
    blogs = fetchedBlogs;
    totalCount = count;
  } catch (error) {
    console.error('[Blog Page DB Error]:', error);
  }

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <main>
      {/* Breadcrumb section */}
      <section className="rs-breadcrumb-area rs-breadcrumb-one p-relative">
        <div 
          className="rs-breadcrumb-bg"
          style={{ backgroundImage: `url('${cld('https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167900/mohit/inner-banner/about-us.png')}')`, filter: "brightness(0.65)" }}
        ></div>
        <div className="container">
          <div className="row">
            <div className="w-full">
              <div className="rs-breadcrumb-content-wrapper">
                <div className="rs-breadcrumb-title-wrapper">
                  <h1 className="rs-breadcrumb-title">Insights & Blog</h1>
                </div>
                <div className="rs-breadcrumb-menu">
                  <nav>
                    <ul>
                      <li><span><Link href="/">Home</Link></span></li>
                      <li><span>Blog</span></li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Blog Grid */}
      <section className="blog-section py-20 bg-gray-50">
        <div className="container">
          {blogs.length === 0 ? (
            <div className="text-center py-20">
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
              <h3 className="text-2xl font-bold text-slate-800">No blog posts published yet</h3>
              <p className="text-gray-500 mt-2">Check back soon for insights, newsletters, and announcements.</p>
              <Link href="/" className="mt-6 inline-block bg-gradient-to-r from-[#f7931e] to-[#c1272d] text-white px-6 py-2.5 rounded font-medium hover:opacity-90">
                Back to Homepage
              </Link>
            </div>
          ) : (
            <>
              <div className="row g-4">
                {blogs.map((post) => {
                  const authorName = post.author?.name || 'Admin';
                  const categoryName = post.category?.name || 'General';
                  const dateStr = post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'N/A';

                  return (
                    <div className="col-lg-4 col-md-6 w-full flex" key={post.id}>
                      <div className="blog-card bg-white rounded-lg shadow-md overflow-hidden flex flex-col flex-grow hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        {/* Image section */}
                        <div className="relative h-48 bg-slate-200 overflow-hidden flex-shrink-0">
                          {post.coverImage ? (
                            <img 
                              src={post.coverImage} 
                              alt={post.title} 
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#1e2e5e] to-[#2d4080] flex items-center justify-center text-white text-3xl font-bold opacity-90">
                              Mohit SCPL
                            </div>
                          )}
                          <span className="absolute top-4 left-4 bg-[#f7931e] text-white text-xs px-2.5 py-1 rounded font-semibold uppercase tracking-wider shadow">
                            {categoryName}
                          </span>
                        </div>

                        {/* Content Section */}
                        <div className="p-6 flex flex-col flex-grow">
                          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                            <span className="flex items-center gap-1">
                              📅 {dateStr}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              👤 {authorName}
                            </span>
                          </div>

                          <h3 className="text-xl font-bold text-slate-800 leading-snug mb-3 hover:text-[#f7931e] transition-colors duration-200">
                            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                          </h3>

                          <p className="text-gray-600 text-sm leading-relaxed mb-5 flex-grow line-clamp-3">
                            {post.excerpt || (post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 140) + '...' : '')}
                          </p>

                          <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                            <Link 
                              href={`/blog/${post.slug}`} 
                              className="text-[#f7931e] font-semibold text-sm inline-flex items-center gap-1 hover:text-[#c1272d] transition-colors duration-200"
                            >
                              Read Full Post &rarr;
                            </Link>
                            {post.tags && (
                              <div className="flex gap-1 overflow-hidden max-w-[50%]">
                                {post.tags.split(',').slice(0, 2).map((t: string, idx: number) => (
                                  <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded whitespace-nowrap">
                                    #{t.trim()}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-12 gap-2">
                  {/* Previous Button */}
                  {page > 1 ? (
                    <Link
                      href={`/blog?page=${page - 1}`}
                      className="px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-md font-medium hover:bg-slate-50 transition-colors duration-200 text-sm no-underline"
                    >
                      &larr; Prev
                    </Link>
                  ) : (
                    <span className="px-4 py-2 border border-slate-200 bg-gray-100 text-gray-400 rounded-md font-medium cursor-not-allowed text-sm select-none">
                      &larr; Prev
                    </span>
                  )}

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => {
                    const pageNum = i + 1;
                    const isAdjacent = Math.abs(pageNum - page) <= 1;
                    const isFirstOrLast = pageNum === 1 || pageNum === totalPages;

                    if (totalPages <= 7 || isAdjacent || isFirstOrLast) {
                      return (
                        <Link
                          key={pageNum}
                          href={`/blog?page=${pageNum}`}
                          className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 no-underline ${
                            page === pageNum
                              ? 'bg-gradient-to-r from-[#f7931e] to-[#c1272d] text-white border-transparent shadow-sm'
                              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {pageNum}
                        </Link>
                      );
                    }

                    if (pageNum === 2 || pageNum === totalPages - 1) {
                      return (
                        <span key={pageNum} className="px-2 text-slate-400 font-medium select-none">
                          ...
                        </span>
                      );
                    }

                    return null;
                  })}

                  {/* Next Button */}
                  {page < totalPages ? (
                    <Link
                      href={`/blog?page=${page + 1}`}
                      className="px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-md font-medium hover:bg-slate-50 transition-colors duration-200 text-sm no-underline"
                    >
                      Next &rarr;
                    </Link>
                  ) : (
                    <span className="px-4 py-2 border border-slate-200 bg-gray-100 text-gray-400 rounded-md font-medium cursor-not-allowed text-sm select-none">
                      Next &rarr;
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
