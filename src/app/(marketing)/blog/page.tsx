import { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import PostCard from "@/components/marketing/blog/PostCard";
import { BookOpen } from "lucide-react";

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

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section
        className="pt-36 pb-16 sm:pt-40 sm:pb-20 px-5 sm:px-12 text-center"
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
            Content Decay Insights
          </h1>
          <p
            className="text-[#94A3B8] mx-auto"
            style={{
              fontSize: "clamp(15px, 1.2vw, 18px)",
              maxWidth: "540px",
            }}
          >
            Data-driven strategies to detect, diagnose, and fix content decay
            before you lose traffic.
          </p>
        </div>
      </section>

      {/* Posts Grid */}
      <section
        className="pb-20 sm:pb-28 px-5 sm:px-12"
        style={{ background: "#07090F" }}
      >
        <div className="mx-auto" style={{ maxWidth: "880px" }}>
          {posts.length > 0 ? (
            <div className="flex flex-col gap-5">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-[#64748B] text-[15px]">
                Posts coming soon. Stay tuned.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
