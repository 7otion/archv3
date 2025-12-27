use serde::Serialize;
use std::fs;
use std::path::Path;

#[derive(Debug, Serialize)]
pub struct FolderData {
    folders: Vec<String>,
    total_count: usize,
    current_page: usize,
}

fn is_special_folder(name: &str) -> bool {
    let special_folders = [
        "$RECYCLE.BIN",
        "System Volume Information",
        "$WinREAgent",
        "Recovery",
        "ProgramData",
        "Windows",
        "Config.Msi",
        "$GetCurrent",
        "$SysReset",
        "MSOCache",
        "$Windows.~BT",
        "$Windows.~WS",
        "Windows.old",
        "hiberfil.sys",
        "pagefile.sys",
        "swapfile.sys",
    ];

    let name_lower = name.to_lowercase();
    special_folders.iter().any(|&special| {
        name_lower == special.to_lowercase()
            || name_lower.starts_with(&format!("{}.", special.to_lowercase()))
    })
}

#[tauri::command(rename_all = "snake_case")]
pub async fn get_folders(
    path: String,
    page: Option<usize>,
    per_page: Option<usize>,
) -> Result<FolderData, String> {
    let path = Path::new(&path);

    if !path.exists() {
        return Err("Path does not exist".to_string());
    }

    if !path.is_dir() {
        return Err("Path is not a directory".to_string());
    }

    let page = page.unwrap_or(1).max(1);
    let per_page = per_page.unwrap_or(50).clamp(1, 200);

    let entries = match fs::read_dir(path) {
        Ok(e) => e,
        Err(e) => return Err(format!("Failed to read directory: {}", e)),
    };

    let mut folders = Vec::new();

    for entry in entries.flatten() {
        let path = entry.path();

        if path.is_dir() {
            if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                if !name.starts_with('.') && !is_special_folder(name) {
                    folders.push(path.to_string_lossy().to_string());
                }
            }
        }
    }

    folders.sort_by(|a, b| {
        let a_name = Path::new(a).file_name().unwrap_or_default();
        let b_name = Path::new(b).file_name().unwrap_or_default();
        a_name.cmp(b_name)
    });

    let total_count = folders.len();

    let start_index = (page - 1) * per_page;
    let end_index = std::cmp::min(start_index + per_page, total_count);

    let paginated_folders = if start_index < total_count {
        folders[start_index..end_index].to_vec()
    } else {
        Vec::new()
    };

    Ok(FolderData {
        folders: paginated_folders,
        total_count,
        current_page: page,
    })
}
