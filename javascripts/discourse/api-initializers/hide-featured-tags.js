import { settings } from "virtual:theme";
import { apiInitializer } from "discourse/lib/api";

export default apiInitializer((api) => {
  if (!settings.hide_featured_tag) {
    return;
  }

  if (api.getCurrentUser()?.staff) {
    return;
  }

  const tags = settings.featured_tag
    .split("|")
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (tags.length === 0) {
    return;
  }

  const selectors = tags
    .flatMap((tag) => [
      `.tag-drop li[data-name="${tag}"]`,
      `[data-tag-name="${tag}"]`,
    ])
    .join(", ");

  const style = document.createElement("style");
  style.textContent = `${selectors} { display: none !important; }`;
  document.head.appendChild(style);
});
