# frozen_string_literal: true

RSpec.describe "Featured tags" do
  let!(:theme) { upload_theme_component }

  fab!(:featured_tag) { Fabricate(:tag, name: "featured") }
  fab!(:spotlight_tag) { Fabricate(:tag, name: "spotlight") }
  fab!(:upload, :image_upload)

  fab!(:featured_topic) { Fabricate(:topic_with_op, image_upload: upload, tags: [featured_tag]) }
  fab!(:spotlight_topic) { Fabricate(:topic_with_op, image_upload: upload, tags: [spotlight_tag]) }

  describe "selecting topics by tag" do
    it "features topics from a single tag" do
      visit("/")

      expect(page).to have_css(".featured-topics .featured-topic", count: 1)
    end

    it "features topics from any of the configured tags" do
      theme.update_setting(:featured_tag, "featured|spotlight")
      theme.save!

      visit("/")

      expect(page).to have_css(".featured-topics .featured-topic", count: 2)
    end
  end

  describe "hiding the featured tag from regular users" do
    # checked on the topic page, where the topic's own tags always render; the
    # initializer that hides them runs globally, not just where the component shows
    it "is hidden from anonymous users by default" do
      visit("/t/#{featured_topic.slug}/#{featured_topic.id}")

      # the tag is still in the DOM, but hidden via the injected style
      expect(page).to have_css("[data-tag-name='featured']", visible: :all)
      expect(page).to have_no_css("[data-tag-name='featured']")
    end

    it "is visible to staff" do
      sign_in(Fabricate(:admin))

      visit("/t/#{featured_topic.slug}/#{featured_topic.id}")

      expect(page).to have_css("[data-tag-name='featured']")
    end

    it "is visible to everyone when the setting is disabled" do
      theme.update_setting(:hide_featured_tag, false)
      theme.save!

      visit("/t/#{featured_topic.slug}/#{featured_topic.id}")

      expect(page).to have_css("[data-tag-name='featured']")
    end
  end
end
