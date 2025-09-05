const path = require("path");

module.exports = {
  i18n: {
    defaultLocale: "en",
    locales: ["en", "zh", "es", "pt", "ru", "tr", "ko", "ja", "vi", "id"],
    localeDetection: false,
  },
  fallbackLng: "en",
  ns: ["common", "header"],
  defaultNS: "common",
  localePath: path.resolve("./public/locales"),
  reloadOnPrerender: process.env.NODE_ENV === "development",
};