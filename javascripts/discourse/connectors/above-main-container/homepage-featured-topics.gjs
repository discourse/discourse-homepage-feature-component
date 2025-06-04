import Component from "@ember/component";
import { classNames } from "@ember-decorators/component";
import FeaturedHomepageTopics from "../../components/featured-homepage-topics";

@classNames("above-main-container-outlet", "homepage-featured-topics")
export default class HomepageFeaturedTopics extends Component {
  init() {
    super.init(...arguments);
    this.set(
      "switchOutletToAboveMainContainer",
      settings.featured_content_position === "above_main_container" ||
        settings.show_on === "all"
    );
  }

  <template>
    {{#if this.switchOutletToAboveMainContainer}}
      <FeaturedHomepageTopics />
    {{/if}}
  </template>
}
