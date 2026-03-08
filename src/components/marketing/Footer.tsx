export default function Footer() {
  return (
    <footer className="sv-footer">
      <div className="fi">
        <div className="fb">
          <a href="/" className="logo">Serp<span>Vive</span></a>
          <p>Revive your rankings.</p>
          <p style={{ marginTop: 16 }}>&copy; 2026 SerpVive. All rights reserved.</p>
        </div>
        <div className="fl">
          <div className="fc">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div className="fc">
            <h4>Company</h4>
            <a href="mailto:serpvive@gmail.com">Contact</a>
          </div>
          <div className="fc">
            <h4>Legal</h4>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
