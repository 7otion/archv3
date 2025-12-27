use std::{fs::metadata, path::Path};

use crate::files::IFile;

#[tauri::command(rename_all = "snake_case")]
pub fn file_details(path: String) -> Result<IFile, String> {
    let filepath = Path::new(&path);
    let filename = match filepath.file_name() {
        Some(name) => name.to_string_lossy().to_string(),
        None => return Err("File Details: Invalid file path".to_string()),
    };

    if filename.starts_with('.') {
        return Err("File is hidden".to_string());
    }

    let file_path_str = filepath.to_str().ok_or("File Details: Invalid file path")?;

    let metadata =
        metadata(file_path_str).map_err(|e| format!("Failed to read metadata: {}", e))?;

    let is_directory = metadata.is_dir();
    let (extension, mime, file_type, size) = if is_directory {
        (
            "".to_string(),
            "directory".to_string(),
            "directory".to_string(),
            0u64,
        )
    } else {
        let ext = Path::new(&filename)
            .extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("")
            .to_lowercase()
            .to_owned();
        (
            ext.clone(),
            get_mime_type_from_extension(&ext),
            get_file_type_from_extension(&ext),
            metadata.len(),
        )
    };

    let ctime = metadata
        .created()
        .map(|time| {
            time.duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs()
        })
        .unwrap_or(0);

    let mtime = metadata
        .modified()
        .map(|time| {
            time.duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs()
        })
        .unwrap_or(0);

    let file_details = IFile {
        id: 0,
        created_at: String::new(),
        updated_at: String::new(),
        path: file_path_str.to_string(),
        name: filename,
        size,
        mime,
        extension,
        ctime,
        mtime,
        file_type,
        file_metadata_id: None,
        scrape_url: None,
        download_url: None,
        is_directory: if is_directory { 1 } else { 0 },
    };

    Ok(file_details)
}

fn get_file_type_from_extension(extension: &str) -> String {
    match extension.to_lowercase().as_str() {
        "mp4" | "avi" | "mkv" | "mov" | "wmv" | "flv" | "webm" | "m4v" | "3gp" => {
            "video".to_string()
        }
        "jpg" | "jpeg" | "png" | "gif" | "bmp" | "tiff" | "webp" | "svg" | "ico" | "avif" => {
            "image".to_string()
        }
        "mp3" | "wav" | "flac" | "aac" | "ogg" | "wma" | "m4a" => "audio".to_string(),
        "pdf" | "doc" | "docx" | "txt" | "rtf" | "odt" | "xls" | "xlsx" | "ppt" | "pptx" => {
            "document".to_string()
        }
        _ => "other".to_string(),
    }
}

fn get_mime_type_from_extension(extension: &str) -> String {
    match extension.to_lowercase().as_str() {
        "mp4" => "video/mp4".to_string(),
        "avi" => "video/x-msvideo".to_string(),
        "mkv" => "video/x-matroska".to_string(),
        "mov" => "video/quicktime".to_string(),
        "wmv" => "video/x-ms-wmv".to_string(),
        "flv" => "video/x-flv".to_string(),
        "webm" => "video/webm".to_string(),
        "m4v" => "video/x-m4v".to_string(),
        "3gp" => "video/3gpp".to_string(),
        "jpg" | "jpeg" => "image/jpeg".to_string(),
        "png" => "image/png".to_string(),
        "gif" => "image/gif".to_string(),
        "bmp" => "image/bmp".to_string(),
        "tiff" => "image/tiff".to_string(),
        "webp" => "image/webp".to_string(),
        "svg" => "image/svg+xml".to_string(),
        "ico" => "image/x-icon".to_string(),
        "avif" => "image/avif".to_string(),
        "mp3" => "audio/mpeg".to_string(),
        "wav" => "audio/wav".to_string(),
        "flac" => "audio/flac".to_string(),
        "aac" => "audio/aac".to_string(),
        "ogg" => "audio/ogg".to_string(),
        "wma" => "audio/x-ms-wma".to_string(),
        "m4a" => "audio/mp4".to_string(),
        "pdf" => "application/pdf".to_string(),
        "doc" => "application/msword".to_string(),
        "docx" => {
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document".to_string()
        }
        "txt" => "text/plain".to_string(),
        "rtf" => "application/rtf".to_string(),
        "odt" => "application/vnd.oasis.opendocument.text".to_string(),
        "xls" => "application/vnd.ms-excel".to_string(),
        "xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet".to_string(),
        "ppt" => "application/vnd.ms-powerpoint".to_string(),
        "pptx" => {
            "application/vnd.openxmlformats-officedocument.presentationml.presentation".to_string()
        }
        _ => "application/octet-stream".to_string(),
    }
}
