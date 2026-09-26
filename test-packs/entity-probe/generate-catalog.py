#!/usr/bin/env python3
"""Build the probe catalog from Mojang's vanilla behavior definitions."""

import argparse
import json
from pathlib import Path

import json5


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("entities", type=Path, help="Path to bedrock-samples/behavior_pack/entities")
    args = parser.parse_args()

    catalog = []
    for path in sorted(args.entities.glob("*.json")):
        with path.open(encoding="utf-8") as source:
            entity = json5.load(source).get("minecraft:entity", {})
        description = entity.get("description") or {}
        identifier = description.get("identifier")
        if not identifier:
            continue

        properties = []
        for property_id, definition in sorted((description.get("properties") or {}).items()):
            if not definition.get("client_sync"):
                continue
            property_type = definition.get("type")
            if property_type == "enum":
                values = definition.get("values") or []
            elif property_type == "bool":
                values = [False, True]
            elif property_type in ("int", "float"):
                values = list(dict.fromkeys(
                    value for value in (
                        definition.get("range", [None, None])[0],
                        definition.get("default"),
                        definition.get("range", [None, None])[-1],
                    ) if value is not None
                ))
            else:
                values = []
            properties.append({"id": property_id, "type": property_type, "values": values})

        catalog.append({
            "type": identifier,
            "summonable": description.get("is_summonable", True),
            "events": sorted((entity.get("events") or {}).keys()),
            "properties": properties,
        })

    output = Path(__file__).parent / "behavior_pack/scripts/catalog.js"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        "// Generated from Mojang bedrock-samples v1.26.40.05. Do not edit.\n"
        + "export const catalog = " + json.dumps(catalog, separators=(",", ":")) + ";\n",
        encoding="utf-8",
    )
    print(
        f"{len(catalog)} types, "
        f"{sum(len(entry['events']) for entry in catalog)} events, "
        f"{sum(len(entry['properties']) for entry in catalog)} synced properties"
    )


if __name__ == "__main__":
    main()
