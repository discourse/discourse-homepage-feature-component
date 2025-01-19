export default {
  setupComponent(args, component) {
    component.set(
      "switchOutletToAboveMainContainer",
      settings.featured_content_position === "above_main_container" ||
        settings.show_on === "all"
    );
  },
};
