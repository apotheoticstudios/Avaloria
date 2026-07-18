// List of all boss IDs to restrict. 
const BANNED_BOSSES = [
    "bbv:the_ender_dragonoverworld"
];

// Configurable ambush system settings
const AMBUSH_CHECK_COOLDOWN = 12000; // 10 minutes in ticks (20 ticks = 1 second)
const WARNING_COUNTDOWN_TIME = 5; // 5 seconds warning structure countdown
const BOSSBAR_DESPAWN_DISTANCE = 64; // Distance at which boss bar disappears if player runs away

// Bosses that should replace natural spawns with a 5-second countdown warning structure
const GRID_BOSSES_CONFIG = [
    { boss: 'opposing_force:guzzler', biome: 'minecraft:swamp', prereq: 'theinkarena:ink_titan', color: 'green' },
    { boss: 'opposing_force:skyvern', biome: 'minecraft:the_end', prereq: 'minecraft:ender_dragon', color: 'blue' },
    { boss: 'saintsdragons:volitans', biome: 'minecraft:plains', prereq: 'minecraft:wither', color: 'purple' },
    { boss: 'saintsdragons:raevyx', biome: 'minecraft:plains', prereq: 'minecraft:wither', color: 'purple' },
    { boss: 'saintsdragons:varasuchus', biome: 'minecraft:plains', prereq: 'minecraft:wither', color: 'purple' },
    { boss: 'saintsdragons:ignivorus', biome: 'minecraft:plains', prereq: 'minecraft:wither', color: 'red' },
    { boss: 'monsterexpansion:ignathos', biome: 'minecraft:plains', prereq: 'minecraft:wither', color: 'red' },
    { boss: 'monsterexpansion:rhyza', biome: 'minecraft:plains', prereq: 'minecraft:wither', color: 'green' },
    { boss: 'monsterexpansion:rakoth', biome: 'minecraft:plains', prereq: 'minecraft:wither', color: 'yellow' },
    { boss: 'monsterexpansion:skrythe', biome: 'minecraft:plains', prereq: 'minecraft:wither', color: 'white' },
    { boss: 'monsterexpansion:leivekilth', biome: 'minecraft:plains', prereq: 'minecraft:wither', color: 'pink' }
];

const GRID_BOSSES = GRID_BOSSES_CONFIG.map(cfg => cfg.boss);

// Paired Luminous Beasts mapping: [Normal Variant]: [Rare Variant]
const LUMINOUS_PAIRS = {
    "luminous_beasts:tree_ent": "luminous_beasts:cherry_tree_ent",
    "luminous_beasts:hermit_king": "luminous_beasts:golden_hermit_king",
    "luminous_beasts:mummy": "luminous_beasts:red_mummy",
    "luminous_beasts:sea_viper": "luminous_beasts:coral_sea_viper",
    "luminous_beasts:yeti": "luminous_beasts:arid_yeti",
    "luminous_beasts:vile_gator": "luminous_beasts:frigid_gator",
    "luminous_beasts:bone_stalker": "luminous_beasts:bogged_bone_stalker",
    "luminous_beasts:piglin_executioner": "luminous_beasts:basalt_executioner",
    "luminous_beasts:the_furnace": "luminous_beasts:soul_furnace",
    "luminous_beasts:horseless_headsman": "luminous_beasts:the_scarecrow",
    "luminous_beasts:witch_doctor": "luminous_beasts:woodland_witch_doctor",
    "luminous_beasts:phoenix": "luminous_beasts:wind_phoenix",
    "luminous_beasts:crimson_mushlin_king": "luminous_beasts:warped_mushlin_king",
    "luminous_beasts:luminous_moth": "luminous_beasts:albino_moth"
};

// Flatten out all luminous keys and values for quick array checks
const LUMINOUS_ALL = Object.keys(LUMINOUS_PAIRS).concat(Object.values(LUMINOUS_PAIRS));
const ALL_RESTRICTED = BANNED_BOSSES.concat(GRID_BOSSES, LUMINOUS_ALL);

/**
 * Custom function to spawn a restricted boss safely.
 */
global.spawnCustomBoss = (level, entityId, x, y, z) => {
    console.log(`[BossSystem] Spawning custom managed boss: ${entityId} at [${Math.floor(x)}, ${Math.floor(y)}, ${Math.floor(z)}]`);
    let entity = level.createEntity(entityId);
    if (entity) {
        entity.setPosition(x, y, z);
        entity.persistentData.putBoolean('allow_boss_spawn', true);
        entity.spawn();
        return entity;
    }
    console.error(`[BossSystem] Failed to create entity object for: ${entityId}`);
    return null;
};

/**
 * Utility function to handle structural persistent checking for Luminous unlocks.
 */
function isLuminousUnlocked(server, level, x, y, z, mobId) {
    let rareVariant = LUMINOUS_PAIRS[mobId] || mobId;
    let nearbyPlayers = level.getEntitiesWithin(AABB.of(x - 128, y - 64, z - 128, x + 128, y + 64, z + 128)).filter(e => e.isPlayer());
    
    if (!server.persistentData.beasts_killed) {
        console.log(`[BossSystem] Luminous Check: No beasts_killed data block initialized on server yet.`);
        return false;
    }

    for (let player of nearbyPlayers) {
        let pUUID = player.uuid.toString();
        if (server.persistentData.beasts_killed[pUUID] && server.persistentData.beasts_killed[pUUID][rareVariant]) {
            console.log(`[BossSystem] Luminous Check: Allowed ${mobId} spawn. Player ${player.username} has unlocked variant ${rareVariant}`);
            return true;
        }
    }
    console.log(`[BossSystem] Luminous Check: Blocked ${mobId} spawn at [${Math.floor(x)}, ${Math.floor(y)}, ${Math.floor(z)}]. No nearby players have unlocked ${rareVariant}`);
    return false;
}

// 1. Intercept spawns and evaluate rule sets
EntityEvents.spawned(event => {
    const entity = event.entity;
    if (!entity || !entity.type) return;
    const type = entity.type;
    const level = event.level;
    const server = level.server;

    if (!ALL_RESTRICTED.includes(type)) return;
    
    if (entity.persistentData.getBoolean('allow_boss_spawn')) {
        console.log(`[BossSystem] Filter Bypass: Allowed custom-spawned boss instance of ${type}`);
        return;
    }

    if (BANNED_BOSSES.includes(type)) {
        console.log(`[BossSystem] Filter Blocked: ${type} tried to spawn, but is explicitly listed in BANNED_BOSSES.`);
        event.cancel();
        return;
    }

    if (GRID_BOSSES.includes(type)) {
        console.log(`[BossSystem] Filter Blocked: ${type} tried to naturally spawn, but Grid Bosses must use the ambush system.`);
        event.cancel();
        return;
    }

    if (LUMINOUS_ALL.includes(type)) {
        if (!isLuminousUnlocked(server, level, entity.x, entity.y, entity.z, type)) {
            event.cancel();
        }
    }
});

// 2. Track Prerequisite Kills for the Ambush System
EntityEvents.death(event => {
    const entity = event.entity;
    const source = event.source;
    if (!entity || !source || !source.actual) return;
    
    const player = source.actual;
    if (!player.isPlayer()) return;

    const server = event.level.server;
    const deadEntityId = entity.type;
    let pUUID = player.uuid.toString();
    
    let trackingKey = `grid_prereq_killed_${pUUID}_${deadEntityId}`;
    server.persistentData.putBoolean(trackingKey, true);
    
    console.log(`[BossSystem] Data Update: Player ${player.username} has logged a prerequisite kill for: ${deadEntityId} (Key: ${trackingKey})`);
});

// 3. Ambush Warning Countdown Initialization
ServerEvents.tick(event => {
    const server = event.server;
    
    if (!global.activeCountdowns) {
        global.activeCountdowns = [];
    }

    // Process countdown warning bar visibility & cleanup every second
    if (server.tickCount % 20 === 0) {
        for (let i = global.activeCountdowns.length - 1; i >= 0; i--) {
            let warn = global.activeCountdowns[i];
            let player = server.getPlayer(warn.playerUUID);
            let shouldRemove = false;

            if (!player) {
                shouldRemove = true;
            } else {
                let pPos = player.block;
                let distSqr = ((pPos.x - warn.x) * (pPos.x - warn.x)) + ((pPos.z - warn.z) * (pPos.z - warn.z));
                if (distSqr > (BOSSBAR_DESPAWN_DISTANCE * BOSSBAR_DESPAWN_DISTANCE)) {
                    shouldRemove = true;
                    console.log(`[BossSystem] Warning Bar Cleanup: Player ${player.username} escaped the countdown zone.`);
                }
            }

            if (shouldRemove) {
                server.runCommandSilent(`bossbar remove ${warn.bossBarId}`);
                global.activeCountdowns.splice(i, 1);
            }
        }
    }

    // Core ~10 minute ambush trigger check
    if (server.tickCount % AMBUSH_CHECK_COOLDOWN !== 0) return;

    console.log(`[BossSystem] Interval Check: Running 10-minute ambush evaluation loop across all online players...`);

    server.players.forEach(player => {
        let level = player.level;
        let biomeId = player.block.biomeId.toString(); 
        let pUUID = player.uuid.toString();

        let unlockedPrereqs = [];
        GRID_BOSSES_CONFIG.forEach(cfg => {
            let trackingKey = `grid_prereq_killed_${pUUID}_${cfg.prereq}`;
            if (server.persistentData.getBoolean(trackingKey) === true) {
                if (!unlockedPrereqs.includes(cfg.prereq)) {
                    unlockedPrereqs.push(cfg.prereq);
                }
            }
        });
        
        console.log(`[BossSystem] Diagnostic -> Player: ${player.username} | Current Biome: ${biomeId} | Defeated Prereqs: [${unlockedPrereqs.join(', ') || 'None'}]`);

        if (!player.hasEffect('minecraft:bad_omen')) {
            console.log(`[BossSystem] Loop Progress: Player ${player.username} skipped (Missing Bad Omen).`);
            return;
        }

        if (unlockedPrereqs.length === 0) {
            console.log(`[BossSystem] Loop Progress: Player ${player.username} has Bad Omen, but has no unlocked prerequisites.`);
            return;
        }

        let availableBosses = GRID_BOSSES_CONFIG.filter(cfg => {
            let trackingKey = `grid_prereq_killed_${pUUID}_${cfg.prereq}`;
            return cfg.biome === biomeId && server.persistentData.getBoolean(trackingKey) === true;
        });

        if (availableBosses.length === 0) {
            console.log(`[BossSystem] Loop Progress: Player ${player.username} has Bad Omen, but no registered boss configurations match their current biome.`);
            return;
        }

        let selected = availableBosses[Math.floor(Math.random() * availableBosses.length)];
        let targetX = player.block.x;
        let targetY = player.block.y;
        let targetZ = player.block.z;

        console.log(`[BossSystem] AMBUSH TRIGGERED: Player ${player.username} matches conditions for ${selected.boss} in ${biomeId}. Starting 5s countdown sequence...`);

        // Using safe unique formatting matching your layout
        let cleanBarName = selected.boss.split(':')[1].replace(/_/g, ' ').toUpperCase();
        let barId = `ambush_warn_${player.username.toLowerCase()}_${server.tickCount}`;
        
        server.runCommandSilent(`bossbar add ${barId} "INCOMING: ${cleanBarName}"`);
        server.runCommandSilent(`bossbar set ${barId} max ${WARNING_COUNTDOWN_TIME}`);
        server.runCommandSilent(`bossbar set ${barId} value ${WARNING_COUNTDOWN_TIME}`);
        server.runCommandSilent(`bossbar set ${barId} color ${selected.color.toLowerCase()}`);
        server.runCommandSilent(`bossbar set ${barId} players ${player.username}`);

        let countdownData = {
            playerUUID: player.uuid,
            bossBarId: barId,
            x: targetX,
            z: targetZ
        };
        global.activeCountdowns.push(countdownData);

        player.tell(Text.red(`Something ancient stirs in the area... Spawning in ${WARNING_COUNTDOWN_TIME} seconds!`));

        let countdownCount = 0;
        event.server.scheduleRepeatingInTicks(20, callback => {
            countdownCount++;
            let remaining = WARNING_COUNTDOWN_TIME - countdownCount;

            // Make sure player hasn't run out of bounds before running next loop tick
            let checkActive = global.activeCountdowns.find(a => a.bossBarId === barId);
            if (!checkActive) {
                callback.clear();
                return;
            }

            if (remaining > 0) {
                server.runCommandSilent(`bossbar set ${barId} value ${remaining}`);
                player.tell(Text.yellow(`Spawning in ${remaining}...`));
            } else {
                // Clear warning bar before spawning actual boss entity bar
                server.runCommandSilent(`bossbar remove ${barId}`);
                global.activeCountdowns = global.activeCountdowns.filter(a => a.bossBarId !== barId);

                let currentLevel = server.getLevel(level.dimension);
                
                // Strike lightning sequence
                let lightning = currentLevel.createEntity('minecraft:lightning_bolt');
                if (lightning) {
                    lightning.setPosition(targetX, targetY, targetZ);
                    lightning.spawn();
                }
                server.runCommandSilent(`execute in ${level.dimension.toString()} at ${targetX} ${targetY} ${targetZ} run playsound minecraft:entity.wither.spawn host @a ~ ~ ~ 1.0 1.0`);

                let spawned = global.spawnCustomBoss(currentLevel, selected.boss, targetX, targetY, targetZ);
                if (spawned) {
                    // Inject persistent data onto the spawned boss so the Level tick handler finds it automatically
                    let bossBarId = `grid_bar_${spawned.uuid.toString().replace(/-/g, '_')}`;
                    let maxHp = Math.ceil(spawned.maxHealth);

                    spawned.persistentData.putBoolean('IsGridAmbushBoss', true);
                    spawned.persistentData.putString('GridBossBarId', bossBarId);
                    spawned.persistentData.putString('GridBossBarColor', selected.color.toLowerCase());
                    spawned.persistentData.putString('GridBossBarName', cleanBarName);

                    // Add the base bossbar configuration instantly
                    server.runCommandSilent(`bossbar add ${bossBarId} "${cleanBarName}"`);
                    server.runCommandSilent(`bossbar set ${bossBarId} max ${maxHp}`);
                    server.runCommandSilent(`bossbar set ${bossBarId} value ${maxHp}`);
                    server.runCommandSilent(`bossbar set ${bossBarId} color ${selected.color.toLowerCase()}`);
                    server.runCommandSilent(`bossbar set ${bossBarId} style progress`);
                    server.runCommandSilent(`execute in ${level.dimension.toString()} run bossbar set ${bossBarId} players @a[x=${targetX},y=${targetY},z=${targetZ},distance=..${BOSSBAR_DESPAWN_DISTANCE}]`);

                    console.log(`[BossSystem] Spawner Success: ${selected.boss} spawned. Bossbar tracking active: ${bossBarId}`);
                } else {
                    console.error(`[BossSystem] Spawner Error: Failed to summon ${selected.boss}.`);
                }
                callback.clear();
            }
        });
    });
});

// 4. ACTIVE BOSS TRACKING MONITOR (Updates BossBar Data & Clean Removal)
LevelEvents.tick(event => {
    const { level, server } = event;
    // Run evaluation every 10 game ticks to reduce server payload footprint
    if (level.time % 10 !== 0) return;

    // Grab all entities loaded in the current dimension running our tracking tag
    let activeGridBosses = level.getEntities().filter(e => {
        if (!e || !e.persistentData) return false;
        return e.persistentData.getBoolean('IsGridAmbushBoss') === true;
    });

    activeGridBosses.forEach(boss => {
        let bossbarId = boss.persistentData.getString('GridBossBarId');
        let currentHp = Math.max(0, Math.ceil(boss.health));
        
        // Update current boss health state tracking
        server.runCommandSilent(`bossbar set ${bossbarId} value ${currentHp}`);
        
        // Dynamically append / remove players in the radius loop selection rule matching your requirement
        server.runCommandSilent(`execute in ${level.dimension.toString()} run bossbar set ${bossbarId} players @a[x=${boss.x},y=${boss.y},z=${boss.z},distance=..${BOSSBAR_DESPAWN_DISTANCE}]`);
        
        // If the boss gets removed, dies, or drops health values to zero, clear the visual UI trace
        if (boss.isRemoved() || !boss.isAlive() || currentHp <= 0) {
            console.log(`[BossSystem] Active Tracking Ended: Removing bossbar ${bossbarId} (Boss defeated/despawned).`);
            server.runCommandSilent(`bossbar remove ${bossbarId}`);
        }
    });
});