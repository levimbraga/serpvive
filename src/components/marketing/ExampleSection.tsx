import { Reveal } from "@/hooks/useReveal";
import { DiagnosisShowcase } from "./DiagnosisShowcase";

export default function ExampleSection() {
  return (
    <section className="py-20 sm:py-28 px-5 sm:px-12 bg-white">
      <div className="mx-auto" style={{ maxWidth: "min(1100px, 85vw)" }}>
        <Reveal>
          <h2
            className="font-extrabold leading-[1.1] text-center text-[#0F172A] mb-4"
            style={{ fontSize: "clamp(2rem, 4vw, 4rem)", letterSpacing: "-0.04em" }}
          >
            See a real diagnosis in action.
          </h2>
        </Reveal>
        <Reveal>
          <p className="text-[16px] sm:text-[18px] text-[#64748B] leading-relaxed text-center max-w-[540px] mx-auto mb-14">
            This is the level of detail you get. Not &quot;optimize your content.&quot;
          </p>
        </Reveal>

        <Reveal>
          <DiagnosisShowcase />
        </Reveal>

        <Reveal>
          <p className="text-center mt-10 text-[15px] sm:text-[16px] text-[#334155]">
            <strong className="text-[#0F172A]">Specific issues. Specific fixes. Measurable results.</strong>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
