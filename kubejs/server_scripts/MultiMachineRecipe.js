ServerEvents.recipes(event => {

    // ============================================================
    // REMOVE ORIGINAL MM STORAGE CHEST RECIPES
    // ============================================================

    event.remove({ output: 'mm_storage:block_chest_wood' })
    event.remove({ output: 'mm_storage:block_chest_iron' })
    event.remove({ output: 'mm_storage:block_chest_gold' })
    event.remove({ output: 'mm_storage:block_chest_diamond' })


    // ============================================================
    // REMOVE ORIGINAL MM STORAGE LARGE CHEST RECIPES
    // ============================================================

    event.remove({ output: 'mm_storage:str_large_chest_iron' })
    event.remove({ output: 'mm_storage:str_large_chest_gold' })
    event.remove({ output: 'mm_storage:str_large_chest_diamond' })


    // ============================================================
    // REMOVE MM STORAGE CRATE RECIPES
    // ============================================================

    event.remove({ output: 'mm_storage:item_crate_iron' })
    event.remove({ output: 'mm_storage:item_crate_gold' })
    event.remove({ output: 'mm_storage:item_crate_diamond' })


    // ============================================================
    // WOOD CHEST RECIPE
    // ============================================================

    event.shaped('mm_storage:block_chest_wood', [
        'AAA',
        'ABA',
        'AAA'
    ], {
        A: 'minecraft:oak_planks', 
        B: 'minecraft:chest'       
    })


    // ============================================================
    // IRON CHEST RECIPE
    // ============================================================

    event.shaped('mm_storage:block_chest_iron', [
        'AAA',
        'ABA',
        'AAA'
    ], {
        A: 'minecraft:iron_ingot',     
        B: 'mm_storage:block_chest_wood'
    })


    // ============================================================
    // GOLD CHEST RECIPE
    // ============================================================

    event.shaped('mm_storage:block_chest_gold', [
        'AAA',
        'ABA',
        'AAA'
    ], {
        A: 'minecraft:gold_ingot',      
        B: 'mm_storage:block_chest_iron'
    })


    // ============================================================
    // DIAMOND CHEST RECIPE
    // ============================================================

    event.shaped('mm_storage:block_chest_diamond', [
        'AAA',
        'ABA',
        'AAA'
    ], {
        A: 'minecraft:diamond',         
        B: 'mm_storage:block_chest_gold'
    })


    // ============================================================
    // LARGE IRON CHEST RECIPE
    // ============================================================

    event.shaped('mm_storage:str_large_chest_iron', [
        'ABA',
        'CDC',
        'ABA'
    ], {
        A: 'minecraft:iron_ingot',      
        B: 'mm_storage:block_chest_iron',
        C: 'minecraft:iron_block',      
        D: 'minecraft:chest'            
    })


    // ============================================================
    // LARGE GOLD CHEST RECIPE
    // ============================================================

    event.shaped('mm_storage:str_large_chest_gold', [
        'ABA',
        'CDC',
        'ABA'
    ], {
        A: 'minecraft:gold_ingot',      
        B: 'mm_storage:block_chest_gold',
        C: 'minecraft:gold_block',      
        D: 'minecraft:chest'            
    })


    // ============================================================
    // LARGE DIAMOND CHEST RECIPE
    // ============================================================

    event.shaped('mm_storage:str_large_chest_diamond', [
        'ABA',
        'CDC',
        'ABA'
    ], {
        A: 'minecraft:diamond',         
        B: 'mm_storage:block_chest_diamond',
        C: 'minecraft:diamond_block',   
        D: 'minecraft:chest'            
    })

})