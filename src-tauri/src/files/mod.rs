use serde::Serialize;

pub mod copy_file;
pub mod fetch_files;
pub mod file_details;
pub mod get_available_disks;
pub mod get_folders;
pub mod get_parent_path;
pub mod get_path_segments;
pub mod highlight_path;
pub mod trash;

#[derive(Serialize)]
pub struct IFile {
    pub id: i32,
    pub created_at: String,
    pub updated_at: String,
    pub path: String,
    pub name: String,
    pub size: u64,
    pub mime: String,
    pub extension: String,
    pub ctime: u64,
    pub mtime: u64,
    pub file_type: String,
    pub file_metadata_id: Option<i32>,
    pub scrape_url: Option<String>,
    pub download_url: Option<String>,
    pub is_directory: u8,
}
