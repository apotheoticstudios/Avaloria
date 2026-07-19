// Function to penalize the player if they haven't beaten the boss
function checkStellarHollowUse(player, event) {
    // Check if the player is holding the restricted item in either hand
    if (player.getMainHandItem().id === 'foolish:stellar_hollow' || player.getOffHandItem().id === 'foolish:stellar_hollow') {
        
        // If they haven't killed the blot yet, trigger the penalty
        if (!player.persistentData.getBoolean('killed_blot')) {
            event.cancel();

            player.tell(Text.red("There still is a stain upon this world."));

            // Apply debuffs for 15 seconds (300 ticks)
            player.potionEffects.add('minecraft:darkness', 300, 0, false, true);
            player.potionEffects.add('theinkarena:inked', 300, 0, false, true);
            
            return true; // Used to stop further checks if needed
        }
    }
    return false;
}

// 1. Track when a player kills the boss
EntityEvents.death(event => {
    const { entity, source } = event;

    if (entity.type === 'theinkarena:blot') {
        if (source.actual && source.actual.isPlayer()) {
            const player = source.actual;
            player.persistentData.putBoolean('killed_blot', true);
            player.tell(Text.green("You have cleared a stain upon this world..."));
        }
    }
});

// 2. Block right-click usage (air or on blocks)
ItemEvents.rightClicked('foolish:stellar_hollow', event => {
    const { player, item } = event;

    if (!player.persistentData.getBoolean('killed_blot')) {
        event.cancel();
        player.tell(Text.red("There still is a stain upon this world."));
        player.potionEffects.add('minecraft:darkness', 300, 0, false, true);
        player.potionEffects.add('theinkarena:inked', 300, 0, false, true);
        player.addItemCooldown(item, 20);
    }
});

// 3. Block breaking blocks while holding the item
BlockEvents.broken(event => {
    const { player } = event;
    if (player) {
        checkStellarHollowUse(player, event);
    }
});

// 4. Block placing blocks while holding the item
BlockEvents.placed(event => {
    const { player } = event;
    if (player) {
        checkStellarHollowUse(player, event);
    }
});