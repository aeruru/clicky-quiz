# Clicky Quiz

This repository will host a very simple client-side web app with simple quizzes for Final Fantasy XIV mechanics.

The goal is to keep the app lightweight and easy to run in a browser, with quiz interactions focused on helping players practice and recognize mechanics.

## Local testing

From the repository root, start a local static server with:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8000/`.

## Notes for the next agent session

- The Graven 3 quiz lives in `FF14/DMU/Phase1/GravenImage3/`.
- The browser may cache static JS/CSS aggressively. When changing quiz behavior, bump the query string on the relevant `<script>` or stylesheet in `index.html`.
- `rules.js` contains the Graven 3 answer table. It is written so each role has spread positions, while stack positions are shared by role group.
- Graven 3 pattern resolution works like this: the top fire-line orb decides whether the shown spread/stack marker pattern is true or a lie; the bottom lightning-line orb decides whether the player should be out of purple or in purple.
- The visible green square numbers are intentionally hidden now, but the buttons keep `aria-label="Box N"` so the game logic can still identify targets.
- The quiz currently rolls a fresh orb/marker pattern and advances the purple line config when a round starts. The old manual purple-line cycle button was removed after wiring the game flow.
- Use `node --test` for the full local test suite. `npm test` may fail on this machine if the user-level npm shim is broken, even though `node --test` works.
