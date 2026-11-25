// Site estático da Débora Lima. Base: kayrahub-ops/meio_fio (docs/ARQUITETURA.md).
// Textos vindos de dados são SEMPRE escapados (HTML vira texto); links só https://.
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const urlSegura = (u) => (/^https:\/\/[^\s"'<>]+$/.test(String(u ?? "")) ? String(u) : "#");

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy({ "src/.htaccess": ".htaccess" });
  eleventyConfig.addFilter("esc", esc);
  eleventyConfig.addFilter("urlSegura", urlSegura);
  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
