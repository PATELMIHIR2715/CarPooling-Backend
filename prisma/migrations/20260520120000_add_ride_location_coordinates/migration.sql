ALTER TABLE "tbl_ride"
ADD COLUMN "destinationLat" DOUBLE PRECISION,
ADD COLUMN "destinationLon" DOUBLE PRECISION,
ADD COLUMN "originLat" DOUBLE PRECISION,
ADD COLUMN "originLon" DOUBLE PRECISION;

ALTER TABLE "tbl_ride" RENAME COLUMN "pickupLocations" TO "pickupLocations_old";

ALTER TABLE "tbl_ride" ADD COLUMN "pickupLocations" JSONB[] NOT NULL DEFAULT ARRAY[]::JSONB[];

UPDATE "tbl_ride"
SET "pickupLocations" = COALESCE(
  (
    SELECT ARRAY_AGG(
      JSONB_BUILD_OBJECT('name', location_name, 'lat', NULL, 'lon', NULL)
    )
    FROM UNNEST("pickupLocations_old") AS location_name
  ),
  ARRAY[]::JSONB[]
);

ALTER TABLE "tbl_ride" ALTER COLUMN "pickupLocations" DROP DEFAULT;

ALTER TABLE "tbl_ride" DROP COLUMN "pickupLocations_old";
