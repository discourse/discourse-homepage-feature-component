import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { service } from "@ember/service";
import getURL from "discourse/lib/get-url";
import { emojiUnescape } from "discourse/lib/text";
import { defaultHomepage } from "discourse/lib/utilities";
import { i18n } from "discourse-i18n";

const FEATURED_CLASS = "featured-homepage-topics";

export default class FeaturedHomepageTopics extends Component {
  @service router;
  @service store;
  @service siteSettings;
  @service currentUser;
  @service keyValueStore;

  @tracked featuredTagTopics = null;
  @tracked
  toggleTopics =
    this.keyValueStore.getItem("toggleTopicsState") === "true" || false;

  constructor() {
    super(...arguments);
    this.router.on("routeDidChange", this.checkShowHere);
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.router.off("routeDidChange", this.checkShowHere);
  }

  @action
  toggle() {
    this.toggleTopics = !this.toggleTopics;
    this.keyValueStore.setItem("toggleTopicsState", this.toggleTopics);
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
    return i18n(themePrefix("featured_topic_title")) || settings.title_text;
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

  emojiTitle(t) {
    return emojiUnescape(t);
  }

  topicHref(t) {
    return getURL(
      `/t/${t.slug}/${t.id}/${
        settings.always_link_to_first_post ? "" : t.last_read_post_number
      }`
    );
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
          topic.image_url && (!settings.hide_closed_topics || !topic.closed)
      )
      .slice(0, settings.number_of_topics);
  }
}
