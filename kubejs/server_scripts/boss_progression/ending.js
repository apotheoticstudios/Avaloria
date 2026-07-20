console.log('[Ignivorus Script] Script loaded successfully.')

// -------------------------------------------------------------
// Helper: Execute Ritual
// -------------------------------------------------------------
function startRitualSequence(player, level, server) {
    console.log(`[Ritual Start] Starting ritual sequence for player: ${player.username}`)

    // Apply initial levitation (18 seconds)
    player.potionEffects.add('minecraft:levitation', 360, 1, false, false)

    // Cinematic message lines
    const lines = [
        "§4§oCan you feel it? In your veins?",
        "§4§oThe warmth? The anguish boiling away from your brow?",
        "§4§oThe sweat, rolling down your neck?",
        "§4§oThe memories, fleeting, yet somehow stuck in this heart.",
        "§4§oIn your heart.",
        "§4§oIn the heart of a beast."
    ]

    // Safe helper function to spawn lightning
    function spawnLightningAt(x, y, z, visualOnly) {
        if (isNaN(x) || isNaN(y) || isNaN(z)) {
            console.log(`[Lightning Error] Aborted spawn due to NaN coordinates! (X:${x}, Y:${y}, Z:${z})`)
            return
        }

        try {
            let bolt = level.createEntity('minecraft:lightning_bolt')
            if (bolt) {
                bolt.setPosition(x, y, z)
                if (visualOnly && typeof bolt.setVisualOnly === 'function') {
                    bolt.setVisualOnly(true)
                }
                bolt.spawn()
            }
        } catch (err) {
            console.log(`[Lightning Exception] Error spawning lightning: ${err}`)
        }
    }

    // Circle calculation using explicit PI value to avoid Rhino engine NaN issue
    function spawnLightningCircle(targetPlayer, radius, points) {
        let playerX = Number(targetPlayer.getX())
        let playerY = Number(targetPlayer.getY())
        let playerZ = Number(targetPlayer.getZ())

        const PI = 3.141592653589793

        for (let i = 0; i < points; i++) {
            let angle = (i * 2 * PI) / points
            let cosVal = Math.cos(angle)
            let sinVal = Math.sin(angle)
            
            let ringX = playerX + (radius * cosVal)
            let ringZ = playerZ + (radius * sinVal)

            spawnLightningAt(ringX, playerY, ringZ, true)
        }
    }

    // Schedule timed cinematic steps (60 ticks = 3 seconds between lines)
    lines.forEach((line, index) => {
        let delayTicks = index * 60

        server.scheduleInTicks(delayTicks, () => {
            player.tell(line)

            let radius = (index + 1) * 2.5
            spawnLightningCircle(player, radius, 8)
        })
    })

    // Climax setup at Line 6 (300 ticks / 15 seconds in)
    server.scheduleInTicks(300, () => {
        player.potionEffects.add('minecraft:blindness', 300, 0, false, false)
        player.potionEffects.add('minecraft:slowness', 300, 4, false, false)
        player.potionEffects.add('minecraft:resistance', 300, 255, false, false)

        player.health = 1.0
    })

    // Final Death sequence after 15-second pause (600 ticks / 30 seconds total)
    server.scheduleInTicks(600, () => {
        player.health = 1.0
        player.tell("§c§lMaybe, maybe you are the beast.")

        // Play Wither spawn sound on MASTER channel
        server.runCommandSilent(`execute as ${player.username} run playsound minecraft:entity.wither.spawn master @s ~ ~ ~ 1.0 1.0`)

        // Direct fatal strike on player live position
        let finalX = Number(player.getX())
        let finalY = Number(player.getY())
        let finalZ = Number(player.getZ())
        spawnLightningAt(finalX, finalY, finalZ, false)
        
        // Instant death
        player.kill()
    })
}

// -------------------------------------------------------------
// 1. Clear default drops & drop Heart with custom Lore
// -------------------------------------------------------------
EntityEvents.drops(event => {
    if (event.entity.type === 'saintsdragons:ignivorus') {
        event.drops.clear()
        
        let heartItem = Item.of('saintsdragons:ignivorus_heart', {
            display: {
                Lore: ['[{"text":"Whose heart is this?","color":"red"}]']
            }
        })

        event.addDrop(heartItem)
    }
})

// -------------------------------------------------------------
// 2. Clear invalid hearts from player inventories every 5 ticks
// -------------------------------------------------------------
PlayerEvents.tick(event => {
    const player = event.player
    
    if (player.age % 5 === 0) {
        player.inventory.items.forEach((stack) => {
            if (stack.id === 'saintsdragons:ignivorus_heart') {
                let hasCustomLore = stack.nbt && 
                                   stack.nbt.display && 
                                   stack.nbt.display.Lore && 
                                   stack.nbt.display.Lore.toString().includes("Whose heart is this?")

                if (!hasCustomLore) {
                    stack.count = 0
                }
            }
        })
    }
})

// -------------------------------------------------------------
// 3. Item Right-Click Listener
// -------------------------------------------------------------
ItemEvents.rightClicked('saintsdragons:ignivorus_heart', event => {
    const player = event.player
    const level = event.level
    const server = event.server

    let hasLore = event.item.nbt && event.item.nbt.display && event.item.nbt.display.Lore
    let loreText = hasLore ? event.item.nbt.display.Lore.toString() : ""

    if (!loreText.includes("Whose heart is this?")) return

    event.item.count--
    startRitualSequence(player, level, server)
})

// -------------------------------------------------------------
// 4. Testing Command: /trigger_ritual
// -------------------------------------------------------------
ServerEvents.commandRegistry(event => {
    const { commands: Commands } = event

    event.register(
        Commands.literal('trigger_ritual')
            .requires(src => src.hasPermission(2))
            .executes(ctx => {
                let player = ctx.source.player
                let level = ctx.source.level
                let server = ctx.source.server

                if (player) {
                    player.tell("§e[Testing] Triggering Ignivorus Heart Ritual Sequence...")
                    startRitualSequence(player, level, server)
                    return 1
                }
                return 0
            })
    )
})