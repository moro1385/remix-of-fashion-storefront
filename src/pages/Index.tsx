import CollectionSlider from "@/components/CollectionSlider";
import CollectionCardsRow from "@/components/CollectionCardsRow";
import ProductRail from "@/components/ProductRail";
import WhyJamiMode from "@/components/WhyJamiMode";

export default function Index() {
  return (
    <>
      <CollectionSlider />

      <ProductRail
        type="newest"
        eyebrow="تازه رسیده"
        title="جدیدترین محصولات"
        count={4}
        className="py-20 bg-background"
      />

      <CollectionCardsRow />

      <ProductRail
        type="featured"
        eyebrow="منتخب"
        title="محصولات ویژه"
        count={4}
        className="py-20 bg-background"
      />

      <WhyJamiMode />
    </>
  );
}
