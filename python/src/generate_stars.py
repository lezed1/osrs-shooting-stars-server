from collections import defaultdict
import datetime
import json
import os
import re
import mysql.connector
from mysql.connector import MySQLConnection
from attrs import define

## Interesting code!


@define
class TelescopeObservation:
    world: int
    recorded_at: datetime.datetime
    reportedBy: str
    mode: str
    message: str

    @staticmethod
    def get(connection: MySQLConnection, query):
        with connection.cursor() as cursor:
            cursor.execute(query)

            for row in cursor:
                row = dict(zip(cursor.column_names, row))
                telescope_observation = TelescopeObservation(**row)
                yield telescope_observation

    @define
    class Parsed:
        region: str
        recorded_at: datetime.datetime
        start: datetime.datetime
        start_offset: datetime.timedelta
        end: datetime.datetime
        end_offset: datetime.timedelta

    def parse_message(self):
        if (
            self.message
            == "You look through the telescope but you don't see anything interesting."
        ):
            return None

        result = re.fullmatch(
            "You see a shooting star! The star looks like it will land (in|on) (?P<region>.*) in the next (?P<start_time>.*) to (?P<end_time>.*).",
            self.message,
        )
        if result:
            result = result.groupdict()

            def parse_time_offset(string: str):
                string = (
                    string.removesuffix("s")
                    .removesuffix(" minute")
                    .replace("hours", "hour")
                )
                if string.isdigit():
                    return datetime.timedelta(minutes=int(string))
                else:
                    hours, minutes = string.split("hour")
                    return datetime.timedelta(hours=int(hours), minutes=int(minutes))

            start_offset = parse_time_offset(result["start_time"])
            end_offset = parse_time_offset(result["end_time"])
            return TelescopeObservation.Parsed(
                region=result["region"],
                recorded_at=self.recorded_at,
                start=self.recorded_at + start_offset,
                start_offset=start_offset,
                end=self.recorded_at + end_offset,
                end_offset=end_offset,
            )
        else:
            raise Exception("failed to parse telescope observation: ", self.message)


@define
class StarObservation:
    id: int
    recorded_at: datetime.datetime
    reportedBy: str
    world: int
    mode: str
    location_x: int
    location_y: int
    location_plane: int
    tier: int
    hp: int
    exact: bool
    percent_remaining: int

    @staticmethod
    def get(connection: MySQLConnection, query):
        with connection.cursor() as cursor:
            cursor.execute(query)
            column_names = cursor.column_names

            for row in cursor:
                yield StarObservation(**dict(zip(column_names, row)))


def telescope_observations(connection: MySQLConnection):
    counts = defaultdict(int)
    for telescope_observation in TelescopeObservation.get(
        connection, "SELECT * FROM telescope_observation"
    ):
        # telescope_observation.parse_message()
        print(telescope_observation.parse_message())
        pass


def star_counts_per_world(connection: MySQLConnection):
    counts = defaultdict(int)

    for star_observation in StarObservation.get(
        connection,
        """
            SELECT 
            * 
            FROM 
            star_observation 
            WHERE 
            recorded_at > NOW() - INTERVAL 4 HOUR 
            ORDER BY 
            recorded_at DESC
        """,
    ):
        counts[star_observation.world] += 1

    return dict(counts)


def generate_star_info(connection: MySQLConnection):
    telescope_observations(connection)
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
