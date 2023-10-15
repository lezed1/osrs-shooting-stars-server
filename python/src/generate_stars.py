from collections import defaultdict
import datetime
import json
import os
import mysql.connector

## Interesting code!


def generate_star_info(connection):
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT * FROM star_observation WHERE recorded_at > NOW() - INTERVAL 4 HOUR ORDER BY recorded_at DESC"
        )

        counts = defaultdict(int)

        for row in cursor:
            row = dict(zip(cursor.column_names, row))
            counts[row["world"]] += 1

    return {
        "generated_at": datetime.datetime.now().isoformat(),
        "counts": dict(counts),
    }


## run and save

with mysql.connector.connect(
    host=os.environ["TYPEORM_HOST"],
    user=os.environ["TYPEORM_USERNAME"],
    password=os.environ["TYPEORM_PASSWORD"],
    database=os.environ["TYPEORM_DATABASE"],
    port=os.environ["TYPEORM_PORT"],
) as connection:
    result = generate_star_info(connection)

temporary_filename = "out/new_json-pretty.json.json.json"
final_filename = "out/stars-pretty.json"
with open(temporary_filename, "w") as temp:
    json.dump(result, temp, sort_keys=True, indent=2)
os.rename(temporary_filename, final_filename)

temporary_filename = "out/new_json.json.json.json"
final_filename = "out/stars.json"
with open(temporary_filename, "w") as temp:
    json.dump(result, temp, sort_keys=True)
os.rename(temporary_filename, final_filename)
