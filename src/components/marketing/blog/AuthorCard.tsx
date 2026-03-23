import { User } from "lucide-react";

type AuthorProps = {
  name: string;
  role: string;
};

export default function AuthorCard({ name, role }: AuthorProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-[#1E293B] flex items-center justify-center">
        <User size={18} strokeWidth={1.5} className="text-[#94A3B8]" />
      </div>
      <div>
        <p className="text-[14px] font-semibold text-[#F1F5F9]">{name}</p>
        <p className="text-[12px] text-[#64748B]">{role}</p>
      </div>
    </div>
  );
}
