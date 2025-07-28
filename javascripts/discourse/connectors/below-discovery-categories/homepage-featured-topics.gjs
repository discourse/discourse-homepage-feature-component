import Component from "@ember/component";
import { classNames } from "@ember-decorators/component";
import FeaturedHomepageTopics from "../../components/featured-homepage-topics";

@classNames("below-discovery-categories-outlet", "homepage-featured-topics")
export default class HomepageFeaturedTopics extends Component {
  init() {
    super.init(...arguments);
    this.set(
      "switchOutletToBelowDiscoveryCategories",
      settings.featured_content_position === "below_discovery_categories"
    );
  }

  <template>
    {{#if this.switchOutletToBelowDiscoveryCategories}}
      <FeaturedHomepageTopics />
    {{/if}}
  </template>
}
