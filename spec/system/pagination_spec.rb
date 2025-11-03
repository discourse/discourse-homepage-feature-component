# frozen_string_literal: true

RSpec.describe "Pagination", type: :system do
  let!(:theme) { upload_theme_component }
  fab!(:tag) { Fabricate(:tag, name: "featured") }
  fab!(:upload, :image_upload)

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
      expect(page).not_to have_css(".page-progress-container .page-progress-marker")
    end
  end

  describe "with plenty of topics to page" do
    fab!(:topics) { Fabricate.times(10, :topic_with_op, image_upload: upload, tags: [tag]) }

    describe "without looping enabled" do
      it "should not allow pagination if max_number_of_topics <= number_of_topics" do
        theme.update_setting(:number_of_topics, 3)
        theme.update_setting(:max_number_of_topics, 3)
        theme.save!

        visit("/")
        expect(page).to have_css(".featured-topics .featured-topic", count: 3)
        expect(page).not_to have_css(".featured-topics-controls .page-button-container")
        expect(page).not_to have_css(".featured-topics-controls .left-page-button")
        expect(page).not_to have_css(".featured-topics-controls .right-page-button")
        expect(page).not_to have_css(".page-progress-container .page-progress-marker")

        # max_number_of_topics lower than number_of_topics should have no effect
        theme.update_setting(:max_number_of_topics, 2)
        theme.save!

        visit("/")
        expect(page).to have_css(".featured-topics .featured-topic", count: 3)
        expect(page).not_to have_css(".featured-topics-controls .page-button-container")
        expect(page).not_to have_css(".featured-topics-controls .left-page-button")
        expect(page).not_to have_css(".featured-topics-controls .right-page-button")
        expect(page).not_to have_css(".page-progress-container .page-progress-marker")

        theme.update_setting(:max_number_of_topics, 0)
        theme.save!

        visit("/")
        expect(page).to have_css(".featured-topics .featured-topic", count: 3)
        expect(page).not_to have_css(".featured-topics-controls .page-button-container")
        expect(page).not_to have_css(".featured-topics-controls .left-page-button")
        expect(page).not_to have_css(".featured-topics-controls .right-page-button")
        expect(page).not_to have_css(".page-progress-container .page-progress-marker")
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
        expect_page_progress(1, 3)

        # Second page should have both arrows
        find(".featured-topics-controls .right-page-button").click
        expect(page).to have_css(".featured-topics .featured-topic", count: 3)
        expect(page).to have_css(".featured-topics-controls .page-button-container")
        expect(page).to have_css(".featured-topics-controls .right-page-button")
        expect(page).to have_css(".featured-topics-controls .left-page-button")
        expect_page_progress(2, 3)

        # Third page should have no right arrow, and only 2 featured topics
        find(".featured-topics-controls .right-page-button").click
        expect(page).to have_css(".featured-topics .featured-topic", count: 2)
        expect(page).to have_css(".featured-topics-controls .page-button-container")
        expect(page).not_to have_css(".featured-topics-controls .right-page-button")
        expect(page).to have_css(".featured-topics-controls .left-page-button")
        expect_page_progress(3, 3)

        # Back to second page
        find(".featured-topics-controls .left-page-button").click
        expect(page).to have_css(".featured-topics .featured-topic", count: 3)
        expect(page).to have_css(".featured-topics-controls .page-button-container")
        expect(page).to have_css(".featured-topics-controls .right-page-button")
        expect(page).to have_css(".featured-topics-controls .left-page-button")     
        expect_page_progress(2, 3)
      end

      it "should allow pagination even if last page only has 1 topic" do
        theme.update_setting(:number_of_topics, 3)
        theme.update_setting(:max_number_of_topics, 4)
        theme.save!

        # First page should have a right arrow when there's only 1 topic on the next page
        visit("/")
        expect(page).to have_css(".featured-topics .featured-topic", count: 3)
        expect(page).to have_css(".featured-topics-controls .page-button-container")
        expect(page).to have_css(".featured-topics-controls .right-page-button")
        expect(page).not_to have_css(".featured-topics-controls .left-page-button")
        expect_page_progress(1, 2)

        # Last page should only have left arrow
        find(".featured-topics-controls .right-page-button").click
        expect(page).to have_css(".featured-topics .featured-topic", count: 1)
        expect(page).to have_css(".featured-topics-controls .page-button-container")
        expect(page).not_to have_css(".featured-topics-controls .right-page-button")
        expect(page).to have_css(".featured-topics-controls .left-page-button")
        expect_page_progress(2, 2)
      end
    end

    describe "with looping enabled" do
      before {theme.update_setting(:pages_loop, true)}
      it "should not allow pagination if max_number_of_topics <= number_of_topics" do
        theme.update_setting(:number_of_topics, 3)
        theme.update_setting(:max_number_of_topics, 3)
        theme.save!

        visit("/")
        expect(page).to have_css(".featured-topics .featured-topic", count: 3)
        expect(page).not_to have_css(".featured-topics-controls .page-button-container")
        expect(page).not_to have_css(".featured-topics-controls .left-page-button")
        expect(page).not_to have_css(".featured-topics-controls .right-page-button")
        expect(page).not_to have_css(".page-progress-container .page-progress-marker")

        # max_number_of_topics lower than number_of_topics should have no effect
        theme.update_setting(:max_number_of_topics, 2)
        theme.save!

        visit("/")
        expect(page).to have_css(".featured-topics .featured-topic", count: 3)
        expect(page).not_to have_css(".featured-topics-controls .page-button-container")
        expect(page).not_to have_css(".featured-topics-controls .left-page-button")
        expect(page).not_to have_css(".featured-topics-controls .right-page-button")
        expect(page).not_to have_css(".page-progress-container .page-progress-marker")

        theme.update_setting(:max_number_of_topics, 0)
        theme.save!

        visit("/")
        expect(page).to have_css(".featured-topics .featured-topic", count: 3)
        expect(page).not_to have_css(".featured-topics-controls .page-button-container")
        expect(page).not_to have_css(".featured-topics-controls .left-page-button")
        expect(page).not_to have_css(".featured-topics-controls .right-page-button")
        expect(page).not_to have_css(".page-progress-container .page-progress-marker")
      end

      it "should allow looped pagination if max_number_of_topics > number_of_topics" do
        theme.update_setting(:number_of_topics, 3)
        theme.update_setting(:max_number_of_topics, 8)
        theme.save!

        visit("/")
        # First page
        expect(page).to have_css(".featured-topics .featured-topic", count: 3)
        expect(page).to have_css(".featured-topics-controls .page-button-container")
        expect(page).to have_css(".featured-topics-controls .right-page-button")
        expect(page).to have_css(".featured-topics-controls .left-page-button")
        expect_page_progress(1, 3)

        # Second page 
        find(".featured-topics-controls .right-page-button").click
        expect(page).to have_css(".featured-topics .featured-topic", count: 3)
        expect(page).to have_css(".featured-topics-controls .page-button-container")
        expect(page).to have_css(".featured-topics-controls .right-page-button")
        expect(page).to have_css(".featured-topics-controls .left-page-button")
        expect_page_progress(2, 3)

        # With number_of_topics = 3 and max_number_of_topics = 8, page 3 should only have 2 topic
        find(".featured-topics-controls .right-page-button").click
        expect(page).to have_css(".featured-topics .featured-topic", count: 2)
        expect(page).to have_css(".featured-topics-controls .page-button-container")
        expect(page).to have_css(".featured-topics-controls .right-page-button")
        expect(page).to have_css(".featured-topics-controls .left-page-button")        
        expect_page_progress(3, 3)

        # With looping on, page right from page 3 should return to page 1
        find(".featured-topics-controls .right-page-button").click
        expect(page).to have_css(".featured-topics .featured-topic", count: 3)
        expect(page).to have_css(".featured-topics-controls .page-button-container")
        expect(page).to have_css(".featured-topics-controls .right-page-button")
        expect(page).to have_css(".featured-topics-controls .left-page-button")
        expect_page_progress(1, 3)

        # With looping on, page left from page 1 should return to page 3
        find(".featured-topics-controls .left-page-button").click
        expect(page).to have_css(".featured-topics .featured-topic", count: 2)
        expect(page).to have_css(".featured-topics-controls .page-button-container")
        expect(page).to have_css(".featured-topics-controls .right-page-button")
        expect(page).to have_css(".featured-topics-controls .left-page-button")
        expect_page_progress(3, 3)
      end
    end
  end

  def expect_page_progress(current_page_number, number_of_pages)
    expect(page).to have_css(".page-progress-container .page-progress-marker", count: number_of_pages)
    expect(page).to have_css(".page-progress-container .page-progress-marker.--current-page", count: 1)

    if current_page_number == 1
      expect(page).not_to have_css(".page-progress-container .page-progress-marker.--previous-page")
    else
      expect(page).to have_css(".page-progress-container .page-progress-marker.--previous-page", count: current_page_number - 1)
    end
  end
end
