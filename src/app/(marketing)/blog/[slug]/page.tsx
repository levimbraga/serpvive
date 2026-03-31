import { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import {
  getPostBySlug,
  getPostSlugs,
  extractHeadings,
  extractFaqs,
} from "@/lib/blog";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import AuthorCard from "@/components/marketing/blog/AuthorCard";
import TableOfContents from "@/components/marketing/blog/TableOfContents";
import BlogCTA from "@/components/marketing/blog/BlogCTA";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: `${post.title} | SerpVive Blog`,
    description: post.description,
    alternates: { canonical: `https://serpvive.com/blog/${slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://serpvive.com/blog/${slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

const mdxComponents = {
  BlogCTA,
  table: (props: React.ComponentProps<"table">) => (
    <div className="overflow-x-auto my-6 rounded-xl border border-[#E5E7EB]">
      <table {...props} />
    </div>
  ),
};

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const headings = extractHeadings(post.content);
  const faqs = extractFaqs(post.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: "SerpVive",
      url: "https://serpvive.com",
    },
    mainEntityOfPage: `https://serpvive.com/blog/${slug}`,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://serpvive.com" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://serpvive.com/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: `https://serpvive.com/blog/${slug}` },
    ],
  };

  return (
    <>
      <Navbar />

      {/* JSON-LD: safe - data comes from our own trusted MDX frontmatter */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* FAQ JSON-LD: auto-extracted from ### headings under ## FAQ section */}
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }) }}
        />
      )}

      {/* Breadcrumb JSON-LD: safe - data comes from our own trusted MDX frontmatter */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Header */}
      <header
        className="pt-36 pb-12 sm:pt-40 sm:pb-16 px-5 sm:px-12"
        style={{ background: "#07090F" }}
      >
        <div className="mx-auto" style={{ maxWidth: "720px" }}>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#64748B] hover:text-[#94A3B8] no-underline transition-colors mb-8"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            Back to blog
          </Link>

          <div className="flex flex-wrap gap-2 mb-5">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-semibold uppercase tracking-wider text-[#3B82F6] bg-[#3B82F6]/10 px-2.5 py-1 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1
            className="font-extrabold text-[#F1F5F9] tracking-tight mb-5 leading-[1.15]"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
          >
            {post.title}
          </h1>

          <p className="text-[16px] text-[#94A3B8] mb-8 leading-relaxed">
            {post.description}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <AuthorCard name={post.author.name} role={post.author.role} />
            <div className="flex items-center gap-4 text-[13px] text-[#64748B]">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} strokeWidth={1.5} />
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} strokeWidth={1.5} />
                {post.readingTime}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Content + ToC (Light) */}
      <section
        className="pt-12 sm:pt-16 pb-20 sm:pb-28 px-5 sm:px-12"
        style={{ background: "#FFFFFF" }}
      >
        <div
          className="mx-auto flex gap-12"
          style={{ maxWidth: "1060px" }}
        >
          {/* Article */}
          <article className="prose-serpvive min-w-0 flex-1 mx-auto" style={{ maxWidth: "720px" }}>
            <MDXRemote
              source={post.content}
              components={mdxComponents}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [
                    rehypeSlug,
                    [rehypeAutolinkHeadings, { behavior: "wrap" }],
                  ],
                },
              }}
            />
          </article>

          {/* ToC sidebar */}
          <TableOfContents headings={headings} />
        </div>
      </section>

      <Footer />
    </>
  );
}
