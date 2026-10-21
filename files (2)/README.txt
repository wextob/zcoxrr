BACKGROUND MUSIC: put your song in this folder

1. Copy your song into this "music" folder.
2. Rename it exactly:  bgm.mp3
   (If your file is .m4a, .ogg or .wav, either keep that name and change the line
   music:"music/bgm.mp3"  in config.js to match, e.g. music:"music/bgm.m4a")
3. Reload the game. Press Start Game. The music plays and loops quietly in the background.

Volumes (in config.js, under audio:):
   musicVolume: 0.5   = background music at 50%
   sfxVolume:   1.0   = sound effects at 100%

Tips:
- MP3 is the safest format for phones. Under about 10 MB keeps loading fast.
- The Pause menu "Sound" button turns music AND effects on/off. Music pauses when she switches apps.
- If no file is found, the game plays its own soft built-in tune instead, so nothing breaks.
- When you publish on GitHub, upload the whole "music" folder too (Add file > Upload files).
  Anything you upload to a public repository is public, so only use a song you have the
  rights to share, or a royalty-free track.
