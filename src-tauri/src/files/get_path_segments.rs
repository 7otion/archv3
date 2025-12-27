use std::path::Path;

#[tauri::command(rename_all = "snake_case")]
pub async fn get_path_segments(path: String) -> Result<Vec<String>, String> {
    let path = Path::new(&path);

    if !path.exists() {
        return Err("Path does not exist".to_string());
    }

    let mut segments = Vec::new();
    let path_str = path.to_string_lossy();

    let components: Vec<&str> = path_str.split('\\').filter(|s| !s.is_empty()).collect();
    for component in components {
        segments.push(component.to_string());
    }

    if segments.is_empty() {
        segments.push(path.to_string_lossy().to_string());
    }

    Ok(segments)
}
