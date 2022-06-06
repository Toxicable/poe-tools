import * as axios from 'axios';
import * as path from 'path';
import * as fs from 'fs';
import lodash from 'lodash'

interface TftPriceResponse {
    timestamp: number;
    data: {
        name: string;
        exalt: number;
        chaos: number;
        lowConfidance: boolean;
    }[]
}

const GOOGLE_SHEETS_SEPERATOR = '	';

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
        const priceResponse = await axios.default.get<TftPriceResponse>('https://raw.githubusercontent.com/The-Forbidden-Trove/tft-data-prices/master/lsc/bulk-compasses.json')

        const tftToModMap = new Map<string, {
            name: string,
            tftName: string,
        }>();
        fs.readFileSync('./compass-selling/data').toString().split('\n').forEach(line => {
            const split = line.split(GOOGLE_SHEETS_SEPERATOR)
            tftToModMap.set(split[0], {
                name: split[1],
                tftName: split[2],
            })
        })
        
        const items = stashItems.data.stash.items
        const prices = priceResponse.data.data;

        const quantity = new Map();
        for(const item of items ) {
            if(item.enchantMods.length === 0) {
                console.log(item)
            }
            const key = item.enchantMods.join().replace(/,/g,'__')
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
 

        console.log('WTS Softcore Compasses 4 Uses | IGN: ToxicableSentinelAura')
        for(const [key, quant] of sortedByQuant) {
            const object = tftToModMap.get(key);
            if(!object) {
                console.log('UNKNOWN MOD')
                console.log(key)
                return
            }
            const price = prices.find(p => p.name === object.tftName);

            if(price == null) {
                console.log('UNKNOWN TFT NAME')
                console.log(object.tftName)
                return
            }

            console.log(`${quant}x ${object.name} ${price.chaos}c / each`)
        }

        console.log()
        console.log('--------------------------------------')
        console.log('--------------------------------------')

        console.log()
    } catch (e) {
        throw e
        // console.log(e.message)
        // console.log(e.response.status)
    }

}



main();