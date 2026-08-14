import CollectionSlider from "@/components/CollectionSlider";
import CollectionCardsRow from "@/components/CollectionCardsRow";
import ProductRail from "@/components/ProductRail";
import WhyJamiMode from "@/components/WhyJamiMode";
import NewsletterSignup from "@/components/NewsletterSignup";

export default function Index() {
  return (
    <>
      <CollectionSlider />

      <ProductRail
        eyebrow="Just arrived"
        title="Newest Products"
        count={4}
        ctaLabel="Shop new"
        className="py-20 bg-background"
      />

      <CollectionCardsRow />

      <ProductRail
        eyebrow="Hand-picked"
        title="Featured Essentials"
        query="product_type:Socks"
        count={4}
        ctaTo="/collections/socks"
        ctaLabel="See collection"
        className="py-20 bg-background"
      />

      <WhyJamiMode />

      <NewsletterSignup />
    </>
  );
}
