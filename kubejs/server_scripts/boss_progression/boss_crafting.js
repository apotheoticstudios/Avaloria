ServerEvents.recipes(event => {
    event.remove( {output: "minecraft:ender_eye"} )
    event.shaped(
        Item.of('minecraft:ender_eye', 16),
        [
            'PPP',
            'PSP',
            'PPP'
        ],
        {
            P: 'minecraft:ender_pearl',
            S: Ingredient.of('netherman:manipulator_stick')
        }
    ).id('kubejs:eyes_of_ender_from_manipulator')
     .keepIngredient('netherman:manipulator_stick')
    event.remove( {output: "luminous_beasts:beast_pit_off"} )
    event.shaped(
        'luminous_beasts:beast_pit_off', // Output item
        [
          'GDG', // Top row
          'GWG', // Middle row (G = Deepslate)
          'GCG'  // Bottom row (C = Campfire, W = Gunpowder)
        ],
        {
          G: 'minecraft:deepslate',       // Material for "G"
          C: 'minecraft:campfire',        // Material for "C"
          D: 'minecraft:diamond',         // Material for "D"
          W: 'minecraft:gunpowder'        // Material for "W"
        }
    )
});