import requests
from bs4 import BeautifulSoup
import json

url = 'https://www.ndsu.edu/dining/menu/shortmenu.asp?sName=MENUS+ON+THE+WEB&locationNum=04&locationName=Residence+Dining+Center&naFlag=1'

response = requests.get(url, timeout=5)
content = BeautifulSoup(response.content, "html.parser")
data = {}

# Find and add to dictionary in useful order
divs = content.findAll('div')
for div in divs:
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
with open('./data.json', 'w') as outfile:
    json.dump(data, outfile, indent=4, sort_keys=True)
