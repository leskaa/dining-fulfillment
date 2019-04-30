const express = require('express');
const bodyParser = require('body-parser');

const db = require('./db');

const axios = require('axios');
const cheerio = require('cheerio');

const { dialogflow, Table } = require('actions-on-google');

const app = dialogflow();

app.intent('Default Welcome Intent', conv => {
  conv.ask('Hi, What would you like to know about the NDSU Dining Centers?');
});

app.intent('Default Fallback Intent', conv => {
  conv.ask(`I couldn't understand. Can you say that again?`);
});

app.intent('Get Menu Intent', async (conv, params) => {

  let date = new Date(params.date);
  let meal = params.Meal;
  let diningCenter = params.DiningCenter;

  const { dateRows } = await db.query('SELECT * FROM dates WHERE date = $1', [date]);

  if(dateRows.length < 1) {
    parseDay(date);
  }
  
  if(meal == '' && diningCenter == '') {

    const { rows } = await db.query('SELECT * FROM food-items WHERE date = $1', [date]);

    console.log(rows[0]);

    conv.close(`Here is the menu for ${date}.`);

  } else if (meal == '') {

    const { rows } = await client.query('SELECT * FROM food-items WHERE date = $1 AND dining_center = $2', [date, diningCenter]);

    console.log(rows[0]);

    conv.close(`Here is ${diningCenter}'s menu for ${date}.`);

  } else if (diningCenter == '') {

    const { rows } = await client.query('SELECT * FROM food-items WHERE date = $1 AND meal = $2', [date, meal]);

    console.log(rows[0]);

    conv.close(`Here is the ${meal} menu for ${date}.`);

  } else {

    const { rows } = await client.query('SELECT * FROM food-items WHERE date = $1 AND dining_center = $2 AND meal = $3', [date, diningCenter, meal]);

    console.log(rows[0]);

    conv.close(`Here is the ${menu} at ${diningCenter} dining center for ${date}.`);
  }
});

app.intent('Get Hours Intent', (conv, params) => {
  conv.close(`This feature is not yet supported.`);
});

function parseDay(date) {
  let month = date.getMonth() + 1;
  if (month < 10) {
    month = '0' + month;
  }
  let day = date.getDate();
  if (day < 10) {
    day = '0' + day;
  }
  let year = date.getFullYear();

  const residenceUrl = 'https://www.ndsu.edu/dining/menu/shortmenu.asp?sName=MENUS+ON+THE+WEB&locationNum=04&locationName=Residence+Dining+Center&naFlag=1&WeeksMenus=This+Week%27s+Menus&myaction=read&dtdate=' + month + '%2F' + day + '%2F' + year;
  const unionUrl = 'https://www.ndsu.edu/dining/menu/shortmenu.asp?sName=MENUS+ON+THE+WEB&locationNum=10&locationName=Union+Dining+Center&naFlag=1&WeeksMenus=This+Week%27s+Menus&myaction=read&dtdate=' + month + '%2F' + day + '%2F' + year;
  const westUrl = 'https://www.ndsu.edu/dining/menu/shortmenu.asp?sName=MENUS+ON+THE+WEB&locationNum=02&locationName=West+Dining+Center&naFlag=1&WeeksMenus=This+Week%27s+Menus&myaction=read&dtdate=' + month + '%2F' + day + '%2F' + year;

  parsePage(residenceUrl, 'residence');
  parsePage(unionUrl, 'union');
  parsePage(westUrl, 'west');
}

async function parsePage(pageUrl, diningCenter) {

  await db.query('INSERT INTO dates (date) VALUES ($1)', [new Date()]);

  axios(pageUrl).then(response => {

    const html = response.data;
    const $ = cheerio.load(html);
    let currentMeal = '';
    let currentCategory = '';
    let data = {};
    let itemNumber = 0;

    $('div').each((i, element) => {

      if($(element).attr('class') == 'shortmenumeals') {

        currentMeal = $(element).text();
        data[currentMeal] = {};

      } else if($(element).attr('class') == 'shortmenucats') {

        currentCategory = $(element).text().substring(3, $(element).text().length - 3);
        data[currentMeal][currentCategory] = {};
        itemNumber = 0;

      } else if($(element).attr('class') == 'shortmenurecipes') {
        
        let food = $(element).text().replace('\u00a0', '');
        await client.query('INSERT INTO food-items (food, date, dining_center, meal, menu_category) VALUES ($1, $2,$3, $4, $5', [food, new Date(), diningCenter, currentMeal, currentCategory]);
        itemNumber++;
      }
    });
  })
  .catch(console.error());
}

const expressApp = express().use(bodyParser.json());

expressApp.post('/fulfillment', app);

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
expressApp.listen(port);