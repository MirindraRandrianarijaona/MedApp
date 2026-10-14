"""
Telecharge la liste des medicaments enregistres a Madagascar publiee par
l'Agence du Medicament de Madagascar (amm.mg).

Le site amm.mg etant injoignable au moment de l'ecriture de ce script
(timeout de connexion), on passe par une capture Wayback Machine
(web.archive.org) plutot que par le site en direct.

Pour mettre a jour vers une liste plus recente le jour ou amm.mg est de
nouveau accessible, ou qu'une capture plus recente existe sur Wayback
Machine :
  1. Aller sur https://web.archive.org/web/*/amm.mg/*
  2. Filtrer sur "pdf", choisir la capture la plus recente de la liste
     des medicaments enregistres
  3. Copier l'URL complete (avec l'horodatage, ex: /web/20260219023331/...)
     et remplacer ARCHIVE_PDF_URL ci-dessous

Usage:
    python fetch_amm.py
"""

import sys
from pathlib import Path

import requests

ARCHIVE_PDF_URL = (
    "https://web.archive.org/web/20260219023331/"
    "https://amm.mg/PDF/SE/2025/9%20LISTE_AMM_Dec-2025.pdf"
)
OUTPUT_DIR = Path(__file__).parent / "output" / "raw"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; MedApp-import/1.0; usage interne cabinet medical)"
}


def download_pdf(pdf_url: str, dest_dir: Path) -> Path:
    dest_dir.mkdir(parents=True, exist_ok=True)

    # Le nom de fichier Wayback contient l'URL d'origine apres l'horodatage ;
    # on ne garde que la vraie partie nom de fichier (apres le dernier "/").
    filename = pdf_url.split("/")[-1].split("?")[0]
    dest_path = dest_dir / filename

    response = requests.get(pdf_url, headers=HEADERS, timeout=30)
    response.raise_for_status()
    dest_path.write_bytes(response.content)

    return dest_path


def main() -> None:
    print(f"Telechargement depuis Wayback Machine : {ARCHIVE_PDF_URL}")
    dest_path = download_pdf(ARCHIVE_PDF_URL, OUTPUT_DIR)
    print(f"PDF telecharge : {dest_path}")


if __name__ == "__main__":
    try:
        main()
    except requests.RequestException as e:
        print(f"Erreur reseau : {e}", file=sys.stderr)
        sys.exit(1)
