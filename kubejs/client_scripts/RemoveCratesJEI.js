// ============================================================
// HIDE ITEMS FROM JEI
// ============================================================

JEIEvents.hideItems(event => {

    const hiddenItems = [
        'mm_storage:item_crate_iron',
        'mm_storage:item_crate_gold',
        'mm_storage:item_crate_diamond'
    ]

    hiddenItems.forEach(item => event.hide(item))

})