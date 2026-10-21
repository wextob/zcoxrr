# How to change what Ali says (and everything else you wrote)

Every line of dialogue lives in ONE file: **config.js**. You never need to touch game.js.

## 1. Open it
- On a computer: right-click `config.js` > Open with Notepad (Windows) or TextEdit (Mac, plain text mode).
- On GitHub (after you publish): open `config.js` > click the pencil icon > edit > "Commit changes".
- On a phone: GitHub's website works too; use the pencil icon.

## 2. Where is each thing?
| What you want to change | Look for this in config.js |
|---|---|
| Names | `ali:` and `her:` |
| Intro (first screens) | `intro:` |
| The 9 memory messages | `memories:` (each has an `id`, `title`, `text`) |
| The final letter, one screen per line | `letter:` |
| Final title and tagline | `finalTitle:` and `finalSub:` |
| What Ali says in the Group Chat scene | `npc:` > `chat:` |
| What Ali says in the Universe | `npc:` > `universe:` |
| Locked / unlocked messages | `msgs:` |
| Dream Date intro | `date:` > `intro:` |
| What Ali says on the picnic | `date:` > `aliLines:` |
| Cheers while she plays (short!) | `date:` > `live:` |
| What Ali says after a game (1, 2, 3 stars) | `date:` > `end:` |
| Place names | `places:` and `short:` |

Memory ids: `chat`, `rave`, `winter`, `h1` to `h5` (the five garden hearts), `universe`.

## 3. Change a line
Only change the words between the quotation marks.

Before: `"For making me smile."`
After: `"For making every day brighter."`

## 4. Add or remove a line
Each line in a list `[ ... ]` is one screen she taps through. Lines are separated by commas, and the last line has no comma after it.

```
intro:[
  "First line.",
  "Second line.",
  "A brand new third line."
],
```

## 5. Rules that stop the game breaking
- Keep every line inside its quotation marks `"like this"`, and keep the commas between lines.
- For apostrophes use the curly one: `don’t`. A plain `'` is fine too. Do NOT put a plain `"` inside a line.
- Emoji are fine (❤️ ✨).
- Keep `live:` and `end:` lines under about 24 characters, because they appear in a small speech bubble.
- Memory texts and letter lines can be long, but 1 to 3 sentences reads best on a phone.

## 6. See your change
Save the file and reload the page (on a phone, close the tab and open it again). If you published on GitHub Pages, wait about a minute after committing, then reload.
Her saved progress is kept, so use Pause > Restart Game only if you want to play from the start.

## 7. If the screen goes blank after an edit
You most likely deleted a quote or a comma. Undo your last change, or download `config.js` again from the original zip and redo your edit more carefully.

## 8. Text that is not in config.js
The short how-to-play instructions inside the three mini-games are in `game.js`: search for `how:`. Change them the same way, only touching the words inside quotes.
