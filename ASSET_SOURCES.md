# Euro Haul — asset acquisition register

This file tracks third-party content approved for inclusion in the game. Do not package an asset until its individual source page and included license have been checked and recorded.

## Approved starting libraries

| Content | Source | License basis | Integration notes |
|---|---|---|---|
| Vehicle/gameplay props | https://kenney.nl/assets/car-kit | CC0 stated on asset page | Use as traffic and prop models; not a substitute for a detailed licensed heavy-truck model. |
| Roads and city pieces | https://kenney.nl/assets/city-kit-roads | Verify CC0 on the exact pack page before download | Use modular road junctions, barriers and street furniture. |
| Industrial scenery | https://kenney.nl/assets/city-kit-industrial | Verify CC0 on the exact pack page before download | Warehouses, depots and cargo-yard props. |
| Nature props | https://kenney.nl/assets/nature-kit | Verify CC0 on the exact pack page before download | Trees, rocks and roadside vegetation. |
| PBR materials and HDRIs | https://polyhaven.com/ | Poly Haven states its assets are CC0 | Prefer mobile-sized 1K/2K maps and compressed formats. |
| PBR materials | https://ambientcg.com/ | ambientCG states its assets are CC0 | Keep source IDs and license metadata beside each imported material. |
| Audio | https://kenney.nl/assets/impact-sounds and https://kenney.nl/assets/interface-sounds | CC0 stated on the respective asset pages | UI and general effects; source vehicle engine audio separately and verify its license. |

Kenney confirms its game assets are public-domain/CC0 on its support page:
https://kenney.nl/support

## Release requirements

- Keep an asset manifest containing source URL, creator, license, original filename, and SHA-256.
- Never use a model merely because its download is free; inspect the exact asset license.
- Do not use trademarks, real-world logos, or branded vehicle designs without permission.
- Import and optimize models, textures, and audio for Android; do not bulk-copy unrelated files to inflate package size.
- Measure the actual APK and its uncompressed asset payload in CI.
- Keep the final APK under 700 MiB, but do not force a 400 MiB minimum by adding filler. The 400–700 MiB target is a content goal, not a reason to degrade loading or performance.
- Test the installed APK and gameplay on a physical Android device before calling the release complete.

## Current repository status

The game now downloads and packages four pinned Kenney CC0 GLB collections during the Android build:
- Car Kit: https://kenney.nl/assets/car-kit
- City Kit (Roads): https://kenney.nl/assets/city-kit-roads
- City Kit (Commercial): https://kenney.nl/assets/city-kit-commercial
- Nature Kit: https://kenney.nl/assets/nature-kit

The build pins the converted model library to commit 3ddcc695adbba9fb918cf31b7c139b3f95b76910 from https://github.com/Hidencod/tge-assets and includes that repository's CC0 LICENSE file in the app's asset directory. The GLB loader imports selected vehicles, buildings, roadside props and modular road pieces into the live scene. CI checks that at least 400 GLB models are packaged and reports their uncompressed payload size alongside the actual APK file size.

A separate truck-specific CC0 collection is also integrated from https://3dassets.dev/packs/long-haul-trucking-and-truck-stop. The build includes a long-nose tractor, cab-over sleeper tractor, dry-van semitrailer and truck-stop yard scene (model IDs 13943, 13946, 13950 and 14029). The pack page declares CC0 1.0 Universal and documents metre-scale model dimensions. These models are loaded as traffic and roadside truck-stop content.

Two additional 3DAssets.dev CC0 1.0 collections are integrated:
- https://3dassets.dev/packs/car-park-and-road-vehicle-fleet — 77 models, including detailed road cars, vans and rigid trucks, plus a car-park starter scene. The build downloads the model manifest and GLBs; selected vehicle models are loaded into live traffic.
- https://3dassets.dev/packs/motorway-services-and-truck-park — 54 models for a motorway service area, lorry bays, parking, signage and roadside facilities. The build includes the pack's starter scene and individual models.

The player truck is still a procedural model rather than a licensed, high-detail tractor unit. The current physics implementation is a simplified real-time vehicle dynamics model; it is not yet a validated professional-grade simulator. A physical Android gameplay test remains necessary.
