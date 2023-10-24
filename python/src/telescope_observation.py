from collections import defaultdict
import datetime
import json
import os
import re
from mysql.connector import MySQLConnection
from attrs import define


@define
class TelescopeObservation:
    world: int
    recorded_at: datetime.datetime
    reportedBy: str
    mode: str
    message: str

    @staticmethod
    def get(connection: MySQLConnection):
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM telescope_observation")

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
