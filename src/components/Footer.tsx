import { Link } from "react-router-dom";
import { Instagram, Send } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-12">
          <div>
            <h3 className="text-2xl font-light tracking-wide text-foreground mb-3">Jami Mode</h3>
            <p className="text-sm text-muted-foreground">مهم ترین نیاز های روزمره خود را با بیشترین کیفیت از جامی مد تهیه کنید</p>
            <div className="flex gap-4 mt-6 mb-8">
              <a href="https://www.instagram.com/jami_modee?igsi=Z2N2cXdwNWZpeDRw&utm_source=qr" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram className="w-[18px] h-[18px] text-muted-foreground hover:text-foreground transition-colors" />
              </a>
              <a href="https://t.me/foroshgahejamaly" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                <Send className="w-[18px] h-[18px] text-muted-foreground hover:text-foreground transition-colors" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-base font-semibold text-foreground mb-4">دسترسی سریع</h4>
            <div className="flex flex-col gap-3">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">خانه</Link>
              <Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground transition-colors">فروشگاه</Link>
              <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">درباره ما</Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">تماس با ما</Link>
              <Link to="/wholesale" className="text-sm text-muted-foreground hover:text-foreground transition-colors">فروش عمده</Link>
              <Link to="/address" className="text-sm text-muted-foreground hover:text-foreground transition-colors">آدرس</Link>
            </div>
          </div>
          <div>
            <h4 className="text-base font-semibold text-foreground mb-4">خدمات مشتریان</h4>
            <div className="flex flex-col gap-3">
              <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">حریم خصوصی</Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">قوانین و مقررات</Link>
              <Link to="/size-guide" className="text-sm text-muted-foreground hover:text-foreground transition-colors">راهنمای سایز</Link>
              <Link to="/return-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">شرایط مرجوعی</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
