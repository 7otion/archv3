use std::fs;
use std::path::Path;
use tauri::Manager;
use tauri::path::BaseDirectory;

use crate::utils::protected_paths::PROTECTED_PATHS;

#[tauri::command(rename_all = "snake_case")]
pub fn copy_file(
    handle: tauri::AppHandle,
    file_path: String,
    output_folder: String,
    output_file_name: String,
) -> Result<String, String> {
    let file_path = Path::new(&file_path);
    if !file_path.exists() || !file_path.is_file() {
        return Err("Copy File: Invalid file path".into());
    }

    let canonical = file_path
        .canonicalize()
        .map_err(|_| "Copy File: Invalid file path")?;
    for protected in PROTECTED_PATHS {
        let protected_path = Path::new(protected);
        if canonical.starts_with(protected_path) {
            return Err("Refusing to copy a protected system path.".into());
        }
    }

    let allowed_dir = handle
        .path()
        .resolve("", BaseDirectory::AppConfig)
        .map_err(|_| "Failed to resolve allowed directory")?;

    let output_path = Path::new(&output_folder).join(&output_file_name);
    if !output_path.is_absolute() {
        return Err("Output path must be absolute".into());
    }

    let output_path_abs = output_path
        .canonicalize()
        .unwrap_or_else(|_| output_path.clone());

    for protected in PROTECTED_PATHS {
        let protected_path = Path::new(protected);
        if output_path_abs.starts_with(protected_path) {
            return Err("Refusing to copy to a protected system path.".into());
        }
    }

    if let Some(parent) = output_path_abs.parent() {
        if !parent.exists() {
            if !parent.starts_with(&allowed_dir) {
                return Err(
                    "Output path does not exist and is not inside allowed directory".into(),
                );
            }
            fs::create_dir_all(parent).map_err(|_| "Failed to create output directory")?;
        }
    }

    fs::copy(file_path, &output_path_abs).map_err(|_| "Failed to copy file")?;
    Ok(output_path_abs.to_string_lossy().to_string())
}
