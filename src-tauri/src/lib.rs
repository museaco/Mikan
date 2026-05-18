use std::{collections::HashSet, sync::Mutex};

use tauri::State;
use tauri_plugin_fs::FsExt;

#[derive(Default)]
struct ApiAccess {
    allowed_origins: Mutex<HashSet<String>>,
}

fn normalize_api_base_url(base_url: &str) -> Result<(String, String), String> {
    let base_url = base_url.trim().trim_end_matches('/').to_string();
    if base_url.is_empty() {
        return Err("API address is empty".to_string());
    }

    let parsed = tauri_plugin_http::reqwest::Url::parse(&base_url)
        .map_err(|e| format!("Invalid API address: {e}"))?;

    match parsed.scheme() {
        "http" | "https" => {}
        scheme => return Err(format!("Unsupported API scheme: {scheme}")),
    }

    let host = parsed
        .host_str()
        .ok_or_else(|| "API address must include a host".to_string())?;
    let mut origin = format!("{}://{}", parsed.scheme(), host);
    if let Some(port) = parsed.port() {
        origin.push(':');
        origin.push_str(&port.to_string());
    }

    Ok((base_url, origin))
}

#[tauri::command]
fn allow_download_dir(app: tauri::AppHandle, path: String) -> Result<(), String> {
    let scope = app.fs_scope();
    scope
        .allow_directory(path.clone(), true)
        .map_err(|e| e.to_string())?;
    println!("Allowed dir: {}", path);
    Ok(())
}

#[tauri::command]
fn allow_api_base_url(state: State<ApiAccess>, base_url: String) -> Result<(), String> {
    let (_, origin) = normalize_api_base_url(&base_url)?;
    state
        .allowed_origins
        .lock()
        .map_err(|e| e.to_string())?
        .insert(origin.clone());
    println!("Allowed API origin: {}", origin);
    Ok(())
}

#[tauri::command]
async fn fetch_xhs_detail(
    state: State<'_, ApiAccess>,
    base_url: String,
    params: serde_json::Value,
) -> Result<serde_json::Value, String> {
    let (base_url, origin) = normalize_api_base_url(&base_url)?;
    let allowed = state
        .allowed_origins
        .lock()
        .map_err(|e| e.to_string())?
        .contains(&origin);

    if !allowed {
        return Err(format!("API origin is not authorized: {origin}"));
    }

    let url = format!("{}/xhs/detail", base_url);
    let body = serde_json::to_vec(&params).map_err(|e| e.to_string())?;
    let response = tauri_plugin_http::reqwest::Client::new()
        .post(url)
        .header("Content-Type", "application/json")
        .body(body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let status = response.status();
    let text = response
        .text()
        .await
        .map_err(|e| e.to_string())?;

    if !status.is_success() {
        return Err(format!("HTTP {}: {}", status.as_u16(), text));
    }

    serde_json::from_str::<serde_json::Value>(&text).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(ApiAccess::default())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            allow_download_dir,
            allow_api_base_url,
            fetch_xhs_detail
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
