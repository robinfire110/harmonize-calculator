const db = require("../models/models");
const axois = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

/* Functions */
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

//Get gas prices
async function getGasPrices() {
    //Get data
    /* API Calls. Cost money to do. Instead, I have files. */
    //const gasPrice = await axois.get("https://api.collectapi.com/gasPrice/allUsaPrice", {headers: {"content-type": "application/json", "authorization": process.env.API_GAS_PRICE}}).catch(error => console.log(error));
    //const stateNames = await axois.get("https://api.collectapi.com/gasPrice/usaStateCode", {headers: {"content-type": "application/json", "authorization": process.env.API_GAS_PRICE}}).catch(error => console.log(error));;   

    //Get data from AAA site and parse it
    let data = axois.get(`https://gasprices.aaa.com/state-gas-price-averages/`).then(async (res) => {
        const $ = cheerio.load(res.data);

        //Create map of state abbreviations
        const stateNames = require('./stateCodes.json');
        const stateCodes = new Object();
        for (let i = 0; i < stateNames.result.length; i++)
        {
            let name = stateNames.result[i].name;
            stateCodes[name] = stateNames.result[i].code;
        }
        
        //Get state data
        $(".sortable-table tr").each(async (i, row) => {
            const stateName = $(row).find('a').text().replace(/\s\s+/g, '');
            const gasPrice = $(row).find('td.regular').text().replace(/[^0-9.]/g, '')
            if (stateName != "")
            {
                await db.GasPrice.upsert({location: stateCodes[`${stateName}`], average_price: gasPrice});  
            } 
        });

        //Add MPG Values (//https://afdc.energy.gov/data/10310, https://www.energy.gov/sites/default/files/styles/full_article_width/public/2022-05/FOTW_1237.png?itok=bOmGiBgI)
        await db.GasPrice.upsert({location: "motorcyle_mpg", average_price: 43});
        await db.GasPrice.upsert({location: "sedan_mpg", average_price: 23});
        await db.GasPrice.upsert({location: "suv_mpg", average_price: 20});
        await db.GasPrice.upsert({location: "truck_van_mpg", average_price: 15});
        await db.GasPrice.upsert({location: "bus_mpg", average_price: 7});

        //Add other values (totalAverage, averageMPG)
        await db.GasPrice.upsert({location: "average_gas", average_price: $("p.price-text").text().replace(/[^0-9.]/g, '')});
        await db.GasPrice.upsert({location: "average_mpg", average_price: 20});
    });
}

//Check if userId exists
async function checkValidUserId(id)
{
    let user = await db.User.findOne({where: {user_id: id}});
    if (id === user?.user_id) return true;
    return false;
}

//Check if finId exists
async function checkValidFinancialId(id)
{
    let financial = await db.Financial.findOne({where: {fin_id: id}});
    if (id === financial?.fin_id) return true;
    return false;
}

module.exports = { getRandomInt, getGasPrices, createFakerData, checkValidUserId, checkValidFinancialId }