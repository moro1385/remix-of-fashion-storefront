import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-12">
          <div>
            <h3 className="text-2xl font-light tracking-wide text-foreground mb-3">Jami Mode</h3>
            <p className="text-sm text-muted-foreground">Everyday essentials, made with care.</p>
            <div className="flex gap-4 mt-6 mb-8">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram className="w-[18px] h-[18px] text-muted-foreground hover:text-foreground transition-colors" />
              </a>
            </div>
            <div className="flex gap-4">
              <Link to="/sign-in" className="px-6 py-2 bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity">
                Sign In (ورود)
              </Link>
              <Link to="/sign-up" className="px-6 py-2 border border-input text-foreground text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                Sign Up (ثبت نام)
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Address</Link>
          </div>
          <div className="flex flex-col gap-3">
            <Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">فروش عمده</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
