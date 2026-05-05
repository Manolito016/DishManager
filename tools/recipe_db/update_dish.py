import argparse
import json
import sqlite3
from datetime import datetime, timezone


UTC = timezone.utc


def now_utc_iso() -> str:
    return datetime.now(UTC).replace(microsecond=0).isoformat()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", required=True)
    ap.add_argument("--category", required=True)
    ap.add_argument("--canonical-name", required=True)
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument(
        "--payload-json",
        help="JSON string with keys: ingredients[], steps[], instructions?, prep_time_minutes?, cook_time_minutes?, total_time_minutes?, servings?, tips?, sources[]",
    )
    g.add_argument("--payload-file", help="Path to a UTF-8 JSON file with the same schema as --payload-json")
    args = ap.parse_args()

    if args.payload_file:
        with open(args.payload_file, "r", encoding="utf-8") as f:
            payload = json.load(f)
    else:
        payload = json.loads(args.payload_json)
    ingredients = payload.get("ingredients") or []
    steps = payload.get("steps") or []
    instructions = payload.get("instructions")
    tips = payload.get("tips")
    servings = payload.get("servings")
    prep_time_minutes = payload.get("prep_time_minutes")
    cook_time_minutes = payload.get("cook_time_minutes")
    total_time_minutes = payload.get("total_time_minutes")
    sources = payload.get("sources") or []

    ts = now_utc_iso()
    conn = sqlite3.connect(args.db)
    try:
        row = conn.execute(
            "SELECT id FROM dishes WHERE canonical_name=? AND category=?",
            (args.canonical_name, args.category),
        ).fetchone()
        if not row:
            raise SystemExit("dish not found")
        dish_id = int(row[0])

        conn.execute(
            "UPDATE dishes SET prep_time_minutes=?, cook_time_minutes=?, total_time_minutes=?, servings=?, tips=?, instructions=?, updated_at_utc=? WHERE id=?",
            (
                prep_time_minutes,
                cook_time_minutes,
                total_time_minutes,
                servings,
                tips,
                instructions,
                ts,
                dish_id,
            ),
        )

        conn.execute("DELETE FROM dish_ingredients WHERE dish_id=?", (dish_id,))
        for idx, ing in enumerate(ingredients, start=1):
            conn.execute(
                "INSERT INTO dish_ingredients(dish_id, position, ingredient_text, created_at_utc) VALUES(?,?,?,?)",
                (dish_id, idx, ing, ts),
            )

        conn.execute("DELETE FROM dish_steps WHERE dish_id=?", (dish_id,))
        for idx, st in enumerate(steps, start=1):
            conn.execute(
                "INSERT INTO dish_steps(dish_id, position, step_text, created_at_utc) VALUES(?,?,?,?)",
                (dish_id, idx, st, ts),
            )

        conn.execute("DELETE FROM dish_sources WHERE dish_id=?", (dish_id,))
        for s in sources:
            conn.execute(
                "INSERT INTO dish_sources(dish_id, url, title, publisher, accessed_at_utc, created_at_utc) VALUES(?,?,?,?,?,?)",
                (dish_id, s.get("url"), s.get("title"), s.get("publisher"), ts, ts),
            )

        status = "completed" if ingredients and steps else "failed"
        conn.execute(
            "UPDATE enrichment_queue SET status=?, attempts=attempts+1, last_error=NULL, updated_at_utc=? WHERE dish_id=?",
            (status, ts, dish_id),
        )

        conn.commit()
    finally:
        conn.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
