import requests
import json
import pathlib
from bs4 import BeautifulSoup


# Class scrape to get json data from 'Menus on the Web' pages
class Foodscraper:

    # date - (string) in YYYY-MM-DD format
    # diningCenter - (string) 'residence' or 'union' or 'west'
    def __init__(self, date, diningCenter):
        if diningCenter == 'residence' or diningCenter == 4:
            locationNum = '04'
            locationName = 'Residence+Dining+Center'
        elif diningCenter == 'union' or diningCenter == 10:
            locationNum = '10'
            locationName = 'Union+Dining+Center'
        elif diningCenter == 'west' or diningCenter == 2:
            locationNum = '02'
            locationName = 'West+Dining+Center'
        month = str(date[5:-3])
        day = str(date[-2:])
        year = str(date[:4])
        self.url = 'https://www.ndsu.edu/dining/menu/shortmenu.asp?sName=MENUS+ON+THE+WEB&locationNum=' + locationNum + \
            '&locationName=' + locationName + \
            '&naFlag=1&WeeksMenus=This+Week%27s+Menus&myaction=read&dtdate=' + \
            month + '%2F' + day + '%2F' + year

    # filepath - location to save json file of data
    # filename - name of saved file
    def createJson(self, filepath, filename):
        response = requests.get(self.url, timeout=5)
        content = BeautifulSoup(response.content, 'html.parser')
        data = {}

        # Find and add to dictionary in useful order
        for div in content.findAll('div'):
            if div.get('class') == ['shortmenumeals']:
                currentMeal = div.text
                data[currentMeal] = {}
            elif div.get('class') == ['shortmenucats']:
                currentCategory = div.text[3:][:-3]
                data[currentMeal][currentCategory] = {}
                itemNumber = 0
            elif div.get('class') == ['shortmenurecipes']:
                data[currentMeal][currentCategory][itemNumber] = div.text.replace(
                    '\u00a0', '')
                itemNumber += 1
        # Save to external file
        pathlib.Path(filepath).mkdir(parents=True, exist_ok=True)
        with open(filepath + '/' + filename + '.json', 'w') as outfile:
            json.dump(data, outfile, indent=2, sort_keys=True)
