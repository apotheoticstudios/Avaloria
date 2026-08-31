#!/usr/bin/env python3
"""Generate deterministic structure-biome compatibility for Biome Replacer.

The generator reads the active Biome Replacer rules, vanilla 1.20.1 data, every
installed mod jar, and Paxi datapacks. For each structure that accepts a biome
being replaced, it makes the replacement biome eligible as well.

Most structures reference biome tags; those receive small additive tag files.
Structures that hard-code biome IDs receive a complete structure JSON override
whose only change is routing the original biome holder set through a generated
compatibility tag.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import io
import json
import re
import urllib.request
import zipfile
from collections import defaultdict
from pathlib import Path


MINECRAFT_VERSION = "1.20.1"
VERSION_MANIFEST_URL = (
    "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json"
)
TAG_PATTERN = re.compile(
    r"^data/([^/]+)/tags/worldgen/biome/(.+)\.json$"
)
STRUCTURE_PATTERN = re.compile(
    r"^data/([^/]+)/worldgen/structure/(.+)\.json$"
)


def strip_line_comments(text: str) -> str:
    """Remove // comments while preserving comment-like text inside strings."""
    output: list[str] = []
    index = 0
    in_string = False
    escaped = False
    while index < len(text):
        char = text[index]
        if in_string:
            output.append(char)
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == '"':
                in_string = False
            index += 1
            continue
        if char == '"':
            in_string = True
            output.append(char)
            index += 1
            continue
        if char == "/" and index + 1 < len(text) and text[index + 1] == "/":
            while index < len(text) and text[index] not in "\r\n":
                index += 1
            continue
        output.append(char)
        index += 1
    return "".join(output)


def load_json_bytes(raw: bytes, source: str) -> object:
    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        raise ValueError(f"Invalid UTF-8 in {source}: {exc}") from exc
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        try:
            return json.loads(strip_line_comments(text))
        except json.JSONDecodeError as exc:
            raise ValueError(f"Invalid JSON in {source}: {exc}") from exc


def download_json(url: str) -> dict:
    with urllib.request.urlopen(url, timeout=30) as response:
        return json.load(response)


def vanilla_data_jar(version: str) -> zipfile.ZipFile:
    manifest = download_json(VERSION_MANIFEST_URL)
    version_url = next(
        entry["url"] for entry in manifest["versions"] if entry["id"] == version
    )
    version_data = download_json(version_url)
    server_download = version_data["downloads"]["server"]

    with urllib.request.urlopen(server_download["url"], timeout=60) as response:
        bundled_server = response.read()
    actual_sha1 = hashlib.sha1(bundled_server).hexdigest()
    if actual_sha1 != server_download["sha1"]:
        raise ValueError(
            f"Vanilla server checksum mismatch: {actual_sha1} != "
            f"{server_download['sha1']}"
        )

    with zipfile.ZipFile(io.BytesIO(bundled_server)) as outer:
        inner_path = f"META-INF/versions/{version}/server-{version}.jar"
        inner_bytes = outer.read(inner_path)
    return zipfile.ZipFile(io.BytesIO(inner_bytes))


def read_replacements(config_path: Path) -> list[tuple[str, str]]:
    replacements: list[tuple[str, str]] = []
    for line_number, raw_line in enumerate(
        config_path.read_text(encoding="utf-8").splitlines(), 1
    ):
        line = raw_line.strip()
        if not line or line.startswith("!") or line.startswith("#"):
            continue
        if line.startswith("[") and line.endswith("]"):
            continue
        if ">" not in line:
            raise ValueError(f"Malformed replacement rule on line {line_number}: {line}")
        old_biome, new_biome = (part.strip() for part in line.split(">", 1))
        if old_biome.startswith("#"):
            raise ValueError(
                "Tag-based source rules are not supported by this generator: "
                f"{old_biome}"
            )
        if new_biome == "null":
            continue
        replacements.append((old_biome, new_biome))
    return replacements


def resource_archives(root: Path) -> list[Path]:
    archives = sorted((root / "mods").glob("*.jar"), key=lambda p: p.name.lower())
    archives.extend(
        sorted(
            (root / "config" / "paxi" / "datapacks").glob("*.zip"),
            key=lambda p: p.name.lower(),
        )
    )
    return archives


def collect_resources(
    vanilla: zipfile.ZipFile, archives: list[Path]
) -> tuple[dict[str, list[dict]], dict[str, dict], list[str]]:
    tag_documents: dict[str, list[dict]] = defaultdict(list)
    structures: dict[str, dict] = {}
    warnings: list[str] = []

    sources: list[tuple[str, zipfile.ZipFile]] = [("vanilla", vanilla)]
    opened: list[zipfile.ZipFile] = []
    try:
        for archive in archives:
            try:
                opened_archive = zipfile.ZipFile(archive)
            except zipfile.BadZipFile:
                warnings.append(f"Skipped invalid archive: {archive}")
                continue
            opened.append(opened_archive)
            sources.append((archive.name, opened_archive))

        for source_name, archive in sources:
            for member in archive.namelist():
                tag_match = TAG_PATTERN.match(member)
                structure_match = STRUCTURE_PATTERN.match(member)
                if not tag_match and not structure_match:
                    continue
                try:
                    document = load_json_bytes(
                        archive.read(member), f"{source_name}!/{member}"
                    )
                except (KeyError, ValueError) as exc:
                    warnings.append(str(exc))
                    continue
                if not isinstance(document, dict):
                    warnings.append(f"Skipped non-object JSON: {source_name}!/{member}")
                    continue
                if tag_match:
                    namespace, tag_path = tag_match.groups()
                    tag_documents[f"{namespace}:{tag_path}"].append(document)
                else:
                    namespace, structure_path = structure_match.groups()
                    structures[f"{namespace}:{structure_path}"] = document
    finally:
        for archive in opened:
            archive.close()

    return tag_documents, structures, warnings


def tag_values(documents: list[dict]) -> list[object]:
    values: list[object] = []
    for document in documents:
        if document.get("replace", False):
            values.clear()
        document_values = document.get("values", [])
        if isinstance(document_values, list):
            values.extend(document_values)
    return values


def entry_id(entry: object) -> str | None:
    if isinstance(entry, str):
        return entry
    if isinstance(entry, dict) and isinstance(entry.get("id"), str):
        return entry["id"]
    return None


def make_tag_resolver(tag_documents: dict[str, list[dict]]):
    cache: dict[str, set[str]] = {}

    def resolve(tag_id: str, visiting: frozenset[str] = frozenset()) -> set[str]:
        if tag_id in cache:
            return set(cache[tag_id])
        if tag_id in visiting:
            return set()
        result: set[str] = set()
        next_visiting = visiting | {tag_id}
        for entry in tag_values(tag_documents.get(tag_id, [])):
            identifier = entry_id(entry)
            if not identifier:
                continue
            if identifier.startswith("#"):
                result.update(resolve(identifier[1:], next_visiting))
            else:
                result.add(identifier)
        cache[tag_id] = result
        return set(result)

    return resolve


def resolve_holder(holder: object, resolve_tag) -> set[str]:
    entries = holder if isinstance(holder, list) else [holder]
    result: set[str] = set()
    for entry in entries:
        identifier = entry_id(entry)
        if not identifier:
            continue
        if identifier.startswith("#"):
            result.update(resolve_tag(identifier[1:]))
        else:
            result.add(identifier)
    return result


def path_for_tag(data_root: Path, tag_id: str) -> Path:
    namespace, tag_path = tag_id.split(":", 1)
    return data_root / namespace / "tags" / "worldgen" / "biome" / f"{tag_path}.json"


def path_for_structure(data_root: Path, structure_id: str) -> Path:
    namespace, structure_path = structure_id.split(":", 1)
    return data_root / namespace / "worldgen" / "structure" / f"{structure_path}.json"


def write_json(path: Path, document: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(document, indent=2) + "\n", encoding="utf-8")


def remove_previous_outputs(root: Path, manifest_path: Path) -> None:
    if not manifest_path.exists():
        return
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    for relative_path in manifest.get("generated_files", []):
        target = (root / relative_path).resolve()
        if root.resolve() not in target.parents:
            raise ValueError(f"Refusing to remove path outside the instance: {target}")
        if target.is_file():
            target.unlink()


def generate(root: Path) -> dict:
    config_path = root / "config" / "biome_replacer.properties"
    data_root = root / "kubejs" / "data"
    manifest_path = root / "kubejs" / "structure_biome_compat_manifest.json"
    configured_replacements = read_replacements(config_path)
    replacements = [
        rule
        for rule in configured_replacements
        if not rule[1].startswith("minecraft:")
    ]
    skipped_vanilla_targets = [
        rule
        for rule in configured_replacements
        if rule[1].startswith("minecraft:")
    ]

    with vanilla_data_jar(MINECRAFT_VERSION) as vanilla:
        tags, structures, warnings = collect_resources(
            vanilla, resource_archives(root)
        )
    resolve_tag = make_tag_resolver(tags)

    tag_additions: dict[str, set[str]] = defaultdict(set)
    direct_overrides: dict[str, tuple[dict, str, list[object], set[str]]] = {}
    impacted_structures: dict[str, set[str]] = defaultdict(set)

    for structure_id, structure in sorted(structures.items()):
        holder = structure.get("biomes")
        if holder is None:
            continue
        allowed = resolve_holder(holder, resolve_tag)
        additions = {
            new_biome
            for old_biome, new_biome in replacements
            if old_biome in allowed and new_biome not in allowed
        }
        if not additions:
            continue
        impacted_structures[structure_id].update(additions)

        if isinstance(holder, str) and holder.startswith("#"):
            tag_additions[holder[1:]].update(additions)
            continue

        compat_tag = (
            "kubejs:biome_replacer_structure_compat/"
            + structure_id.replace(":", "/")
        )
        original_entries = copy.deepcopy(holder if isinstance(holder, list) else [holder])
        override = copy.deepcopy(structure)
        override["biomes"] = f"#{compat_tag}"
        direct_overrides[structure_id] = (
            override,
            compat_tag,
            original_entries,
            additions,
        )

    verification_tags = {
        tag_id: list(documents) for tag_id, documents in tags.items()
    }
    for tag_id, additions in tag_additions.items():
        verification_tags.setdefault(tag_id, []).append(
            {"replace": False, "values": sorted(additions)}
        )
    for _, compat_tag, original_entries, additions in direct_overrides.values():
        verification_tags.setdefault(compat_tag, []).append(
            {
                "replace": False,
                "values": original_entries + sorted(additions),
            }
        )
    verification_structures = dict(structures)
    for structure_id, (override, _, _, _) in direct_overrides.items():
        verification_structures[structure_id] = override
    resolve_verified_tag = make_tag_resolver(verification_tags)
    verification_failures: dict[str, list[str]] = {}
    for structure_id, expected_additions in impacted_structures.items():
        allowed_after = resolve_holder(
            verification_structures[structure_id]["biomes"], resolve_verified_tag
        )
        missing = sorted(expected_additions - allowed_after)
        if missing:
            verification_failures[structure_id] = missing
    if verification_failures:
        raise ValueError(
            "Generated compatibility failed its eligibility audit: "
            + json.dumps(verification_failures, sort_keys=True)
        )

    remove_previous_outputs(root, manifest_path)
    generated_files: list[str] = []

    for tag_id, additions in sorted(tag_additions.items()):
        output_path = path_for_tag(data_root, tag_id)
        write_json(
            output_path,
            {"replace": False, "values": sorted(additions)},
        )
        generated_files.append(str(output_path.relative_to(root)))

    for structure_id, (override, compat_tag, original_entries, additions) in sorted(
        direct_overrides.items()
    ):
        structure_path = path_for_structure(data_root, structure_id)
        write_json(structure_path, override)
        generated_files.append(str(structure_path.relative_to(root)))

        compat_tag_path = path_for_tag(data_root, compat_tag)
        compat_values = original_entries + sorted(additions)
        write_json(
            compat_tag_path,
            {"replace": False, "values": compat_values},
        )
        generated_files.append(str(compat_tag_path.relative_to(root)))

    manifest = {
        "description": (
            "Generated deterministic structure compatibility for active "
            "Biome Replacer rules. Regenerate with "
            "tools/generate_structure_biome_compat.py after changing mods or rules."
        ),
        "minecraft_version": MINECRAFT_VERSION,
        "replacements": [
            {"source": old_biome, "replacement": new_biome}
            for old_biome, new_biome in replacements
        ],
        "skipped_vanilla_targets": [
            {
                "source": old_biome,
                "replacement": new_biome,
                "reason": (
                    "The replacement is an existing vanilla biome with its own "
                    "structure eligibility; inheriting the removed biome would "
                    "affect every occurrence of the vanilla biome."
                ),
            }
            for old_biome, new_biome in skipped_vanilla_targets
        ],
        "structure_definitions_scanned": len(structures),
        "biome_tags_scanned": len(tags),
        "structures_extended": len(impacted_structures),
        "tags_extended": len(tag_additions),
        "direct_structure_overrides": len(direct_overrides),
        "eligibility_audit": "passed",
        "generated_files": sorted(generated_files),
        "tag_additions": {
            tag_id: sorted(additions)
            for tag_id, additions in sorted(tag_additions.items())
        },
        "structure_additions": {
            structure_id: sorted(additions)
            for structure_id, additions in sorted(impacted_structures.items())
        },
        "warnings": warnings,
    }
    write_json(manifest_path, manifest)
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--instance",
        type=Path,
        default=Path(__file__).resolve().parents[1],
        help="Minecraft instance root (defaults to this repository)",
    )
    args = parser.parse_args()
    manifest = generate(args.instance.resolve())
    print(
        "Generated compatibility for "
        f"{manifest['structures_extended']} structures via "
        f"{manifest['tags_extended']} additive tags and "
        f"{manifest['direct_structure_overrides']} direct-biome overrides."
    )
    if manifest["warnings"]:
        print(f"Warnings: {len(manifest['warnings'])}")


if __name__ == "__main__":
    main()
