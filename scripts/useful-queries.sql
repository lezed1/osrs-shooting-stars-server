-- Get basic stats about report rate
SELECT COUNT(*) as "total reports",
  MIN(recorded_at) as "earliest report",
  MAX(recorded_at) as "latest report",
  NOW(6) - MAX(recorded_at) as "seconds since last report",
  COUNT(*) / (MAX(recorded_at) - MIN(recorded_at)) as "reports per second"
FROM star_observation;