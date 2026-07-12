var SYSTEM_CONFIG = {
    debug: false,
    tiers: {
        LEATHER:      { name: 'leather',         hammer: 'minecraft:wooden_axe',                            },
        WOOD:         { name: 'wood',            hammer: 'minecraft:wooden_hoe',                            },
        STONE:        { name: 'stone',           hammer: 'minecraft:stone_pickaxe',                         },
        IRON:         { name: 'iron',            hammer: 'lowlands_clothing:blacksmith_hammer',             },
        GOLD:         { name: 'gold',            hammer: 'minecraft:golden_hoe',                            },
        DIAMOND:      { name: 'diamond',         hammer: 'farmersdelight:diamond_knife',                    },
        BONE:         { name: 'bone',            hammer: 'opposing_force:sawblade',                         },
        NETHERITE:    { name: 'netherite',       hammer: 'minecraft:netherite_hoe',                         },
        STELLAR:      { name: 'stellar',         hammer: 'foolish:meteordrive_hammer',                      },
    }
};

/**
 * Global Registration Map
 */
var armor_sets = {
    // --- Vanilla Minecraft ---
    leather: new ArmorSet("minecraft", "leather", "chestplate").setTier("LEATHER").withCrafting("minecraft:leather"),
    chainmail: new ArmorSet("minecraft", "chainmail", "chestplate").setTier("IRON").withCrafting("minecraft:chain", "minecraft:coal"),
    iron: new ArmorSet("minecraft", "iron", "chestplate").setTier("IRON").withCrafting("minecraft:iron_ingot"),
    gold: new ArmorSet("minecraft", "golden", "chestplate").setTier("GOLD").withCrafting("minecraft:gold_ingot"),
    diamond: new ArmorSet("minecraft", "diamond", "chestplate").setTier("DIAMOND").withCrafting("minecraft:diamond"),
    netherite: new ArmorSet("minecraft", "netherite", "chestplate").setTier("NETHERITE").withCrafting("minecraft:gold_block", "minecraft:netherite_ingot", "minecraft:ender_eye"), //TODO change gem

    // --- Foolish Mod ---
    coccinium: new ArmorSet("foolish", "coccinium_armor", "chestplate").setTier("IRON").withCrafting("foolish:coccinium", "minecraft:iron_ingot"),
    blunt_armor: new ArmorSet("foolish", "blunt_armor", "chestplate").setTier("NETHERITE").withCrafting("foolish:blunt_metal_ingot", "foolish:inferal_alloy_plate_item", "minecraft:netherite_ingot"),
    keepsteel: new ArmorSet("foolish", "keepsteel", "chestplate").setTier("NETHERITE").withFoundry("foolish:enderslate", "foolish:chorus_leather", "foolish:rotary_core", "foolish:keepsteel_ingot"),
    stellar_armor: new ArmorSet("foolish", "stellar_armor", "chestplate").setTier("STELLAR").withFoundry("foolish:infernal_alloy_plate", "minecraft:netherite_scrap", "foolish:star_shard", "minecraft:diamond_block"),

    // --- Armor of the Ages ---
    anubis: new ArmorSet("armoroftheages", "anubis_armor", "chest").setTier("NETHERITE").withFoundry("minecraft:lapis_block", "minecraft:gold_block", "minecraft:netherite_scrap", "lowlands_clothing:laced_woolen_fabric"),
    centurion: new ArmorSet("armoroftheages", "centurion_armor", "chest").setTier("GOLD").withCrafting("minecraft:gold_ingot", "minecraft:red_wool", "minecraft:iron_block"),
    exalted_aurum: new ArmorSet("armoroftheages", "exalted_aurum_armor", "chest").setTier("NETHERITE").withFoundry("minecraft:red_wool", "minecraft:gold_block", "minecraft:netherite_scrap", "minecraft:redstone_block"),
    holy_armor: new ArmorSet("armoroftheages", "holy_armor", "chest").setTier("NETHERITE").withFoundry("minecraft:iron_block", "minecraft:gold_block", "minecraft:netherite_scrap", "minecraft:emerald_block"),
    iron_plate: new ArmorSet("armoroftheages", "iron_plate_armor", "chest").setTier("IRON").withCrafting("minecraft:iron_block", "lowlands_clothing:heavy_iron_ingot"),
    japanese_light: new ArmorSet("armoroftheages", "japanese_light_armor", "chest").setTier("LEATHER").withCrafting("minecraft:leather", "minecraft:string", "minecraft:redstone"),
    o_yoroi: new ArmorSet("armoroftheages", "o_yoroi_armor", "chest").setTier("IRON").withCrafting("minecraft:redstone_block", "minecraft:coal_block", "minecraft:iron_block"),
    pharaoh: new ArmorSet("armoroftheages", "pharaoh_armor", "chest").setTier("DIAMOND").withCrafting("minecraft:diamond_ingot", "minecraft:gold_ingot", "minecraft:white_wool"),
    quetzalcoatl: new ArmorSet("armoroftheages", "quetzalcoatl_armor", "chest").setTier("NETHERITE").withFoundry("ogres:ogre_bone", "minecraft:egg", "minecraft:netherite_scrap", "supplementaries:feather_block"),
    raijin: new ArmorSet("armoroftheages", "raijin_armor", "chest").setTier("NETHERITE").withFoundry("foolish:electrical_charge", "minecraft:lightning_rod", "minecraft:netherite_scrap", "minecraft:copper_block"),

    // --- Lowlands Clothing ---
    guard_captain: new ArmorSet("lowlands_clothing", "guard_captain_armor", "chestplate").setTier("LEATHER").withCrafting("lowlands_clothing:laced_woolen_fabric", "minecraft:iron_ingot"),
    mercenary_swordsman: new ArmorSet("lowlands_clothing", "mercenary_swordman", "chestplate").setTier("IRON").withCrafting("lowlands_clothing:laced_woolen_fabric", "minecraft:iron_ingot"),
    mountainmen: new ArmorSet("lowlands_clothing", "mountainmenclothes", "chestplate").setTier("LEATHER").withCrafting("lowlands_clothing:furpelt", "minecraft:leather"),
    snowtiger: new ArmorSet("lowlands_clothing", "snowtigerarmor", "chestplate").setTier("NETHERITE").withCrafting("lowlands_clothing:furpelt", "minecraft:netherite_scrap", "minecraft:goat_horn"),
    ratcatcher: new ArmorSet("lowlands_clothing", "ratcatcherrobes", "chestplate").setTier("LEATHER").withCrafting("lowlands_clothing:cloth_fabric", "lowlands_clothing:woolen_fabric", "minecraft:iron_ingot"),
    executor: new ArmorSet("lowlands_clothing", "executorarmor", "chestplate").setTier("LEATHER").withCrafting("lowlands_clothing:cloth_fabric", "minecraft:black_wool", "minecraft:iron_axe"),
    furnacemaster: new ArmorSet("lowlands_clothing", "furnacemasteramor", "chestplate").setTier("IRON").withCrafting("minecraft:iron_ingot", "minecraft:lantern", "minecraft:blast_furnace"),
    highlands_kilt: new ArmorSet("lowlands_clothing", "highlandslongkilt", "chestplate", [3]).setTier("LEATHER").withCrafting("minecraft:white_wool", "minecraft:yellow_wool", "minecraft:lantern"),
    plague_doctor: new ArmorSet("lowlands_clothing", "plague_doctor_suit", "chestplate").setTier("LEATHER").withCrafting("lowlands_clothing:cloth_fabric", "lowlands_clothing:treated_leather", "#bloomingnature:small_flower"),
    penitent_rags: new ArmorSet("lowlands_clothing", "penitent_rags", "chestplate").setTier("LEATHER").withCrafting("lowlands_clothing:cloth_fabric", "minecraft:string", "minecraft:rabbit_hide"),
    winged_cavalry: new ArmorSet("lowlands_clothing", "wingedcavaleryarmor", "chestplate").setTier("IRON").withCrafting("minecraft:iron_ingot", "minecraft:feather", "minecraft:firework_rocket"),
    axolotl: new ArmorSet("lowlands_clothing", "axolotl_armor", "chestplate").setTier("IRON").withCrafting("lowlands_clothing:axolotl_iron", "minecraft:flowering_azalea", "minecraft:spore_blossom"),
    norsian: new ArmorSet("lowlands_clothing", "norsian_armor", "chestplate").setTier("IRON").withCrafting("minecraft:iron_ingot", "lowlands_clothing:furpelt", "minecraft:goat_horn"),
    wald_knight: new ArmorSet("lowlands_clothing", "wald_knight_armor", "chestplate").setTier("IRON").withCrafting("minecraft:iron_ingot", "#minecraft:saplings", "minecraft:dark_oak_wood"),
    maskerade: new ArmorSet("lowlands_clothing", "maskerade_armor", "chestplate").setTier("GOLD").withCrafting("minecraft:gold_ingot", "lowlands_clothing:cloth_fabric", "minecraft:totem_of_undying"),
    bret_corsair: new ArmorSet("lowlands_clothing", "bret_corsair_armor", "chestplate").setTier("LEATHER").withCrafting("minecraft:woolen_fabric", "minecraft:kelp"),
    bret_clothes: new ArmorSet("lowlands_clothing", "bret_clothes", "chestplate").setTier("GOLD").withCrafting("minecraft:gold_ingot", "minecraft:prismarine_crystals", "minecraft:heart_of_the_sea"),
    depth_scaphander: new ArmorSet("lowlands_clothing", "depth_scaphander", "chestplate").setTier("GOLD").withCrafting("minecraft:copper_ingot", "minecraft:prismarine_crystals", "minecraft:prismarine_crystals"),
    gamekeeper: new ArmorSet("lowlands_clothing", "gamekeeper_attires", "chestplate").setTier("LEATHER").withCrafting("lowlands_clothing:laced_woolen_fabric", "minecraft:bone", "minecraft:lead"),
    netherborn_pirate: new ArmorSet("lowlands_clothing", "netherborn_pirate", "chestplate").setTier("NETHERITE").withFoundry("minecraft:red_nether_bricks", "minecraft:glowstone", "minecraft:netherite_scrap", "minecraft:blaze_rod"),
    swampland_folks: new ArmorSet("lowlands_clothing", "swampland_folks_attires", "chestplate", [4]).setTier("LEATHER").withCrafting("lowlands_clothing:wetlands_fabric", "lowlands_clothing:treated_leather", "minecraft:slime_ball"),
    siege_armor: new ArmorSet("lowlands_clothing", "siege_armor", "chestplate").setTier("NETHERITE").withFoundry("lowlands_clothing:heavy_iron_ingot", "minecraft:iron_block", "minecraft:netherite_scrap", "minecraft:emerald_block"),
    gatesentry: new ArmorSet("lowlands_clothing", "gatesentry_armor", "chestplate").setTier("LEATHER").withCrafting("lowlands_clothing:treated_leather", "minecraft:iron_ingot", "minecraft:lantern"),

    // --- Opposing Force ---
    bone: new ArmorSet("opposing_force", "bone", "chestplate").setTier("BONE").withCrafting("opposing_force:heavy_bone", "foolish:elongated_bone", "philipsruins:broken_bone"),
    slug_baron: new ArmorSet("opposing_force", "slug_baron", "chestplate").setTier("NETHERITE").withFoundry("minecraft:copper_block", "opposing_force:slug_eggs", "minecraft:netherite_scrap", "minecraft:moss_block"),
    deepwoven: new ArmorSet("opposing_force", "deepwoven", "tunic").setTier("LEATHER").withCrafting("opposing_force:deep_silk", "opposing_force:umber_fang"),
    recon_knight: new ArmorSet("opposing_force", "recon_knight", "chestplate").setTier("GOLD").withCrafting("opposing_force:electric_alloy", "opposing_force:electric_charge"),
    wooden: new ArmorSet("opposing_force", "wooden", "cover").setTier("WOOD").withCrafting("#minecraft:logs_that_burn"),
    stone: new ArmorSet("opposing_force", "stone", "chestplate").setTier("STONE").withCrafting("#minecraft:stone_tool_materials"),
    emerald: new ArmorSet("opposing_force", "emerald", "mask").setTier("DIAMOND").withFoundry("minecraft:diamond", "minecraft:emerald", "minecraft:emerald_block", "minecraft:lapis_block"),

    // --- Monster Expansion ---
    skrythe: new ArmorSet("monsterexpansion", "skrythe", "chestplate").setTier("NETHERITE").withFoundry("monsterexpansion:skrythe_armorplate", "monsterexpansion:skrythe_wing_membrane", "minecraft:nether_star", "minecraft:netherite_ingot"),
    rhyza: new ArmorSet("monsterexpansion", "rhyza", "chestplate").setTier("NETHERITE").withFoundry("monsterexpansion:rhyza_fur", "monsterexpansion:rhyza_scale", "minecraft:netherite_ingot", "monsterexpansion:glowstone"),
    rakoth: new ArmorSet("monsterexpansion", "rakoth", "chestplate").setTier("NETHERITE").withFoundry("monsterexpansion:rakoth_underplate", "monsterexpansion:sedimentary_scarp_shell", "minecraft:netherite_ingot", "monsterexpansion:rakoth_carapace"),
    leivekilth: new ArmorSet("monsterexpansion", "leivekilth", "chestplate").setTier("DIAMOND"),

    // --- Ogres ---
    ogre: new ArmorSet("ogres", "ogre_armor", "chestplate").setTier("LEATHER").withCrafting("ogres:ogre_skin")
};