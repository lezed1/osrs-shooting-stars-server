from collections import defaultdict
import datetime
import json
import os
import mysql.connector

mydb = mysql.connector.connect(
    host=os.environ["TYPEORM_HOST"],
    user=os.environ["TYPEORM_USERNAME"],
    password=os.environ["TYPEORM_PASSWORD"],
    database=os.environ["TYPEORM_DATABASE"],
    port=os.environ["TYPEORM_PORT"],
)

mycursor = mydb.cursor()

mycursor.execute(
    "SELECT * FROM star_observation WHERE recorded_at > NOW() - INTERVAL 4 HOUR ORDER BY recorded_at DESC"
)

counts = defaultdict(int)

for row in mycursor:
    row = dict(zip(mycursor.column_names, row))
    counts[row["world"]] += 1

result = {"generated_at": datetime.datetime.now().isoformat(), "counts": dict(counts)}

temporary_filename = "out/new_json.json.json.json"
final_filename = "out/stars.json"
with open(temporary_filename, "w") as temp:
    json.dump(result, temp, sort_keys=True)
os.rename(temporary_filename, final_filename)
