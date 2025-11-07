/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://iqos-24.ru",
  generateRobotsTxt: true, // генерировать robots.txt
  sitemapSize: 7000,
  changefreq: "weekly",
  priority: 0.7,
  outDir: "./public",
  // Дополнительные настройки
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
  },
};
