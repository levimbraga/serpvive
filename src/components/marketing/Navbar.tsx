export default function Navbar() {
  return (
    <nav className="sv-nav">
      <a href="/" className="logo">Serp<span>Vive</span></a>
      <div className="nav-links">
        <a href="#features">Features</a>
        <a href="#pricing">Pricing</a>
        <a href="/login" className="nav-login">Log in</a>
        <a href="/signup" className="nav-cta">Get Started Free</a>
      </div>
    </nav>
  );
}
