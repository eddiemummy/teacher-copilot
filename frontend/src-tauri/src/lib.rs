use std::{fs, path::PathBuf, process::Command};

use tauri::Manager;

fn resolve_sidecar_path(resource_dir: &PathBuf) -> Option<PathBuf> {
  // Prefer the exact triple-suffixed name (what CI copies into `src-tauri/bin/`).
  // But Tauri may also bundle external bins under simpler names depending on platform/version.
  let candidates: &[&str] = if cfg!(target_os = "windows") {
    &[
      "rain-api-x86_64-pc-windows-msvc.exe",
      "rain-api.exe",
      "rain-api",
    ]
  } else if cfg!(target_os = "macos") {
    &["rain-api-aarch64-apple-darwin", "rain-api"]
  } else {
    &["rain-api", "rain-api-x86_64-unknown-linux-gnu"]
  };

  for name in candidates {
    let p = resource_dir.join(name);
    if fs::metadata(&p).is_ok() {
      return Some(p);
    }
  }
  None
}

fn spawn_backend<R: tauri::Runtime>(app: &tauri::AppHandle<R>) {
  if cfg!(debug_assertions) {
    return;
  }
  let resource_dir = match app.path().resource_dir() {
    Ok(dir) => dir,
    Err(err) => {
      eprintln!("resource_dir resolve failed: {err}");
      return;
    }
  };

  let sidecar_path = match resolve_sidecar_path(&resource_dir) {
    Some(p) => p,
    None => {
      eprintln!("backend sidecar not found in resource dir: {resource_dir:?}");
      return;
    }
  };

  let mut cmd = Command::new(sidecar_path);
  cmd.env("TEACHER_COPILOT_RELOAD", "0");
  if let Ok(data_dir) = app.path().app_data_dir() {
    cmd.env("TEACHER_COPILOT_DATA_DIR", &data_dir);
    // Ensure relative paths (e.g. PDF outputs) land in a writable location.
    cmd.current_dir(&data_dir);
  }
  cmd.env("TEACHER_COPILOT_HOST", "127.0.0.1");
  cmd.env("TEACHER_COPILOT_PORT", "8010");

  if let Err(err) = cmd.spawn() {
    eprintln!("backend spawn failed: {err}");
  }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      spawn_backend(app.handle());
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
