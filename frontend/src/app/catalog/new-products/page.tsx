import BreadCrumbs from "@/components/common/breadcrums";
import NewProducts from "@/components/main-page/newProducts/newProducts";

export default function NewProductsPage() {
  return (
    <section className="hero-container">
      <div className={"second_page_header"}>
        <h1>Новинки</h1>
        <BreadCrumbs
          items={[{ label: "Главная", href: "/" }, { label: "Новинки" }]}
        />
      </div>
      <NewProducts />
    </section>
  );
}
