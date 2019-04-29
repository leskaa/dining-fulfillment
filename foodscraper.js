const axios = require('axios');
const cheerio = require('cheerio');

// Test function call
parseDay(new Date());

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

  parsePage(residenceUrl);
  parsePage(unionUrl);
  parsePage(westUrl);
}

function parsePage(pageUrl) {
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
        data[currentMeal][currentCategory][itemNumber] = $(element).text().replace('\u00a0', '');
        itemNumber++;
      }
    });
  })
  .catch(console.error());
}