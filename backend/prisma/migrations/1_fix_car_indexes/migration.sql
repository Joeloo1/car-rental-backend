-- CreateIndex: composite indexes for common car search filter combinations
CREATE INDEX "Car_availabilityStatus_locationCity_idx" ON "Car"("availabilityStatus", "locationCity");
CREATE INDEX "Car_availabilityStatus_pricePerDay_idx" ON "Car"("availabilityStatus", "pricePerDay");
