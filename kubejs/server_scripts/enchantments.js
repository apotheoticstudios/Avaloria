// ServerEvents.recipes(event => {
//     let displayOutput = Item.of('minecraft:enchanted_book')
//     displayOutput.nbt = { display: { Name: '{"text":"Remove Enchantments from Items","color":"gold","italic":false}' } }
//     console.log("test")
//     event.shapeless(
//         displayOutput, 
//         [
//             'minecraft:book',
//             '#forge:tools'
//         ]
//     ).keepIngredient(
//         '#forge:tools'
//     ).modifyResult((grid, result) => {
//         console.log("test")
//         let book = grid.find(Item.of('minecraft:book'))
        
//         // Use grid.find() with a string or Ingredient to locate the tool
//         let itemWithEnchants = grid.find('#forge:tools')
        
//         if (!itemWithEnchants || !book) return result;

//         let nbt = itemWithEnchants.nbt
//         if (!nbt || !nbt.contains('Enchantments')) return result;

//         // 1. Build and return the enchanted book
//         let enchantments = nbt.get('Enchantments')
//         let enchantedBook = Item.of('minecraft:enchanted_book')
//         let bookNBT = Utils.newMap()
//         bookNBT.put('StoredEnchantments', enchantments)
//         enchantedBook.nbt = bookNBT

//         // 2. Strip the tool and set it as the grid remainder
//         // We create a clean copy of the tool to manipulate
//         console.log(itemWithEnchants)
//         let strippedTool = itemWithEnchants.copy()
//         console.log(cleanNBT)
//         let cleanNBT = strippedTool.nbt
//         delete cleanNBT.Enchantments
//         delete cleanNBT.RepairCost
//         console.log(cleanNBT)
//         strippedTool.nbt = cleanNBT

//         // Tell KubeJS to replace the tool ingredient slot with this stripped version
//         itemWithEnchants = strippedTool

//         console.error("test")
//         return enchantedBook;
//     })
// })