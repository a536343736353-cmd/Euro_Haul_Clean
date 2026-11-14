@tool
extends EditorPlugin

const LEGACY_MAIN := "res://../overrides/src/main.js"
const LEGACY_STYLE := "res://../overrides/src/style.css"
const SOURCE_ASSETS := "res://../assets"
const TARGET_ASSETS := "res://assets"
const REPORT_PATH := "res://MIGRATION_REPORT.md"

var dock: VBoxContainer
var status_label: Label

func _enter_tree() -> void:
	dock = VBoxContainer.new()
	dock.name = "Euro Haul"
	var heading := Label.new()
	heading.text = "EURO HAUL • GODOT MIGRATION"
	heading.add_theme_font_size_override("font_size", 16)
	dock.add_child(heading)
	var intro := Label.new()
	intro.text = "Stage the existing project safely. Legacy gameplay is preserved as reference; it is not auto-translated."
	intro.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	dock.add_child(intro)
	var audit_button := Button.new()
	audit_button.text = "1. Audit legacy project"
	audit_button.pressed.connect(_audit_legacy_project)
	dock.add_child(audit_button)
	var import_button := Button.new()
	import_button.text = "2. Import available source assets"
	import_button.pressed.connect(_import_source_assets)
	dock.add_child(import_button)
	var open_button := Button.new()
	open_button.text = "3. Open Godot game scene"
	open_button.pressed.connect(_open_main_scene)
	dock.add_child(open_button)
	status_label = Label.new()
	status_label.text = "Ready. Run the audit first."
	status_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	dock.add_child(status_label)
	add_control_to_dock(DOCK_SLOT_RIGHT_UL, dock)

func _exit_tree() -> void:
	if dock:
		remove_control_from_docks(dock)
		dock.queue_free()

func _audit_legacy_project() -> void:
	var main_path := ProjectSettings.globalize_path(LEGACY_MAIN)
	var style_path := ProjectSettings.globalize_path(LEGACY_STYLE)
	var main_exists := FileAccess.file_exists(main_path)
	var style_exists := FileAccess.file_exists(style_path)
	var main_bytes := FileAccess.get_file_as_bytes(main_path).size() if main_exists else 0
	var report := "# Euro Haul — Godot migration audit\n\n"
	report += "- Legacy Babylon.js gameplay source found: **%s**\n" % str(main_exists)
	report += "- Legacy UI stylesheet found: **%s**\n" % str(style_exists)
	report += "- Main JavaScript source size: **%d bytes**\n\n" % main_bytes
	report += "## Migration status\n\n"
	report += "The current playable implementation is Babylon.js inside a web/Capacitor Android wrapper. The Godot project is a separate native migration target. JavaScript gameplay, DOM controls, Babylon meshes, GLB loading and camera logic require deliberate GDScript/scene conversion and testing; copying the files does not convert them.\n\n"
	report += "## Safe next steps\n\n"
	report += "1. Import and verify licensed GLB assets in Godot.\n2. Rebuild the truck, trailer, road and camera as native Godot scenes.\n3. Port steering, throttle, braking, gearbox, suspension and collision logic.\n4. Rebuild HUD, menus, traffic, missions and save data.\n5. Add a Godot Android export job and compare installed-device behaviour before switching release builds.\n"
	var file := FileAccess.open(REPORT_PATH, FileAccess.WRITE)
	if file:
		file.store_string(report)
		file.close()
		status_label.text = "Audit complete. Report saved to res://MIGRATION_REPORT.md"
	else:
		status_label.text = "Could not write migration report."

func _import_source_assets() -> void:
	var source_absolute := ProjectSettings.globalize_path(SOURCE_ASSETS)
	var target_absolute := ProjectSettings.globalize_path(TARGET_ASSETS)
	if not DirAccess.dir_exists_absolute(source_absolute):
		status_label.text = "No repository assets folder found beside the godot/ folder."
		return
	var copied := _copy_directory(source_absolute, target_absolute)
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path("res://migration_reference"))
	_copy_if_present(LEGACY_MAIN, "res://migration_reference/legacy_main.js")
	_copy_if_present(LEGACY_STYLE, "res://migration_reference/legacy_style.css")
	_refresh_filesystem()
	status_label.text = "Asset staging finished. Files copied: %d. Review licenses and import results." % copied

func _copy_directory(source: String, target: String) -> int:
	DirAccess.make_dir_recursive_absolute(target)
	var count := 0
	var dir := DirAccess.open(source)
	if dir == null:
		return count
	dir.list_dir_begin()
	var entry := dir.get_next()
	while entry != "":
		if entry != "." and entry != "..":
			var from_path := source.path_join(entry)
			var to_path := target.path_join(entry)
			if dir.current_is_dir():
				count += _copy_directory(from_path, to_path)
			else:
				if not FileAccess.file_exists(to_path):
					var err := DirAccess.copy_absolute(from_path, to_path)
					if err == OK:
						count += 1
		entry = dir.get_next()
	dir.list_dir_end()
	return count

func _copy_if_present(source_res: String, destination_res: String) -> void:
	var source := ProjectSettings.globalize_path(source_res)
	if FileAccess.file_exists(source):
		var destination := ProjectSettings.globalize_path(destination_res)
		DirAccess.make_dir_recursive_absolute(destination.get_base_dir())
		if not FileAccess.file_exists(destination):
			DirAccess.copy_absolute(source, destination)

func _open_main_scene() -> void:
	var scene_path := "res://scenes/main.tscn"
	if ResourceLoader.exists(scene_path):
		get_editor_interface().open_scene_from_path(scene_path)
	else:
		status_label.text = "Main scene not found."

func _refresh_filesystem() -> void:
	get_editor_interface().get_resource_filesystem().scan()
