use serde::{Deserialize, Serialize};

pub mod download_dataset_image;
pub mod fetch_datasets;

#[derive(Serialize, Deserialize, Debug, Clone)]
struct DatasetMetadata {
    id: String,
    title: String,
    description: String,
    author: String,
    updated_at: String,
    version: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct RawDataset {
    metadata: DatasetMetadata,
    content_type: ContentType,
    categories: Vec<Category>,
    tags: Vec<Tag>,
    content_metadata_attributes: Vec<MetadataAttribute>,
    demo_data: Option<Vec<serde_json::Value>>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Dataset {
    id: String,
    title: String,
    description: String,
    author: String,
    updated_at: String,
    version: String,
    categories_count: usize,
    tags_count: usize,
    metadata_attributes_count: usize,
    demo_data_count: usize,
    size: u64,
    json: RawDataset,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct ContentType {
    name: String,
    slug: String,
    shape: String,
    file_type: String,
    description: String,
    cover: Option<String>,
    icon: Option<String>,
    order: Option<i32>,
    pinned: i32,
    docked: i32,
    locked: i32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Category {
    content_type_id: String,
    name: String,
    slug: String,
    description: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Tag {
    content_type_id: String,
    name: String,
    slug: String,
    description: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct MetadataAttribute {
    content_type_id: String,
    name: String,
    attribute_type: String,
    icon: Option<String>,
    order: i32,
    is_array: i32,
    filterable: i32,
    sortable: i32,
    description: String,
}
