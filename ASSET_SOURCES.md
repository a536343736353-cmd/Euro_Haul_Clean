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

The existing game is a small Babylon.js procedural prototype. The asset sources above are a sourcing register, not proof that those packs have already been downloaded or integrated. The current project does not yet contain a complete heavy-truck simulator asset library.
