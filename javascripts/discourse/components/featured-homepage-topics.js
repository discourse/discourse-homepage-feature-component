import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
import { defaultHomepage } from "discourse/lib/utilities";

const FEATURED_CLASS = "featured-homepage-topics";

export default class MyComponent extends Component {
  @service router;
  @service store;
  @service siteSettings;
  @tracked titleElement = null;
  @tracked featuredTagTopics = null;

  constructor() {
    super(...arguments);
    this.router.on("routeDidChange", this.checkShowHere);
  }

  willDestroy() {
    this.router.off("routeDidChange", this.checkShowHere);
  }

  @action
  checkShowHere() {
    if (!this.showHere) {
      document.querySelector("body").classList.remove(FEATURED_CLASS);
    } else {
      document.querySelector("body").classList.add(FEATURED_CLASS);
    }
  }

  get showHere() {
    let currentRoute = this.router.currentRoute;
    let currentRouteName = this.router.currentRouteName;

    if (currentRoute) {
      switch (settings.show_on) {
        case "homepage":
          return currentRouteName === `discovery.${defaultHomepage()}`;
        case "top_menu":
          const topMenuRoutes = this.siteSettings.top_menu
            .split("|")
            .filter(Boolean);
          return topMenuRoutes.includes(currentRoute.localName);
        case "all":
          return !["editCategory", "admin", "full-page-search"].some((route) =>
            currentRouteName.includes(route)
          );
        default:
          return false;
      }
    }

    return false;
  }

  get featuredTitle() {
    // falls back to setting for backwards compatibility
    return I18n.t(themePrefix("featured_topic_title")) || settings.title_text;
  }

  get showFor() {
    if (
      settings.show_for === "everyone" ||
      (settings.show_for === "logged_out" && !this.currentUser) ||
      (settings.show_for === "logged_in" && this.currentUser)
    ) {
      return true;
    } else {
      return false;
    }
  }

  get mobileStyle() {
    if (
      settings.show_all_always &&
      settings.mobile_style === "stacked_on_smaller_screens"
    ) {
      return "-mobile-stacked";
    } else if (settings.show_all_always) {
      return "-mobile-horizontal";
    } else {
      return;
    }
  }

  @action
  getBannerTopics() {
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
          this.featuredTagTopics = topicList.topics
            .filter(
              (topic) =>
                topic.image_url &&
                (!settings.hide_archived_topics || !topic.archived)
            )
            .slice(0, settings.number_of_topics);
        });
    }
  }
}
