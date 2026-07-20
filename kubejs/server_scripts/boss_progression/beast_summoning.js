// --- CONFIGURATION ARRAY SCAFFOLD ---
const BEAST_SUMMONS = [
    {
        mobId: "luminous_beasts:soul_furnace",
        itemId: "minecraft:cooked_beef",
        offHandItemId: "minecraft:nether_quartz",
        biome: "minecraft:soul_sand_valley",
        radius: 8, filters: { inWater: false, padding: 1 }
    },
    {
        mobId: "luminous_beasts:the_scarecrow",
        itemId: "minecraft:rotten_flesh",
        offHandItemId: "minecraft:nether_quartz",
        biome: "kubejs:wildlife_spawns/temperate_forests",
        radius: 10, filters: { inWater: false, padding: 1 }
    },
    {
        mobId: "luminous_beasts:woodland_witch_doctor",
        itemId: "minecraft:chicken",
        biome: "kubejs:wildlife_spawns/temperate_forests",
        radius: 10, filters: { inWater: false, padding: 1 }
    },
    {
        mobId: "luminous_beasts:red_mummy",
        itemId: "minecraft:mutton",
        biome: "#kubejs:wildlife_spawns/arid_wildlands", 
        radius: 8, filters: { inWater: false, padding: 1 }
    },
    {
        mobId: "luminous_beasts:cherry_tree_ent",
        itemId: "minecraft:apple",
        biome: "minecraft:cherry_grove", 
        radius: 12, filters: { inWater: false, padding: 2 }
    },
    {
        mobId: "luminous_beasts:golden_hermit_king",
        itemId: "minecraft:rabbit",
        biome: "kubejs:wildlife_spawns/coasts",
        radius: 6, filters: { inWater: false, padding: 1 }
    },
    {
        mobId: "luminous_beasts:coral_sea_viper",
        itemId: "minecraft:tropical_fish",
        biome: "kubejs:wildlife_spawns/oceans",
        radius: 15, filters: { inWater: true, padding: 2 }
    },
    {
        mobId: "luminous_beasts:arid_yeti",
        itemId: "minecraft:porkchop",
        biome: "kubejs:wildlife_spawns/arid_wildlands",
        radius: 12, filters: { inWater: false, padding: 2 }
    },
    {
        mobId: "luminous_beasts:frigid_gator",
        itemId: "minecraft:cod",
        biome: "kubejs:wildlife_spawns/oceans",
        radius: 10, filters: { inWater: true, padding: 1 }
    },
    {
        mobId: "luminous_beasts:wind_phoenix",
        itemId: "minecraft:feather",
        biome: "kubejs:wildlife_spawns/taiga_dark",
        radius: 16, filters: { inWater: false, padding: 3 }
    },
    {
        mobId: "luminous_beasts:bogged_bone_stalker",
        itemId: "minecraft:bone",
        biome: "kubejs:wildlife_spawns/wetlands",
        radius: 8, filters: { inWater: false, padding: 1 }
    },
    {
        mobId: "luminous_beasts:basalt_executioner",
        itemId: "minecraft:magma_cream",
        offHandItemId: "minecraft:nether_quartz",
        biome: "minecraft:basalt_deltas",
        radius: 8, filters: { inWater: false, padding: 2 }
    },
    {
        mobId: "luminous_beasts:warped_mushlin_king",
        itemId: "minecraft:warped_fungus",
        offHandItemId: "minecraft:nether_quartz",
        biome: "minecraft:warped_forest",
        radius: 10, filters: { inWater: false, padding: 2 }
    },
    {
        mobId: "luminous_beasts:albino_moth",
        itemId: "minecraft:spider_eye",
        biome: "kubejs:wildlife_spawns/taiga_dark",
        radius: 12, filters: { inWater: false, padding: 1 }
    }
];

// --- INTERACTION LOGIC & CINEMATIC SPAWN ---
BlockEvents.rightClicked(event => {
    const { block, player, hand, level, server } = event;
    if (hand != 'MAIN_HAND') return;
    if (block.id !== 'luminous_beasts:beast_pit') return;
    
    const heldItem = player.getMainHandItem();
    const offHandItem = player.getOffHandItem();
    const dimensionId = level.dimension.toString();
    
    console.log(`[Beast Summoner] Interaction detected by player: ${player.username}`);
    
    // --- SPECIAL CONDITION: SAINTSDRAGONS:IGNIVORUS ---
    if (dimensionId === 'bbv:endnew' && heldItem.id === 'minecraft:dragon_egg') {
        // Verify the bedrock pillar: block directly below pit, and block below that one
        let firstBelow = block.pos.below();
        let secondBelow = firstBelow.below();
        
        let isPillar = level.getBlock(firstBelow).id === 'minecraft:bedrock' && 
                       level.getBlock(secondBelow).id === 'minecraft:bedrock';
                       
        if (isPillar) {
            // Convert BlockPos to plain JS object with block-center offsets
            let targetPos = block.pos.above(20);
            let spawnPos = {
                x: targetPos.x + 0.5,
                y: targetPos.y,
                z: targetPos.z + 0.5
            };
            
            if (!player.isCreative()) {
                server.runCommandSilent(`clear ${player.username} minecraft:dragon_egg 1`);
            }
            
            block.set('minecraft:air');
            player.setStatusMessage("§6The skies tear open... Ignivorus descends!§r");
            
            // Trigger cinematic sequence using the formatted spawn position
            triggerCinematicSpawn(server, level, player, spawnPos, 'saintsdragons:ignivorus');
            event.success();
            return;
        }
    }
    
    // --- FALLBACK TO STANDARD BEAST SUMMONS ---
    const biome = level.getBiome(block.pos);
    let biomeKey = biome.unwrapKey().orElse(null);
    let currentBiomeId = biomeKey ? biomeKey.location().toString() : "unknown";
    
    const match = BEAST_SUMMONS.find(cfg => {
        if (heldItem.id !== cfg.itemId) return false;
        if (cfg.offHandItemId && offHandItem.id !== cfg.offHandItemId) return false;
        
        let targetBiomeRule = cfg.biome;
        let isTagCheck = targetBiomeRule.startsWith('#');
        let ruleClean = isTagCheck ? targetBiomeRule.substring(1) : targetBiomeRule;
        
        if (!isTagCheck && currentBiomeId === ruleClean) return true;
        
        try {
            let hasTagMatch = false;
            let iterator = biome.tags().iterator();
            while (iterator.hasNext()) {
                let tag = iterator.next();
                let finalTag = tag.location ? tag.location().toString() : tag.toString();
                if (finalTag === ruleClean) {
                    hasTagMatch = true;
                    break;
                }
            }
            if (hasTagMatch) return true;
        } catch(e) {
            if (typeof biome.hasTag === 'function') {
                if (biome.hasTag(ruleClean) || biome.hasTag('#' + ruleClean)) return true;
            }
        }
        return false;
    });
    
    if (!match) return;
    
    const spawnPos = findSpawnPosition(level, block.pos, match.radius, match.filters);
    if (!spawnPos) {
        player.setStatusMessage("No suitable space nearby to summon the beast!");
        return;
    }
    
    if (!player.isCreative()) {
        server.runCommandSilent(`clear ${player.username} ${match.itemId} 1`);
        if (match.offHandItemId) {
            server.runCommandSilent(`clear ${player.username} ${match.offHandItemId} 1`);
        }
    }
    
    block.set('minecraft:air');
    player.setStatusMessage("§6Something ancient stirs... prepare yourself!§r");

    // Trigger standard cinematic sequence
    triggerCinematicSpawn(server, level, player, spawnPos, match.mobId);
    event.success();
});

// --- HELPER FUNCTION FOR CINEMATIC SEQUENCING ---
function triggerCinematicSpawn(server, level, player, spawnPos, mobId) {
    server.runCommandSilent(`weather thunder`);

    let lightningDelays = [0, 20, 40, 60, 80, 95];
    lightningDelays.forEach((delay, index) => {
        server.scheduleInTicks(delay, callback => {
            let lx = spawnPos.x + (Math.random() - 0.5) * 4;
            let lz = spawnPos.z + (Math.random() - 0.5) * 4;
            server.runCommandSilent(`execute in ${level.dimension.toString()} run summon minecraft:lightning_bolt ${lx} ${spawnPos.y} ${lz}`);
            
            if (index === lightningDelays.length - 1) {
                server.runCommandSilent(`execute in ${level.dimension.toString()} at ${spawnPos.x} ${spawnPos.y} ${spawnPos.z} run playsound minecraft:entity.wither.spawn host @a ~ ~ ~ 1.0 1.0`);

                let entity = level.createEntity(mobId);
                entity.setPosition(spawnPos.x, spawnPos.y, spawnPos.z);
                
                entity.persistentData.putBoolean('IsBeastSummon', true);
                entity.persistentData.putString('BeastMobId', mobId);
                entity.persistentData.putString('SummonerUUID', player.uuid.toString());
                entity.persistentData.putBoolean('allow_boss_spawn', true);

                entity.mergeNbt({
                    ForgeData: {
                        IsBeastSummon: true,
                        BeastMobId: mobId,
                        SummonerUUID: player.uuid.toString()
                    }
                });
                
                entity.spawn();

                // Instantly heal entity to its maximum capacity
                entity.setHealth(entity.maxHealth);

                let uuid = entity.uuid.toString();

                // NEW: Instant health burst (tier 255) to guarantee full HP if modded attributes take a tick to apply
                server.runCommandSilent(`effect give ${uuid} minecraft:instant_health 1 255 true`);

                // Glowing effect (10 seconds, hidden particles)
                server.runCommandSilent(`effect give ${uuid} minecraft:glowing 10 0 true`);
                
                // 5 seconds of max-tier status effects with particles hidden
                server.runCommandSilent(`effect give ${uuid} minecraft:regeneration 5 255 true`);
                server.runCommandSilent(`effect give ${uuid} minecraft:resistance 5 255 true`);
                server.runCommandSilent(`effect give ${uuid} minecraft:weakness 5 255 true`);
                
                let bossbarId = `beast_bar_${uuid.replace(/-/g, '_')}`;
                let cleanMobName = mobId.split(':')[1].replace(/_/g, ' ').toUpperCase();
                let maxHp = Math.ceil(entity.maxHealth);
                
                server.runCommandSilent(`bossbar add ${bossbarId} "${cleanMobName}"`);
                server.runCommandSilent(`bossbar set ${bossbarId} max ${maxHp}`);
                server.runCommandSilent(`bossbar set ${bossbarId} value ${maxHp}`);
                server.runCommandSilent(`bossbar set ${bossbarId} color red`);
                server.runCommandSilent(`bossbar set ${bossbarId} style progress`);
                
                console.log(`[Beast Summoner] Successfully summoned ${mobId}. Bossbar tracking initialized with max HP (${maxHp}): ${bossbarId}`);
            }
        });
    });
}

// --- LEVEL TICK MONITORING (Updates BossBar Data & Clean Removal) ---
LevelEvents.tick(event => {
    const { level, server } = event;
    if (level.time % 10 !== 0) return;

    let activeBeasts = level.getEntities().filter(e => {
        if (!e || !e.persistentData) return false;
        return e.persistentData.getBoolean('IsBeastSummon') === true;
    });

    activeBeasts.forEach(beast => {
        let bossbarId = `beast_bar_${beast.uuid.toString().replace(/-/g, '_')}`;
        let currentHp = Math.max(0, Math.ceil(beast.health));
        
        server.runCommandSilent(`bossbar set ${bossbarId} value ${currentHp}`);
        
        // Dynamically updates the visible player list strictly to those within 60 blocks of the beast
        server.runCommandSilent(`execute in ${level.dimension.toString()} run bossbar set ${bossbarId} players @a[x=${beast.x},y=${beast.y},z=${beast.z},distance=..60]`);
        
        if (beast.isRemoved() || !beast.isAlive() || currentHp <= 0) {
            server.runCommandSilent(`bossbar remove ${bossbarId}`);
        }
    });
});

// --- DEATH STATS TRACKING & BOSSBAR CLEANUP ---
EntityEvents.death(event => {
    const { entity, source, server } = event;
    
    if (!entity || !entity.persistentData || !entity.persistentData.getBoolean('IsBeastSummon')) return;
    
    const mobId = entity.persistentData.getString('BeastMobId');
    const summonerUUID = entity.persistentData.getString('SummonerUUID');
    
    let bossbarId = `beast_bar_${entity.uuid.toString().replace(/-/g, '_')}`;
    server.runCommandSilent(`bossbar remove ${bossbarId}`);
    console.log(`[Beast Summoner] Entity deceased. Cleared target bossbar allocation: ${bossbarId}`);
    
    let player = source.actualEntity;
    if (!player || !player.isPlayer()) {
        if (summonerUUID) player = server.getPlayer(summonerUUID);
    }
    
    if (player && player.isPlayer()) {
        const playerUUID = player.uuid.toString();
        
        if (!server.persistentData.beasts_killed) server.persistentData.beasts_killed = {};
        if (!server.persistentData.beasts_killed[playerUUID]) server.persistentData.beasts_killed[playerUUID] = {};
        
        let currentKills = server.persistentData.beasts_killed[playerUUID][mobId] || 0;
        server.persistentData.beasts_killed[playerUUID][mobId] = currentKills + 1;
        
        // player.tell(`§aYou have slain a summoned ${mobId}! Total tracking: ${server.persistentData.beasts_killed[playerUUID][mobId]}§r`);
    }
});

// --- CUSTOM COMMAND: /checkbiometags <current|id> [biome_id] ---
ServerEvents.commandRegistry(event => {
    const { commands: Commands, arguments: Arguments } = event;
    
    event.register(
        Commands.literal('checkbiometags')
            .requires(src => src.hasPermission(2))
            .then(
                Commands.literal('current').executes(ctx => {
                    let player = ctx.source.player;
                    if (!player) return 0;
                    
                    let biomeKey = player.level.getBiome(player.blockPosition()).unwrapKey().orElse(null);
                    let biomeIdStr = biomeKey ? biomeKey.location().toString() : "unknown";
                    
                    let biomeHolder = player.level.getBiome(player.blockPosition());
                    dumpBiomeTags(player, biomeHolder, biomeIdStr);
                    return 1;
                })
            )
            .then(
                Commands.literal('id')
                    .then(
                        Commands.argument('biome', Arguments.STRING.create(event))
                            .suggests((ctx, builder) => {
                                let registryKey = Utils.MC.registryAccess().registryOrThrow('worldgen/biome');
                                return net.minecraft.commands.SharedSuggestionProvider.suggestResource(registryKey.keySet(), builder);
                            })
                            .executes(ctx => {
                                let player = ctx.source.player;
                                if (!player) return 0;
                                
                                let inputId = Arguments.STRING.getResult(ctx, 'biome');
                                let biomeRegistry = player.level.commands.level.registryAccess().registryOrThrow('worldgen/biome');
                                let biomeHolder = biomeRegistry.get(inputId);
                                
                                if (!biomeHolder) {
                                    player.tell(`§cCould not find biome registry for ID: ${inputId}§r`);
                                    return 0;
                                }
                                
                                dumpBiomeTags(player, biomeHolder, inputId);
                                return 1;
                            })
                    )
            )
    );
});

function dumpBiomeTags(player, biomeHolder, nameStr) {
    player.tell(`§b--- Tags for Biome: [${nameStr}] ---§r`);
    let tagsFound = [];
    
    try {
        let iterator = biomeHolder.tags().iterator();
        while (iterator.hasNext()) {
            let tag = iterator.next();
            let finalTag = tag.location ? tag.location().toString() : tag.toString();
            tagsFound.push(`#${finalTag}`);
        }
    } catch (e) {
        if (biomeHolder.tags) {
            biomeHolder.tags.forEach(tag => {
                let finalTag = tag.location ? tag.location().toString() : tag.toString();
                tagsFound.push(`#${finalTag}`);
            });
        }
    }
    
    if (tagsFound.length === 0) {
        player.tell(`§7No tags found on this biome.§r`);
    } else {
        tagsFound.forEach(tagStr => player.tell(`§e${tagStr}§r`));
    }
}

// --- SPATIAL FILTER FUNCTION ---
function findSpawnPosition(level, centerPos, radius, filters) {
    for (let i = 0; i < 40; i++) {
        let dx = Math.floor((Math.random() - 0.5) * 2 * radius);
        let dz = Math.floor((Math.random() - 0.5) * 2 * radius);
        let dy = Math.floor((Math.random() - 0.5) * 2 * (radius / 2));
        
        let targetPos = centerPos.above(dy).east(dx).north(dz);
        let targetBlock = level.getBlock(targetPos);
        
        if (filters.inWater) {
            if (!targetBlock.hasTag('minecraft:water') && targetBlock.id !== 'minecraft:water') continue;
        } else {
            if (targetBlock.id !== 'minecraft:air') continue;
            
            let belowBlock = level.getBlock(targetPos.below());
            if (!belowBlock.solid && belowBlock.id !== 'minecraft:dirt' && belowBlock.id !== 'minecraft:grass_block') {
                if (typeof belowBlock.getSolid === 'function' && !belowBlock.getSolid()) continue;
            }
        }
        
        let hasPadding = true;
        let pad = filters.padding || 1;
        
        for (let x = -pad; x <= pad; x++) {
            for (let y = 0; y <= pad; y++) {
                for (let z = -pad; z <= pad; z++) {
                    let checkBlock = level.getBlock(targetPos.above(y).east(x).north(z));
                    if (filters.inWater) {
                        if (!checkBlock.hasTag('minecraft:water') && checkBlock.id !== 'minecraft:water') {
                            hasPadding = false;
                            break;
                        }
                    } else {
                        if (checkBlock.id !== 'minecraft:air') {
                            hasPadding = false;
                            break;
                        }
                    }
                }
                if (!hasPadding) break;
            }
            if (!hasPadding) break;
        }
        
        if (hasPadding) {
            return { x: targetPos.x + 0.5, y: targetPos.y, z: targetPos.z + 0.5 };
        }
    }
    return null;
}