import { ajax } from "discourse/lib/ajax";
import Topic from "discourse/models/topic";
import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  setupComponent(args, component) {
    var topMenuRoutes = Discourse.SiteSettings.top_menu
      .split("|")
      .map(function(route) {
        return "/" + route;
      });
    var homeRoute = topMenuRoutes[0];
    withPluginApi("0.1", api => {
      api.onPageChange((url, title) => {
        var home = url === "/" || url.match(/^\/\?/) || url === homeRoute;

        if (settings.show_on === "homepage") {
          var showBannerHere = home;
        } else if (settings.show_on === "top_menu") {
          var showBannerHere = topMenuRoutes.indexOf(url) > -1 || home;
        } else {
          var showBannerHere =
            url.match(/.*/) && !url.match(/search.*/) && !url.match(/admin.*/);
        }

        if (showBannerHere) {
          $("html").addClass("homepage-featured-topics");
          component.set("displayHomepageFeatured", true);
          component.set("loadingFeatures", true);
          var titleElement = document.createElement("h2");
          titleElement.innerHTML = settings.title_text;
          component.set("titleElement", titleElement);
          $(function() {
            ajax("/tags/" + settings.featured_tag + ".json").then(function(
              result
            ) {
              // Get posts from tag
              let customFeaturedTopics = [];
              result.topic_list.topics.slice(0, 3).forEach(function(topic) {
                customFeaturedTopics.push(Topic.create(topic));
              });
              component.set("loadingFeatures", false);
              component.set("customFeaturedTopics", customFeaturedTopics);
            });
          });
        } else {
          $("html").removeClass("homepage-featured-topics");
          component.set("displayHomepageFeatured", false);
        }

        if (settings.show_for === "everyone") {
          component.set("show_for", true);
        } else if (
          settings.show_for === "logged_out" &&
          !api.getCurrentUser()
        ) {
          component.set("show_for", true);
        } else if (settings.show_for === "logged_in" && api.getCurrentUser()) {
          component.set("show_for", true);
        } else {
          component.set("show_for", false);
          $("html").removeClass("homepage-featured-topics");
        }
      });
    });
  }
};
