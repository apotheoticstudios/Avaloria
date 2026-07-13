// startup_scripts/scrap_items.js
StartupEvents.registry('item', function(event) {
    event.create('custom_scrap_box')
         .displayName('Equipment Scrap')
         .unstackable()
         .texture('minecraft:item/bundle'); // Reuses bundle texture, or use your own
});

ForgeEvents.onEvent('net.minecraftforge.event.AnvilUpdateEvent', event => {
    console.log("test")
    // Check if the item being repaired/modified is one you want to block
    let leftItem = event.getLeft()
    let rightItem = event.getRight()
    let cancel_list = [
        "minecraft:leather",
        "#minecraft:planks",
        "#minecraft:stone_tool_materials",
        "minecraft:iron_ingot",
        "minecraft:gold_ingot",
        "minecraft:diamond",
        "minecraft:netherite_ingot",
    ]
    // Example: Block repairing Diamond Swords
    if (cancel_list.includes(rightItem.id)) {
        event.setCanceled(true)
    }
})
