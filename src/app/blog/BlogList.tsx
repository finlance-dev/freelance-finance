"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface Post {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  date: string;
}

const POSTS_PER_PAGE = 10;

export default function BlogList({ posts }: { posts: Post[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const currentPosts = posts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div className="space-y-6">
        {currentPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="flex flex-col sm:flex-row bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-md transition-all group"
          >
            <img
              src={post.coverImage}
              alt={post.title}
              width={400}
              height={210}
              loading="lazy"
              className="w-full sm:w-64 h-40 sm:h-auto object-cover shrink-0 bg-muted/10"
            />
            <div className="p-6 flex flex-col justify-center">
              <time className="text-xs text-muted">
                {new Date(post.date).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
              </time>
              <h2 className="text-xl font-semibold mt-1 mb-2 group-hover:text-primary transition">{post.title}</h2>
              <p className="text-muted text-sm">{post.excerpt}</p>
              <span className="inline-flex items-center gap-1 text-primary text-sm font-medium mt-3">
                อ่านต่อ <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 mt-12">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-border bg-card text-muted hover:border-primary/30 hover:text-primary transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition ${
                page === currentPage
                  ? "bg-primary text-white shadow-sm"
                  : "border border-border bg-card text-muted hover:border-primary/30 hover:text-primary"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-border bg-card text-muted hover:border-primary/30 hover:text-primary transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      )}
    </>
  );
}
