import Component from "@ember/component";
import { classNames } from "@ember-decorators/component";
import FeaturedHomepageTopics from "../../components/featured-homepage-topics";

@classNames("discovery-list-controls-above-outlet", "homepage-featured-topics")
export default class HomepageFeaturedTopics extends Component {
  init() {
    super.init(...arguments);
    this.set(
      "switchOutlet",
      settings.featured_content_position === "above_main_container" ||
        settings.featured_content_position === "below_discovery_categories" ||
        settings.show_on === "all"
    );
  }

  <template>
    {{#unless this.switchOutlet}}
      <FeaturedHomepageTopics />
    {{/unless}}
  </template>
}
