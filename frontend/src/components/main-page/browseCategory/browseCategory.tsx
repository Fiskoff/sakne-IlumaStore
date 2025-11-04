"use client";

import Link from "next/link";
import styles from "./browseCategory.module.scss";
import Image from "next/image";
import { FC } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

interface BrowseCategoryItemProps {
  title: string;
  imageUrl: string;
  url: string;
}

const BrowseCategoryItem: FC<BrowseCategoryItemProps> = ({
  title,
  imageUrl,
  url,
}) => {
  return (
    <Link href={url} className={styles.category_item}>
      <Image src={imageUrl} alt={title} width={200} height={200} />
      <p>{title}</p>
    </Link>
  );
};

export default function BrowseCategory() {
  const categories: BrowseCategoryItemProps[] = [
    {
      title: "Iqos Iluma One",
      imageUrl: "/browseCategory/ilumaone.webp",
      url: "/category1",
    },
    {
      title: "Iqos Iluma One",
      imageUrl: "/browseCategory/ilumastandart.webp",
      url: "/category1",
    },
    {
      title: "Iqos Iluma One",
      imageUrl: "/browseCategory/ilumaprime.webp",
      url: "/category1",
    },
    {
      title: "Iqos Iluma One",
      imageUrl: "/browseCategory/ilumaione.webp",
      url: "/category1",
    },
    {
      title: "Iqos Iluma One",
      imageUrl: "/browseCategory/ilumaistandart.png",
      url: "/category1",
    },
    {
      title: "Iqos Iluma One",
      imageUrl: "/browseCategory/ilumaiprime.webp",
      url: "/category1",
    },
  ];

  return (
    <section className="container">
      <div className={styles.browse_header}>
        <h2>Iqos Iluma по категориям</h2>
        <div className="swiper-navigation">
          <div className="category-swiper-button-prev"></div>
          <div className="category-swiper-button-next"></div>
        </div>
      </div>
      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={20}
        navigation={{
          prevEl: ".category-swiper-button-prev",
          nextEl: ".category-swiper-button-next",
        }}
        loop={true}
        breakpoints={{
          320: {
            slidesPerView: 3,
            spaceBetween: 10,
          },
          480: {
            slidesPerView: 3,
            spaceBetween: 15,
          },
          580: {
            slidesPerView: 3,
            spaceBetween: 15,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
          992: {
            slidesPerView: 4,
            spaceBetween: 20,
          },
          1200: {
            slidesPerView: 5,
            spaceBetween: 20,
          },
        }}
        className={styles.browse_category_swiper}
      >
        {categories.map((category, index) => (
          <SwiperSlide key={index}>
            <BrowseCategoryItem {...category} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
