// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');
const organizationName = "dennislapchenko";
const projectName = "garden-of-wiki";

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Garden of Wiki',
  tagline: 'My Digital Garden of Wikipedia: all I know, practice and aspire to.',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: `https://${organizationName}.github.io`,
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: `/${projectName}/`,

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName,
  projectName,

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: "/",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: `https://github.com/${organizationName}/${projectName}/tree/main/`,
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        respectPrefersColorScheme: true,
        disableSwitch: true,
      },
      navbar: {
        title: 'Garden of Wiki',
        logo: {
          alt: 'garden-of-wiki',
          src: 'img/logo.svg',
        },
        items: [
          {
            href: "https://www.instagram.com/ootekai/",
            position: "right",
            label: "insta",
          },
          {
            href: "https://github.com/dennislapchenko",
            position: "right",
            label: "gh",
          },
          {
            href: `https://github.com/${organizationName}/${projectName}`,
            position: "right",
            className: "header-github-link",
            "aria-label": "GitHub repository",
          },
        ]
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      }
      // algolia: {
      //   appId: "",
      //   apiKey: "",
      //   indexName: "",
      // },
    }),
};

module.exports = config;
