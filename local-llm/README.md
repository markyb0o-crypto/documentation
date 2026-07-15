# Lokale LLM-Umgebung (RTX 2060)

Ollama + Open WebUI — große Modellauswahl, Chat im Browser, OpenAI-kompatible API.

## Deine GPU: NVIDIA RTX 2060

| Variante | VRAM | Empfehlung |
|----------|------|------------|
| RTX 2060 | 6 GB | 3B–8B Modelle (Q4), max. ~9B |
| RTX 2060 Super | 8 GB | zusätzlich 13B (Q4) möglich |

**Wichtig:** Diese Cloud-VM hat **keine** GPU. Das Setup ist für **deinen Rechner** mit RTX 2060 gedacht.

## Schnellstart (Linux)

```bash
cd local-llm
chmod +x setup.sh scripts/pull-models.sh
./setup.sh
./scripts/pull-models.sh
```

Danach im Browser: **http://localhost:3000**

## Was du bekommst

- **Ollama** — Modell-Verwaltung, 100+ Modelle auf [ollama.com/library](https://ollama.com/library)
- **Open WebUI** — Chat-Oberfläche, Modellwechsel per Klick, Verlauf, Uploads
- **API** unter `http://localhost:11434` (kompatibel mit vielen Tools)

## Modell-Empfehlungen (RTX 2060, 6 GB)

| Modell | Größe (ca.) | Einsatz |
|--------|-------------|---------|
| `llama3.2:3b` | ~2 GB | Sehr schnell, Alltag |
| `llama3.1:8b` | ~4.7 GB | Gute Qualität |
| `mistral:7b` | ~4.1 GB | Solider Allrounder |
| `qwen2.5:7b` | ~4.7 GB | Stark bei Logik/Code |
| `codellama:7b` | ~4.1 GB | Programmieren |
| `llava:7b` | ~4.7 GB | Bilder verstehen |
| `gemma2:9b` | ~5.5 GB | Knapp, aber machbar |

Einzelnes Modell laden:

```bash
ollama pull llama3.1:8b
ollama run llama3.1:8b
```

Weitere Modelle: `ollama search` oder [ollama.com/library](https://ollama.com/library)

## Voraussetzungen

1. **NVIDIA-Treiber** — `nvidia-smi` muss funktionieren
2. **Docker** (empfohlen) + **NVIDIA Container Toolkit**
3. Alternativ: native Ollama-Installation ohne Docker

### NVIDIA Container Toolkit (Ubuntu)

```bash
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | \
  sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
  sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
  sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
sudo apt-get update && sudo apt-get install -y nvidia-container-toolkit
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker
```

## Windows

1. [Ollama für Windows](https://ollama.com/download) installieren
2. [Docker Desktop](https://www.docker.com/products/docker-desktop/) mit WSL2 + GPU
3. In PowerShell im Ordner `local-llm`:

```powershell
docker compose up -d
```

Oder Open WebUI nativ: [openwebui.com](https://openwebui.com)

## Nützliche Befehle

```bash
docker compose up -d          # Starten
docker compose down           # Stoppen
docker compose logs -f ollama # Logs
ollama list                   # Installierte Modelle
ollama rm modellname          # Modell löschen
```

## API-Beispiel

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2:3b",
  "prompt": "Erkläre Quantencomputing in drei Sätzen.",
  "stream": false
}'
```

## Grenzen der RTX 2060

- **70B+ Modelle:** passen nicht in 6 GB VRAM
- **13B+:** nur mit stärkerer Quantisierung (Q3) oder CPU-Offload (deutlich langsamer)
- **Mehrere Modelle gleichzeitig:** nur eines aktiv im VRAM — Rest auf Festplatte

Für größere Modelle: Upgrade auf 12 GB+ VRAM (z. B. RTX 3060 12 GB, RTX 4070).
