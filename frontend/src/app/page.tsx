import BestSellers from "@/components/main-page/bestSellers/bestSellers";
import BrowseCategory from "@/components/main-page/browseCategory/browseCategory";
import BrowseCountry from "@/components/main-page/browseCountry/browseCountry";
import Exclusive from "@/components/main-page/exclusive/exclusive";
import Hero from "@/components/main-page/hero-block/Hero";
import NewProducts from "@/components/main-page/newProducts/newProducts";
import Reviews from "@/components/main-page/reviews/reviews";
import Sales from "@/components/main-page/sales/sales";

export default function Home() {
  return (
    <>
      <Hero />
      <BrowseCategory />
      <BrowseCountry />
      <NewProducts title="Новинки" limit={8} />
      <Sales />
      <BestSellers title="Хит продаж" limit={8} />
      <Exclusive />
      <Reviews />
    </>
  );
}
