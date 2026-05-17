use std::{fs, path::PathBuf, process::Command};

use tauri::Manager;

fn resolve_sidecar_path(resource_dir: &PathBuf) -> Option<PathBuf> {
  let candidates: &[&str] = if cfg!(target_os = "windows") {
    &[
      "rain-api-x86_64-pc-windows-msvc.exe",
      "rain-api.exe",
      "rain-api",
    ]
  } else if cfg!(target_os = "macos") {
    &["rain-api-aarch64-apple-darwin", "rain-api-x86_64-apple-darwin", "rain-api"]
  } else {
    &["rain-api", "rain-api-x86_64-unknown-linux-gnu"]
  };

  for name in candidates {
    let p = resource_dir.join(name);
    if fs::metadata(&p).is_ok() {
      eprintln!("[rain] found sidecar candidate: {:?}", p);
      return Some(p);
    }
  }
  eprintln!("[rain] no sidecar found in {:?}. Candidates tried: {:?}", resource_dir, candidates);
  None
}

fn spawn_backend<R: tauri::Runtime>(app: &tauri::AppHandle<R>) {
  let resource_dir = match app.path().resource_dir() {
    Ok(dir) => dir,
    Err(err) => {
      eprintln!("[rain] resource_dir resolve failed: {err}");
      return;
    }
  };

  let sidecar_path = match resolve_sidecar_path(&resource_dir) {
    Some(p) => p,
    None => {
      eprintln!("[rain] backend sidecar not found – LLM features will be unavailable");
      return;
    }
  };

  let mut cmd = Command::new(&sidecar_path);
  cmd.env("TEACHER_COPILOT_RELOAD", "0");
  cmd.env("TEACHER_COPILOT_HOST", "127.0.0.1");
  cmd.env("TEACHER_COPILOT_PORT", "8010");

  if let Ok(data_dir) = app.path().app_data_dir() {
    // Create app data dir if it doesn't exist yet (first launch)
    let _ = fs::create_dir_all(&data_dir);
    cmd.env("TEACHER_COPILOT_DATA_DIR", &data_dir);
    cmd.current_dir(&data_dir);
    eprintln!("[rain] app_data_dir: {:?}", data_dir);
  }

  eprintln!("[rain] spawning backend: {:?}", sidecar_path);
  match cmd.spawn() {
    Ok(child) => eprintln!("[rain] backend started, pid={}", child.id()),
    Err(err) => eprintln!("[rain] backend spawn failed: {err}"),
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
