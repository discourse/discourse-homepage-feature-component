import Component from "@ember/component";
import FeaturedHomepageTopics from "_fake_theme/discourse/components/featured-homepage-topics";
import { classNames } from "@ember-decorators/component";

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
