# GoodTunez

GoodTunez is a responsive music player website I built using **HTML, CSS, and JavaScript**.

The idea behind GoodTunez is simple: give users a place where they can browse music, discover artists, search for songs, and listen to tracks without leaving the page.

## Features

* Loads recently added and streamable tracks from the [Audius API](https://docs.audius.org/).
* Uses three local songs as a backup if the Audius API isn't available.
* Search for songs by their title or artist.
* Play and pause songs.
* Skip between tracks.
* Scrub through a song using the progress bar.
* Displays song artwork and artist names.
* Responsive design that works on both desktop and mobile.

## Running GoodTunez Locally

You don't need to install any packages or set up a complicated build process.

First, open the project folder in VS Code and start a local server from the terminal:

```bash
python3 -m http.server 8000
```

Then open this in your browser:

http://localhost:8000

The Audius tracks need an internet connection to load. The three fallback songs are stored directly in the project, so they can still be used if the API doesn't work.

## Project Structure

```text
GoodTunez/
├── index.html       # The main page and player controls
├── style.css        # Styling and responsive layout
├── script.js        # Music loading, search, and player functionality
├── audio/           # Local fallback audio files
└── images/          # Artwork for the fallback songs
```

## Local Fallback Songs

The project currently includes these three fallback songs:

| Track    | Artist      | Audio                           | Artwork               |
| -------- | ----------- | ------------------------------- | --------------------- |
| Football | SigmaMusic  | `audio/sigmamusic-football.mp3` | `images/football.png` |
| Dark     | AudioCopper | `audio/audiocopper-dark.mp3`    | `images/dark.png`     |
| In Love  | Kaazoom     | `audio/kaazoom-in-love.mp3`     | `images/in-love.png`  |

If you want to add another fallback song, you can edit the `fallbackSongs` array near the top of `script.js`.

Each song needs:

* `title`
* `artist`
* `audio`
* `image`
* `duration`

Make sure the audio file is placed inside the `audio/` folder and the artwork is placed inside the `images/` folder.

## How the Music Loading Works

When GoodTunez opens, it first tries to get recently added tracks from the **Audius API**.

If the API works and playable tracks are available, those tracks are displayed on the website.

If the request fails or no playable tracks are returned, GoodTunez automatically switches to the local fallback songs included in the project.

This means the website can still work even when the music API isn't available.

## Built With

* HTML
* CSS
* JavaScript
* Audius API

GoodTunez is a learning project, and I'm continuing to improve its design, features, and music discovery experience.
