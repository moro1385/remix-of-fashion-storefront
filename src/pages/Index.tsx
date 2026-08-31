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
        eyebrow="Just arrived"
        title="Newest Products"
        count={4}
        className="py-20 bg-background"
      />

      <CollectionCardsRow />

      <ProductRail
        type="featured"
        eyebrow="Hand-picked"
        title="Featured Essentials"
        count={4}
        className="py-20 bg-background"
      />

      <WhyJamiMode />
    </>
  );
}
