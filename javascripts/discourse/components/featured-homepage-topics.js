import discourseComputed from "discourse-common/utils/decorators";
import Component from "@ember/component";
import { inject as service } from "@ember/service";
import Topic from "discourse/models/topic";
import { defaultHomepage } from "discourse/lib/utilities";

export default Component.extend({
  classNameBindings: ["featured-homepage-topics"],
  router: service(),
  titleElement: null,
  featuredTagTopics: null,

  init() {
    this._super(...arguments);
    let sortOrder = settings.sort_by_created ? "created" : "activity";
    if (settings.featured_tag) {
      this.store
        .findFiltered("topicList", {
          filter: "latest",
          params: {
            tags: [`${settings.featured_tag}`],
            order: sortOrder,
          },
        })
        .then((topicList) => {
          let featuredTagTopics = [];

          topicList.topics.forEach((topic) =>
            topic.image_url ? featuredTagTopics.push(Topic.create(topic)) : ""
          );

          this.set(
            "featuredTagTopics",
            featuredTagTopics.slice(0, settings.number_of_topics)
          );
        });
    }
  },

  @discourseComputed("router.currentRoute", "router.currentRouteName")
  showHere(currentRoute, currentRouteName) {
    if (currentRoute) {
      if (settings.show_on === "homepage") {
        return currentRouteName === `discovery.${defaultHomepage()}`;
      } else if (settings.show_on === "top_menu") {
        const topMenuRoutes = this.siteSettings.top_menu
          .split("|")
          .filter(Boolean);
        return topMenuRoutes.includes(currentRoute.localName);
      } else if (settings.show_on === "all") {
        return (
          currentRouteName.indexOf("editCategory") &&
          currentRouteName.indexOf("admin") &&
          currentRouteName.indexOf("full-page-search")
        );
      } else {
        return false;
      }
    }
  },

  @discourseComputed()
  showTitle() {
    if (settings.show_title) {
      const titleElement = document.createElement("h2");
      titleElement.innerHTML = settings.title_text;
      return titleElement;
    }
  },

  @discourseComputed()
  showFor() {
    if (settings.show_for === "everyone") {
      return true;
    } else if (settings.show_for === "logged_out" && !this.currentUser) {
      return true;
    } else if (settings.show_for === "logged_in" && this.currentUser) {
      return true;
    } else {
      document.querySelector("html").classList.remove(FEATURED_CLASS);
      return false;
    }
  },
});
