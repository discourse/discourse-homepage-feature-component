import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
import { defaultHomepage } from "discourse/lib/utilities";
import I18n from "I18n";

const FEATURED_CLASS = "featured-homepage-topics";

export default class FeaturedHomepageTopics extends Component {
  @service router;
  @service store;
  @service siteSettings;
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
    document.body.classList.toggle(FEATURED_CLASS, this.showHere);
  }

  get showHere() {
    const { currentRoute, currentRouteName } = this.router;

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
          return !/editCategory|admin|full-page-search/.test(currentRouteName);
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
  async getBannerTopics() {
    if (!settings.featured_tag) {
      return;
    }

    const sortOrder = settings.sort_by_created ? "created" : "activity";
    const topicList = await this.store.findFiltered("topicList", {
      filter: "latest",
      params: {
        tags: [`${settings.featured_tag}`],
        order: sortOrder,
      },
    });

    this.featuredTagTopics = topicList.topics
      .filter(
        (topic) =>
          topic.image_url && (!settings.hide_archived_topics || !topic.archived)
      )
      .slice(0, settings.number_of_topics);
  }
}
