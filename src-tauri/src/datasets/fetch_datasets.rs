use std::fs;
use std::path::PathBuf;
use std::time::{Duration, SystemTime};
use tauri::{Manager, path::BaseDirectory};

use crate::datasets::{Dataset, RawDataset};

const CACHE_TTL_HOURS: u64 = 1;
const CACHE_FILENAME: &str = "datasets_cache.json";

#[tauri::command(rename_all = "snake_case")]
pub async fn fetch_datasets(
    handle: tauri::AppHandle,
    invalidate_cache: Option<bool>,
) -> Result<Vec<Dataset>, String> {
    let cache_path = get_cache_path(&handle)?;
    let should_invalidate = invalidate_cache.unwrap_or(false);

    if !should_invalidate && is_cache_valid(&cache_path) {
        if let Ok(cached_datasets) = load_from_cache(&cache_path) {
            return Ok(cached_datasets);
        }
    }

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(30))
        .connect_timeout(Duration::from_secs(10))
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let manifest_url =
        "https://raw.githubusercontent.com/7otion/archv3-datasets/master/datasets.json";

    let slugs: Vec<String> = client
        .get(manifest_url)
        .send()
        .await
        .map_err(|e| format!("Failed to fetch dataset manifest from GitHub: {}", e))?
        .json()
        .await
        .map_err(|e| format!("Failed to parse dataset manifest JSON: {}", e))?;

    let base_url = "https://raw.githubusercontent.com/7otion/archv3-datasets/master/datasets/";

    let mut handles = Vec::new();
    for slug in slugs {
        let client_clone = client.clone();
        let base_url_clone = base_url.to_string();
        let handle =
            tokio::spawn(
                async move { fetch_single_dataset(client_clone, slug, base_url_clone).await },
            );
        handles.push(handle);
    }

    let mut datasets = Vec::new();
    for handle in handles {
        match handle.await {
            Ok(Ok(dataset)) => datasets.push(dataset),
            Ok(Err(e)) => return Err(e),
            Err(e) => return Err(format!("Task execution failed: {}", e)),
        }
    }

    if let Err(e) = save_to_cache(&cache_path, &datasets) {
        eprintln!("Warning: Failed to save cache: {}", e);
    }

    Ok(datasets)
}

async fn fetch_single_dataset(
    client: reqwest::Client,
    slug: String,
    base_url: String,
) -> Result<Dataset, String> {
    let file_url = format!("{base_url}{slug}/{slug}-dataset.json");

    let response = client
        .get(&file_url)
        .send()
        .await
        .map_err(|e| format!("Failed to fetch dataset {}: {}", slug, e))?;

    if !response.status().is_success() {
        return Err(format!(
            "HTTP error for dataset {}: {} {}",
            slug,
            response.status().as_u16(),
            response.status().canonical_reason().unwrap_or("Unknown")
        ));
    }

    let size = response
        .headers()
        .get("content-length")
        .and_then(|val| val.to_str().ok())
        .and_then(|s| s.parse::<u64>().ok())
        .unwrap_or(0);

    let response_text = response
        .text()
        .await
        .map_err(|e| format!("Failed to get response text for {}: {}", slug, e))?;

    let raw_dataset: RawDataset = serde_json::from_str(&response_text).map_err(|e| {
        format!(
            "Failed to parse dataset {}: {} | Text: {}",
            slug,
            e,
            &response_text[..500.min(response_text.len())]
        )
    })?;

    let dataset = Dataset {
        id: raw_dataset.metadata.id.clone(),
        title: raw_dataset.metadata.title.clone(),
        description: raw_dataset.metadata.description.clone(),
        author: raw_dataset.metadata.author.clone(),
        updated_at: raw_dataset.metadata.updated_at.clone(),
        version: raw_dataset.metadata.version.clone(),
        categories_count: raw_dataset.categories.len(),
        tags_count: raw_dataset.tags.len(),
        metadata_attributes_count: raw_dataset.content_metadata_attributes.len(),
        demo_data_count: raw_dataset.demo_data.as_ref().map_or(0, |data| data.len()),
        size,
        json: raw_dataset,
    };

    Ok(dataset)
}

fn get_cache_path(handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    let app_cache_dir = handle
        .path()
        .resolve("cache".to_string(), BaseDirectory::AppConfig)
        .map_err(|e| format!("Failed to resolve App Config directory: {}", e))?;

    fs::create_dir_all(&app_cache_dir)
        .map_err(|e| format!("Failed to create cache directory: {}", e))?;

    Ok(app_cache_dir.join(CACHE_FILENAME))
}

fn is_cache_valid(cache_path: &PathBuf) -> bool {
    if let Ok(metadata) = fs::metadata(cache_path) {
        if let Ok(modified) = metadata.modified() {
            if let Ok(elapsed) = SystemTime::now().duration_since(modified) {
                return elapsed < Duration::from_secs(CACHE_TTL_HOURS * 3600);
            }
        }
    }
    false
}

fn load_from_cache(cache_path: &PathBuf) -> Result<Vec<Dataset>, String> {
    let data =
        fs::read_to_string(cache_path).map_err(|e| format!("Failed to read cache file: {}", e))?;

    serde_json::from_str(&data).map_err(|e| format!("Failed to deserialize cache: {}", e))
}

fn save_to_cache(cache_path: &PathBuf, datasets: &Vec<Dataset>) -> Result<(), String> {
    let json = serde_json::to_string(datasets)
        .map_err(|e| format!("Failed to serialize datasets: {}", e))?;

    fs::write(cache_path, json).map_err(|e| format!("Failed to write cache file: {}", e))?;

    Ok(())
}
