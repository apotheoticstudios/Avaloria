// priority: 11

/**
 * Base Constructor for all equipment sets (Armor, Tools, Weapons)
 */
function EquipmentSet(mod, prefix, itemClass) {
    this.mod = mod;
    this.prefix = prefix;
    this.itemClass = itemClass; 
    this.ids = [];
    this.materialCosts = {}; 
    
    // Internal parameters for automated array-driven processing
    this.recipeTypeToRun = null; 
    this.recipeArgs = null;
    
    // System defaults
    this.itemTier = SYSTEM_CONFIG.tiers.IRON;
}

EquipmentSet.prototype.modifyAttributes = function() {
    // Skeleton: Logic for procedurally generated JSON attributes
};

/**
 * Fluid Chaining Methods for array map commands
 */
EquipmentSet.prototype.setTier = function(tier) {
    if (tier && SYSTEM_CONFIG.tiers[tier]) { 
        this.itemTier = SYSTEM_CONFIG.tiers[tier]; 
    }
    return this;
};

/**
 * Configures a standard Crafting Table recipe suite for the entire armor set.
 * Automatically removes old recipes and handles variable 3-item mapping counts.
 * * ### Full Set Cost Breakdown (All 4 Pieces: Helmet, Chest, Legs, Boots):
 * - **Main Material Only:** 24x Total Main Items
 * - **With Secondary Override:** 17x Main Items, 7x Secondary Items
 * - **With Embedded Gem (Chestplate Only):** Reduces Main by 1x, requires 1x Gem
 * * @param {string} main - The primary item ID/Tag used for the armor chassis (e.g., 'minecraft:iron_ingot').
 * @param {string} [secondary] - Optional item ID to substitute structural padding accent slots.
 * @param {string} [gem] - Optional unique item ID embedded exclusively into the centerpiece of the Chestplate.
 * @returns {EquipmentSet} This instance for fluent configuration array method chaining.
 */
EquipmentSet.prototype.withCrafting = function(main, secondary, gem) {
    this.recipeTypeToRun = "crafting";
    this.recipeArgs = { main: main, secondary: secondary || null, gem: gem || null };
    return this;
};

/**
 * Configures a high-tier Monsterexpansion Foundry recipe matrix for the entire armor set.
 * Completely parses a complex 5x5 custom array layout for all 4 slots.
 * * ### Full Set Cost Breakdown (All 4 Pieces Combined Matrix Key Counts):
 * - **Main Material (`M`):** 36x Total Items
 * - **Secondary Material (`H`):** 28x Total Items
 * - **Tertiary Material (`T`):** 16x Total Items
 * - **Gem Component (`G`):** 12x Total Items
 * * @param {string} main - The backbone core material ID mapped to key 'M'.
 * @param {string} secondary - The reinforcing layout element item ID mapped to key 'H'.
 * @param {string} tertiary - The balancing insulation binder item ID mapped to key 'T'.
 * @param {string} gem - The focal catalyst power stone item ID mapped to key 'G'.
 * @returns {EquipmentSet} This instance for fluent configuration array method chaining.
 */
EquipmentSet.prototype.withFoundry = function(main, secondary, tertiary, gem) {
    this.recipeTypeToRun = "foundry";
    this.recipeArgs = { main: main, secondary: secondary, tertiary: tertiary, gem: gem };
    return this;
};


/**
 * ArmorSet Constructor
 */
function ArmorSet(mod, prefix, type, sub) {
    EquipmentSet.call(this, mod, prefix, "armor");
    
    var suffixes = ["helmet", "chestplate", "leggings", "boots"];
    if (type === "chest")       { suffixes = ["head", "chest", "legs", "feet"]; } 
    else if (type === "tunic")  { suffixes = ["hat", "tunic", "pants", "boots"]; } 
    else if (type === "coat")   { suffixes = ["hood", "coat", "trousers", "boots"]; } 
    else if (type === "robes")  { suffixes = ["mask", "robes", "trousers", "boots"]; } 
    else if (type === "attires") { suffixes = ["hat", "attires", "trousers", "boots"]; } 
    else if (type === "suit")   { suffixes = ["mask", "suit", "trousers", "boots"]; } 
    else if (type === "rags")   { suffixes = ["hood", "rags", "trousers", "boots"]; }
    else if (type === "cover")   { suffixes = ["mask", "chestplate", "cover", "boots"]; }
    else if (type === "mask")   { suffixes = ["mask", "chestplate", "leggings", "boots"]; }

    var self = this;
    this.ids = suffixes.map(function(s) {
        return self.mod + ":" + self.prefix + "_" + s;
    });
    if (sub) {
        sub.forEach(index => {
            this.ids[index - 1] = "delete"
        })
    }
}

ArmorSet.prototype = Object.create(EquipmentSet.prototype);
ArmorSet.prototype.constructor = ArmorSet;

/**
 * Crafting Table Engine Registration & Cost Matrix Tracking
 */
ArmorSet.prototype.execute_crafting = function(event) {
    var args = this.recipeArgs;
    var maps = [['MSM', 'M M'], ['M M', 'MGM', 'SMS'], ['MMM', 'S S', 'M M'], ['S S', 'M M']];
    var baseCounts = [{ M: 4, S: 1, G: 0 }, { M: 5, S: 2, G: 1 }, { M: 5, S: 2, G: 0 }, { M: 4, S: 2, G: 0 }];

    for (var i = 0; i < 4; i++) {
        var itemId = this.ids[i];
        if (itemId == "delete") continue
        event.remove({ output: itemId });

        var key = { M: args.main, S: args.main };
        if (i === 1) { key.G = args.main; }

        if (args.secondary) { key.S = args.secondary; }
        if (args.gem && i === 1) { key.G = args.gem; }

        event.shaped(itemId, maps[i], key);

        this.materialCosts[itemId] = {
            mainItem: args.main, secondaryItem: args.secondary, tertiaryItem: null, gemItem: args.gem,
            mainCount: baseCounts[i].M + (!args.secondary ? baseCounts[i].S : 0) + (!args.gem && i === 1 ? baseCounts[i].G : 0),
            secondaryCount: args.secondary ? baseCounts[i].S : 0, tertiaryCount: 0, gemCount: (args.gem && i === 1) ? baseCounts[i].G : 0
        };
    }
};

/**
 * Foundry Engine Registration & Cost Matrix Tracking
 */
ArmorSet.prototype.execute_foundry = function(event) {
    var args = this.recipeArgs;
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
            key: { G: { item: args.gem }, H: { item: args.secondary }, T: { item: args.tertiary }, M: { item: args.main } },
            result: { item: itemId, count: 1 }
        }).id("avaloria:from_foundry_" + itemId.replace(":", "_"));

        var fullStr = pattern.join('');
        self.materialCosts[itemId] = {
            mainItem: args.main, secondaryItem: args.secondary, tertiaryItem: args.tertiary, gemItem: args.gem,
            mainCount: (fullStr.match(/M/g) || []).length,
            secondaryCount: (fullStr.match(/H/g) || []).length,
            tertiaryCount: (fullStr.match(/T/g) || []).length,
            gemCount: (fullStr.match(/G/g) || []).length
        };
    });
};

/**
 * Dynamic Scrapping Recipe Generator with Custom Math & Server Lore Strings
 */
ArmorSet.prototype.registerScrapRecipes = function(event) {
    var self = this;
    var hammerItem = self.itemTier.hammer;

    this.ids.forEach(function(itemId) {
        var costs = self.materialCosts[itemId];
        if (!costs) return;

        var totalMaterials = (costs.mainCount || 0) + (costs.secondaryCount || 0) + (costs.tertiaryCount || 0) + (costs.gemCount || 0);
        if (totalMaterials === 0) return;

        // Formula Implementation: Denominator = materials + 1
        var formulaDivisor = totalMaterials + 1;
        var reductionRate = 1.0 / totalMaterials;
        var maxDurability = Item.of(itemId).getItem().getMaxDamage();
        var durDmg = Math.round(maxDurability * reductionRate);

        // Pre-formatted Clean Truncated Percentages
        var mainPercentStr = Math.round((costs.mainCount / formulaDivisor) * 100) + "%";
        var secPercentStr = Math.round((costs.secondaryCount / formulaDivisor) * 100) + "%";
        var tertPercentStr = Math.round((costs.tertiaryCount / formulaDivisor) * 100) + "%";
        var gemPercentStr = Math.round((costs.gemCount / formulaDivisor) * 100) + "%";
        var durPercentStr = Math.round(reductionRate * 100) + "%";

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

        baseNBT.display.Lore.push('{"text":"Extracting salvage will consume ' + durPercentStr + ' durability.","color":"yellow","italic":false}');
        baseNBT.display.Lore.push('{"text":"--- Expected Yields ---","color":"gray","italic":false}');

        if (costs.mainCount) { baseNBT.display.Lore.push('{"text":"• Main Material: ","color":"white","italic":false,"extra":[{"text":"' + mainPercentStr + '","color":"green"}]}'); }
        if (costs.secondaryCount) { baseNBT.display.Lore.push('{"text":"• Secondary Material: ","color":"gray","italic":false,"extra":[{"text":"' + secPercentStr + '","color":"dark_green"}]}'); }
        if (costs.tertiaryCount) { baseNBT.display.Lore.push('{"text":"• Tertiary Material: ","color":"dark_gray","italic":false,"extra":[{"text":"' + tertPercentStr + '","color":"gold"}]}'); }
        if (costs.gemCount) { baseNBT.display.Lore.push('{"text":"• Embedded Gems: ","color":"aqua","italic":false,"extra":[{"text":"' + gemPercentStr + '","color":"light_purple"}]}'); }

        // Shapeless execution logic linking durability damage configurations
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
        })
        .id("avaloria:scrapping_"+itemId.replace(":", "_"));
    });
};


/**
 * -------------------------------------------------------------
 * ENGINE EVENT PROCESSING WRAPPERS
 * -------------------------------------------------------------
 */

/**
 * 2. Recipe Management Engine Loop
 */
ServerEvents.recipes(function(event) {
    Object.keys(armor_sets).forEach(function(setName) {
        var armor = armor_sets[setName];
        
        // Execute dynamic bindings straight out of configurations
        if (armor.recipeTypeToRun === "crafting") { 
            armor.execute_crafting(event); 
        } else if (armor.recipeTypeToRun === "foundry") { 
            armor.execute_foundry(event); 
        }

        // Handle structural scrapping system setups
        if (armor.materialCosts && Object.keys(armor.materialCosts).length > 0) {
            armor.registerScrapRecipes(event);
        }
    });
});

/**
 * 3. Inventory Unpack Listener Event
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