# Structure compatibility for replaced biomes

`Biome Replacer` changes the biome selected by world generation, but structure
definitions still test the original biome IDs and tags. The generated files in
`kubejs/data` make every replacement biome inherit the structure eligibility of
the biome it replaces without changing structure spacing, separation, or salts.

Rules whose destination is an existing vanilla biome (such as savanna to plains)
are intentionally skipped. Those destinations already have complete structure
support, and extending them would make savanna structures generate in every
plains biome or Fantasy Birch structures generate in every meadow—not only in
the terrain regions that were replaced.

The files are generated from the active mod set and
`config/biome_replacer.properties`. After changing either, regenerate them from
the instance root:

```sh
python3 tools/generate_structure_biome_compat.py
```

The generator scans vanilla 1.20.1, installed mod jars, and Paxi datapacks. It
uses additive biome tags wherever possible. When a structure hard-codes biome
IDs instead of using a tag, it emits a narrowly scoped structure override whose
only change is the `biomes` holder set.

Only newly generated chunks can contain newly eligible structures.
