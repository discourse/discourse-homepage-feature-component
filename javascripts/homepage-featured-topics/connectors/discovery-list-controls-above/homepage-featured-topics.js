export default {
  setupComponent(args, component) {
    component.set(
      "switchOutlet",
      settings.featured_content_position === "above_main_container" ||
        settings.featured_content_position === "below_discovery_categories" ||
        settings.show_on === "all"
    );
  },
};
