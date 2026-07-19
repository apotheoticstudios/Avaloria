// --- CONFIGURATION ---
const POTION_CONFIG = {
    // === MOVEMENT & AGILITY ===
    "minecraft:speed":            { tier: "minecraft:iron_ingot", tuning: "minecraft:sugar", name: "Potion of Speed", baseDuration: 180 },
    "minecraft:slowness":         { tier: "minecraft:iron_ingot", tuning: "minecraft:fermented_spider_eye", name: "Potion of Slowness", baseDuration: 90 },
    "minecraft:jump_boost":       { tier: "minecraft:iron_ingot", tuning: "minecraft:rabbit_foot", name: "Potion of Leaping", baseDuration: 180 },
    "minecraft:slow_falling":     { tier: "minecraft:feather", tuning: "minecraft:phantom_membrane", name: "Potion of Slow Falling", baseDuration: 90 },
    "minecraft:dolphins_grace":   { tier: "minecraft:emerald", tuning: "minecraft:heart_of_the_sea", name: "Potion of Dolphin's Grace", baseDuration: 60 },
    "minecraft:levitation":       { tier: "minecraft:purpur_block", tuning: "minecraft:shulker_shell", name: "Potion of Levitation", baseDuration: 30 },

    // === COMBAT & POWER ===
    "minecraft:strength":         { tier: "minecraft:diamond", tuning: "minecraft:blaze_powder", name: "Potion of Strength", baseDuration: 90 },
    "minecraft:weakness":         { tier: "minecraft:iron_ingot", tuning: "minecraft:fermented_spider_eye", name: "Potion of Weakness", baseDuration: 90 },
    "minecraft:resistance":       { tier: "minecraft:diamond", tuning: "minecraft:shulker_shell", name: "Potion of Resistance", baseDuration: 90 },

    // === UTILITY & MINING ===
    "minecraft:haste":            { tier: "minecraft:gold_ingot", tuning: "minecraft:pickaxe", name: "Potion of Haste", baseDuration: 240 },
    "minecraft:mining_fatigue":   { tier: "minecraft:gold_ingot", tuning: "minecraft:prismarine_crystals", name: "Potion of Dullness", baseDuration: 60 },

    // === RECOVERY & HEALTH ===
    "minecraft:regeneration":     { tier: "minecraft:emerald", tuning: "minecraft:ghast_tear", name: "Potion of Regeneration", baseDuration: 45 },
    "minecraft:instant_health":   { tier: "minecraft:gold_ingot", tuning: "minecraft:glistering_melon_slice", name: "Potion of Healing", isInstant: true },
    "minecraft:health_boost":     { tier: "minecraft:emerald", tuning: "minecraft:golden_apple", name: "Potion of Vitality", baseDuration: 240 },
    "minecraft:absorption":       { tier: "minecraft:diamond", tuning: "minecraft:golden_apple", name: "Potion of Insulation", baseDuration: 120 },
    "minecraft:saturation":       { tier: "minecraft:gold_ingot", tuning: "minecraft:cake", name: "Potion of Saturation", isInstant: true },

    // === ENVIRONMENTAL SURVIVAL ===
    "minecraft:fire_resistance":  { tier: "minecraft:magma_block", tuning: "minecraft:magma_cream", name: "Potion of Fire Resistance", baseDuration: 180 },
    "minecraft:water_breathing":  { tier: "minecraft:iron_ingot", tuning: "minecraft:pufferfish", name: "Potion of Water Breathing", baseDuration: 180 },

    // === STEALTH & VISION ===
    "minecraft:invisibility":     { tier: "minecraft:amethyst_shard", tuning: "minecraft:fermented_spider_eye", name: "Potion of Invisibility", baseDuration: 180 },
    "minecraft:night_vision":     { tier: "minecraft:gold_ingot", tuning: "minecraft:golden_carrot", name: "Potion of Night Vision", baseDuration: 180 },
    "minecraft:glowing":          { tier: "minecraft:glowstone", tuning: "minecraft:glowstone_dust", name: "Potion of Illumination", baseDuration: 120 },

    // === HARMFUL & AFFLICTIONS ===
    "theinkarena:inked":          { tier: "minecraft:iron_ingot", tuning: "theinkarena:ink_waste", name: "Potion of Splattering", baseDuration: 90 },
    "foolish:paralysis":          { tier: "minecraft:netherite_scrap", tuning: "foolish:sacilite_shard", name: "Potion of Paralysis", baseDuration: 15 },
    "minecraft:instant_damage":   { tier: "minecraft:netherite_scrap", tuning: "minecraft:fermented_spider_eye", name: "Potion of Harming", isInstant: true },
    "minecraft:poison":           { tier: "minecraft:emerald", tuning: "minecraft:spider_eye", name: "Potion of Poison", baseDuration: 45 },
    "minecraft:wither":           { tier: "minecraft:netherite_scrap", tuning: "minecraft:wither_skeleton_skull", name: "Potion of Decay", baseDuration: 30 },
    "minecraft:hunger":           { tier: "minecraft:iron_ingot", tuning: "minecraft:rotten_flesh", name: "Potion of Hunger", baseDuration: 60 },
    "minecraft:nausea":           { tier: "minecraft:iron_ingot", tuning: "minecraft:pufferfish", name: "Potion of Vertigo", baseDuration: 45 },
    "minecraft:blindness":        { tier: "minecraft:obsidian", tuning: "minecraft:ink_sac", name: "Potion of Blindness", baseDuration: 30 },
    "minecraft:darkness":         { tier: "minecraft:netherite_scrap", tuning: "minecraft:echo_shard", name: "Potion of Creeping Shadow", baseDuration: 30 },

    // === FORTUNE & FATE ===
    "minecraft:luck":             { tier: "minecraft:emerald", tuning: "minecraft:rabbit_foot", name: "Potion of Luck", baseDuration: 300 },
    "minecraft:unluck":           { tier: "minecraft:iron_ingot", tuning: "minecraft:spider_eye", name: "Potion of Misfortune", baseDuration: 180 }
};

const BASE_GROWTH_TICKS = 6000; 

// Helper to look up the modern numerical ID from a string ID via the vanilla registry
function getNumericalId(effectStrId) {
    const BuiltInRegistries = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries');
    const ResourceLocation = Java.loadClass('net.minecraft.resources.ResourceLocation');
    
    let registry = BuiltInRegistries.MOB_EFFECT;
    let effect = registry.get(new ResourceLocation(effectStrId));
    if (!effect) return 0;
    
    return registry.getId(effect);
}

// Helper to format ticks cleanly into MM:SS string
function formatDuration(ticks) {
    let totalSeconds = Math.floor(ticks / 20);
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

// Helper to update the item's display Lore NBT array directly
function updatePotionLore(nbt, durationTicks, isInstant) {
    nbt.display = nbt.display || {};
    if (isInstant) {
        nbt.display.Lore = [
            '{"text":"🔒 Fermentation Locked","color":"red","italic":true}',
            '{"text":"🧪 Status: Ready to Use","color":"green","bold":true,"italic":false}'
        ];
    } else {
        let formattedTime = formatDuration(durationTicks);
        nbt.display.Lore = [
            '{"text":"🔒 Fermentation Locked","color":"red","italic":true}',
            `{"text":"🧪 Duration: ${formattedTime}","color":"green","bold":true,"italic":false}`
        ];
    }
}

// --- RECIPE GENERATION ---
ServerEvents.recipes(event => {

    event.remove({ output: 'minecraft:brewing_stand' }) 

    function makePotionNBT(numId, effectStrId, tier, color, namePrefix, pName) {
        let amp = tier - 1; 
        let nbt = {
            CustomPotionColor: color,
            CustomPotionEffects: [{ Id: numId, Amplifier: amp, Duration: 20 }],
            PotionTier: tier,
            CustomPotionEffectStrId: effectStrId,
            display: { 
                Name: `{"text":"${namePrefix} ${pName}","italic":false}`
            }
        };
        nbt.display.Lore = ['{"text":"⚠ Unfermented: Needs to be fermented to use.","color":"gold","italic":true}'];
        return nbt;
    }

    const tierColors = { 1: 3407871, 2: 16711680, 3: 16755200 };
    const tierPrefixes = { 1: "", 2: "Strong", 3: "Mighty" };
    const potionTypes = ['minecraft:potion', 'minecraft:splash_potion', 'minecraft:lingering_potion'];

    Object.keys(POTION_CONFIG).forEach(effectStrId => {
        let config = POTION_CONFIG[effectStrId];
        let pName = config.name;
        let isInstant = !!config.isInstant;
        
        let numId = getNumericalId(effectStrId);

        // 1. Base Potion Recipe (Normal, Tier 1)
        event.shaped(
            Item.of('minecraft:potion', 6, makePotionNBT(numId, effectStrId, 1, tierColors[1], tierPrefixes[1], pName)),
            ['WGW', 'W W', 'WTW'],
            {
                W: Item.of('minecraft:potion', '{Potion:"minecraft:water"}').strongNBT(),
                G: config.tier,
                T: config.tuning
            }
        );

        // 2. Blasting & Smoking conversions
        [1, 2, 3].forEach(tier => {
            let currentNBT = makePotionNBT(numId, effectStrId, tier, tierColors[tier], tierPrefixes[tier], pName);

            event.blasting(Item.of('minecraft:splash_potion', currentNBT), Item.of('minecraft:potion', currentNBT).strongNBT()).xp(0.1).cookingTime(100);
            event.smoking(Item.of('minecraft:lingering_potion', currentNBT), Item.of('minecraft:splash_potion', currentNBT).strongNBT()).xp(0.1).cookingTime(100);
        });

        // 3. Smithing Table Upgrades
        potionTypes.forEach(type => {
            let nbtTier1 = makePotionNBT(numId, effectStrId, 1, tierColors[1], tierPrefixes[1], pName);
            let nbtTier2 = makePotionNBT(numId, effectStrId, 2, tierColors[2], tierPrefixes[2], pName);
            let nbtTier3 = makePotionNBT(numId, effectStrId, 3, tierColors[3], tierPrefixes[3], pName);

            event.smithing(Item.of(type, nbtTier2), Item.of(type, nbtTier1).strongNBT(), 'minecraft:diamond', Item.of(type, nbtTier1).strongNBT());
            event.smithing(Item.of(type, nbtTier3), Item.of(type, nbtTier2).strongNBT(), 'minecraft:netherite_scrap', Item.of(type, nbtTier2).strongNBT());

            // 4. FERMENTATION UPGRADE
            [1, 2, 3].forEach(tier => {
                let baseNBT = makePotionNBT(numId, effectStrId, tier, tierColors[tier], tierPrefixes[tier], pName);
                
                let fermentedNBT = Object.assign({}, baseNBT);
                fermentedNBT.IsFermenting = 1;
                fermentedNBT.IsInstantPotion = isInstant ? 1 : 0;

                // Grab configured duration (converted to ticks), dynamically scale it by tier (x1.0, x1.33, x2.0)
                let configSeconds = config.baseDuration || 180; // Defaults to 3 mins if unconfigured
                let tierMultiplier = tier === 1 ? 1.0 : (tier === 2 ? 1.333 : 2.0);
                
                fermentedNBT.BaseDuration = Math.floor(configSeconds * 20 * tierMultiplier);
                fermentedNBT.CurrentDuration = fermentedNBT.BaseDuration;
                fermentedNBT.display = { Name: `{"text":"Fermented ${tierPrefixes[tier]} ${pName}","italic":false,"color":"purple"}` };
                
                updatePotionLore(fermentedNBT, fermentedNBT.BaseDuration, isInstant);

                event.smithing(
                    Item.of(type, fermentedNBT),
                    Item.of(type, baseNBT).strongNBT(),
                    'minecraft:nether_wart',
                    'minecraft:nether_wart'
                );
            });
        });
    });
});

// --- DENY USE UNLESS FERMENTED ---
ItemEvents.rightClicked(event => {
    let item = event.item;
    if (item.id === 'minecraft:potion' || item.id === 'minecraft:splash_potion' || item.id === 'minecraft:lingering_potion') {
        let nbt = item.nbt;
        if (nbt && nbt.CustomPotionEffectStrId && !nbt.IsFermenting) {
            event.cancel();
            if (!event.level.isClientSide()) {
                event.player.statusMessage = Text.of("This potion is raw and undrinkable! You must ferment it with Nether Wart first.").gold();
            }
        }
    }
});

// --- OFFHAND TICK LOGIC ---
PlayerEvents.tick(event => {
    let player = event.player;
    if (player.age % 20 !== 0) return; 

    let offhandItem = player.getOffhandItem();
    
    if (offhandItem.id === 'minecraft:potion' || offhandItem.id === 'minecraft:splash_potion' || offhandItem.id === 'minecraft:lingering_potion') {
        let nbt = offhandItem.nbt;
        if (!nbt || !nbt.CustomPotionEffectStrId || !nbt.IsFermenting || nbt.IsInstantPotion === 1) return;

        let effectStrId = nbt.CustomPotionEffectStrId.toString(); 
        let tier = nbt.PotionTier ? nbt.PotionTier.valueOf() : 1; 

        if (POTION_CONFIG[effectStrId]) {
            let pData = player.persistentData;
            if (!pData.potionOffhandTicks) {
                pData.potionOffhandTicks = 0;
            }
            
            pData.potionOffhandTicks += 20; 
            let ticksHeld = pData.potionOffhandTicks;

            let multiplier = 1.0 + (ticksHeld / BASE_GROWTH_TICKS);
            let baseDuration = nbt.BaseDuration ? nbt.BaseDuration.valueOf() : 3600; 

            let finalDuration = Math.floor(baseDuration * multiplier);
            let amplifier = Math.max(0, tier - 1); 

            nbt.CurrentDuration = finalDuration;
            updatePotionLore(nbt, finalDuration, false);

            player.potionEffects.add(effectStrId, finalDuration, amplifier, false, false);
        }
    } else {
        if (player.persistentData.potionOffhandTicks) {
            player.persistentData.potionOffhandTicks = 0;
        }
    }
});

BlockEvents.rightClicked('minecraft:brewing_stand', event => {
  event.cancel()
})