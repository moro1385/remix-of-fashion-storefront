import { Link } from "react-router-dom";
import { Leaf, Package, RefreshCcw, Ruler } from "lucide-react";

const reasons = [
  {
    icon: Leaf,
    title: "مواد اولیه ماندگار",
    body: "پنبه شانه شده، الیاف بامبو و مودال - انتخاب شده برای تنفس‌پذیری، نرمی و حفظ فرم حتی پس از ده‌ها بار شستشو.",
  },
  {
    icon: Ruler,
    title: "سایز متناسب با شما",
    body: "هر مدل روی بدن‌های واقعی الگوبرداری و برش داده می‌شود تا سایزبندی در تمامی محصولات دقیق و قابل پیش‌بینی باشد.",
  },
  {
    icon: Package,
    title: "تکمیل کمد لباس در یک خرید",
    body: "جوراب، لباس زیر، زیرپوش و لباس راحتی همه در یک جا. کمد خود را بدون نیاز به جستجو در برندهای مختلف تکمیل کنید.",
  },
  {
    icon: RefreshCcw,
    title: "مرجوعی آسان و بی‌دردسر",
    body: "از خرید خود راضی نیستید؟ آن را در ۳۰ روز برگردانید. ما ترجیح می‌دهیم چیزی را بپوشید که هر روز دوستش دارید.",
  },
];

export default function WhyJamiMode() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            چرا جامی مد
          </p>
          <h2 className="text-3xl md:text-5xl font-light text-foreground leading-tight">
            لایه‌ای که کسی نمی‌بیند، شایسته بیشترین توجه است.
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            Basics get worn more than anything else in your wardrobe, and they wear out first. We
            build ours to outlast the trend cycle: warm, quiet colours, honest fabrics and a fit
            you forget you're wearing. Buy less, replace it less often, feel better all day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mt-16">
          {reasons.map((reason) => (
            <div key={reason.title}>
              <reason.icon className="w-6 h-6 text-accent" strokeWidth={1.5} />
              <h3 className="mt-5 text-lg font-light text-foreground">{reason.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{reason.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-border pt-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <p className="text-xl md:text-2xl font-light text-foreground max-w-xl">
            با یک خرید شروع کنید، برای خریدهای بیشتر بازخواهید گشت.
          </p>
        </div>
      </div>
    </section>
  );
}
