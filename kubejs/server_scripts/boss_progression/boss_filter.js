// List of all boss IDs to restrict. 
// You can add or remove IDs from this array to match your exact configuration.
const RESTRICTED_BOSSES = [
    // // Ink Arena
    // 'theinkarena:ink_titan',
    // 'theinkarena:natural_ink_titan',
    
    // Opposing Force
    'opposing_force:guzzler',
    'opposing_force:skyvern',
    
    // Saints & Dragons
    'saintsdragons:volitans',
    'saintsdragons:raevyx',
    'saintsdragons:varasuchus',
    'saintsdragons:ignivorus',
    
    // Monster Expansion
    'monsterexpansion:ignathos',
    'monsterexpansion:rhyza',
    'monsterexpansion:rakoth',
    'monsterexpansion:skrythe',
    'monsterexpansion:leivekilth',
    
    // // Vanilla
    // 'minecraft:ender_dragon',
    // 'minecraft:wither',
    // 'bbv:the_ender_dragon', // Alternative Ender Dragon from your list
    
    // // Netherman
    // 'netherman:azazel',
    
    // // Foolish Bosses & Astralis
    // 'foolish:astralis',
    // 'foolish:scarlant_queen',
    // 'foolish:thunderbird',
    // 'foolish:varmint_king',
    // 'foolish:sacilic_abomination',
    // 'foolish:wendigrudge',
    // 'foolish:timewelder',

    // Luminous Bosses (Examples based on your list, add/remove as needed)
    "luminous_beasts:tree_ent",
    "luminous_beasts:hermit_king",
    "luminous_beasts:sand_crab",
    "luminous_beasts:mummy",
    "luminous_beasts:sea_viper",
    "luminous_beasts:yeti",
    "luminous_beasts:vile_gator",
    "luminous_beasts:bone_stalker",
    "luminous_beasts:piglin_executioner",
    "luminous_beasts:the_furnace",
    "luminous_beasts:horseless_headsman",
    "luminous_beasts:soul_furnace",
    "luminous_beasts:the_scarecrow",
    "luminous_beasts:witch_doctor",
    "luminous_beasts:woodland_witch_doctor",
    "luminous_beasts:phoenix",
    "luminous_beasts:cherry_tree_ent",
    "luminous_beasts:red_mummy",
    "luminous_beasts:golden_hermit_king",
    "luminous_beasts:coral_sea_viper",
    "luminous_beasts:arid_yeti",
    "luminous_beasts:frigid_gator",
    "luminous_beasts:wind_phoenix",
    "luminous_beasts:basalt_executioner",
    "luminous_beasts:bogged_bone_stalker",
    "luminous_beasts:crimson_mushlin_king",
    "luminous_beasts:warped_mushlin_king",
    "luminous_beasts:luminous_moth",
    "luminous_beasts:albino_moth",
    
    
];

/**
 * Custom function to spawn a restricted boss safely.
 * @param {Internal.MinecraftServer} server 
 * @param {string} entityId 
 * @param {number} x 
 * @param {number} y 
 * @param {number} z 
 */
global.spawnCustomBoss = (server, entityId, x, y, z) => {
    let level = server.overworld(); // Defaults to overworld. Modify level handling if needed.
    let entity = level.createEntity(entityId);
    
    if (entity) {
        entity.setPosition(x, y, z);
        // Apply the bypass tag BEFORE adding to the level
        entity.persistentData.putBoolean('allow_boss_spawn', true);
        entity.spawn();
        return entity;
    }
    return null;
};

// Intercept all spawns and cancel unauthorized boss entries
EntityEvents.spawned(event => {
    const entity = event.entity;
    const type = entity.type;

    // Check if the entity being spawned is one of our restricted bosses
    if (RESTRICTED_BOSSES.includes(type)) {
        // If it doesn't have our KubeJS custom bypass tag, deny the spawn
        if (!entity.persistentData.getBoolean('allow_boss_spawn')) {
            event.setCanceled(true);
        }
    }
});