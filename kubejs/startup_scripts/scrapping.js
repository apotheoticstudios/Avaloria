// startup_scripts/scrap_items.js
StartupEvents.registry('item', function(event) {
    event.create('custom_scrap_box')
         .displayName('Equipment Scrap')
         .unstackable()
         .texture('minecraft:item/bundle'); // Reuses bundle texture, or use your own
});