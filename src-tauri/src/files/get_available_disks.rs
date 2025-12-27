use std::{os::windows::process::CommandExt, process::Command};

#[tauri::command(rename_all = "snake_case")]
pub async fn get_available_disks() -> Result<Vec<String>, String> {
    let available_disks = get_windows_drives()?;
    Ok(available_disks)
}

pub fn get_windows_drives() -> Result<Vec<String>, String> {
    let output = Command::new("powershell")
        .creation_flags(0x08000000)
        .args([
            "-Command",
            "Get-PSDrive -PSProvider FileSystem | Select-Object -ExpandProperty Root",
        ])
        .output()
        .map_err(|e| format!("Failed to get Windows drives: {}", e))?;

    Ok(String::from_utf8_lossy(&output.stdout)
        .lines()
        .map(|s| s.trim().to_string())
        .collect())
}
