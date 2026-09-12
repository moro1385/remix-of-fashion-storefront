import CollectionSlider from "@/components/CollectionSlider";
import CategoryQuickNav from "@/components/CategoryQuickNav";
import CollectionCardsRow from "@/components/CollectionCardsRow";
import ProductRail from "@/components/ProductRail";
import WhyJamiMode from "@/components/WhyJamiMode";
import FadeIn from "@/components/FadeIn";

export default function Index() {
  return (
    <>
      <FadeIn>
        <CollectionSlider />
      </FadeIn>

      <FadeIn>
        <CategoryQuickNav />
      </FadeIn>

      <FadeIn>
        <ProductRail
          type="newest"
          eyebrow="تازه ترین ها"
          title="جدید ترین محصولات"
          count={4}
          className="py-20 bg-background"
        />
      </FadeIn>

      <FadeIn>
        <CollectionCardsRow />
      </FadeIn>

      <FadeIn>
        <ProductRail
          type="featured"
          eyebrow="محبوب ها"
          title="محصولات ویژه و خاص"
          count={4}
          className="py-20 bg-background"
        />
      </FadeIn>

      <FadeIn>
        <WhyJamiMode />
      </FadeIn>
    </>
  );
}
