#!/usr/bin/env bash

ssh root@crowdsource.runescape.wiki -- \
  "cd ~/osrs-shooting-stars-server/osrs-shooting-stars-server/hacky-prod-stuff \
  && docker-compose exec -T db bash -c 'mysqldump -uroot -p\"\${MYSQL_ROOT_PASSWORD}\" shooting-stars --ignore-table=shooting-stars.star_observation'" \
  | docker-compose exec -T db bash -c 'mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" shooting-stars'
 
ssh root@crowdsource.runescape.wiki -- \
  "cd ~/osrs-shooting-stars-server/osrs-shooting-stars-server/hacky-prod-stuff \
  && docker-compose exec -T db bash -c 'mysqldump -uroot -p\"\${MYSQL_ROOT_PASSWORD}\" shooting-stars star_observation --where=\"recorded_at > NOW() - INTERVAL 2 DAY\"'" \
  | docker-compose exec -T db bash -c 'mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" shooting-stars'