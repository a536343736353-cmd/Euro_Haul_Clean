# Euro Haul — Godot migration target

This folder is a new Godot 4 project and a safe migration target. The existing Babylon.js/Capacitor app remains the current release source until the Godot version has feature parity and passes Android device testing.

## Open the project

Open this folder (godot/) in Godot 4.3 or newer. Enable **Project > Project Settings > Plugins > Euro Haul Migration Assistant** if it is not already enabled.

The editor dock provides:
1. **Audit legacy project** — checks for the Babylon.js source and writes MIGRATION_REPORT.md.
2. **Import available source assets** — copies repository assets/ content into the Godot project and preserves the legacy JS/CSS as reference files.
3. **Open Godot game scene** — opens the native Godot scene scaffold.

## Current migration scope

The initial native scaffold contains a world, road, truck body, follow camera and a basic keyboard movement controller. It is a foundation for porting, not a completed simulator. It does not yet reproduce the legacy Babylon.js gameplay, truck physics, UI, traffic, missions, asset streaming or Android export.

## Migration rules

- Keep the existing overrides/, Euro_Haul_Step1_Godot_Free.zip, and Android workflow intact during migration.
- Port each gameplay system into native GDScript and .tscn scenes, then test it before marking it migrated.
- Import GLB files through Godot's asset pipeline and verify scale, materials, collision and mobile performance.
- Verify the license of every asset before packaging.
- Switch the production APK workflow only after Godot export, install, launch and gameplay tests pass on Android.
- Never add filler assets to reach an APK size target.
