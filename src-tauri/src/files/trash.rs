use std::path::{Path, PathBuf};
use trash::delete;

use crate::utils::protected_paths::PROTECTED_PATHS;

#[tauri::command(rename_all = "snake_case")]
pub async fn trash(path: String) -> Result<bool, String> {
    let file_path = PathBuf::from(&path);
    let canonical = file_path
        .canonicalize()
        .map_err(|_| "Trash: Invalid file path")?;

    for protected in PROTECTED_PATHS {
        let protected_path = Path::new(protected);
        if canonical.starts_with(protected_path) {
            return Err("Refusing to trash a protected system path.".into());
        }
    }

    if !canonical.exists() {
        return Err("File or directory does not exist".into());
    }

    delete(&canonical).map_err(|e| format!("Failed to trash: {}", e))?;
    Ok(true)
}
