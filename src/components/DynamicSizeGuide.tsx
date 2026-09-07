export default function DynamicSizeGuide({ department, category }: { department: string, category: string }) {
  let guideText = "";

  if (department === 'men' && category === 'socks') {
    guideText = "راهنمای سایز جوراب مردانه: جوراب‌های ما فری‌سایز بوده و برای سایز پای ۴۰ تا ۴۴ مناسب است.";
  } else if (department === 'women' && category === 'socks') {
    guideText = "راهنمای سایز جوراب زنانه: جوراب‌های ما فری‌سایز بوده و برای سایز پای ۳۶ تا ۴۰ مناسب است.";
  } else if (department === 'kids' && category === 'socks') {
    guideText = "راهنمای سایز جوراب بچه‌گانه: لطفاً بر اساس سن و سایز کفش کودک انتخاب کنید.";
  } else if (department === 'men' && (category === 'underwear' || category === 'undershirts')) {
    guideText = "راهنمای سایز لباس زیر و زیرپوش مردانه: با توجه به بهداشتی بودن کالا، در انتخاب سایز دقت کنید.";
  } else if (department === 'men') {
    guideText = "راهنمای سایز محصولات مردانه: برای انتخاب دقیق، اندازه‌های خود را با جدول سایز مطابقت دهید.";
  } else if (department === 'women' && (category === 'underwear' || category === 'undershirts')) {
    guideText = "راهنمای سایز لباس زیر و زیرپوش زنانه: با توجه به بهداشتی بودن کالا، لطفاً سایز دقیق خود را انتخاب کنید.";
  } else if (department === 'women') {
    guideText = "راهنمای سایز محصولات زنانه: لطفاً قبل از خرید، دور کمر و باسن خود را اندازه بگیرید.";
  } else if (department === 'kids' && (category === 'underwear' || category === 'undershirts')) {
    guideText = "راهنمای سایز لباس زیر و زیرپوش بچه‌گانه: سایزها بر اساس سن استاندارد کودک طراحی شده‌اند.";
  } else {
    guideText = "راهنمای سایز محصولات جامی مد.";
  }

  return (
    <div className="mt-8 p-4 bg-muted/50 rounded-2xl border border-border">
      <h4 className="text-sm font-bold mb-2">راهنمای سایز</h4>
      <p className="text-xs text-muted-foreground leading-relaxed">{guideText}</p>
    </div>
  );
}
