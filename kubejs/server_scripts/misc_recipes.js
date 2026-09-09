ServerEvents.recipes(event => {
    event.shaped('minecraft:cactus', [
        ' S ',
        'LCL',
        ' B '
    ], {
        S: 'minecraft:stick',
        L: '#minecraft:leaves',
        C: 'minecraft:sand',
        B: 'minecraft:bone_meal'
    }).id('kubejs:cactus_from_leaves')
})
