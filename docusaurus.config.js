// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

import { themes } from "prism-react-renderer";
import { remarkKroki } from "remark-kroki";
import path from "path";

const organizationName = "dennislapchenko";
const projectName = "garden-of-atlantis";

console.log("remarkKroki is:", remarkKroki);

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Garden of Atlantis",
  tagline: "Garden of Atlantis: all my skills, all my knowledge, all my quests",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: `https://${organizationName}.github.io`,
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: `/${projectName}/`,

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName,
  projectName,

  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  plugins: [
    // path.resolve(__dirname, "plugins/skills-levels.js"),
    path.resolve(__dirname, "plugins/skills-levels-plugin.js"),
  ],

  presets: [
    [
      "@docusaurus/preset-classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          routeBasePath: "/",
          sidebarCollapsed: true,
          editUrl: `https://github.com/${organizationName}/${projectName}/tree/main/`,
          remarkPlugins: [[remarkKroki, { alias: ["plantuml"] }]],
        },
        blog: false,
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
        gtag: {
          trackingID: "G-6XYWE26Y5J",
          anonymizeIP: false,
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        respectPrefersColorScheme: true,
        disableSwitch: false,
      },
      navbar: {
        title: "Garden of Atlantis",
        logo: {
          alt: "garden-of-atlantis",
          src: "img/alchemical-sun.svg",
        },
        items: [
          {
            href: "https://t.me/zhora_velosiped",
            position: "right",
            className: "header-telegram-link",
          },
          {
            href: "https://www.instagram.com/ootekai/",
            position: "right",
            className: "header-instagram-link",
          },
          {
            href: "https://soundcloud.com/ootekai",
            position: "right",
            label: "🔊",
          },
          {
            href: `https://github.com/${organizationName}/${projectName}`,
            position: "right",
            className: "header-github-link",
            "aria-label": "GitHub repository",
          },
        ],
      },
      prism: {
        theme: themes.github,
        darkTheme: themes.dracula,
      },
      // algolia: {
      //   appId: "",
      //   apiKey: "",
      //   indexName: "",
      // },
    }),
};

module.exports = config;
