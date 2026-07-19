// --- CONFIGURATION ---
const POTION_CONFIG = {
    // Maps potion effect string to tier material and tuning item
    // G = Tier Material (e.g., coal, iron, diamond, gold, emerald)
    // T = Tuning Item
    "minecraft:speed": { tier: "minecraft:iron_ingot", tuning: "minecraft:sugar" },
    "minecraft:haste": { tier: "minecraft:gold_ingot", tuning: "minecraft:pickaxe" },
    "minecraft:strength": { tier: "minecraft:diamond", tuning: "minecraft:blaze_powder" },
    "minecraft:regeneration": { tier: "minecraft:emerald", tuning: "minecraft:ghast_tear" },
    "minecraft:wither": { tier: "minecraft:netherite_scrap", tuning: "minecraft:wither_skeleton_skull" },
    // Special Potion Example
    "minecraft:bad_omen": { tier: "minecraft:coal", tuning: "minecraft:white_banner" } // Banner handled uniquely below
};

// Offhand growth config: linear scaling.
// "double after 5 minutes (6000 ticks), triple after 10 minutes (12000 ticks)"
// Formula applied: duration = base_duration * (1 + (ticks_held / BASE_GROWTH_TICKS))
const BASE_GROWTH_TICKS = 6000; 

// --- RECIPE GENERATION ---
ServerEvents.recipes(event => {
    
    // Helper function to build the potion lifecycle recipes
    function registerPotionRecipes(effectId, tierMat, tuningMat) {
        let baseEffect = effectId

        // 1. Base Potion Recipe (Crafting Table)
        // WGW / W W / WTW -> 6x Potions
        event.shaped(
            Item.of('minecraft:potion', 6, '{Potion:"' + effectId + '"}'),
            // Item.of('minecraft:potion', 6, `{Potion:""}`), 
            [
                'WGW',
                'W W',
                'WTW'
            ], {
                W: 'minecraft:potion',
                G: tierMat,
                T: tuningMat
            }
        );

        // 2. Blast to Splash
        event.blasting(
            Item.of('minecraft:splash_potion', `{Potion:"${baseEffect}"}`), 
            Item.of('minecraft:potion', `{Potion:"${baseEffect}"}`)
        ).xp(0.1).cookingTime(100);

        // 3. Smoke to Lingering
        event.smoking(
            Item.of('minecraft:lingering_potion', `{Potion:"${baseEffect}"}`), 
            Item.of('minecraft:splash_potion', `{Potion:"${baseEffect}"}`)
        ).xp(0.1).cookingTime(100);

        // 4. Smithing Upgrades (Level 1 -> 2 -> 3)
        // Level 1 to Level 2 (Requires Diamond)
        event.smithing(
            Item.of('minecraft:potion', `{Potion:"${baseEffect}"}`), // Output custom strong type or NBT
            'minecraft:diamond', // Template/Upgrade item
            Item.of('minecraft:potion', `{Potion:"${baseEffect}"}`), // Base
            Item.of('minecraft:potion', `{Potion:"${baseEffect}"}`)  // Addition
        );

        // Level 2 to Level 3 (Requires Netherite Scrap)
        event.smithing(
            Item.of('minecraft:potion', `{Potion:"${baseEffect}"}`), 
            'minecraft:netherite_scrap', 
            Item.of('minecraft:potion', `{Potion:"${baseEffect}"}`), 
            Item.of('minecraft:potion', `{Potion:"${baseEffect}"}`)
        );
    }

    // Loop through config and generate recipes
    Object.keys(POTION_CONFIG).forEach(effect => {
        let data = POTION_CONFIG[effect];
        
        // Skip normal generation for bad omen since it requires an Ominous Banner override
        if (effect === "minecraft:bad_omen") {
            // Shaped recipe that doesn't consume the banner (uses KubeJS .keepIngredient)
            event.shaped(
                Item.of('minecraft:potion', 6, `{Potion:"minecraft:bad_omen"}`), 
                ['WGW', 'W W', 'WTW'], 
                {
                    W: 'minecraft:water_bottle',
                    G: data.tier,
                    T: Item.of('minecraft:white_banner').strongNBT() // Matches ominous banner NBT roughly, or handle via replacement below
                }
            ).modifyResult((grid, result) => {
                // Double check it's an ominous banner specifically
                let bannerStack = grid.find(Item.of('minecraft:white_banner'));
                if (bannerStack && bannerStack.nbt && bannerStack.nbt.toString().contains("Ominous Banner")) {
                    return result;
                }
                return Item.empty;
            });
            return;
        }

        registerPotionRecipes(effect, data.tier, data.tuning);
    });
});

// --- REFRESHING OMINOUS BANNER BEHAVIOR ---
// Ensures the banner isn't consumed in crafting
ServerEvents.recipes(event => {
    // If you want a clean non-consuming recipe item return for the banner:
    event.forEachRecipe({ output: Item.of('minecraft:potion', `{Potion:"minecraft:bad_omen"}`) }, recipe => {
        recipe.keepIngredient('minecraft:white_banner');
    });
});

// --- OFFHAND TICK LOGIC ---
PlayerEvents.tick(event => {
    let player = event.player;
    // Run roughly every second (20 ticks) to reduce overhead
    if (player.age % 20 !== 0) return;

    let offhandItem = player.getOffhandItem();
    
    // Check if the item is a valid potion type
    if (offhandItem.id === 'minecraft:potion' || offhandItem.id === 'minecraft:splash_potion' || offhandItem.id === 'minecraft:lingering_potion') {
        let nbt = offhandItem.nbt;
        if (!nbt || !nbt.Potion) return;

        let potionType = nbt.Potion.toString(); // e.g., "minecraft:speed"
        let cleanEffect = potionType.replace("alg_potions:strong_", "").replace("alg_potions:mighty_", "");

        // Verify it's part of our system
        if (POTION_CONFIG[cleanEffect]) {
            // Track ticks spent in offhand using custom forge/fabric persistent data
            let pData = player.persistentData;
            if (!pData.potionOffhandTicks) {
                pData.potionOffhandTicks = 0;
            }
            
            pData.potionOffhandTicks += 20; // Added 1 second worth of ticks
            let ticksHeld = pData.potionOffhandTicks;

            // Linear multiplier: 1 + (6000 / 6000) = 2x at 5 mins
            let multiplier = 1.0 + (ticksHeld / BASE_GROWTH_TICKS);

            // Fetch the potion status effect to amplify or extend it manually on the player
            let baseDuration = 3600; // default base 3 mins (3600 ticks)
            
            // Adjust base duration based on custom smithing tiers if recognized
            if (potionType.contains("strong_")) baseDuration = 4800;
            if (potionType.contains("mighty_")) baseDuration = 7200;

            let finalDuration = Math.floor(baseDuration * multiplier);
            let amplifier = 0;
            if (potionType.contains("strong_")) amplifier = 1;
            if (potionType.contains("mighty_")) amplifier = 2;

            // Apply effect continuously while holding
            player.potionEffects.add(cleanEffect, finalDuration, amplifier, false, false);
        }
    } else {
        // Clear offhand tracking if they unequip the potion
        if (player.persistentData.potionOffhandTicks) {
            player.persistentData.potionOffhandTicks = 0;
        }
    }
});