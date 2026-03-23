import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import type { BlogPostMeta } from "@/lib/blog";

export default function PostCard({ post }: { post: BlogPostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-2xl border border-[#1E293B] bg-[#0F1219] p-6 sm:p-8 no-underline transition-all duration-300 hover:border-[#3B82F6]/40 hover:shadow-[0_0_40px_rgba(59,130,246,0.06)]"
    >
      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="text-[11px] font-semibold uppercase tracking-wider text-[#3B82F6] bg-[#3B82F6]/10 px-2.5 py-1 rounded-md"
          >
            {tag}
          </span>
        ))}
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] mb-3 group-hover:text-[#3B82F6] transition-colors leading-tight">
        {post.title}
      </h2>

      <p className="text-[15px] text-[#94A3B8] leading-relaxed mb-5 line-clamp-2">
        {post.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-[13px] text-[#64748B]">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} strokeWidth={1.5} />
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} strokeWidth={1.5} />
            {post.readingTime}
          </span>
        </div>

        <span className="flex items-center gap-1 text-[13px] font-medium text-[#3B82F6] opacity-0 group-hover:opacity-100 transition-opacity">
          Read <ArrowRight size={14} strokeWidth={1.5} />
        </span>
      </div>
    </Link>
  );
}
