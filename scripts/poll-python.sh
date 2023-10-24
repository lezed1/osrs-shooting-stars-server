#!/usr/bin/env bash

# fswatch -o python | (while read -d "" event; do
#   echo "$event"
#   docker compose run -T python
# done)

fswatch -o --exclude '\.pyc' python/src | xargs -n1 -I{} docker compose run -T python
