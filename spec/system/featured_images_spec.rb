# frozen_string_literal: true

RSpec.describe "Featured images" do
  let!(:theme) { upload_theme_component }

  fab!(:tag) { Fabricate(:tag, name: "featured") }
  fab!(:upload, :image_upload)
  fab!(:topic) { Fabricate(:topic_with_op, image_upload: upload, tags: [tag]) }

  it "renders the featured image as an <img> element with a source" do
    visit("/")

    expect(page).to have_css(".featured-topic .featured-topic-image img[src]")
  end

  it "links the image to the topic but keeps it out of the tab order" do
    visit("/")

    image_link = find(".featured-topic .featured-topic-image")
    expect(image_link["href"]).to include("/t/#{topic.slug}/#{topic.id}")
    expect(image_link["tabindex"]).to eq("-1")
    expect(image_link["aria-hidden"]).to eq("true")
  end
end
