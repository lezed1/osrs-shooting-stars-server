from collections import defaultdict
import datetime
import json
import os
import re
from mysql.connector import MySQLConnection
from attrs import define


@define
class CannonObservation:
    world: int
    recorded_at: datetime.datetime
    reportedBy: str
    mode: str
    cannonVarbit: int
    time_from_client: datetime.datetime

    @staticmethod
    def get(connection: MySQLConnection):
        with connection.cursor() as cursor:
            cursor.execute(
                """
                    SELECT * FROM cannon_observation
                    WHERE ABS(TIMESTAMPDIFF(SECOND, recorded_at, time_from_client)) < 5
                      AND recorded_at >= NOW() - INTERVAL 16 DAY
                    ORDER BY recorded_at DESC
                """
            )
            column_names = cursor.column_names

            for row in cursor:
                yield CannonObservation(**dict(zip(column_names, row)))
