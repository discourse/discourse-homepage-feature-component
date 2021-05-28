import { ajax } from "discourse/lib/ajax";
import Topic from "discourse/models/topic";
import { withPluginApi } from "discourse/lib/plugin-api";
import { getOwner } from "discourse-common/lib/get-owner";

const FEATURED_CLASS = "homepage-featured-topics";

export default {
  setupComponent(args, component) {
    withPluginApi("0.1", (api) => {
      api.onPageChange((url) => {
        if (!settings.featured_tag) {
          return;
        }

        const topMenuRoutes = this.siteSettings.top_menu
          .split("|")
          .filter(Boolean);

        const homeRoute = topMenuRoutes[0];
        const router = getOwner(this).lookup("router:main");
        const route = router.currentRoute;

        let showBannerHere;
        if (settings.show_on === "homepage") {
          showBannerHere = route.localName === homeRoute;
        } else if (settings.show_on === "top_menu") {
          showBannerHere = topMenuRoutes.includes(route.localName);
        }

        if (showBannerHere) {
          document.querySelector("html").classList.add(FEATURED_CLASS);

          component.setProperties({
            displayHomepageFeatured: true,
          });

          ajax(`/tag/${settings.featured_tag}.json`)
            .then((result) => {
              // Get posts from tag
              let customFeaturedTopics = [];
              result.topic_list.topics.forEach((topic) =>
                topic.image_url
                  ? customFeaturedTopics.push(Topic.create(topic))
                  : ""
              );

              customFeaturedTopics = customFeaturedTopics.slice(
                0,
                settings.number_of_topics
              );

              if (customFeaturedTopics.length && settings.show_title) {
                const titleElement = document.createElement("h2");
                titleElement.innerHTML = settings.title_text;
                component.set("titleElement", titleElement);
              }

              if (settings.sort_by_created) {
                customFeaturedTopics = customFeaturedTopics.sort(function (
                  a,
                  b
                ) {
                  return a.created_at > b.created_at
                    ? -1
                    : a.created_at < b.created_at
                    ? 1
                    : 0;
                });
              }

              component.set("customFeaturedTopics", customFeaturedTopics);

              if (customFeaturedTopics.length) {
                component.set("displayCustomFeatured", true);
              } else {
                component.set("displayCustomFeatured", false);
              }
            })
            .catch((e) => {
              // the featured tag doesn't exist
              if (e.jqXHR && e.jqXHR.status === 404) {
                document.querySelector("html").classList.remove(FEATURED_CLASS);
                component.set("displayHomepageFeatured", false);
              }
            });
        } else {
          document.querySelector("html").classList.remove(FEATURED_CLASS);
          component.set("displayHomepageFeatured", false);
          component.set("displayCustomFeatured", true);
        }

        if (settings.show_for === "everyone") {
          component.set("showFor", true);
        } else if (
          settings.show_for === "logged_out" &&
          !api.getCurrentUser()
        ) {
          component.set("showFor", true);
        } else if (settings.show_for === "logged_in" && api.getCurrentUser()) {
          component.set("showFor", true);
        } else {
          component.set("showFor", false);
          document.querySelector("html").classList.remove(FEATURED_CLASS);
        }
      });
    });
  },
};
