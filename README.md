# Neon City Rider — Karthik Ambati's Game Portfolio

A 3D motorcycle game that doubles as a developer portfolio. Ride a closed city circuit, obey the traffic signals, avoid other vehicles and stop at five street shops to unlock the portfolio sections: About Me, Experience, Skills, Projects and Contact.

Built with plain HTML, CSS and JavaScript plus [Three.js](https://threejs.org/) (r128, loaded from a CDN). No build step and no server are required.

## Run
1. Open `index.html` in Chrome, Edge or Safari (internet needed once for the Three.js CDN).
2. Press **Enter the city**, then **Start engine**.

## Controls
| Action | Keyboard | Touch |
| --- | --- | --- |
| Engine on / off | `I` | Engine button |
| Accelerate / brake | `W` `S` or arrows | GAS / BRAKE pedals |
| Steer | `A` `D` or arrows | ◀ ▶ |
| Gear forward / reverse | `G` | D / R buttons |
| Horn | `Space` (hold) | 📯 |
| Parking lights | `H` | Park Lights button |
| Enter a shop | `E` | tap the prompt |
| Pause / restart | `P` / `R` | top-bar buttons |

Reverse gear plays a short music loop. The route map is draggable and has a **STOPS** drop-down with distance, navigation and fast travel.

## Project structure
```
index.html          markup only
css/style.css       all styles (desktop + mobile layouts)
js/utils.js         DOM helper
js/images.js        photos embedded as data URIs
js/data.js          portfolio content (edit this to update the portfolio)
js/audio.js         engine, horn, starter and reverse-music synthesis
js/world.js         renderer, circuit, road, city, banners, shops, pedestrians
js/traffic.js       vehicles, two-way lanes, traffic signals
js/bike.js          player bike, rider, steering assembly, parking lights
js/game.js          state, input, UI, route map, main loop
assets/images/      the original optimised photos
```
Scripts are plain `<script>` tags (not ES modules) and must stay in the order listed in `index.html`, because they share global scope.

## Notes
- **Why the photos are in `js/images.js`:** the banners draw photos onto canvas textures. Browsers block that for image files opened from `file://`, so the same photos are embedded as data URIs. `assets/images/` holds the originals for reference. If you host the project on a web server you can load them from `assets/images/` instead.
- To change content, edit `js/data.js`. Project links and career details should be reviewed before publishing.
- Portfolio content is based on https://karthikkumarambati.github.io/karthik_kumar/

## License
MIT — see `LICENSE`.
