from foodscraper import Foodscraper

url = 'https://www.ndsu.edu/dining/menu/shortmenu.asp?sName=MENUS+ON+THE+WEB&locationNum=04&locationName=Residence+Dining+Center&naFlag=1'

exampleFoodScraper = Foodscraper(url)
exampleFoodScraper.createJson('./data/03-04-2019', 'residence')
