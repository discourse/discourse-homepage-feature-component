export default {
  setupComponent(args, component) {
      component.set("switchOutlet", (settings.above_main_container || settings.show_on === "all"));
  },
};
