import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const CONTENT_DIR = path.join(process.cwd(), "content", "blog");

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  coverImage?: string;
  tags: string[];
  readingTime: string;
  content: string;
};

export type BlogPostMeta = Omit<BlogPost, "content">;

export function getPostSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const stats = readingTime(content);

  return {
    slug,
    title: data.title ?? "",
    description: data.description ?? "",
    publishedAt: data.publishedAt ?? "",
    updatedAt: data.updatedAt ?? data.publishedAt ?? "",
    author: data.author ?? {
      name: "Levi",
      role: "Founder, SerpVive",
      avatar: "/authors/levi.jpg",
    },
    coverImage: data.coverImage ?? undefined,
    tags: data.tags ?? [],
    readingTime: stats.text,
    content,
  };
}

export function getAllPosts(): BlogPostMeta[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => {
      const post = getPostBySlug(slug);
      if (!post) return null;
      const meta = { ...post } as Partial<typeof post>;
      delete meta.content;
      return meta as Omit<typeof post, "content">;
    })
    .filter((p): p is BlogPostMeta => p !== null)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

  return posts;
}

/**
 * Extracts FAQ pairs from MDX content by finding H3s under the
 * "Frequently Asked Questions" H2. Returns pairs for FAQPage JSON-LD.
 */
export function extractFaqs(
  content: string,
): { question: string; answer: string }[] {
  const faqSectionMatch = content.match(
    /## Frequently Asked Questions\n([\s\S]*?)(?=\n## |\n<BlogCTA|$)/,
  );
  if (!faqSectionMatch?.[1]) return [];

  const faqContent = faqSectionMatch[1];
  const faqs: { question: string; answer: string }[] = [];
  const parts = faqContent.split(/\n### /);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const newlineIdx = trimmed.indexOf("\n");
    if (newlineIdx === -1) continue;
    const question = trimmed.slice(0, newlineIdx).trim();
    const answer = trimmed.slice(newlineIdx + 1).trim();
    if (question && answer) {
      faqs.push({ question, answer });
    }
  }

  return faqs;
}

export function extractHeadings(
  content: string
): { id: string; text: string; level: number }[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: { id: string; text: string; level: number }[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const rawText = match[2];
    const rawLevel = match[1];
    if (!rawText || !rawLevel) continue;
    const text = rawText.trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    headings.push({ id, text, level: rawLevel.length });
  }

  return headings;
}
