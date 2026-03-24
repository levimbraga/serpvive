import { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, type BlogPostMeta } from "@/lib/blog";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import { Calendar, Clock, ArrowRight, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog | SerpVive - Content Decay Insights & SEO Strategies",
  description:
    "Learn how to detect content decay, protect your organic traffic, and keep your content ranking. Data-driven SEO strategies from the SerpVive team.",
  alternates: { canonical: "https://serpvive.com/blog" },
  openGraph: {
    title: "SerpVive Blog - Content Decay Insights",
    description:
      "Data-driven strategies to detect and fix content decay before you lose traffic.",
    url: "https://serpvive.com/blog",
    type: "website",
  },
};

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  Guide:        { bg: "#EFF6FF", text: "#2563EB" },
  SEO:          { bg: "#F5F3FF", text: "#7C3AED" },
  Comparison:   { bg: "#F0FDFA", text: "#0D9488" },
  "Content Audit": { bg: "#F0FDFA", text: "#0D9488" },
  "SEO Tools":  { bg: "#F0FDFA", text: "#0D9488" },
  Tools:        { bg: "#FFFBEB", text: "#D97706" },
  "Google Search Console": { bg: "#EFF6FF", text: "#2563EB" },
};

const DEFAULT_TAG = { bg: "#F3F4F6", text: "#6B7280" };

function getTagColor(tag: string) {
  return TAG_COLORS[tag] ?? DEFAULT_TAG;
}

function FeaturedCard({ post }: { post: BlogPostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-2xl border border-[#E5E7EB] bg-white p-7 sm:p-9 no-underline transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags.map((tag) => {
          const c = getTagColor(tag);
          return (
            <span
              key={tag}
              className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md"
              style={{ background: c.bg, color: c.text }}
            >
              {tag}
            </span>
          );
        })}
      </div>

      <h2 className="text-[22px] sm:text-[28px] font-bold text-[#111827] mb-3 group-hover:text-[#2563EB] transition-colors leading-tight tracking-tight">
        {post.title}
      </h2>

      <p className="text-[15px] sm:text-[16px] text-[#4B5563] leading-relaxed mb-6 max-w-2xl">
        {post.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-[13px] text-[#6B7280]">
          <span>{post.author.name}</span>
          <span className="flex items-center gap-1.5">
            <Calendar size={13} strokeWidth={1.5} />
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={13} strokeWidth={1.5} />
            {post.readingTime}
          </span>
        </div>
        <span className="hidden sm:flex items-center gap-1 text-[13px] font-medium text-[#2563EB] opacity-0 group-hover:opacity-100 transition-opacity">
          Read article <ArrowRight size={14} strokeWidth={1.5} />
        </span>
      </div>
    </Link>
  );
}

function PostCard({ post }: { post: BlogPostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-xl border border-[#E5E7EB] bg-white p-6 no-underline transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="flex flex-wrap gap-2 mb-3">
        {post.tags.slice(0, 2).map((tag) => {
          const c = getTagColor(tag);
          return (
            <span
              key={tag}
              className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md"
              style={{ background: c.bg, color: c.text }}
            >
              {tag}
            </span>
          );
        })}
      </div>

      <h3 className="text-[18px] font-bold text-[#111827] mb-2 group-hover:text-[#2563EB] transition-colors leading-snug">
        {post.title}
      </h3>

      <p className="text-[14px] text-[#4B5563] leading-relaxed mb-4 line-clamp-2">
        {post.description}
      </p>

      <div className="flex items-center gap-3 text-[12px] text-[#9CA3AF]">
        <span>{post.author.name}</span>
        <span>&middot;</span>
        <span>
          {new Date(post.publishedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
        <span>&middot;</span>
        <span>{post.readingTime}</span>
      </div>
    </Link>
  );
}

export default function BlogIndex() {
  const posts = getAllPosts();
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <>
      <Navbar />

      {/* Dark Hero */}
      <header
        className="pt-36 pb-12 sm:pt-40 sm:pb-16 px-5 sm:px-12 text-center"
        style={{ background: "#07090F" }}
      >
        <div className="mx-auto" style={{ maxWidth: "720px" }}>
          <div className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#3B82F6] bg-[#3B82F6]/10 px-4 py-1.5 rounded-full mb-6">
            <BookOpen size={14} strokeWidth={1.5} />
            SerpVive Blog
          </div>
          <h1
            className="font-extrabold text-[#F1F5F9] tracking-tight mb-4"
            style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
          >
            Guides, strategies, and insights
          </h1>
          <p
            className="text-[#94A3B8] mx-auto"
            style={{
              fontSize: "clamp(15px, 1.2vw, 18px)",
              maxWidth: "540px",
            }}
          >
            Content decay, SEO monitoring, and protecting your organic traffic.
          </p>
        </div>
      </header>

      {/* Posts (Light) */}
      <section className="bg-[#F9FAFB] px-5 sm:px-12 pt-12 sm:pt-16 pb-20 sm:pb-28">
        <div className="mx-auto" style={{ maxWidth: "880px" }}>
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#6B7280] text-[15px]">
                Posts coming soon. Stay tuned.
              </p>
            </div>
          ) : (
            <>
              {/* Featured Post */}
              {featured && (
                <div className="mb-8">
                  <FeaturedCard post={featured} />
                </div>
              )}

              {/* Grid */}
              {rest.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-5">
                  {rest.map((post) => (
                    <PostCard key={post.slug} post={post} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* CTA */}
          <div className="mt-16 rounded-2xl border border-[#2563EB]/15 bg-white p-8 sm:p-10 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-[#111827] mb-3">
              Stop losing traffic you already earned
            </h2>
            <p className="text-[15px] text-[#4B5563] mb-6 max-w-md mx-auto">
              SerpVive monitors your blog, detects decay, and tells you exactly
              what to fix. Free plan available.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] text-white font-semibold px-6 py-3 text-[15px] no-underline hover:bg-[#1D4ED8] transition-all"
            >
              Get Started Free
              <ArrowRight size={16} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
