//priority: 0
ServerEvents.recipes(event => {
    let debug = false // Set to true if you want connection logging in your console

    let ArmorSet = (mod, prefix, type) => {
        // Automatically determine piece suffixes based on the naming pattern of the mod
        let suffixes = ["helmet", "chestplate", "leggings", "boots"]
        if (type === "chest") {
            suffixes = ["head", "chest", "legs", "feet"]
        } else if (type === "tunic") {
            suffixes = ["cowl", "tunic", "pants", "boots"]
        } else if (type === "coat") {
            suffixes = ["hood", "coat", "trousers", "boots"]
        } else if (type === "robes") {
            suffixes = ["mask", "robes", "trousers", "boots"]
        } else if (type === "attires") {
            suffixes = ["hat", "attires", "trousers", "boots"]
        } else if (type === "suit") {
            suffixes = ["mask", "suit", "trousers", "boots"]
        } else if (type === "rags") {
            suffixes = ["hood", "rags", "trousers", "boots"]
        }

        let ids = [
            mod + ":" + prefix + "_" + suffixes[0],
            mod + ":" + prefix + "_" + suffixes[1],
            mod + ":" + prefix + "_" + suffixes[2],
            mod + ":" + prefix + "_" + suffixes[3]
        ]
        return {
            ids: ids,
            crafted_from: (main, secondary, gem) => {
                if (debug) { console.log("Main: " + main + ", Secondary: " + secondary + ", Gem: " + gem + " --> " + ids) }
                let maps = [
                    ['MSM', 'M M'],
                    ['M M', 'MGM', 'SMS'],
                    ['MMM', 'S S', 'M M'],
                    ['S S', 'M M']
                ]
                for (let i = 0; i < 4; i++) {
                    event.remove({ output: ids[i] })
                    let key
                    if (i == 1) {
                        key = { M: main, S: main, G: main }
                        if (secondary) { key.S = secondary }
                        if (gem) { key.G = gem }
                    } else {
                        key = { M: main, S: main }
                        if (secondary) { key.S = secondary }
                    }
                    event.shaped(ids[i], maps[i], key)
                }
            },
            to_smithing: (armor_set_out, template, material) => {
                for (let i = 0; i < 4; i++) {
                    if (debug) { console.log(template + " + " + ids[i] + " + " + material + " --> " + armor_set_out.ids[i]) }
                    event.remove({ output: armor_set_out.ids[i] })
                    event.smithing(armor_set_out.ids[i], template, ids[i], material)
                }
            },
            merge_smithing: (armor_set_out, template, armor_set_in) => {
                for (let i = 0; i < 4; i++) {
                    if (debug) { console.log(template + " + " + ids[i] + " + " + armor_set_in.ids[i] + " --> " + armor_set_out.ids[i]) }
                    event.remove({ output: armor_set_out.ids[i] })
                    event.smithing(armor_set_out.ids[i], template, ids[i], armor_set_in.ids[i])
                }
            },
            to_foundry: (armor_set_out, gem, carapace, material) => {
                for (let i = 0; i < 4; i++) {
                    if (debug) { console.log(`Foundry: ${ids[i]} + ${gleam_core} --> ${armor_set_out.ids[i]}`) }
                    event.remove({ output: armor_set_out.ids[i] })
                    let maps = [
                        [
                            ' HGH ',
                            'GMMMG',
                            'HMFMH',
                            'MM MM',
                            'M   M',
                        ],
                        [
                            'HH HH',
                            'GMMMG',
                            'HMFMH',
                            ' GMG ',
                            ' MMM ',
                        ],
                        [
                            ' GGG ',
                            'HMFMH',
                            'MM MM',
                            'MG GM',
                            'H   H',
                        ],
                        [
                            ' H H ',
                            ' M M ',
                            ' MFM ',
                            'GM MG',
                            'HG GH',
                        ]
                    ]
                    for (let i = 0; i < 4; i++) {
                        event.remove({ output: ids[i] })
                        event.custom({
                            type: "monsterexpansion:foundry",
                            pattern: maps[i],
                            key: {
                                G: { item: gem },
                                H: { item: carapace },
                                M: { item: material },
                                F: { item: ids[i] }
                            },
                            result: {
                                item: armor_set_out.ids[i],
                                count: 1
                            }
                        })
                    }
                }
            }
        }
    }

    let armor_sets = {
        // --- Vanilla Minecraft ---
        leather: ArmorSet("minecraft", "leather", "chestplate"),
        chainmail: ArmorSet("minecraft", "chainmail", "chestplate"),
        iron: ArmorSet("minecraft", "iron", "chestplate"),
        gold: ArmorSet("minecraft", "golden", "chestplate"),
        diamond: ArmorSet("minecraft", "diamond", "chestplate"),
        netherite: ArmorSet("minecraft", "netherite", "chestplate"),

        // --- Foolish Mod ---
        coccinium: ArmorSet("foolish", "coccinium_armor", "chestplate"),
        swamp_beast: ArmorSet("foolish", "swamp_beast", "chestplate"),
        blunt_armor: ArmorSet("foolish", "blunt_armor", "chestplate"),
        keepsteel: ArmorSet("foolish", "keepsteel", "chestplate"),
        soul_coat: ArmorSet("foolish", "soul_coat", "coat"),
        stellar_armor: ArmorSet("foolish", "stellar_armor", "chestplate"),

        // --- Armor of the Ages ---
        anubis: ArmorSet("armoroftheages", "anubis_armor", "chest"),
        centurion: ArmorSet("armoroftheages", "centurion_armor", "chest"),
        exalted_aurum: ArmorSet("armoroftheages", "exalted_aurum_armor", "chest"),
        holy_armor: ArmorSet("armoroftheages", "holy_armor", "chest"),
        iron_plate: ArmorSet("armoroftheages", "iron_plate_armor", "chest"),
        japanese_light: ArmorSet("armoroftheages", "japanese_light_armor", "chest"),
        o_yoroi: ArmorSet("armoroftheages", "o_yoroi_armor", "chest"),
        pharaoh: ArmorSet("armoroftheages", "pharaoh_armor", "chest"),
        quetzalcoatl: ArmorSet("armoroftheages", "quetzalcoatl_armor", "chest"),
        raijin: ArmorSet("armoroftheages", "raijin_armor", "chest"),

        // --- Lowlands Clothing ---
        guard_captain: ArmorSet("lowlands_clothing", "guard_captain_armor", "chestplate"),
        mercenary_swordsman: ArmorSet("lowlands_clothing", "mercenary_swordman", "chestplate"),
        mountainmen: ArmorSet("lowlands_clothing", "mountainmenclothes", "chestplate"),
        snowtiger: ArmorSet("lowlands_clothing", "snowtigerarmor", "chestplate"),
        ratcatcher: ArmorSet("lowlands_clothing", "ratcatcherrobes", "robes"),
        executor: ArmorSet("lowlands_clothing", "executorarmor", "chestplate"),
        furnacemaster: ArmorSet("lowlands_clothing", "furnacemasteramor", "chestplate"),
        highlands_kilt: ArmorSet("lowlands_clothing", "highlandslongkilt", "chestplate"),
        plague_doctor: ArmorSet("lowlands_clothing", "plague_doctor_suit", "suit"),
        penitent_rags: ArmorSet("lowlands_clothing", "penitent_rags", "rags"),
        winged_cavalry: ArmorSet("lowlands_clothing", "wingedcavaleryarmor", "chestplate"),
        axolotl: ArmorSet("lowlands_clothing", "axolotl_armor", "chestplate"),
        norsian: ArmorSet("lowlands_clothing", "norsian_armor", "chestplate"),
        wald_knight: ArmorSet("lowlands_clothing", "wald_knight_armor", "chestplate"),
        maskerade: ArmorSet("lowlands_clothing", "maskerade_armor", "chestplate"),
        bret_corsair: ArmorSet("lowlands_clothing", "bret_corsair_armor", "chestplate"),
        bret_clothes: ArmorSet("lowlands_clothing", "bret_clothes", "chestplate"),
        depth_scaphander: ArmorSet("lowlands_clothing", "depth_scaphander", "chestplate"),
        gamekeeper: ArmorSet("lowlands_clothing", "gamekeeper_attires", "attires"),
        netherborn_pirate: ArmorSet("lowlands_clothing", "netherborn_pirate", "chestplate"),
        swampland_folks: ArmorSet("lowlands_clothing", "swampland_folks_attires", "attires"),
        siege_armor: ArmorSet("lowlands_clothing", "siege_armor", "chestplate"),
        gatesentry: ArmorSet("lowlands_clothing", "gatesentry_armor", "chestplate"),

        // --- Opposing Force ---
        bone: ArmorSet("opposing_force", "bone", "chestplate"),
        slug_baron: ArmorSet("opposing_force", "slug_baron", "chestplate"),
        deepwoven: ArmorSet("opposing_force", "deepwoven", "tunic"),
        recon_knight: ArmorSet("opposing_force", "recon_knight", "chestplate"),
        wooden: ArmorSet("opposing_force", "wooden", "chestplate"),
        stone: ArmorSet("opposing_force", "stone", "chestplate"),
        emerald: ArmorSet("opposing_force", "emerald", "chestplate"),

        // --- Monster Expansion ---
        skrythe: ArmorSet("monsterexpansion", "skrythe", "chestplate"),
        rhyza: ArmorSet("monsterexpansion", "rhyza", "chestplate"),
        rakoth: ArmorSet("monsterexpansion", "rakoth", "chestplate"),
        leivekilth: ArmorSet("monsterexpansion", "leivekilth", "chestplate"),

        // --- Ogres ---
        ogre: ArmorSet("ogres", "ogre_armor", "chestplate")
    }

    // LIGHT LINE
    // Leather
    armor_sets.leather.crafted_from("minecraft:leather", "minecraft:leather", "minecraft:leather")

    // MEDIUM LINE

    // HEAVY LINE

})