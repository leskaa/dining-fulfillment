from foodscraper import Foodscraper
import datetime

currentDateString = str(datetime.date.today())

exampleFoodScraper = Foodscraper(currentDateString, 'residence')
exampleFoodScraper.createJson(currentDateString, 'residence')

exampleFoodScraper = Foodscraper(currentDateString, 'union')
exampleFoodScraper.createJson(currentDateString, 'union')

exampleFoodScraper = Foodscraper(currentDateString, 'west')
exampleFoodScraper.createJson(currentDateString, 'west')
