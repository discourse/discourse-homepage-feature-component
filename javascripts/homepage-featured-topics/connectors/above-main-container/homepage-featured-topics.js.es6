import { ajax } from "discourse/lib/ajax";
import Topic from "discourse/models/topic";
import { withPluginApi } from "discourse/lib/plugin-api";

const FEATURED_CLASS = "homepage-featured-topics";

export default {
  setupComponent(args, component) {
    const topMenuRoutes = this.siteSettings.top_menu
      .split("|")
      .filter(Boolean)
      .map((route) => `/${route}`);

    const homeRoute = topMenuRoutes[0];

    withPluginApi("0.1", (api) => {
      api.onPageChange((url) => {
        if (!settings.featured_tag) {
          return;
        }

        const home = url === "/" || url.match(/^\/\?/) || url === homeRoute;

        let showBannerHere;
        if (settings.show_on === "homepage") {
          showBannerHere = home;
        } else if (settings.show_on === "top_menu") {
          showBannerHere = topMenuRoutes.indexOf(url) > -1 || home;
        } else {
          showBannerHere =
            url.match(/.*/) && !url.match(/search.*/) && !url.match(/admin.*/);
        }

        if (showBannerHere) {
          document.querySelector("html").classList.add(FEATURED_CLASS);

          component.setProperties({
            displayHomepageFeatured: true,
          });

          const titleElement = document.createElement("h2");
          titleElement.innerHTML = settings.title_text;
          component.set("titleElement", titleElement);

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

              if (settings.sort_by_created) {
                customFeaturedTopics = customFeaturedTopics.sort(function (
                  a,
                  b
                ) {
                  return a.created_at < b.created_at
                    ? -1
                    : a.created_at > b.created_at
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
