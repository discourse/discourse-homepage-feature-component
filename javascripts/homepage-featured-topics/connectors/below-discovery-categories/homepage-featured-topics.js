export default {
  setupComponent(args, component) {
    component.set(
      "switchOutletToBelowDiscoveryCategories",
      settings.featured_content_position === "below_discovery_categories"
    );
  },
};
