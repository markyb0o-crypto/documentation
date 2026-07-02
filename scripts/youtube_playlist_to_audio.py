#!/usr/bin/env python3
"""
YouTube-Playlist zu Audio-Dateien konvertieren (Windows, macOS, Linux).

Lädt jedes Video einer Playlist nacheinander herunter und speichert
die extrahierte Audiodatei im Download-Ordner.

Voraussetzungen:
    pip install yt-dlp
    ffmpeg (muss im PATH liegen)

Windows-Beispiel:
    python youtube_playlist_to_audio.py "https://www.youtube.com/playlist?list=PLxxxx"
    youtube_playlist_to_audio.bat "https://www.youtube.com/playlist?list=PLxxxx"

Linux/macOS-Beispiel:
    python3 youtube_playlist_to_audio.py "https://www.youtube.com/playlist?list=PLxxxx"
"""

from __future__ import annotations

import argparse
import platform
import shutil
import sys
from pathlib import Path

if sys.platform == "win32":
    # Umlaute und Sonderzeichen in der Windows-Konsole korrekt anzeigen
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

try:
    import yt_dlp
except ImportError:
    print(
        "Fehler: yt-dlp ist nicht installiert.\n"
        "Installation: pip install yt-dlp",
        file=sys.stderr,
    )
    sys.exit(1)


def default_download_dir() -> Path:
    """Gibt den Standard-Download-Ordner des Systems zurück."""
    if sys.platform == "win32":
        # Windows: C:\Users\<Name>\Downloads
        downloads = Path.home() / "Downloads"
        if downloads.exists():
            return downloads
        # Fallback über Umgebungsvariable
        userprofile = Path.home()
        return userprofile / "Downloads"

    return Path.home() / "Downloads"


def check_ffmpeg() -> None:
    """Prüft, ob ffmpeg verfügbar ist, und gibt plattformspezifische Hinweise."""
    if shutil.which("ffmpeg"):
        return

    print("Fehler: ffmpeg wurde nicht gefunden (muss im PATH liegen).", file=sys.stderr)
    if sys.platform == "win32":
        print(
            "\nWindows – ffmpeg installieren (eine Option wählen):\n"
            "  winget install Gyan.FFmpeg\n"
            "  choco install ffmpeg\n"
            "  Oder von https://ffmpeg.org/download.html herunterladen\n"
            "  und den bin-Ordner zum PATH hinzufügen.",
            file=sys.stderr,
        )
    elif platform.system() == "Darwin":
        print("\nmacOS: brew install ffmpeg", file=sys.stderr)
    else:
        print("\nLinux: sudo apt install ffmpeg  (Debian/Ubuntu)", file=sys.stderr)

    sys.exit(1)


def build_options(
    output_dir: Path,
    audio_format: str,
    quality: str,
    skip_existing: bool,
) -> dict:
    """Erstellt die yt-dlp-Konfiguration für Audio-Extraktion."""
    output_dir.mkdir(parents=True, exist_ok=True)

    # Nummerierung + Titel für sortierte Dateinamen
    outtmpl = str(output_dir / "%(playlist_index)03d - %(title)s.%(ext)s")

    return {
        "format": "bestaudio/best",
        "outtmpl": outtmpl,
        "restrictfilenames": True,
        "ignoreerrors": False,
        "noplaylist": False,
        "nooverwrites": skip_existing,
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": audio_format,
                "preferredquality": quality,
            }
        ],
        "progress_hooks": [progress_hook],
    }


def progress_hook(status: dict) -> None:
    """Zeigt Fortschritt während des Downloads an."""
    if status.get("status") == "downloading":
        filename = status.get("filename", "")
        percent = status.get("_percent_str", "?").strip()
        speed = status.get("_speed_str", "?").strip()
        eta = status.get("_eta_str", "?").strip()
        print(f"  ↓ {percent} | {speed} | ETA {eta} | {Path(filename).name}")
    elif status.get("status") == "finished":
        print("  ✓ Download abgeschlossen, konvertiere zu Audio …")


def download_playlist(
    playlist_url: str,
    output_dir: Path,
    audio_format: str = "mp3",
    quality: str = "192",
    skip_existing: bool = True,
) -> None:
    """Lädt eine YouTube-Playlist nacheinander als Audiodateien herunter."""
    print(f"Playlist:   {playlist_url}")
    print(f"Zielordner: {output_dir}")
    print(f"Format:     {audio_format} ({quality} kbps)")
    print(f"Vorhandene Dateien überspringen: {'ja' if skip_existing else 'nein'}")
    print("-" * 60)

    options = build_options(output_dir, audio_format, quality, skip_existing)

    with yt_dlp.YoutubeDL(options) as ydl:
        info = ydl.extract_info(playlist_url, download=False)

        if info is None:
            print("Fehler: Playlist konnte nicht gelesen werden.", file=sys.stderr)
            sys.exit(1)

        entries = info.get("entries") or []
        playlist_title = info.get("title", "Unbekannte Playlist")
        total = len(entries)

        print(f"Playlist „{playlist_title}“ – {total} Video(s) gefunden\n")

        for index, entry in enumerate(entries, start=1):
            if entry is None:
                print(f"[{index}/{total}] Übersprungen (Video nicht verfügbar)")
                continue

            title = entry.get("title", "Unbekannt")
            video_url = entry.get("webpage_url") or entry.get("url")

            print(f"[{index}/{total}] {title}")

            try:
                ydl.download([video_url])
                print(f"  ✓ Fertig: {title}\n")
            except Exception as exc:  # noqa: BLE001 – Fehler pro Video melden, Rest fortsetzen
                print(f"  ✗ Fehler bei „{title}“: {exc}\n", file=sys.stderr)

    print("-" * 60)
    print(f"Fertig. Audiodateien liegen in: {output_dir}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Konvertiert eine YouTube-Playlist nacheinander in Audiodateien.",
    )
    parser.add_argument(
        "playlist_url",
        help="URL der YouTube-Playlist (z. B. https://www.youtube.com/playlist?list=...)",
    )
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=default_download_dir(),
        help=f"Zielordner (Standard: {default_download_dir()})",
    )
    parser.add_argument(
        "-f",
        "--format",
        choices=["mp3", "m4a", "opus", "wav", "flac"],
        default="mp3",
        help="Audioformat (Standard: mp3)",
    )
    parser.add_argument(
        "-q",
        "--quality",
        default="192",
        help="Audio-Bitrate in kbps für verlustbehaftete Formate (Standard: 192)",
    )
    parser.add_argument(
        "--no-skip",
        action="store_true",
        help="Bereits vorhandene Dateien erneut herunterladen",
    )
    return parser.parse_args()


def main() -> None:
    check_ffmpeg()
    args = parse_args()
    download_playlist(
        playlist_url=args.playlist_url,
        output_dir=args.output.expanduser().resolve(),
        audio_format=args.format,
        quality=args.quality,
        skip_existing=not args.no_skip,
    )


if __name__ == "__main__":
    main()
