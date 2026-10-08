# Putt-Pocalypse

Mini-golf with zombies. Sink every hole on the haunted course while the undead shamble across the fairway, then spend the tickets you earn on upgrades, beer, and an armed caddy.

## How to play

No build step or install is needed. Open `index.html` in a modern browser and click **Start Game**.

You can also serve the folder locally, for example with `python -m http.server`, and browse to `http://localhost:8000`.

### Controls

| Action | Input |
| --- | --- |
| Move the golfer | `W` `A` `S` `D` |
| Putt | Walk up to the ball, click it, pull back, then release |
| Swing the club at zombies | `Space` (or the **Swing Club** button) |
| Pause / resume | `Esc` or `P` |
| Toggle sound | `M` |
| Continue from the results or shop screen | `Enter` |

## Features

- Seven hand-built holes with windmills, water hazards, bridges, and zombies that roam the course
- Fixed-timestep physics, so the ball behaves the same at 60 Hz, 144 Hz, or on a slow laptop
- The responsive course scales to any window size
- Rich course art: a graveyard backdrop, textured fairways, beveled walls, waving flags, and a proper cup
- Top HUD with hole, par, strokes, round score, health, tickets, club durability, and caddy ammo
- Hole intro banners, a 0–3 star rating per hole, and a full end-of-round scorecard
- Personal bests per hole, a best-round record, and lifetime stats (rounds, aces, zombies splatted), saved in your browser
- Between-hole ticket shop with upgrades and consumables

## Project layout

- `index.html` loads every script in order. Later modules extend earlier ones by wrapping their functions.
- `js/` holds the game modules.
- `style.css` holds menus, the HUD, and results styling.
- `assets/` holds the sounds and other media.