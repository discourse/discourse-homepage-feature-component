// `featured_tag` changed from a single string setting to a tag list
// (type: list, list_type: tag). A previously saved value such as "featured" is
// already a valid single-item list value, so no transformation is needed — but
// this migration must exist so the existing value survives the change in setting
// type. Without it, the old override is dropped and the setting resets to its
// default.
export default function migrate(settings) {
  return settings;
}
