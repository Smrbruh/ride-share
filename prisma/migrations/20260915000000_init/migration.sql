CREATE TABLE "user" (
    "user_id" SERIAL PRIMARY KEY,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "phone_number" VARCHAR(30) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "registration_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active'
);
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
CREATE UNIQUE INDEX "user_phone_number_key" ON "user"("phone_number");

CREATE TABLE "driver" (
    "driver_id" SERIAL PRIMARY KEY,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "phone_number" VARCHAR(30) NOT NULL,
    "license_number" VARCHAR(50) NOT NULL,
    "license_expiry_date" DATE NOT NULL,
    "hire_date" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "password_hash" VARCHAR(255) NOT NULL
);
CREATE UNIQUE INDEX "driver_email_key" ON "driver"("email");
CREATE UNIQUE INDEX "driver_phone_number_key" ON "driver"("phone_number");
CREATE UNIQUE INDEX "driver_license_number_key" ON "driver"("license_number");

CREATE TABLE "admin" (
    "admin_id" SERIAL PRIMARY KEY,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" VARCHAR(20) NOT NULL DEFAULT 'admin'
);
CREATE UNIQUE INDEX "admin_email_key" ON "admin"("email");

CREATE TABLE "vehicle_type" (
    "vehicle_type_id" SERIAL PRIMARY KEY,
    "type_name" VARCHAR(50) NOT NULL,
    "base_fare" NUMERIC(10,2) NOT NULL,
    "per_km_rate" NUMERIC(10,2) NOT NULL
);
CREATE UNIQUE INDEX "vehicle_type_type_name_key" ON "vehicle_type"("type_name");

CREATE TABLE "vehicle" (
    "vehicle_id" SERIAL PRIMARY KEY,
    "driver_id" INTEGER NOT NULL,
    "vehicle_type_id" INTEGER NOT NULL,
    "plate_number" VARCHAR(20) NOT NULL,
    "model" VARCHAR(100) NOT NULL,
    "color" VARCHAR(30) NOT NULL,
    "manufacture_year" INTEGER NOT NULL,
    CONSTRAINT "vehicle_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "driver"("driver_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "vehicle_vehicle_type_id_fkey" FOREIGN KEY ("vehicle_type_id") REFERENCES "vehicle_type"("vehicle_type_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "vehicle_driver_id_key" ON "vehicle"("driver_id");
CREATE UNIQUE INDEX "vehicle_plate_number_key" ON "vehicle"("plate_number");

CREATE TABLE "location" (
    "location_id" SERIAL PRIMARY KEY,
    "address" VARCHAR(255) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "latitude" NUMERIC(9,6) NOT NULL,
    "longitude" NUMERIC(9,6) NOT NULL
);

CREATE TABLE "ride" (
    "ride_id" SERIAL PRIMARY KEY,
    "driver_id" INTEGER NOT NULL,
    "pickup_location_id" INTEGER NOT NULL,
    "dropoff_location_id" INTEGER NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "distance_km" NUMERIC(8,2) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'scheduled',
    "fare_amount" NUMERIC(10,2) NOT NULL,
    CONSTRAINT "ride_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "driver"("driver_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ride_pickup_location_id_fkey" FOREIGN KEY ("pickup_location_id") REFERENCES "location"("location_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ride_dropoff_location_id_fkey" FOREIGN KEY ("dropoff_location_id") REFERENCES "location"("location_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "booking" (
    "booking_id" SERIAL PRIMARY KEY,
    "ride_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "booking_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seat_count" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    CONSTRAINT "booking_ride_id_fkey" FOREIGN KEY ("ride_id") REFERENCES "ride"("ride_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "booking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "payment" (
    "payment_id" SERIAL PRIMARY KEY,
    "booking_id" INTEGER NOT NULL,
    "amount" NUMERIC(10,2) NOT NULL,
    "payment_method" VARCHAR(30) NOT NULL,
    "payment_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "payment_date" TIMESTAMP(3),
    CONSTRAINT "payment_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "booking"("booking_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "payment_booking_id_key" ON "payment"("booking_id");

CREATE TABLE "rating" (
    "rating_id" SERIAL PRIMARY KEY,
    "booking_id" INTEGER NOT NULL,
    "rating_value" INTEGER NOT NULL,
    "comment" VARCHAR(500),
    "rating_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rating_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "booking"("booking_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "rating_booking_id_key" ON "rating"("booking_id");

CREATE TABLE "promo_code" (
    "promo_id" SERIAL PRIMARY KEY,
    "code" VARCHAR(30) NOT NULL,
    "discount_percent" NUMERIC(5,2) NOT NULL,
    "valid_from" DATE NOT NULL,
    "valid_to" DATE NOT NULL,
    "max_usage" INTEGER NOT NULL
);
CREATE UNIQUE INDEX "promo_code_code_key" ON "promo_code"("code");

CREATE TABLE "user_promo" (
    "user_id" INTEGER NOT NULL,
    "promo_id" INTEGER NOT NULL,
    "usage_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_promo_pkey" PRIMARY KEY ("user_id","promo_id"),
    CONSTRAINT "user_promo_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_promo_promo_id_fkey" FOREIGN KEY ("promo_id") REFERENCES "promo_code"("promo_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
