use std::{fs, path::Path};
use tauri::{Manager, path::BaseDirectory};
use uuid::Uuid;

#[tauri::command(rename_all = "snake_case")]
pub async fn download_dataset_image(
    handle: tauri::AppHandle,
    filename: String,
) -> Result<String, String> {
    let slug = filename.split('-').next().ok_or("Invalid filename")?;
    let path = format!("datasets/{}/{}", slug, filename);
    let url = format!(
        "https://raw.githubusercontent.com/7otion/archv3-datasets/master/{}",
        path
    );

    let response = reqwest::get(&url)
        .await
        .map_err(|e| format!("Failed to download image: {}", e))?;

    if !response.status().is_success() {
        return Err(format!(
            "Failed to download image: HTTP {}",
            response.status()
        ));
    }

    let image_bytes = response
        .bytes()
        .await
        .map_err(|e| format!("Failed to read image data: {}", e))?;

    let extension = Path::new(&filename)
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("webp");
    let uuid_filename = format!("{}.{}", Uuid::new_v4(), extension);

    let covers_dir = handle
        .path()
        .resolve("covers", BaseDirectory::AppConfig)
        .map_err(|_| "Failed to resolve covers directory")?;
    fs::create_dir_all(&covers_dir).map_err(|_| "Failed to create covers directory")?;

    let file_path = covers_dir.join(&uuid_filename);
    fs::write(&file_path, &image_bytes).map_err(|e| format!("Failed to save image: {}", e))?;

    Ok(file_path.to_string_lossy().to_string())
}
