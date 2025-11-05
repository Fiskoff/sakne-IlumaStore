import BreadCrumbs from "@/components/common/breadcrums";
import BestSellers from "@/components/main-page/bestSellers/bestSellers";

export default function BestSellersPage() {
  return (
    <>
      <section className="hero-container">
        <div className={"second_page_header"}>
          <h1>Хит продаж</h1>
          <BreadCrumbs
            items={[{ label: "Главная", href: "/" }, { label: "Хит продаж" }]}
          />
        </div>
        <BestSellers />
      </section>
    </>
  );
}
