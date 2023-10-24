from collections import defaultdict
import datetime
import json
import os
import re
from mysql.connector import MySQLConnection
from attrs import define


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
    def get(connection: MySQLConnection):
        with connection.cursor() as cursor:
            cursor.execute(
                """
            SELECT 
            * 
            FROM 
            star_observation 
            WHERE 
            recorded_at > NOW() - INTERVAL 4 HOUR 
            ORDER BY 
            recorded_at DESC
        """
            )
            column_names = cursor.column_names

            for row in cursor:
                yield StarObservation(**dict(zip(column_names, row)))
