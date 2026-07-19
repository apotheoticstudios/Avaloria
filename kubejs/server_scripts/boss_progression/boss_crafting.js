ServerEvents.recipes(event => {
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
});