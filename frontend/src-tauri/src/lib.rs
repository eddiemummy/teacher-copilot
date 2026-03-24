use std::process::Command;

use tauri::Manager;

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

  let mut sidecar_path = resource_dir.join("teacher-copilot-api");
  if cfg!(target_os = "windows") {
    sidecar_path.set_extension("exe");
  }

  let mut cmd = Command::new(sidecar_path);
  cmd.env("TEACHER_COPILOT_RELOAD", "0");
  if let Ok(data_dir) = app.path().app_data_dir() {
    cmd.env("TEACHER_COPILOT_DATA_DIR", data_dir);
  }

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
