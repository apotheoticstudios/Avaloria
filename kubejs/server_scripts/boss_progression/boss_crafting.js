ServerEvents.recipes(event => {
  event.shaped(
    'minecraft:ender_eye', // Output
    [
      ' I ', 
      ' P ', 
      ' B '  
    ],
    {
      I: 'mosterexpansion:ignathos_hide',
      P: 'minecraft:ender_pearl',
      B: 'minecraft:blaze_rod'
    }
  )
})