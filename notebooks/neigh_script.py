import pandas as pd
import json as json
import math
import random
import pprint

MOBILE_FOOD_SCHEDULE = "../data/mobile_food_schedule/"
RESTAURANT_SCORES    = "../data/restaurant_scores/SFFoodProgram_Complete_Data/"
OUTPUT_PATH          = "../data/json/"
NEIGHBORHOOD_PATH    = "../data/neighborhood/"

mobile_food_data_df = pd.read_csv(MOBILE_FOOD_SCHEDULE + "Mobile_Food_Schedule.csv")
businesses_plus_df  = pd.read_csv(RESTAURANT_SCORES + "businesses_plus.csv", encoding='latin-1')
inspections_plus_df = pd.read_csv(RESTAURANT_SCORES + "inspections_plus.csv", encoding='latin-1')
violations_plus_df  = pd.read_csv(RESTAURANT_SCORES + "violations_plus.csv", encoding='latin-1')

# Create dict from violation, inspection, and business data
# @key: a business id
# @value: dictionary of dictionaries containing
# 
# all data is encoded as utf-8
# print all_data[538] for an example
all_restaurant_data = {}

# add business data
for index, row in businesses_plus_df.iterrows():
    all_restaurant_data.setdefault(row["business_id"], {"business_data": {}, "inspection_data": [], "violation_data": []})
    for col in businesses_plus_df.columns.values.tolist():
        datum = row[col].encode('utf-8') if type(row[col]) == type("s") else row[col]
        if type(datum) == type(3.14) and math.isnan(datum):
            datum = None
        all_restaurant_data[row["business_id"]]["business_data"][col] = datum
        
# add inspection data
for index, row in inspections_plus_df.iterrows():
    all_restaurant_data.setdefault(row["business_id"], {"business_data": {}, "inspection_data": [], "violation_data": []})
    obj = {}
    for col in inspections_plus_df.columns.values.tolist():
        datum = row[col].encode('utf-8') if type(row[col]) == type("s") else row[col]
        if type(datum) == type(3.14) and math.isnan(datum):
            datum = None
        obj[col] = datum
    all_restaurant_data[row["business_id"]]["inspection_data"].append(obj)
        
# add violation data
for index, row in violations_plus_df.iterrows():
    all_restaurant_data.setdefault(row["business_id"], {"business_data": {}, "inspection_data": [], "violation_data": []})
    obj = {}
    for col in violations_plus_df.columns.values.tolist():
        datum = row[col].encode('utf-8') if type(row[col]) == type("s") else row[col]
        if type(datum) == type(3.14) and math.isnan(datum):
            datum = None
        obj[col] = datum
    all_restaurant_data[row["business_id"]]["violation_data"].append(obj)

geo_neighborhoods = ["Seacliff","Lake Street","Presidio National Park","Presidio Terrace","Inner Richmond",
                 "Sutro Heights","Lincoln Park / Ft. Miley","Outer Richmond","Golden Gate Park",
                 "Presidio Heights","Laurel Heights / Jordan Park","Lone Mountain","Anza Vista",
                 "Cow Hollow","Union Street","Marina","Telegraph Hill","Downtown / Union Square",
                 "Tenderloin","Civic Center","Hayes Valley","Alamo Square","Panhandle","Haight Ashbury",
                 "Lower Haight","Mint Hill","Duboce Triangle","Cole Valley","Rincon Hill","South Beach",
                 "South of Market","Showplace Square","Mission Bay","Yerba Buena Island","Treasure Island",
                 "Mission Dolores","Castro","Outer Sunset","Parkside","Stonestown","Parkmerced","Lakeshore",
                 "Golden Gate Heights","Forest Hill","West Portal","Clarendon Heights","Midtown Terrace",
                 "Laguna Honda","Upper Market","Dolores Heights","Mission","Potrero Hill","Dogpatch",
                 "Central Waterfront","Diamond Heights","Fairmount","Peralta Heights","Holly Park","Merced Manor",
                 "Balboa Terrace","Ingleside","Merced Heights","Outer Mission","Ingleside Terraces","Mt. Davidson Manor",
                 "Monterey Heights","Westwood Highlands","Westwood Park","Miraloma Park","Crocker Amazon","McLaren Park",
                 "Sunnydale","Visitacion Valley","India Basin","Hunters Point","Candlestick Point SRA","Northern Waterfront",
                 "Cayuga","Oceanview","Apparel City","Bernal Heights","Noe Valley","Produce Market","Bayview",
                 "Silver Terrace","Bret Harte","Little Hollywood","Portola","University Mound","St. Marys Park",
                 "Mission Terrace","Excelsior","Sunnyside","Glen Park","Aquatic Park / Ft. Mason","Fishermans Wharf",
                 "Cathedral Hill","Japantown","Pacific Heights","Lower Pacific Heights","Western Addition","Chinatown",
                 "Nob Hill","Lower Nob Hill","Polk Gulch","North Beach","Russian Hill","Financial District",
                 "Inner Sunset","Parnassus Heights","Forest Knolls","Buena Vista","Corona Heights","Ashbury Heights",
                 "Eureka Valley","St. Francis Wood","Sherwood Forest"]

# files
neighborhood_file_1 = NEIGHBORHOOD_PATH + "neighborhoods_0_2500.txt"
neighborhood_file_2 = NEIGHBORHOOD_PATH + "neighborhoods_2498_4997.txt"

# dict
# @key: int - business_id 
# @value: str - neighborhood
restaurants_and_neighborhoods = {}

# add first half of data
for line in open(neighborhood_file_1, "r"):
    arr = map(lambda x: x.replace("\n", ""), line.split(" "))
    if arr[1] != "N/A":
        business_id = int(arr[0][:len(arr[0]) - 1])
        neighborhood = " ".join(arr[1:]).strip()
        restaurants_and_neighborhoods[business_id] = neighborhood
        
# add second half of data
for line in open(neighborhood_file_2, "r"):
    arr = map(lambda x: x.replace("\n", ""), line.split(" "))
    if arr[1] != "N/A":
        business_id = int(arr[0][:len(arr[0]) - 1])
        neighborhood = " ".join(arr[1:]).strip()
        restaurants_and_neighborhoods[business_id] = neighborhood
        
# add neighborhoods to main restaurant dict
for business_id in all_restaurant_data:
    val = None
    if business_id in restaurants_and_neighborhoods:
        val = restaurants_and_neighborhoods[business_id]
    all_restaurant_data[business_id]["business_data"]["neighborhood"] = val

google_neighborhoods = []
for k,v in restaurants_and_neighborhoods.iteritems():
    if v not in google_neighborhoods:
        google_neighborhoods.append(v)

# sort both
google_neighborhoods.sort()
geo_neighborhoods.sort()

with open("../data/neighborhood/google_neighborhoods.txt", "w") as outfile:
     for line in google_neighborhoods:
          outfile.write(line + "\n")

with open("../data/neighborhood/geo_neighborhoods.txt", "w") as outfile:
     for line in geo_neighborhoods:
          outfile.write(line + "\n")







