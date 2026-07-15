#!/usr/bin/env bash
set -euo pipefail

# RTX 2060 (6 GB VRAM): quantisierte 7B–8B-Modelle laufen gut.
# 13B nur mit Q3_K_M oder kleiner; größere Modelle brauchen CPU-Offload (langsam).

MODELS=(
  # Schnell & leicht (~2 GB)
  "llama3.2:3b"
  "gemma2:2b"
  "phi3:mini"

  # Allrounder (~4–5 GB, Q4)
  "llama3.1:8b"
  "mistral:7b"
  "qwen2.5:7b"
  "gemma2:9b"

  # Code
  "codellama:7b"
  "deepseek-coder:6.7b"

  # Deutsch / EU
  "leo-hessianai:7b"

  # Vision (Bilder beschreiben)
  "llava:7b"

  # Optional: knapp auf 6 GB — nur wenn genug freier VRAM
  # "llama3.1:13b"
)

echo "Lade ${#MODELS[@]} Modelle für Ollama …"
echo "(Abbruch jederzeit mit Ctrl+C möglich)"
echo

for model in "${MODELS[@]}"; do
  echo ">>> Pull: $model"
  ollama pull "$model"
  echo
done

echo "Fertig. Installierte Modelle:"
ollama list
