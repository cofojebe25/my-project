const fallbackSongs = [
    {
        title: "Football",
        artist: "SigmaMusic",
        audio: "audio/sigmamusic-football.mp3",
        image: "images/football.png",
        duration: 225
    },
    {
        title: "Dark",
        artist: "AudioCopper",
        audio: "audio/audiocopper-dark.mp3",
        image: "images/dark.png",
        duration: 252
    },
    {
        title: "In Love",
        artist: "Kaazoom",
        audio: "audio/kaazoom-in-love.mp3",
        image: "images/in-love.png",
        duration: 238
    }
];

const songGrid = document.getElementById("song-grid");
const artistGrid = document.getElementById("artist-grid");
const searchInput = document.getElementById("searchInput");
const songStatus = document.getElementById("song-status");
const playButton = document.getElementById("play");
const previousButton = document.getElementById("previous");
const nextButton = document.getElementById("next");
const title = document.querySelector(".player-title");
const artist = document.querySelector(".player-artist");
const progress = document.getElementById("progress");
const currentTime = document.getElementById("current-time");
const duration = document.getElementById("duration");

const audio = new Audio();
let songs = fallbackSongs;
let currentSong = 0;

function formatTime(time) {
    if (!Number.isFinite(time) || time < 0) {
        return "0:00";
    }

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function renderSongs() {
    const query = searchInput.value.trim().toLowerCase();
    const visibleSongs = songs
        .map((song, index) => ({ song, index }))
        .filter(({ song }) => !query
            || song.title.toLowerCase().includes(query)
            || song.artist.toLowerCase().includes(query));

    if (visibleSongs.length === 0) {
        songGrid.replaceChildren();
        const emptyState = document.createElement("div");
        emptyState.className = "empty-state";
        emptyState.textContent = "No tracks match your search yet.";
        songGrid.append(emptyState);
        return;
    }

    songGrid.replaceChildren();
    visibleSongs.forEach(({ song, index }) => {
        const card = document.createElement("article");
        card.className = "song-card";
        card.dataset.song = String(index);
        card.tabIndex = 0;
        card.setAttribute("aria-label", `Play ${song.title} by ${song.artist}`);

        const image = document.createElement("img");
        image.src = song.image;
        image.alt = `${song.title} by ${song.artist}`;
        const info = document.createElement("div");
        info.className = "song-info";
        const songTitle = document.createElement("h3");
        songTitle.textContent = song.title;
        const songArtist = document.createElement("p");
        songArtist.textContent = song.artist;
        const meta = document.createElement("div");
        meta.className = "song-meta";
        const songDuration = document.createElement("span");
        songDuration.textContent = formatTime(song.duration);
        const playLabel = document.createElement("span");
        playLabel.textContent = "Play";

        meta.append(songDuration, playLabel);
        info.append(songTitle, songArtist, meta);
        card.append(image, info);
        songGrid.append(card);
    });

    attachSongEvents();
}

function renderArtists() {
    const uniqueArtists = [...new Map(songs.map((song) => [song.artist, song])).values()];
    artistGrid.replaceChildren();
    uniqueArtists.slice(0, 6).forEach((song) => {
        const card = document.createElement("article");
        card.className = "artist-card";
        const image = document.createElement("img");
        image.src = song.artistImage || song.image;
        image.alt = song.artist;
        const name = document.createElement("h3");
        name.textContent = song.artist;
        card.append(image, name);
        artistGrid.append(card);
    });
}

function attachSongEvents() {
    const cards = document.querySelectorAll(".song-card");

    cards.forEach((card) => {
        const handleSelect = () => {
            currentSong = Number(card.dataset.song);
            loadSong(currentSong);
            audio.play();
        };

        card.addEventListener("click", handleSelect);
        card.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleSelect();
            }
        });
    });
}

function loadSong(index) {
    const song = songs[index];

    if (!song) {
        return;
    }

    currentSong = index;
    title.textContent = song.title;
    artist.textContent = song.artist;
    audio.src = song.audio;
    audio.load();
    progress.value = 0;
    currentTime.textContent = "0:00";
    duration.textContent = "0:00";
}

function togglePlayback() {
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
}

function changeSong(direction) {
    if (songs.length === 0) {
        return;
    }

    const nextIndex = (currentSong + direction + songs.length) % songs.length;
    currentSong = nextIndex;
    loadSong(currentSong);
    audio.play();
}

playButton.addEventListener("click", togglePlayback);
nextButton.addEventListener("click", () => changeSong(1));
previousButton.addEventListener("click", () => changeSong(-1));

searchInput.addEventListener("input", renderSongs);

progress.addEventListener("input", () => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
        return;
    }

    audio.currentTime = (progress.value / 100) * audio.duration;
});

audio.addEventListener("loadedmetadata", () => {
    duration.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
        return;
    }

    progress.value = (audio.currentTime / audio.duration) * 100;
    currentTime.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("ended", () => {
    changeSong(1);
});

audio.addEventListener("play", () => {
    playButton.textContent = "⏸";
});

audio.addEventListener("pause", () => {
    playButton.textContent = "▶";
});

async function loadRecentSongs() {
    const endpoint = new URL("https://api.audius.co/v1/tracks/search");
    endpoint.search = new URLSearchParams({
        query: "",
        sort_method: "recently_added",
        limit: "12",
        app_name: "GoodTunez"
    }).toString();

    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`Audius returned HTTP ${response.status}`);
        }

        const result = await response.json();
        if (!Array.isArray(result.data)) {
            throw new Error("Audius returned an invalid tracks response");
        }

        const recentSongs = result.data
            .filter((track) => track.is_available && track.is_streamable && track.track_id)
            .map((track) => ({
                title: track.title || "Untitled track",
                artist: track.user?.name || track.user?.handle || "Unknown artist",
                audio: `https://api.audius.co/v1/tracks/${encodeURIComponent(track.track_id)}/stream?app_name=GoodTunez`,
                image: track.artwork?.["480x480"] || track.artwork?.["150x150"] || "images/football.png",
                artistImage: track.user?.profile_picture?.["150x150"],
                duration: Number(track.duration) || 0
            }));

        if (recentSongs.length === 0) {
            throw new Error("Audius did not return any playable tracks");
        }

        songs = recentSongs;
        currentSong = 0;
        renderSongs();
        renderArtists();
        loadSong(currentSong);
        songStatus.textContent = "Recently added tracks from Audius.";
    } catch (error) {
        console.error("Unable to load recent tracks from Audius:", error);
        songs = fallbackSongs;
        currentSong = 0;
        renderSongs();
        renderArtists();
        loadSong(currentSong);
        songStatus.textContent = "Recent tracks are unavailable. Showing the tracks saved with this site.";
    }
}

renderSongs();
renderArtists();
loadSong(currentSong);
loadRecentSongs();