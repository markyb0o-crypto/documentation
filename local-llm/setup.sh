#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

echo "=== Lokale LLM-Umgebung (Ollama + Open WebUI) ==="
echo

if ! command -v nvidia-smi >/dev/null 2>&1; then
  echo "WARNUNG: nvidia-smi nicht gefunden."
  echo "  Installiere zuerst den NVIDIA-Treiber:"
  echo "  https://www.nvidia.com/Download/index.aspx"
  echo
else
  echo "GPU erkannt:"
  nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv,noheader
  echo
fi

if command -v docker >/dev/null 2>&1; then
  echo "Docker gefunden — starte mit GPU-Support (empfohlen)."
  echo

  if ! docker info 2>/dev/null | grep -qi nvidia; then
    echo "Hinweis: NVIDIA Container Toolkit fehlt evtl. noch."
    echo "  Ubuntu/Debian:"
    echo "    curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg"
    echo "    curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \\"
    echo "      sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \\"
    echo "      sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list"
    echo "    sudo apt-get update && sudo apt-get install -y nvidia-container-toolkit"
    echo "    sudo nvidia-ctk runtime configure --runtime=docker"
    echo "    sudo systemctl restart docker"
    echo
  fi

  docker compose up -d
  echo
  echo "Container gestartet."
else
  echo "Docker nicht gefunden — installiere Ollama nativ."
  echo

  if ! command -v ollama >/dev/null 2>&1; then
    curl -fsSL https://ollama.com/install.sh | sh
  fi

  if command -v systemctl >/dev/null 2>&1 && systemctl is-system-running >/dev/null 2>&1; then
    sudo systemctl enable --now ollama
  else
    ollama serve >/dev/null 2>&1 &
    sleep 2
  fi

  echo "Open WebUI ohne Docker:"
  echo "  pip install open-webui   # oder: pipx install open-webui"
  echo "  open-webui serve --port 3000"
fi

echo
echo "=== Empfohlene Modelle für RTX 2060 (6 GB VRAM) ==="
echo "  bash scripts/pull-models.sh"
echo
echo "=== Zugriff ==="
echo "  Web-UI:  http://localhost:3000"
echo "  API:     http://localhost:11434"
echo "  CLI:     ollama run llama3.2:3b"
echo
