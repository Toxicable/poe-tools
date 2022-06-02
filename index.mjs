import cheerio from 'cheerio';
import axios from 'axios';
import moment from 'moment';

const weightRegexp = new RegExp('( (1000|10|50|125|250|500))');

const exaltToChaos = 115;

async function main() {
    console.log('start')
    const result = [];

    const finalPrices = [];

    cheerio.load(data)('tr').each((index, el) => {
        let weight;
        cheerio
            .load(el)('td > div')
            .each((i, e) => {
                const text = cheerio.load(e).root().text();
                weight = weightRegexp.exec(text)[2];
            });

        let type = cheerio.load(el)('td').first().text();

        const modText = cheerio.load(el)('td').next().html().trim();
        const mods = modText
            .replace(/<span class="mod-value">\d+<\/span>/g, '#')
            .replace(/&apos;/g, '\'')
            .split('<br>')
            .filter((t) => t != '')
            .filter((t) => !['mod_grey', 'uses'].some((a) => t.includes(a))
            );

        result.push({ type, weight, mods });
    });
    // print mods
    // console.log(result.filter((i) => i.type === 'Awakened Sextant').filter(i => i.weight != 1000).length)

    const map = modMap.split('\n').map(l => {
        const lines = l.split(',');
        return {
            enchant: lines[0],
            option: lines[1],
            modText: [lines[2], lines[3], lines[4]]
        }
    });

    for (const item of result.filter((i) => i.type === 'Awakened Sextant').filter(i => i.weight != 1000).sort((a, b) => a.weight - b.weight)) {
        const enchant = map.find(mod => mod.modText.some(text => item.mods.includes(text)));


        if(!enchant) {
            throw new Error('unable to find enchant')
        }

        let filter; 
        if(enchant.option != '') {
            filter = { "id": enchant.enchant, "disabled": false, value: {option: enchant.option} }
        } else {
            filter = { "id": enchant.enchant }

        }
        const q2 = {
            "query": {
                "status": {
                    "option": "online"
                }, "type": "Charged Compass",
                "stats":
                [
                    {
                        "type": "and",
                        "disabled": false,
                        "filters":[
                            {
                                "id": "enchant.stat_290368246",
                                "disabled": false, "value": { "min": 4, "max": 4 }
                            }
                        ], 
                    }, 
                    {
                        "type": "and",
                        "disabled": false,
                        "filters": [
                            filter
                        ],
                        
                    }
                ]
            }, "sort": { "price": "asc" }
        }
        try {

            const headers = {
                headers: {
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.82 Safari/537.36'
                }
            }

            const postResult = await axios.default.post('https://www.pathofexile.com/api/trade/search/Archnemesis', q2, headers)
            const result1 = await axios.default.get(`https://www.pathofexile.com/api/trade/fetch/${postResult.data.result.slice(0, 10).join(',')}?query=${postResult.data.id}`, headers)
            const result2 = await axios.default.get(`https://www.pathofexile.com/api/trade/fetch/${postResult.data.result.slice(10, 20).join(',')}?query=${postResult.data.id}`, headers)
            const results = [...result1.data.result, ...result2.data.result];


            const filtered = results.filter(r =>  moment(r.listing.indexed) > moment().subtract(1, 'day')).filter(r => r.listing.price.currency === 'chaos' || r.listing.price.currency === 'exalted');
            const prices = filtered.map(r => r.listing.price.currency === 'exalted' ? exaltToChaos * r.listing.price.amount : r.listing.price.amount);
            const averagePrice = Math.round(prices.reduce((last, next) => last + next, 0) / prices.length)
            
            console.log(item.mods.join('\n'))
            console.log(`Total Avilable: ${postResult.data.total}`)
            console.log(`Filtered to ${filtered.length}/20`);
            console.log(`Average price for items 10-30: ${averagePrice}c`)
            console.log()

            finalPrices.push({avilable: postResult.data.total, averagePrice: averagePrice, modText: item.mods.join(' '), weight: item.weight});
            
            await new Promise((resolve, reject) => setTimeout(() => resolve(null), 12 * 1000))
        } catch (e) {
            console.log(e.response?.statusText)
            console.log(e.response?.data)
            console.log(e)
            // console.log(e.response.data)
            // console.log(e.request)
        }
    }
    console.log()
    console.log()

    console.log(finalPrices.map(item => `${item.modText},${item.averagePrice},${item.avilable},${item.weight}`).join('\n'))

}

// --
// --
// --
// --
// --
// --
// --
// --
// --
// --
// --
// --
// --
// --
// --
// --
// --
// --
// --
// --
// --
// --
// --
// --
// --
// --
// --
// --
// --
// --
// --
// --

const modMap = `enchant.stat_2862290356,,Areas are Alluring
enchant.stat_2398157267,,Areas contain a mirror of Delirium
enchant.stat_1145451936,,Areas contain The Sacred Grove
enchant.stat_1671749203,,Areas contain Ritual Altars
enchant.stat_3798342608,,Areas contain # additional Clusters of Mysterious Barrels
enchant.stat_1223360315,,Maps found in Areas are Corrupted with 8 Modifiers
enchant.stat_124877078,,Unique Bosses deal #% increased Damage,Maps have #% Quality,,
enchant.stat_1959158336,,Unique Bosses have #% increased Life,Quality bonus of Maps also appliesto Rarity of Items found,,
enchant.stat_2747603858,,Unique Bosses of Corrupted Maps drop # additional Vaal Items,Found Itemshave #% chance to drop Corrupted in Areas,,
enchant.stat_279246355,,Areas are inhabited by an additional Invasion Boss
enchant.stat_181106230,,Unique Bosses deal #% more Damage,Unique Bosses have #% more Life,Unique Bosses drop an additional Shaper Guardian Map (Tier14+),
enchant.stat_891263063,,Unique Bosses deal #% more Damage,Unique Bosses have #% more Life,Unique Bosses drop an additional Elder Guardian Map (Tier14+),
enchant.stat_3457098703,,Unique Bosses deal #% more Damage,Unique Bosses have #% more Life,Unique Bosses drop an additional Conqueror Map,
enchant.stat_3760667977,,Unique Bosses drop # additional Unique Item
enchant.stat_1714706956,,#% increased Magic Pack Size
enchant.stat_1080855680,,Rogue Exiles deal #% increased Damage,Rogue Exiles drop # additional Jewels,Rogue Exiles in Areas have #% increased Maximum Life,Areas are inhabited by # additional Rogue Exiles
enchant.stat_3416709884,,Players gain an additional Vaal Soul on Kill,Area contains # additional packs of Corrupted Vaal Monsters,,
enchant.stat_2681419531,,Areas contain # additional Strongboxes,Strongboxes in Areas are Corrupted,Strongboxes in Areas are at least Rare,
enchant.stat_1542416476,2,Breaches in Areas belong to Xoph,Breaches in Areas contain # additional Clasped Hands,,
enchant.stat_1542416476,3,Breaches in Areas belong to Tul,Breaches in Areas contain # additional Clasped Hands,,
enchant.stat_1542416476,4,Breaches in Areas belong to Esh,Breaches in Areas contain # additional Clasped Hands,,
enchant.stat_1542416476,1,Breaches in Areas belong to Uul-Netol,Breaches in Areas contain #additional Clasped Hands,,
enchant.stat_1542416476,5,Breaches in Areas belong to Chayula,Breaches in Areas contain # additional Clasped Hands,,
enchant.stat_2836003955,,#% chance to create a copy of Beasts Captured in Areas
enchant.stat_1640965354,,Areas contain #% increased number of Runic Monster Markers
enchant.stat_1829593182,,Legion Monsters in Areas have #% more Life,Splinters and Emblems droppedby Legion Monsters in Areas are duplicated,,
enchant.stat_3011365432,,Catalysts dropped by Metamorphs in Areas are duplicated,Metamorphs in Areas have #% more Life,,
enchant.stat_3259960466,,Oils found in Areas have #% chance to be 1 tier higher,Cost of Buildingand Upgrading Blight Towers in Areas is doubled,,
enchant.stat_1682417271,,Gain #% increased Immortal Syndicate Intelligence in Areas
enchant.stat_4139181362,,Delirium Reward Bars fill #% faster in Areas
enchant.stat_832377952,3,Plants Harvested in Areas are more likely to give less common Crafting Options,Harvest Monsters in Areashave #% more Life,Harvests in Areas contain at least one Crop of Blue Plants,
enchant.stat_832377952,1,Plants Harvested in Areas are more likely to give less common Crafting Options,Harvest Monsters in Areas have #% more Life,Harvests in Areas contain at least one Crop of Purple Plants,
enchant.stat_832377952,2,Plants Harvested in Areas are more likely to give less common Crafting Options,Harvest Monsters in Areashave #% more Life,Harvests in Areas contain at least one Crop of Yellow Plants,
enchant.stat_2256808958,,Non-Unique Heist Contracts found in Areas have an additional Implicit Modifier
enchant.stat_2425554673,,Ritual Altars in Areas allow rerolling Favours an additional time at no Cost
enchant.stat_1439991839,,Monsters Imprisoned by Essences have a #% chance to contain a Remnant of Corruption,Areas contain an additional Essence,,
enchant.stat_3187151138,2,Areas contain Einhar
enchant.stat_3187151138,3,Areas contain Alva
enchant.stat_3187151138,5,Areas contain Niko
enchant.stat_3187151138,6,Areas contain Jun
enchant.stat_75100665,,Found Items drop Identified in Identified Maps,#% increased Pack Size in Unidentified Maps,,
enchant.stat_1669553893,,Areas contain # additional Clusters of Mysterious Barrels
enchant.stat_3789079511,,The First 3 Possessed Monsters drop an additional Rusted Scarab,Areas contain an additional Tormented Betrayer,,
enchant.stat_1317250154,,The First 3 Possessed Monsters drop an additional Polished Scarab,Areas contain an additional Tormented Betrayer,,
enchant.stat_1480568810,,The First 3 Possessed Monsters drop an additional Gilded Scarab,Areas contain an additional Tormented Betrayer,,
enchant.stat_3340686967,,The First 3 Possessed Monsters drop an additional Map,Areas contain an additional Tormented Heretic,,
enchant.stat_2392278281,,The First 3 Possessed Monsters drop an additional Unique Item,Areas contain an additional Tormented Graverobber,,
enchant.stat_3123392503,,Strongbox Monsters are Enraged,Strongbox Monsters have #% increased Item Quantity,Areas contain an additional Strongbox,
enchant.stat_3481854423,,Unique Bosses are accompanied by Bodyguards,An additional Map drops on Completing Areas,,
enchant.stat_397012377,,Unique Bosses are accompanied by a mysterious Harbinger,Unique Bosses drop additional Currency Shards,Harbingers drop additional Currency Shards,
enchant.stat_3747734818,,Areas contain hunted traitors
enchant.stat_3045497140,,Area contains # additional packs of Corrupted Vaal Monsters,Items dropped by Corrupted Vaal Monsters in Areas have #% chance to be Corrupted,,
enchant.stat_2649372092,,Area contains # additional packs of Corrupted Vaal Monsters,Area has #% chance to contain Gifts of the Red Queen per Mortal Fragment used,Area has #% chance to contain Gifts of the Sacrificed per Sacrifice Fragment used,
enchant.stat_977063976,,Players' Vaal Skills do not apply Soul Gain Prevention,Area contains #additional packs of Corrupted Vaal Monsters,,
enchant.stat_3897451709,,Areas contain an additional Legion Encounter
enchant.stat_1994562755,,Area contains Metamorph Monsters
enchant.stat_3960907415,,Area contains a Smuggler's Cache
enchant.stat_2459443694,,Areas contain a Blight Encounter
enchant.stat_3224819794,,Areas can contain Breaches,Areas contain an additional Breach,,
enchant.stat_1070816711,,Areas contain an additional Abyss,Areas can contain Abysses,,
enchant.stat_4008016019,,Slaying Enemies close together in Areas has a #% chance to attract monsters from Beyond,Beyond Portals in Areas have #% chance to spawn an additional Beyond Demon,,
enchant.stat_804187877,,Unique Monsters drop Corrupted Items`


const data = `<tbody aria-live="polite" aria-relevant="all">
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Areas are Alluring<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>default 10</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Areas contain <span class="mod-value">25</span> additional Clusters of Mysterious Barrels<br><span class="mod-value">3</span> uses remaining<br><span class="mod_grey">map bonus barrel % [10]</span></td>
    <td><div>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Areas contain <span class="mod-value">35</span> additional Clusters of Mysterious Barrels<br><span class="mod-value">15</span> uses remaining<br><span class="mod_grey">map bonus barrel % [10]</span></td>
    <td><div>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Maps found in Areas are Corrupted with 8 Modifiers<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Maps found in Areas are Corrupted with 8 Modifiers<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>The First 3 Possessed Monsters drop an additional Winged Scarab<br>Areas contain an additional Tormented Betrayer<br><span class="mod-value">15</span> uses remaining<br><span class="mod_grey">map extra content    weighting [1]</span></td>
    <td><div>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Found Items drop Identified in Identified Maps<br><span class="mod-value">20</span>% increased Pack Size in Unidentified Maps<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Found Items drop Identified in Identified Maps<br><span class="mod-value">25</span>% increased Pack Size in Unidentified Maps<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Areas contain <span class="mod-value">25</span> additional Clusters of Mysterious Barrels<br><span class="mod-value">3</span> uses remaining<br><span class="mod_grey">map bonus barrel % [10]</span></td>
    <td><div>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Areas contain <span class="mod-value">35</span> additional Clusters of Mysterious Barrels<br><span class="mod-value">15</span> uses remaining<br><span class="mod_grey">map bonus barrel % [10]</span></td>
    <td><div>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>The First 3 Possessed Monsters drop an additional Rusted Scarab<br>Areas contain an additional Tormented Betrayer<br><span class="mod-value">3</span> uses remaining<br><span class="mod_grey">map extra content    weighting [1]</span></td>
    <td><div>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>The First 3 Possessed Monsters drop an additional Polished Scarab<br>Areas contain an additional Tormented Betrayer<br><span class="mod-value">3</span> uses remaining<br><span class="mod_grey">map extra content    weighting [1]</span></td>
    <td><div>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>The First 3 Possessed Monsters drop an additional Gilded Scarab<br>Areas contain an additional Tormented Betrayer<br><span class="mod-value">3</span> uses remaining<br><span class="mod_grey">map extra content    weighting [1]</span></td>
    <td><div>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>The First 3 Possessed Monsters drop an additional Map<br>Areas contain an additional Tormented Heretic<br><span class="mod-value">3</span> uses remaining<br><span class="mod_grey">map extra content    weighting [1]</span></td>
    <td><div>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>The First 3 Possessed Monsters drop an additional Map<br>Areas contain an additional Tormented Heretic<br><span class="mod-value">15</span> uses remaining<br><span class="mod_grey">map extra content    weighting [1]</span></td>
    <td><div>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>The First 3 Possessed Monsters drop an additional Unique Item<br>Areas contain an additional Tormented Graverobber<br><span class="mod-value">3</span> uses remaining<br><span class="mod_grey">map extra content    weighting [1]</span></td>
    <td><div>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Unique Bosses deal <span class="mod-value">20</span>% increased Damage<br>Maps have <span class="mod-value">20</span>% Quality<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>default 500</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Unique Bosses have <span class="mod-value">20</span>% increased Life<br>Quality bonus of Maps also appliesto Rarity of Items found<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>default 500</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Unique Bosses of Corrupted Maps drop <span class="mod-value">2</span> additional Vaal Items<br>Found Itemshave <span class="mod-value">5</span>% chance to drop Corrupted in Areas<br><span class="mod-value">3</span>uses remaining</td>
    <td><div>default 500</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Unique Bosses of Corrupted Maps drop <span class="mod-value">3</span> additional Vaal Items<br>Found Itemshave <span class="mod-value">5</span>% chance to drop Corrupted in Areas<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>default 500</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Players and their Minions cannot take Reflected Damage<br>Areas contain <span class="mod-value">4</span>additional Packs with Mirrored Rare Monsters<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>default 1000</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Players and their Minions cannot take Reflected Damage<br>Areas contain <span class="mod-value">5</span>additional Packs with Mirrored Rare Monsters<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>default 1000</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Player's Life and Mana Recovery from Flasks are instant<br>Areas contain <span class="mod-value">6</span>additional packs of Monsters that Heal<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>default 1000</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Player's Life and Mana Recovery from Flasks are instant<br>Areas contain <span class="mod-value">8</span>additional packs of Monsters that Heal<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>default 1000</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Areas are inhabited by an additional Invasion Boss<br><span class="mod-value">3</span> usesremaining<br><span class="mod_grey">map extra content weighting [1]</span></td>
    <td><div>hall_of_grandmasters 0<br>default 500</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Strongbox Monsters are Enraged<br>Strongbox Monsters have <span class="mod-value">500</span>% increased Item Quantity<br>Areas contain an additional Strongbox<br><span class="mod-value">3</span> usesremaining<br><span class="mod_grey">map extra content weighting [0]</span><br><span class="mod_grey">map    strongbox monsters movement velocity +% [25]</span></td>
    <td><div>hall_of_grandmasters 0<br>no_strongboxes 0<br>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Strongbox Monsters are Enraged<br>Strongbox Monsters have <span class="mod-value">600</span>% increased Item Quantity<br>Areas contain an additional Strongbox<br><span class="mod-value">15</span> usesremaining<br><span class="mod_grey">map extra content weighting [0]</span><br><span class="mod_grey">map    strongbox monsters movement velocity +% [30]</span></td>
    <td><div>hall_of_grandmasters 0<br>no_strongboxes 0<br>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Unique Bosses deal <span class="mod-value">100</span>% more Damage<br>Unique Bosses have <span class="mod-value">200</span>% more Life<br>Unique Bosses drop an additional Shaper Guardian Map (Tier14+)<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>no_boss 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Unique Bosses deal <span class="mod-value">100</span>% more Damage<br>Unique Bosses have <span class="mod-value">200</span>% more Life<br>Unique Bosses drop an additional Shaper Guardian Map (Tier14+)<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>no_boss 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Unique Bosses deal <span class="mod-value">100</span>% more Damage<br>Unique Bosses have <span class="mod-value">200</span>% more Life<br>Unique Bosses drop an additional Elder Guardian Map (Tier14+)<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>no_boss 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Unique Bosses deal <span class="mod-value">100</span>% more Damage<br>Unique Bosses have <span class="mod-value">200</span>% more Life<br>Unique Bosses drop an additional Elder Guardian Map (Tier14+)<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>no_boss 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Unique Bosses deal <span class="mod-value">100</span>% more Damage<br>Unique Bosses have <span class="mod-value">200</span>% more Life<br>Unique Bosses drop an additional Conqueror Map<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>no_boss 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Unique Bosses deal <span class="mod-value">100</span>% more Damage<br>Unique Bosses have <span class="mod-value">200</span>% more Life<br>Unique Bosses drop an additional Conqueror Map<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>no_boss 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Unique Bosses are accompanied by Bodyguards<br>An additional Map drops on Completing Areas<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>no_boss 0<br>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Unique Bosses are accompanied by Bodyguards<br><span class="mod-value">2</span> additional Maps drop onCompleting Areas<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>no_boss 0<br>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Unique Bosses are accompanied by a mysterious Harbinger<br>Unique Bosses drop additional Currency Shards<br>Harbingers drop additional Currency Shards<br><span class="mod-value">3</span> usesremaining<br><span class="mod_grey">map extra content weighting [1]</span></td>
    <td><div>no_boss 0<br>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Unique Bosses are accompanied by a mysterious Harbinger<br>Unique Bosses drop additional Currency Shards<br>Harbingers drop additional Currency Shards<br><span class="mod-value">15</span> usesremaining<br><span class="mod_grey">map extra content weighting [1]</span></td>
    <td><div>no_boss 0<br>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Unique Bosses drop <span class="mod-value">1</span> additional Unique Item<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>no_boss 0<br>default 500</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Areas contain hunted traitors<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>no_monster_packs 0<br>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Areas contain hunted traitors<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>no_monster_packs 0<br>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Area contains <span class="mod-value">6</span> additional packs of Corrupted Vaal Monsters<br>Items dropped by Corrupted Vaal Monsters in Areas have <span class="mod-value">25</span>% chance to be Corrupted<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>no_monster_packs 0<br>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Area contains <span class="mod-value">8</span> additional packs of Corrupted Vaal Monsters<br>Items dropped by Corrupted Vaal Monsters in Areas have <span class="mod-value">30</span>% chance to be Corrupted<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>no_monster_packs 0<br>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Area contains <span class="mod-value">6</span> additional packs of Corrupted Vaal Monsters<br>Area has <span class="mod-value">50</span>% chance to contain Gifts of the Red Queen per Mortal Fragment used<br>Area has <span class="mod-value">50</span>% chance to contain Gifts of the Sacrificed per Sacrifice Fragment used<br><span class="mod-value">3</span> uses remaining<br><span class="mod_grey">map extra content    weighting [1]</span></td>
    <td><div>no_monster_packs 0<br>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Area contains <span class="mod-value">8</span> additional packs of Corrupted Vaal Monsters<br>Area has <span class="mod-value">50</span>% chance to contain Gifts of the Red Queen per Mortal Fragment used<br>Area has <span class="mod-value">50</span>% chance to contain Gifts of the Sacrificed per Sacrifice Fragment used<br><span class="mod-value">15</span> uses remaining<br><span class="mod_grey">map extra content    weighting [1]</span></td>
    <td><div>no_monster_packs 0<br>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Players' Vaal Skills do not apply Soul Gain Prevention<br>Area contains <span class="mod-value">6</span>additional packs of Corrupted Vaal Monsters<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>no_monster_packs 0<br>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Players' Vaal Skills do not apply Soul Gain Prevention<br>Area contains <span class="mod-value">8</span>additional packs of Corrupted Vaal Monsters<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>no_monster_packs 0<br>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td><span class="mod-value">25</span>% increased Magic Pack Size<br><span class="mod-value">3</span> usesremaining</td>
    <td><div>no_monster_packs 0<br>default 500</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td><span class="mod-value">30</span>% increased Magic Pack Size<br><span class="mod-value">15</span> usesremaining</td>
    <td><div>no_monster_packs 0<br>default 500</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Rogue Exiles deal <span class="mod-value">20</span>% increased Damage<br>Rogue Exiles drop <span class="mod-value">2</span> additional Jewels<br>Rogue Exiles in Areas have <span class="mod-value">20</span>% increased Maximum Life<br>Areas are inhabited by <span class="mod-value">2</span> additional Rogue Exiles<br><span class="mod-value">3</span> usesremaining<br><span class="mod_grey">map extra content weighting [0]</span></td>
    <td><div>no_monster_packs 0<br>default 500</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Players gain an additional Vaal Soul on Kill<br>Area contains <span class="mod-value">6</span> additional packs of Corrupted Vaal Monsters<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>no_monster_packs 0<br>default 500</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Players gain an additional Vaal Soul on Kill<br>Area contains <span class="mod-value">8</span> additional packs of Corrupted Vaal Monsters<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>no_monster_packs 0<br>default 500</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Players and Monsters take <span class="mod-value">12</span>% increased Fire Damage<br>Areas contain <span class="mod-value">6</span> additional packs of Monsters that deal Fire Damage<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>no_monster_packs 0<br>default 1000</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Players and Monsters take <span class="mod-value">14</span>% increased Fire Damage<br>Areas contain <span class="mod-value">8</span> additional packs of Monsters that deal Fire Damage<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>no_monster_packs 0<br>default 1000</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Players and Monsters take <span class="mod-value">12</span>% increased Cold Damage<br>Areas contain <span class="mod-value">6</span> additional packs of Monsters that deal Cold Damage<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>no_monster_packs 0<br>default 1000</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Players and Monsters take <span class="mod-value">14</span>% increased Cold Damage<br>Areas contain <span class="mod-value">8</span> additional packs of Monsters that deal Cold Damage<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>no_monster_packs 0<br>default 1000</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Players and Monsters take <span class="mod-value">12</span>% increased Lightning Damage<br>Areas contain<span class="mod-value">6</span> additional packs of Monsters that deal Lightning Damage<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>no_monster_packs 0<br>default 1000</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Players and Monsters take <span class="mod-value">14</span>% increased Lightning Damage<br>Areas contain<span class="mod-value">8</span> additional packs of Monsters that deal Lightning Damage<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>no_monster_packs 0<br>default 1000</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Players and Monsters take <span class="mod-value">12</span>% increased Physical Damage<br>Areas contain<span class="mod-value">6</span> additional packs of Monsters that deal Physical Damage<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>no_monster_packs 0<br>default 1000</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Players and Monsters take <span class="mod-value">14</span>% increased Physical Damage<br>Areas contain<span class="mod-value">8</span> additional packs of Monsters that deal Physical Damage<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>no_monster_packs 0<br>default 1000</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Players and Monsters take <span class="mod-value">12</span>% increased Chaos Damage<br>Areas contain <span class="mod-value">6</span> additional packs of Monsters that deal Chaos Damage<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>no_monster_packs 0<br>default 1000</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Players and Monsters take <span class="mod-value">14</span>% increased Chaos Damage<br>Areas contain <span class="mod-value">8</span> additional packs of Monsters that deal Chaos Damage<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>no_monster_packs 0<br>default 1000</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Areas contain <span class="mod-value">6</span> additional packs of Monsters that Convert when Killed<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>no_monster_packs 0<br>default 1000</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Areas contain <span class="mod-value">8</span> additional packs of Monsters that Convert when Killed<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>no_monster_packs 0<br>default 1000</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Areas contain a mirror of Delirium<br><span class="mod-value">3</span> uses remaining<br><span class="mod_grey">map affliction league [1]</span></td>
    <td><div>no_monster_packs 0<br>unique_map 0<br>default 100</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Areas contain a mirror of Delirium<br><span class="mod-value">15</span> uses remaining<br><span class="mod_grey">map affliction league [1]</span></td>
    <td><div>no_monster_packs 0<br>unique_map 0<br>default 100</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Areas contain The Sacred Grove<br><span class="mod-value">3</span> uses remaining<br><span class="mod_grey">map extra content weighting [1]</span><br><span class="mod_grey">map harvest league    [1]</span></td>
    <td><div>no_monster_packs 0<br>unique_map 0<br>default 100</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Areas contain The Sacred Grove<br><span class="mod-value">15</span> uses remaining<br><span class="mod_grey">map extra content weighting [1]</span><br><span class="mod_grey">map harvest league    [1]</span></td>
    <td><div>no_monster_packs 0<br>unique_map 0<br>default 100</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Areas contain Ritual Altars<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>no_monster_packs 0<br>unique_map 0<br>default 100</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Areas contain Ritual Altars<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>no_monster_packs 0<br>unique_map 0<br>default 100</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Areas contain an additional Legion Encounter<br><span class="mod-value">3</span> uses remaining<br><span class="mod_grey">map extra content weighting [1]</span><br><span class="mod_grey">map legion league    [1]</span></td>
    <td><div>no_monster_packs 0<br>unique_map 0<br>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Areas contain an additional Legion Encounter<br><span class="mod-value">15</span> uses remaining<br><span class="mod_grey">map extra content weighting [1]</span><br><span class="mod_grey">map legion league    [1]</span></td>
    <td><div>no_monster_packs 0<br>unique_map 0<br>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Area contains Metamorph Monsters<br><span class="mod-value">3</span> uses remaining<br><span class="mod_grey">map extra content weighting [1]</span></td>
    <td><div>no_monster_packs 0<br>unique_map 0<br>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Area contains Metamorph Monsters<br><span class="mod-value">15</span> uses remaining<br><span class="mod_grey">map extra content weighting [1]</span></td>
    <td><div>no_monster_packs 0<br>unique_map 0<br>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Area contains a Smuggler's Cache<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>no_monster_packs 0<br>unique_map 0<br>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Area contains a Smuggler's Cache<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>no_monster_packs 0<br>unique_map 0<br>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Areas contain a Blight Encounter<br><span class="mod-value">3</span> uses remaining<br><span class="mod_grey">map blight league [1]</span><br><span class="mod_grey">map extra content weighting    [1]</span></td>
    <td><div>no_monster_packs 0<br>unique_map 0<br>map_has_blight_encounter 0<br>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Areas contain a Blight Encounter<br><span class="mod-value">15</span> uses remaining<br><span class="mod_grey">map blight league [1]</span><br><span class="mod_grey">map extra content weighting    [1]</span></td>
    <td><div>no_monster_packs 0<br>unique_map 0<br>map_has_blight_encounter 0<br>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Areas contain <span class="mod-value">2</span> additional Strongboxes<br>Strongboxes in Areas are Corrupted<br>Strongboxes in Areas are at least Rare<br><span class="mod-value">3</span> usesremaining<br><span class="mod_grey">map extra content weighting [1]</span></td>
    <td><div>no_strongboxes 0<br>default 500</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Areas contain <span class="mod-value">3</span> additional Strongboxes<br>Strongboxes in Areas are Corrupted<br>Strongboxes in Areas are at least Rare<br><span class="mod-value">15</span> usesremaining<br><span class="mod_grey">map extra content weighting [1]</span></td>
    <td><div>no_strongboxes 0<br>default 500</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Breaches in Areas belong to Xoph<br>Breaches in Areas contain <span class="mod-value">3</span> additional Clasped Hands<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>unique_map 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Breaches in Areas belong to Xoph<br>Breaches in Areas contain <span class="mod-value">3</span> additional Clasped Hands<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>unique_map 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Breaches in Areas belong to Tul<br>Breaches in Areas contain <span class="mod-value">3</span> additional Clasped Hands<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>unique_map 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Breaches in Areas belong to Tul<br>Breaches in Areas contain <span class="mod-value">3</span> additional Clasped Hands<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>unique_map 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Breaches in Areas belong to Esh<br>Breaches in Areas contain <span class="mod-value">3</span> additional Clasped Hands<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>unique_map 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Breaches in Areas belong to Esh<br>Breaches in Areas contain <span class="mod-value">3</span> additional Clasped Hands<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>unique_map 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Breaches in Areas belong to Uul-Netol<br>Breaches in Areas contain <span class="mod-value">3</span>additional Clasped Hands<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>unique_map 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Breaches in Areas belong to Uul-Netol<br>Breaches in Areas contain <span class="mod-value">3</span>additional Clasped Hands<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>unique_map 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Breaches in Areas belong to Chayula<br>Breaches in Areas contain <span class="mod-value">3</span> additional Clasped Hands<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>unique_map 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Breaches in Areas belong to Chayula<br>Breaches in Areas contain <span class="mod-value">3</span> additional Clasped Hands<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>unique_map 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Areas can contain Breaches<br>Areas contain an additional Breach<br><span class="mod-value">3</span> usesremaining<br><span class="mod_grey">map extra content weighting [1]</span></td>
    <td><div>unique_map 0<br>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Areas can contain Breaches<br>Areas contain <span class="mod-value">2</span> additional Breaches<br><span class="mod-value">15</span> uses remaining<br><span class="mod_grey">map extra content weighting    [1]</span></td>
    <td><div>unique_map 0<br>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Areas contain an additional Abyss<br>Areas can contain Abysses<br><span class="mod-value">3</span> usesremaining<br><span class="mod_grey">map extra content weighting [1]</span></td>
    <td><div>unique_map 0<br>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Areas contain <span class="mod-value">2</span> additional Abysses<br>Areas can contain Abysses<br><span class="mod-value">15</span> uses remaining<br><span class="mod_grey">map extra content weighting    [1]</span></td>
    <td><div>unique_map 0<br>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Slaying Enemies close together in Areas has a <span class="mod-value">6</span>% chance to attract monsters from Beyond<br>Beyond Portals in Areas have <span class="mod-value">25</span>% chance to spawn an additional Beyond Demon<br><span class="mod-value">3</span> uses remaining<br><span class="mod_grey">map extra content    weighting [1]</span></td>
    <td><div>unique_map 0<br>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Slaying Enemies close together in Areas has a <span class="mod-value">8</span>% chance to attract monsters from Beyond<br>Beyond Portals in Areas have <span class="mod-value">25</span>% chance to spawn an additional Beyond Demon<br><span class="mod-value">15</span> uses remaining<br><span class="mod_grey">map extra content    weighting [1]</span></td>
    <td><div>unique_map 0<br>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Areas contain Einhar<br><span class="mod-value">3</span> uses remaining<br><span class="mod_grey">map extra    content weighting [1]</span><br><span class="mod_grey">map mission id [2]</span></td>
    <td><div>unique_map 0<br>elder_occupied_map 0<br>has_atlas_mission 0<br>default 125</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Areas contain Einhar<br><span class="mod-value">15</span> uses remaining<br><span class="mod_grey">map extra    content weighting [1]</span><br><span class="mod_grey">map mission id [2]</span></td>
    <td><div>unique_map 0<br>elder_occupied_map 0<br>has_atlas_mission 0<br>default 125</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Areas contain Alva<br><span class="mod-value">3</span> uses remaining<br><span class="mod_grey">map extra    content weighting [1]</span><br><span class="mod_grey">map mission id [3]</span></td>
    <td><div>unique_map 0<br>elder_occupied_map 0<br>has_atlas_mission 0<br>default 125</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Areas contain Alva<br><span class="mod-value">15</span> uses remaining<br><span class="mod_grey">map extra    content weighting [1]</span><br><span class="mod_grey">map mission id [3]</span></td>
    <td><div>unique_map 0<br>elder_occupied_map 0<br>has_atlas_mission 0<br>default 125</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Areas contain Niko<br><span class="mod-value">3</span> uses remaining<br><span class="mod_grey">map extra    content weighting [1]</span><br><span class="mod_grey">map mission id [5]</span></td>
    <td><div>unique_map 0<br>elder_occupied_map 0<br>has_atlas_mission 0<br>default 125</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Areas contain Niko<br><span class="mod-value">15</span> uses remaining<br><span class="mod_grey">map extra    content weighting [1]</span><br><span class="mod_grey">map mission id [5]</span></td>
    <td><div>unique_map 0<br>elder_occupied_map 0<br>has_atlas_mission 0<br>default 125</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Areas contain Jun<br><span class="mod-value">3</span> uses remaining<br><span class="mod_grey">map extra    content weighting [1]</span><br><span class="mod_grey">map mission id [6]</span></td>
    <td><div>unique_map 0<br>elder_occupied_map 0<br>has_atlas_mission 0<br>default 125</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Areas contain Jun<br><span class="mod-value">15</span> uses remaining<br><span class="mod_grey">map extra    content weighting [1]</span><br><span class="mod_grey">map mission id [6]</span></td>
    <td><div>unique_map 0<br>elder_occupied_map 0<br>has_atlas_mission 0<br>default 125</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td><span class="mod-value">100</span>% chance to create a copy of Beasts Captured in Areas<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>unique_map 0<br>no_monster_packs 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td><span class="mod-value">100</span>% chance to create a copy of Beasts Captured in Areas<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>unique_map 0<br>no_monster_packs 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Areas contain <span class="mod-value">100</span>% increased number of Runic Monster Markers<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>unique_map 0<br>no_monster_packs 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Areas contain <span class="mod-value">100</span>% increased number of Runic Monster Markers<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>unique_map 0<br>no_monster_packs 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Legion Monsters in Areas have <span class="mod-value">100</span>% more Life<br>Splinters and Emblems droppedby Legion Monsters in Areas are duplicated<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>unique_map 0<br>no_monster_packs 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Legion Monsters in Areas have <span class="mod-value">100</span>% more Life<br>Splinters and Emblems droppedby Legion Monsters in Areas are duplicated<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>unique_map 0<br>no_monster_packs 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Catalysts dropped by Metamorphs in Areas are duplicated<br>Metamorphs in Areas have <span class="mod-value">100</span>% more Life<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>unique_map 0<br>no_monster_packs 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Catalysts dropped by Metamorphs in Areas are duplicated<br>Metamorphs in Areas have <span class="mod-value">100</span>% more Life<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>unique_map 0<br>no_monster_packs 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Oils found in Areas have <span class="mod-value">100</span>% chance to be 1 tier higher<br>Cost of Buildingand Upgrading Blight Towers in Areas is doubled<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>unique_map 0<br>no_monster_packs 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Oils found in Areas have <span class="mod-value">100</span>% chance to be 1 tier higher<br>Cost of Buildingand Upgrading Blight Towers in Areas is doubled<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>unique_map 0<br>no_monster_packs 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Gain <span class="mod-value">100</span>% increased Immortal Syndicate Intelligence in Areas<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>unique_map 0<br>no_monster_packs 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Gain <span class="mod-value">100</span>% increased Immortal Syndicate Intelligence in Areas<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>unique_map 0<br>no_monster_packs 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Delirium Reward Bars fill <span class="mod-value">100</span>% faster in Areas<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>unique_map 0<br>no_monster_packs 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Delirium Reward Bars fill <span class="mod-value">100</span>% faster in Areas<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>unique_map 0<br>no_monster_packs 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Plants Harvested in Areas are more likely to give less common Crafting Options<br>Harvest Monsters in Areashave <span class="mod-value">100</span>% more Life<br>Harvests in Areas contain at least one Crop of Blue Plants<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>unique_map 0<br>no_monster_packs 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Plants Harvested in Areas are more likely to give less common Crafting Options<br>Harvest Monsters in Areas have <span class="mod-value">100</span>% more Life<br>Harvests in Areas contain at least one Crop of Purple Plants<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>unique_map 0<br>no_monster_packs 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Plants Harvested in Areas are more likely to give less common Crafting Options<br>Harvest Monsters in Areashave <span class="mod-value">100</span>% more Life<br>Harvests in Areas contain at least one Crop of Yellow Plants<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>unique_map 0<br>no_monster_packs 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Plants Harvested in Areas are more likely to give less common Crafting Options<br>Harvest Monsters in Areas have <span class="mod-value">100</span>% more Life<br>Harvests in Areas contain at least one Crop of Blue Plants<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>unique_map 0<br>no_monster_packs 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Plants Harvested in Areas are more likely to give less common Crafting Options<br>Harvest Monsters in Areashave <span class="mod-value">100</span>% more Life<br>Harvests in Areas contain at least one Crop of PurplePlants<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>unique_map 0<br>no_monster_packs 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Plants Harvested in Areas are more likely to give less common Crafting Options<br>Harvest Monsters in Areashave <span class="mod-value">100</span>% more Life<br>Harvests in Areas contain at least one Crop of Yellow Plants<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>unique_map 0<br>no_monster_packs 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Non-Unique Heist Contracts found in Areas have an additional Implicit Modifier<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>unique_map 0<br>no_monster_packs 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Non-Unique Heist Contracts found in Areas have an additional Implicit Modifier<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>unique_map 0<br>no_monster_packs 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Ritual Altars in Areas allow rerolling Favours an additional time at no Cost<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>unique_map 0<br>no_monster_packs 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Ritual Altars in Areas allow rerolling Favours an additional time at no Cost<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>unique_map 0<br>no_monster_packs 0<br>default 50</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Monsters Imprisoned by Essences have a <span class="mod-value">50</span>% chance to contain a Remnant of Corruption<br>Areas contain an additional Essence<br><span class="mod-value">3</span> usesremaining<br><span class="mod_grey">map extra content weighting [1]</span></td>
    <td><div>unique_map 0<br>no_monster_packs 0<br>default 500</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Monsters Imprisoned by Essences have a <span class="mod-value">50</span>% chance to contain a Remnant of Corruption<br>Areas contain <span class="mod-value">2</span> additional Essences<br><span class="mod-value">3</span> uses remaining<br><span class="mod_grey">map extra content weighting    [1]</span></td>
    <td><div>unique_map 0<br>no_monster_packs 0<br>default 500</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Magic Maps contain <span class="mod-value">4</span> additional packs of Magic Monsters<br>Normal Maps contain <span class="mod-value">4</span> additional packs of Normal Monsters<br>Rare Maps contain <span class="mod-value">4</span> additional Rare Monster packs<br><span class="mod-value">3</span> usesremaining</td>
    <td><div>unique_map 0<br>no_monster_packs 0<br>default 1000</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Magic Maps contain <span class="mod-value">5</span> additional packs of Magic Monsters<br>Normal Maps contain <span class="mod-value">5</span> additional packs of Normal Monsters<br>Rare Maps contain <span class="mod-value">5</span> additional Rare Monster packs<br><span class="mod-value">15</span> usesremaining</td>
    <td><div>unique_map 0<br>no_monster_packs 0<br>default 1000</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td><span class="mod-value">50</span>% increased Duration of Shrine Effects on Players<br>Areas contain anadditional Gloom Shrine<br><span class="mod-value">3</span> uses remaining<br><span class="mod_grey">map    extra content weighting [1]</span></td>
    <td><div>unique_map 0<br>no_monster_packs 0<br>default 1000</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td><span class="mod-value">50</span>% increased Duration of Shrine Effects on Players<br>Areas contain anadditional Gloom Shrine<br>Areas contain an additional Shrine<br><span class="mod-value">15</span> usesremaining<br><span class="mod_grey">map extra content weighting [1]</span></td>
    <td><div>unique_map 0<br>no_monster_packs 0<br>default 1000</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td><span class="mod-value">50</span>% increased Duration of Shrine Effects on Players<br>Areas contain anadditional Resonating Shrine<br><span class="mod-value">3</span> uses remaining<br><span class="mod_grey">map extra content weighting [1]</span></td>
    <td><div>unique_map 0<br>no_monster_packs 0<br>default 1000</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td><span class="mod-value">50</span>% increased Duration of Shrine Effects on Players<br>Areas contain anadditional Resonating Shrine<br>Areas contain an additional Shrine<br><span class="mod-value">15</span> usesremaining<br><span class="mod_grey">map extra content weighting [1]</span></td>
    <td><div>unique_map 0<br>no_monster_packs 0<br>default 1000</div>
    </td>
</tr>
<tr role="row">
    <td>Awakened Sextant</a></td>
    <td>Unique Monsters drop Corrupted Items<br><span class="mod-value">3</span> uses remaining</td>
    <td><div>vaults_of_atziri 0<br>hall_of_grandmasters 0<br>default 250</div>
    </td>
</tr>
<tr role="row">
    <td>Elevated Sextant</a></td>
    <td>Unique Monsters drop Corrupted Items<br><span class="mod-value">15</span> uses remaining</td>
    <td><div>vaults_of_atziri 0<br>hall_of_grandmasters 0<br>default 250</div>
    </td>
</tr>
</tbody>`;

main();
