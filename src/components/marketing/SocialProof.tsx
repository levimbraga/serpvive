const STAR_PATH = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

export default function SocialProof() {
  return (
    <section className="social">
      <div className="social-inner">
        <div className="stars">
          <div className="stars-visual">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} viewBox="0 0 24 24"><path d={STAR_PATH} /></svg>
            ))}
          </div>
          <span className="stars-text">
            Built for <strong>SEO professionals</strong> who protect the traffic they&apos;ve already earned
          </span>
        </div>

        <div className="avatars">
          <div className="avatar-stack">
            <div className="avatar blue">JD</div>
            <div className="avatar orange">MK</div>
            <div className="avatar green">RS</div>
            <div className="avatar purple">AL</div>
            <div className="avatar red">TC</div>
          </div>
          <span className="sp-text">Join <strong>early adopters</strong> already monitoring their content</span>
        </div>

        <div className="logo-wall">
          <span>SEO Agencies</span>
          <span>Content Teams</span>
          <span>SaaS Blogs</span>
          <span>Publishers</span>
          <span>Freelancers</span>
        </div>
      </div>
    </section>
  );
}
