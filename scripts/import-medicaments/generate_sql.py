"""
Prend le fichier JSON produit par parse_amm.py, deduplique, derive
'forme' et 'dosageDisponible' (colonnes du schema reel de la table
medicament, qui n'a pas de champ presentation brute), et genere le
fichier .sql d'insertion final.

Schema cible (medicament) :
    nomCommercial, nomGenerique, forme, dosageDisponible, classeTherapeutique

Notes:
- nomGenerique <- dci (juste un nom de colonne different, meme donnee)
- classeTherapeutique est laisse a NULL pour l'instant (decision : pas
  d'enrichissement ATC/BDPM dans cette premiere version, colonne
  nullable donc aucun probleme pour le code existant)
- forme <- premier segment du texte "presentation", avant la premiere
  virgule (ex: "Comprime pellicule, boite de ..." -> "Comprime pellicule")
- dosageDisponible <- extrait UNIQUEMENT quand une unite explicite est
  presente dans le nom commercial (ex: "500MG", "20ML"). Si aucune unite
  n'est trouvee, le champ reste vide plutot que de deviner une unite —
  a completer manuellement plus tard.

Usage:
    python generate_sql.py [chemin_du_json]

Si aucun chemin n'est fourni, le script prend automatiquement
output/medicaments_amm.json (sortie par defaut de parse_amm.py).
"""

import json
import re
import sys
from pathlib import Path
from typing import Optional

INPUT_JSON = Path(__file__).parent / "output" / "medicaments_amm.json"
OUTPUT_SQL = Path(__file__).parent / "output" / "medicaments_seed.sql"

DOSAGE_PATTERN = re.compile(
    r"(\d+[.,]?\d*\s?(?:MG/ML|MG/G|MCG|UI|MG|G|ML|%))", re.IGNORECASE
)


def extract_forme(presentation: str) -> str:
    """Prend le premier segment avant la virgule comme forme galenique brute."""
    if not presentation:
        return ""
    return presentation.split(",")[0].strip()


def extract_dosage(nom_commercial: str) -> Optional[str]:
    """
    Cherche un dosage avec unite explicite dans le nom commercial.
    Retourne None si aucune unite claire n'est trouvee (on ne devine pas).
    """
    match = DOSAGE_PATTERN.search(nom_commercial)
    if not match:
        return None
    return re.sub(r"\s+", "", match.group(1)).upper()


def sql_escape(value: Optional[str]) -> str:
    """Echappe une valeur pour un litteral SQL, ou retourne NULL si vide/None."""
    if value is None or value == "":
        return "NULL"
    return "'" + value.replace("'", "''") + "'"


def dedupe(medications: list) -> list:
    """Supprime les doublons par codeProduit (identifiant AMM stable), cf.
    lignes a cheval sur deux pages du PDF qui se retrouvent extraites deux
    fois avec le meme code."""
    seen = set()
    unique = []
    for m in medications:
        code = m["codeProduit"]
        if code in seen:
            continue
        seen.add(code)
        unique.append(m)
    return unique


def build_insert_statements(medications: list) -> str:
    lines = [
        "-- Genere automatiquement par generate_sql.py",
        "-- Table cible : medicament (codeProduit, nomCommercial, "
        "nomGenerique, forme, dosageDisponible, classeTherapeutique)",
        "-- classeTherapeutique est laisse a NULL (pas d'enrichissement ATC "
        "dans cette version)",
        "-- INSERT OR IGNORE : un reimport ulterieur (nouvelle liste AMM) ne",
        "-- creera pas de doublons pour les codeProduit deja presents en base.",
        "",
    ]
    for m in medications:
        forme = extract_forme(m["presentation"])
        dosage = extract_dosage(m["nomCommercial"])

        lines.append(
            "INSERT OR IGNORE INTO medicament (codeProduit, nomCommercial, "
            "nomGenerique, forme, dosageDisponible, classeTherapeutique) VALUES ("
            f"{sql_escape(m['codeProduit'])}, "
            f"{sql_escape(m['nomCommercial'])}, "
            f"{sql_escape(m['dci'])}, "
            f"{sql_escape(forme)}, "
            f"{sql_escape(dosage)}, "
            "NULL);"
        )
    return "\n".join(lines) + "\n"


def main() -> None:
    input_path = Path(sys.argv[1]) if len(sys.argv) > 1 else INPUT_JSON
    print(f"Lecture de : {input_path}")

    medications = json.loads(input_path.read_text(encoding="utf-8"))
    print(f"Medicaments charges : {len(medications)}")

    medications = dedupe(medications)
    print(f"Medicaments apres deduplication : {len(medications)}")

    dosage_found = sum(1 for m in medications if extract_dosage(m["nomCommercial"]))
    print(f"Dosage avec unite explicite trouve : {dosage_found} / {len(medications)}")

    sql_content = build_insert_statements(medications)

    OUTPUT_SQL.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_SQL.write_text(sql_content, encoding="utf-8")
    print(f"Fichier ecrit : {OUTPUT_SQL}")


if __name__ == "__main__":
    try:
        main()
    except FileNotFoundError as e:
        print(f"Erreur : fichier introuvable ({e}). Lancez d'abord parse_amm.py.", file=sys.stderr)
        sys.exit(1)
