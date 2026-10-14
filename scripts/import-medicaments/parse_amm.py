"""
Extrait le tableau de medicaments depuis le PDF AMM Madagascar
(telecharge par fetch_amm.py) et produit un fichier JSON intermediaire
propre, une ligne par medicament.

Le PDF est un export Excel avec une vraie grille de tableau (bordures),
ce qui permet a pdfplumber d'en extraire les colonnes proprement :
Nom commercial, Code Produit, DCI, Presentation, Fabriquant, Laboratoire.
Les cellules multi-lignes (retour a la ligne du a la largeur de colonne,
pas un vrai saut de champ) sont aplaties en une seule ligne.

Usage:
    python parse_amm.py [chemin_du_pdf]

Si aucun chemin n'est fourni, le script prend automatiquement le premier
PDF trouve dans output/raw/.
"""

import json
import re
import sys
from pathlib import Path
from typing import List, Optional

import pdfplumber

RAW_DIR = Path(__file__).parent / "output" / "raw"
OUTPUT_JSON = Path(__file__).parent / "output" / "medicaments_amm.json"

EXPECTED_HEADER = [
    "Nom commercial", "Code Produit", "DCI", "Présentation", "Fabriquant", "Laboratoire"
]


def clean_cell(value: Optional[str]) -> str:
    """Aplatit une cellule multi-lignes en une seule ligne, espaces normalises."""
    if not value:
        return ""
    return re.sub(r"\s+", " ", value.replace("\n", " ")).strip()


def find_default_pdf() -> Path:
    pdfs = sorted(RAW_DIR.glob("*.pdf"))
    if not pdfs:
        raise FileNotFoundError(
            f"Aucun PDF trouve dans {RAW_DIR}. Lancez d'abord fetch_amm.py, "
            "ou passez le chemin du PDF en argument (python parse_amm.py chemin.pdf)."
        )
    return pdfs[0]


def extract_medications(pdf_path: Path) -> List[dict]:
    medications = []
    skipped_header_rows = 0
    malformed_rows = 0

    with pdfplumber.open(pdf_path) as pdf:
        for page_number, page in enumerate(pdf.pages, start=1):
            for table in page.extract_tables():
                for row in table:
                    cleaned = [clean_cell(c) for c in row]

                    # Ignore les lignes d'en-tete, repetees en haut de chaque page
                    if cleaned[:len(EXPECTED_HEADER)] == EXPECTED_HEADER:
                        skipped_header_rows += 1
                        continue

                    # Ignore les lignes vides ou incompletes (ex: lignes de
                    # separation visuelle detectees par erreur comme tableau)
                    if len(cleaned) < 6 or not cleaned[0]:
                        malformed_rows += 1
                        continue

                    nom_commercial, code_produit, dci, presentation, fabricant, laboratoire = cleaned[:6]

                    medications.append({
                        "nomCommercial": nom_commercial.upper(),
                        "codeProduit": code_produit,
                        "dci": dci,
                        "presentation": presentation,
                        "fabricant": fabricant,
                        "laboratoire": laboratoire,
                        "pageSource": page_number,
                    })

    print(f"Lignes d'en-tete ignorees : {skipped_header_rows}")
    print(f"Lignes mal formees ignorees : {malformed_rows}")
    return medications


def main() -> None:
    pdf_path = Path(sys.argv[1]) if len(sys.argv) > 1 else find_default_pdf()
    print(f"Extraction depuis : {pdf_path}")

    medications = extract_medications(pdf_path)
    print(f"Medicaments extraits : {len(medications)}")

    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_JSON.write_text(
        json.dumps(medications, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Fichier ecrit : {OUTPUT_JSON}")


if __name__ == "__main__":
    try:
        main()
    except FileNotFoundError as e:
        print(f"Erreur : {e}", file=sys.stderr)
        sys.exit(1)
