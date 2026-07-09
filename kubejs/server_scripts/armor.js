// priority: 0

var SYSTEM_CONFIG = {
    debug: false,
    tiers: {
        LEATHER: { name: 'leather', hammer: 'minecraft:wooden_hoe' },
        IRON:    { name: 'iron',    hammer: 'minecraft:iron_pickaxe' },
        GOLD:    { name: 'gold',    hammer: 'minecraft:golden_pickaxe' },
        DIAMOND: { name: 'diamond', hammer: 'minecraft:diamond_pickaxe' }
    }
};

/**
 * Base Constructor for all equipment sets
 */
function EquipmentSet(mod, prefix, itemClass) {
    this.mod = mod;
    this.prefix = prefix;
    this.itemClass = itemClass; 
    this.ids = [];
    this.materialCosts = {}; 
    this.itemTier = SYSTEM_CONFIG.tiers.IRON;
}

EquipmentSet.prototype.modifyAttributes = function() {
    // Logic for procedurally generated JSON attributes
};

/**
 * ArmorSet Constructor
 */
function ArmorSet(mod, prefix, type) {
    EquipmentSet.call(this, mod, prefix, "armor");
    
    var suffixes = ["helmet", "chestplate", "leggings", "boots"];
    if (type === "chest")       { suffixes = ["head", "chest", "legs", "feet"]; } 
    else if (type === "tunic")  { suffixes = ["cowl", "tunic", "pants", "boots"]; } 
    else if (type === "coat")   { suffixes = ["hood", "coat", "trousers", "boots"]; } 
    else if (type === "robes")  { suffixes = ["mask", "robes", "trousers", "boots"]; } 
    else if (type === "attires") { suffixes = ["hat", "attires", "trousers", "boots"]; } 
    else if (type === "suit")   { suffixes = ["mask", "suit", "trousers", "boots"]; } 
    else if (type === "rags")   { suffixes = ["hood", "rags", "trousers", "boots"]; }

    var self = this;
    this.ids = suffixes.map(function(s) {
        return self.mod + ":" + self.prefix + "_" + s;
    });
}

ArmorSet.prototype = Object.create(EquipmentSet.prototype);
ArmorSet.prototype.constructor = ArmorSet;

// Crafting method implementation
ArmorSet.prototype.from_crafting = function(event, main, secondary, gem) {
    var maps = [
        ['MSM', 'M M'],
        ['M M', 'MGM', 'SMS'],
        ['MMM', 'S S', 'M M'],
        ['S S', 'M M']
    ];

    var baseCounts = [
        { M: 4, S: 1, G: 0 },
        { M: 5, S: 2, G: 1 },
        { M: 5, S: 2, G: 0 },
        { M: 4, S: 2, G: 0 }
    ];

    for (var i = 0; i < 4; i++) {
        var itemId = this.ids[i];
        event.remove({ output: itemId });

        var key = { M: main, S: main };
        if (i === 1) { key.G = main; }

        if (secondary) { key.S = secondary; }
        if (gem && i === 1) { key.G = gem; }

        event.shaped(itemId, maps[i], key);

        this.materialCosts[itemId] = {
            mainItem: main,
            secondaryItem: secondary || null,
            tertiaryItem: null,
            gemItem: gem || null,
            mainCount: baseCounts[i].M + (!secondary ? baseCounts[i].S : 0) + (!gem && i === 1 ? baseCounts[i].G : 0),
            secondaryCount: secondary ? baseCounts[i].S : 0,
            tertiaryCount: 0,
            gemCount: (gem && i === 1) ? baseCounts[i].G : 0
        };
    }
    return this;
};

// Foundry method implementation
ArmorSet.prototype.from_foundry = function(event, main, secondary, tertiary, gem) {
    var maps = [
        [' HGH ', 'GMMMG', 'HM MH', 'MT TM', 'T   T'],
        ['HH HH', 'GMMMG', 'HTGTH', ' GMG ', ' MMM '],
        [' GGG ', 'HMTMH', 'MT TM', 'MG GM', 'H   H'],
        [' H H ', ' M M ', ' T T ', 'GM MG', 'HG GH']
    ];

    var self = this;
    maps.forEach(function(pattern, i) {
        var itemId = self.ids[i];
        event.remove({ output: itemId });

        event.custom({
            type: "monsterexpansion:foundry",
            pattern: pattern,
            key: {
                G: { item: gem },
                H: { item: secondary },
                T: { item: tertiary },
                M: { item: main }
            },
            result: { item: itemId, count: 1 }
        });

        var fullStr = pattern.join('');
        self.materialCosts[itemId] = {
            mainItem: main,
            secondaryItem: secondary,
            tertiaryItem: tertiary,
            gemItem: gem,
            mainCount: (fullStr.match(/M/g) || []).length,
            secondaryCount: (fullStr.match(/H/g) || []).length,
            tertiaryCount: (fullStr.match(/T/g) || []).length,
            gemCount: (fullStr.match(/G/g) || []).length
        };
    });
    return this;
};

/**
 * Dynamic Scrapping Recipe Generator with Scaled NBT Percent Formulas
 */
ArmorSet.prototype.registerScrapRecipes = function(event) {
    var self = this;
    var hammerItem = self.itemTier.hammer;

    this.ids.forEach(function(itemId) {
        var costs = self.materialCosts[itemId];
        if (!costs) return;

        var totalMaterials = (costs.mainCount || 0) + (costs.secondaryCount || 0) + (costs.tertiaryCount || 0) + (costs.gemCount || 0);
        if (totalMaterials === 0) return;

        // Formula Step 1: Base total denominator calculation (+1 modifier)
        var formulaDivisor = totalMaterials + 1;

        // Formula Step 2: Durability chunk removal percentage
        var reductionRate = 1.0 / formulaDivisor;
        var maxDurability = Item.of(itemId).getItem().getMaxDamage();
        var durDmg = Math.round(maxDurability * reductionRate);

        // Pre-calculate clean truncated percentage strings
        var mainPercentStr = Math.round((costs.mainCount / formulaDivisor) * 100) + "%";
        var secPercentStr = Math.round((costs.secondaryCount / formulaDivisor) * 100) + "%";
        var tertPercentStr = Math.round((costs.tertiaryCount / formulaDivisor) * 100) + "%";
        var gemPercentStr = Math.round((costs.gemCount / formulaDivisor) * 100) + "%";
        var durPercentStr = Math.round(reductionRate * 100) + "%";

        // --- 1. Pre-build the complete NBT object for the recipe output ---
        var baseNBT = {
            TargetArmor: itemId,
            Rewards: {
                main:      costs.mainCount ?      { id: costs.mainItem } : null,
                secondary: costs.secondaryCount ? { id: costs.secondaryItem } : null,
                tertiary:  costs.tertiaryCount ?  { id: costs.tertiaryItem } : null,
                gem:       costs.gemCount ?       { id: costs.gemItem } : null
            },
            display: {
                Name: '{"text":"Equipment Scrap","color":"gold","italic":false}',
                Lore: []
            }
        };

        // Populate descriptions with updated formula percentages
        baseNBT.display.Lore.push('{"text":"Extracting salvage will consume ' + durPercentStr + ' durability.","color":"yellow","italic":false}');
        baseNBT.display.Lore.push('{"text":"--- Expected Yields ---","color":"gray","italic":false}');

        if (costs.mainCount) {
            baseNBT.display.Lore.push('{"text":"• Main Material: ","color":"white","italic":false,"extra":[{"text":"' + mainPercentStr + '","color":"green"}]}');
        }
        if (costs.secondaryCount) {
            baseNBT.display.Lore.push('{"text":"• Secondary Material: ","color":"gray","italic":false,"extra":[{"text":"' + secPercentStr + '","color":"dark_green"}]}');
        }
        if (costs.tertiaryCount) {
            baseNBT.display.Lore.push('{"text":"• Tertiary Material: ","color":"dark_gray","italic":false,"extra":[{"text":"' + tertPercentStr + '","color":"gold"}]}');
        }
        if (costs.gemCount) {
            baseNBT.display.Lore.push('{"text":"• Embedded Gems: ","color":"aqua","italic":false,"extra":[{"text":"' + gemPercentStr + '","color":"light_purple"}]}');
        }

        // --- 2. Register the shapeless recipe with explicit NBT output ---
        event.shapeless(Item.of('kubejs:custom_scrap_box').withNBT(baseNBT), [itemId, hammerItem])
        .damageIngredient(hammerItem, 1) 
        .damageIngredient(itemId, durDmg) 
        .modifyResult(function(gridInv, resultStack) {
            var armorStack = null;
            for (var i = 0; i < 9; i++) {
                var slotItem = gridInv.get(i);
                if (slotItem && slotItem.id === itemId) {
                    armorStack = slotItem;
                    break;
                }
            }

            if (!armorStack) return resultStack;

            var currentDamage = armorStack.getDamageValue();
            var remainingDurability = maxDurability - currentDamage;
            var actualDamageToApply = Math.min(durDmg, remainingDurability);
            
            var nbt = resultStack.getOrCreateTag();
            nbt.putInt('DmgToApply', actualDamageToApply);

            return resultStack;
        });
    });
};

/**
 * Global Registration Map
 */
var armor_sets = {
    leather: new ArmorSet("minecraft", "leather", "chestplate"),
    iron: new ArmorSet("minecraft", "iron", "chestplate"),
    gold: new ArmorSet("minecraft", "golden", "chestplate"),
    diamond: new ArmorSet("minecraft", "diamond", "chestplate")
};

ServerEvents.recipes(function(event) {
    armor_sets.leather.itemTier = SYSTEM_CONFIG.tiers.LEATHER;
    armor_sets.iron.itemTier = SYSTEM_CONFIG.tiers.IRON;
    armor_sets.gold.itemTier = SYSTEM_CONFIG.tiers.GOLD;
    armor_sets.diamond.itemTier = SYSTEM_CONFIG.tiers.DIAMOND;

    armor_sets.leather.from_crafting(event, "minecraft:leather");
    armor_sets.iron.from_crafting(event, "minecraft:iron_ingot", "minecraft:coal");

    Object.keys(armor_sets).forEach(function(setName) {
        var armor = armor_sets[setName];
        if (armor.materialCosts && Object.keys(armor.materialCosts).length > 0) {
            armor.registerScrapRecipes(event);
        }
    });
});

/**
 * Handle Unpacking Event on Server
 */
PlayerEvents.inventoryChanged(function(event) {
    var player = event.player;
    if (!player || player.level.isClientSide()) return;

    var item = event.item;
    if (item.id === 'kubejs:custom_scrap_box' && item.nbt && item.nbt.Rewards) {
        var rewards = item.nbt.Rewards;
        
        if (rewards.main)      { player.give(Item.of(rewards.main.id)); }
        if (rewards.secondary) { player.give(Item.of(rewards.secondary.id)); }
        if (rewards.tertiary)  { player.give(Item.of(rewards.tertiary.id)); }
        if (rewards.gem)       { player.give(Item.of(rewards.gem.id)); }

        item.setCount(0);
        player.playSound('minecraft:block.anvil.use', 0.6, 1.2);
    }
});