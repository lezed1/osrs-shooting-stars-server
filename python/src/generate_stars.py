from collections import defaultdict
import datetime
import itertools
import json
import os
import mysql.connector
from mysql.connector import MySQLConnection
import numpy as np

from cannon_observation import CannonObservation
from star_observation import StarObservation
from telescope_observation import TelescopeObservation

## Interesting code!


def world_reset(connection: MySQLConnection):
    world_starts = defaultdict(list)
    for cannon_observation in CannonObservation.get(connection):
        world_start = cannon_observation.recorded_at - datetime.timedelta(
            seconds=cannon_observation.cannonVarbit * 0.6
        )
        world_starts[cannon_observation.world].append(world_start)

    grouped = {}
    for world, starts in sorted(world_starts.items()):
        clusters = {
            l[0]: len(l)
            for l in np.split(
                starts,
                np.where(np.diff(starts) > (datetime.timedelta(minutes=10)))[0] + 1,
            )
            if len(l) > 25
        }
        if not clusters:
            continue
        grouped[world] = max(clusters.keys())

    return grouped


def telescope_observations(connection: MySQLConnection):
    counts = defaultdict(int)
    for telescope_observation in TelescopeObservation.get(connection):
        # telescope_observation.parse_message()
        # print(telescope_observation.parse_message())
        pass


def star_counts_per_world(connection: MySQLConnection):
    counts = defaultdict(int)

    for star_observation in StarObservation.get(connection):
        counts[star_observation.world] += 1

    return dict(counts)


def generate_star_info(connection: MySQLConnection):
    telescope_observations(connection)
    world_reset(connection)
    counts = star_counts_per_world(connection)

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

temporary_filename = "out/new_json.json.json.json"
final_filename = "out/stars.json"
with open(temporary_filename, "w") as temp:
    json.dump(result, temp, sort_keys=True)
os.rename(temporary_filename, final_filename)

temporary_filename = "out/new_json-pretty.json.json.json"
final_filename = "out/stars-pretty.json"
with open(temporary_filename, "w") as temp:
    json.dump(result, temp, sort_keys=True, indent=2)
os.rename(temporary_filename, final_filename)
