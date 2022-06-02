import * as axios from 'axios';
import * as path from 'path';
import lodash from 'lodash'

async function main() {
    const stashId = 'bcda1ae695'
    const league = 'Sentinel'
    const poeApiBasePath = 'https://api.pathofexile.com'

    try {
        const headers = {
            headers: {
                'cookie': 'cf_clearance=hFWsWMXnJ.KTjLVIf.O1k715deGxdHlH4fgv.g6mZ2A-1643997436-0-150; POESESSID=09510c259c6bf5cc21d68dfe97f1ba87',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.61 Safari/537.36'
            }
        }
        const stashItems = await axios.default.get(`${poeApiBasePath}/stash/${league}/${stashId}`, headers)

        const items = stashItems.data.stash.items

        const quantity = new Map();
        // const allEnchants = items.map(i => i.enchantMods.join()).join('\n')
        // console.log(allEnchants);
        for(const item of items ) {
            if(item.enchantMods.lenth === 0) {
                console.log(item)
            }
            const key = item.enchantMods.join().replaceAll(',','__')
            if(quantity.has(key)) {
                quantity.set(key, quantity.get(key) +1);
            } else {
                quantity.set(key, 1);
            }
        }

        const sortedByKey = lodash.orderBy(Array.from(quantity.entries()), ([key, quant]) => key)
        const sortedByQuant = lodash.orderBy(Array.from(quantity.entries()), ([key, quant]) => quant, 'desc')



        for(const [key, quant] of  sortedByKey) {
            console.log(`"${key}"`)
        }

        console.log('--------------------------------------')
        console.log('--------------------------------------')
        console.log()
 
        const map = new Map();
        namToPriceMapData.split('\n').forEach(line => {
            const split = line.split('	')
            map.set(split[0], {
                name: split[1],
                price: split[2],
            })
        })
        
        console.log('WTS Softcore Compasses 4 Uses | IGN: ToxicableSentinelAura')
        for(const [key, quant] of sortedByQuant) {
            const object = map.get(key);
            if(!object) {
                console.log('UNKNOWN MOD')
                console.log(key)
                return
            }
            console.log(`${quant}x ${object.name} ${object.price}c / each`)
        }

        console.log()
        console.log('--------------------------------------')
        console.log('--------------------------------------')

        console.log()
    } catch (e) {
        console.log(e.message)
        // console.log(e.response.status)
    }

}



main();

const namToPriceMapData = `Map Bosses drop an additional Conqueror Map__Map Bosses have 200% more Life__Map Bosses deal 100% more Damage__4 uses remaining	Conq Map	145		0
Map Bosses drop an additional Elder Guardian Map (Tier 14+)__Map Bosses have 200% more Life__Map Bosses deal 100% more Damage__4 uses remaining	Elder Guard	68		0
Strongbox Monsters are Enraged__Strongbox Monsters have 500% increased Item Quantity__Your Maps contain an additional Strongbox__4 uses remaining	Enraged Strongbox	50		0
Slaying Enemies close together in your Maps has a 6% chance to attract monsters from Beyond__Beyond Portals in your Maps have 25% chance to spawn an additional Beyond Demon__4 uses remaining	Beyond	45		0
Breaches in your Maps belong to Chayula__Breaches in your Maps contain 3 additional Clasped Hands__4 uses remaining	Chayula	35		0
100% chance to create a copy of Beasts Captured in your Maps__4 uses remaining	Copy beasts	35		0
Your Maps have +100% chance to contain The Sacred Grove__4 uses remaining	Harvest	35		0
Splinters and Emblems dropped by Legion Monsters in your Maps are duplicated__Legion Monsters in your Maps have 100% more Life__4 uses remaining	Splinters	35		0
placeholder	Harvest Blue	30		0
Your Maps contain a Mirror of Delirium__4 uses remaining	Delirium Mirror	25		0
Your Maps contain Alva__4 uses remaining	Alva	20		0
Your Maps contain Jun__4 uses remaining	Jun	20		0
Maps found in your Maps are Corrupted with 8 Modifiers__4 uses remaining	8 Modifiers	20		0
Unique Monsters drop Corrupted Items__4 uses remaining	Corrupted Items	20		0
The First 3 Possessed Monsters drop an additional Gilded Scarab__Your Maps contain an additional Tormented Betrayer__4 uses remaining	Gilded Scarab	20		0
Map Bosses are accompanied by a mysterious Harbinger__Map Bosses drop additional Currency Shards__Harbingers in your Maps drop additional Currency Shards__4 uses remaining	Harbinger	15		0
Plants Harvested in your Maps are more likely to give less common Crafting Options__Harvest Monsters in your Maps have 100% more Life__Harvests in your Maps contain at least one Crop of Purple Plants__4 uses remaining	Harvest Purple	15		0
Your Maps contain Ritual Altars__4 uses remaining	Ritual Altars	12		0
Your Maps contain an additional Legion Encounter__4 uses remaining	Legion	12		0
Your Maps contain 2 additional Strongboxes__Strongboxes in your Maps are Corrupted__Strongboxes in your Maps are at least Rare__4 uses remaining	Corrupted Strongboxes	10		0
Delirium Reward Bars fill 100% faster in your Maps__4 uses remaining	Delirium Bars Fill Faster	10		0
Players' Vaal Skills do not apply Soul Gain Prevention__Your Maps contains 6 additional packs of Corrupted Vaal Monsters__4 uses remaining	Soul gain prevention	9		0
Your Maps can contain Breaches__Your Maps contain an additional Breach__4 uses remaining	Breach	5		0
placeholder	Immortal Syndicate	5		0
Rerolling Favours at Ritual Altars in your Maps has no Cost the first 1 time__4 uses remaining	Reroll Ritual	5		0
Area contains a Smuggler's Cache__4 uses remaining	Smuggler's Cache	5		0
placeholder	Abyss	4		0
Your Maps contain a Blight Encounter__4 uses remaining	Blight	4		0
placeholder	Rogue exiles + jewels	3		0
Plants Harvested in your Maps are more likely to give less common Crafting Options__Harvest Monsters in your Maps have 100% more Life__Harvests in your Maps contain at least one Crop of Yellow Plants__4 uses remaining	Yellow Harvest	15		0`