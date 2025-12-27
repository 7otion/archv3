use std::fs;
use std::path::Path;

use crate::files::IFile;
use crate::files::file_details::file_details;

#[tauri::command(rename_all = "snake_case")]
pub fn fetch_files(
    folder_path: String,
    extension_filter: Option<String>,
) -> Result<Vec<IFile>, String> {
    let path = Path::new(&folder_path);
    if !path.exists() || !path.is_dir() {
        return Err("Invalid folder path".into());
    }

    let mut files = Vec::new();
    for entry in fs::read_dir(path).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;

        let filename = entry
            .file_name()
            .into_string()
            .map_err(|e| format!("Could not parse filename: {:?}", e))?;
        if let Some(ref ext_filter) = extension_filter {
            if !filename
                .to_lowercase()
                .ends_with(&ext_filter.to_lowercase())
            {
                continue;
            }
        }

        let entry_details =
            file_details(entry.path().to_string_lossy().to_string()).map_err(|e| e.to_string())?;

        files.push(entry_details);
    }

    Ok(files)
}
