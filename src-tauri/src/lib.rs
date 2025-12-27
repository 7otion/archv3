use std::fs;

use tauri::Manager;
use tauri::path::BaseDirectory;

mod files;
mod utils;
mod migrations;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::new()
                .add_migrations("sqlite:archv3.db", migrations::get_migrations())
                .build(),
        )
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            let app_cache_dir = app
                .handle()
                .path()
                .resolve("cache", BaseDirectory::AppConfig)
                .map_err(|e| format!("Failed to resolve App Config directory: {}", e))?;

            if !app_cache_dir.exists() {
                fs::create_dir_all(&app_cache_dir)
                    .map_err(|e| format!("Failed to create cache directory: {}", e))?;
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            files::highlight_path::highlight_path,
            files::get_available_disks::get_available_disks,
            files::get_folders::get_folders,
            files::get_parent_path::get_parent_path,
            files::get_path_segments::get_path_segments,
            files::copy_file::copy_file,
            files::fetch_files::fetch_files,
            files::file_details::file_details,
            files::trash::trash,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
