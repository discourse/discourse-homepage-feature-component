# frozen_string_literal: true

RSpec.describe "Pagination", type: :system do
  let!(:theme) { upload_theme_component }
  fab!(:tag) { Fabricate(:tag, name: "featured") }
  fab!(:upload) { Fabricate(:image_upload) }

  describe "without enough topics to page" do
    fab!(:topics) { Fabricate.times(3, :topic_with_op, image_upload: upload, tags: [tag]) }
    it "should not allow pagination even if max_number_of_topics > number_of_topics" do
      theme.update_setting(:number_of_topics, 3)
      theme.update_setting(:max_number_of_topics, 6)
      theme.save!

      visit("/")
      expect(page).to have_css(".featured-topics .featured-topic", count: 3)
      expect(page).not_to have_css(".featured-topics-controls .page-button-container")
      expect(page).not_to have_css(".featured-topics-controls .left-page-button")
      expect(page).not_to have_css(".featured-topics-controls .right-page-button")
    end
  end
  
  describe "with plenty of topics to page" do
    fab!(:topics) { Fabricate.times(8, :topic_with_op, image_upload: upload, tags: [tag]) }

    it "should not allow pagination if max_number_of_topics <= number_of_topics" do
      theme.update_setting(:number_of_topics, 3)
      theme.update_setting(:max_number_of_topics, 3)
      theme.save!

      visit("/")
      expect(page).to have_css(".featured-topics .featured-topic", count: 3)
      expect(page).not_to have_css(".featured-topics-controls .page-button-container")
      expect(page).not_to have_css(".featured-topics-controls .left-page-button")
      expect(page).not_to have_css(".featured-topics-controls .right-page-button")

      # max_number_of_topics lower than number_of_topics should have no effect
      theme.update_setting(:max_number_of_topics, 2)
      theme.save!

      visit("/")
      expect(page).to have_css(".featured-topics .featured-topic", count: 3)
      expect(page).not_to have_css(".featured-topics-controls .page-button-container")
      expect(page).not_to have_css(".featured-topics-controls .left-page-button")
      expect(page).not_to have_css(".featured-topics-controls .right-page-button")

      theme.update_setting(:max_number_of_topics, 0)
      theme.save!

      visit("/")
      expect(page).to have_css(".featured-topics .featured-topic", count: 3)
      expect(page).not_to have_css(".featured-topics-controls .page-button-container")
      expect(page).not_to have_css(".featured-topics-controls .left-page-button")
      expect(page).not_to have_css(".featured-topics-controls .right-page-button")
    end

    it "should allow pagination if max_number_of_topics > number_of_topics" do
      theme.update_setting(:number_of_topics, 3)
      theme.update_setting(:max_number_of_topics, 8)
      theme.save!

      # First page should have no left arrow
      visit("/")
      expect(page).to have_css(".featured-topics .featured-topic", count: 3)
      expect(page).to have_css(".featured-topics-controls .page-button-container")
      expect(page).to have_css(".featured-topics-controls .right-page-button")
      expect(page).not_to have_css(".featured-topics-controls .left-page-button")

      # Second page should have both arrows
      find(".featured-topics-controls .right-page-button").click
      expect(page).to have_css(".featured-topics .featured-topic", count: 3)
      expect(page).to have_css(".featured-topics-controls .page-button-container")
      expect(page).to have_css(".featured-topics-controls .right-page-button")
      expect(page).to have_css(".featured-topics-controls .left-page-button")

      # Third page should have no right arrow, and only 2 featured topics
      find(".featured-topics-controls .right-page-button").click
      expect(page).to have_css(".featured-topics .featured-topic", count: 2)
      expect(page).to have_css(".featured-topics-controls .page-button-container")
      expect(page).not_to have_css(".featured-topics-controls .right-page-button")
      expect(page).to have_css(".featured-topics-controls .left-page-button")

      # Back to second page
      find(".featured-topics-controls .left-page-button").click
      expect(page).to have_css(".featured-topics .featured-topic", count: 3)
      expect(page).to have_css(".featured-topics-controls .page-button-container")
      expect(page).to have_css(".featured-topics-controls .right-page-button")
      expect(page).to have_css(".featured-topics-controls .left-page-button")
    end
  end
end
