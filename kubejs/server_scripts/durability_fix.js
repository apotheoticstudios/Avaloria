EntityEvents.death(event => {
    // console.log("DEATH!")
    // Check if the killer was a player
    const { entity, source } = event;
    const attacker = source.actual;
    if (!attacker || !attacker.isPlayer()) return;
    // console.log("KILLED BY PLAYER!")

    const player = attacker;
    // console.log(`[RepairOnKill] Player ${player.username} killed an entity: ${event.entity.type}`);

    let totalItemsRepaired = 0;

    // Helper function to handle the repair logic and logging
    function repairItem(item, slotName) {
        if (item && item.isDamageableItem()) {
            const currentDamage = item.getDamageValue();
            if (currentDamage > 0) {
                const newDamage = Math.max(0, currentDamage - 10);
                item.setDamageValue(newDamage);
                // console.log(`[RepairOnKill] Repaired ${slotName} (${item.id}): Damage ${currentDamage} -> ${newDamage}`);
                totalItemsRepaired++;
            } else {
                // console.log(`[RepairOnKill] ${slotName} (${item.id}) is already at full durability.`);
            }
        }
    }

    // 1. Check main hand and offhand
    repairItem(player.getMainHandItem(), "Main Hand");
    repairItem(player.getOffHandItem(), "Offhand");

    // 2. Check armor slots
    player.getArmorSlots().forEach((armorItem, index) => {
        // Armor slots typically index from 0 (boots) to 3 (helmet)
        const slotNames = ["Boots", "Leggings", "Chestplate", "Helmet"];
        const slotName = slotNames[index] || `Armor Slot ${index}`;
        repairItem(armorItem, slotName);
    });

    // console.log(`[RepairOnKill] Processing complete. Total items repaired: ${totalItemsRepaired}`);
});