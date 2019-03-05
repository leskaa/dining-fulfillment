import requests
import json
import pathlib
from bs4 import BeautifulSoup


# Class scrape to get json data from 'Menus on the Web' pages
class Foodscraper:

    # url - url of page to be scraped
    def __init__(self, url):
        self.url = url

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
