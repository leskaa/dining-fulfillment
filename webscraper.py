import requests
from bs4 import BeautifulSoup

url = 'https://www.ndsu.edu/dining/menu/shortmenu.asp?sName=MENUS+ON+THE+WEB&locationNum=04&locationName=Residence+Dining+Center&naFlag=1'

response = requests.get(url, timeout=5)
content = BeautifulSoup(response.content, "html.parser")

breakfastTitle = content.find('div', attrs={"class": "shortmenumeals"}).text

menuItems = content.findAll('div', attrs={"class": "shortmenurecipes"})
for item in menuItems:
    print(item.text)
