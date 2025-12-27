use std::path::Path;

#[tauri::command(rename_all = "snake_case")]
pub async fn get_parent_path(path: String) -> Result<Option<String>, String> {
    let path = Path::new(&path);

    if !path.exists() {
        return Err("Path does not exist".to_string());
    }

    match path.parent() {
        Some(parent) => {
            let parent_str = parent.to_string_lossy().to_string();
            if parent_str.is_empty() || parent_str.is_empty() {
                return Ok(None);
            }

            Ok(Some(parent_str))
        }
        None => Ok(None),
    }
}
