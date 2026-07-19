ItemEvents.modification(event => {
    // This modifies regular, splash, and lingering potions
    event.modify('minecraft:potion', item => {
        item.maxStackSize = 16 // Change 16 to whatever stack limit you want, max is 64
    })
    
    event.modify('minecraft:splash_potion', item => {
        item.maxStackSize = 16
    })
    
    event.modify('minecraft:lingering_potion', item => {
        item.maxStackSize = 16
    })
})
MoreJSEvents.registerPotionBrewing((event) => {
    event.removeByCustom((brewing) => {
        return true
    });
});