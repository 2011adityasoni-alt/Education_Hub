-- Constraints Prisma cannot express. Applied as a migration via `npm run db:constraints`.

-- Data integrity
ALTER TABLE "Review"        ADD CONSTRAINT review_rating_range CHECK ("rating" BETWEEN 1 AND 5);
ALTER TABLE "CentreReview"  ADD CONSTRAINT centre_review_rating_range CHECK ("rating" BETWEEN 1 AND 5);
ALTER TABLE "Course"        ADD CONSTRAINT course_price_valid CHECK ("priceInPaise" >= 0 AND "mrpInPaise" >= "priceInPaise");
ALTER TABLE "Payment"       ADD CONSTRAINT payment_amounts_valid CHECK (
  "listPriceInPaise" >= 0 AND "discountInPaise" >= 0 AND "taxInPaise" >= 0 AND "amountInPaise" >= 0
  AND "discountInPaise" <= "listPriceInPaise");
ALTER TABLE "Refund"        ADD CONSTRAINT refund_amount_positive CHECK ("amountInPaise" > 0);
ALTER TABLE "Coupon"        ADD CONSTRAINT coupon_value_valid CHECK (
  "discountValue" > 0 AND ("discountType" <> 'PERCENT' OR "discountValue" <= 100) AND "validUntil" > "validFrom");
ALTER TABLE "Test"          ADD CONSTRAINT test_duration_positive CHECK ("durationMinutes" > 0 AND "maxAttempts" >= 1);
ALTER TABLE "Test"          ADD CONSTRAINT test_window_valid CHECK ("closesAt" IS NULL OR "opensAt" IS NULL OR "closesAt" > "opensAt");
ALTER TABLE "Question"      ADD CONSTRAINT question_marks_valid CHECK ("marks" > 0 AND "negativeMarks" >= 0);
ALTER TABLE "LiveSession"   ADD CONSTRAINT live_window_valid CHECK ("scheduledEnd" > "scheduledStart");
ALTER TABLE "LearningCentre" ADD CONSTRAINT centre_geo_valid CHECK (
  "latitude" BETWEEN -90 AND 90 AND "longitude" BETWEEN -180 AND 180);
ALTER TABLE "CounsellingBooking" ADD CONSTRAINT booking_duration_valid CHECK ("durationMinutes" BETWEEN 10 AND 180);
-- A user must be reachable by at least one identifier
ALTER TABLE "User" ADD CONSTRAINT user_has_identifier CHECK ("email" IS NOT NULL OR "phone" IS NOT NULL);
-- One live attempt per student per test (race-proof, partial unique index)
CREATE UNIQUE INDEX attempt_one_in_progress ON "TestAttempt" ("testId", "studentId") WHERE "status" = 'IN_PROGRESS';
-- Case-insensitive coupon codes
CREATE UNIQUE INDEX coupon_code_ci ON "Coupon" (UPPER("code"));

-- Audit log is append-only
CREATE OR REPLACE FUNCTION audit_log_immutable() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'AuditLog is append-only';
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER audit_log_no_update BEFORE UPDATE OR DELETE ON "AuditLog"
  FOR EACH ROW EXECUTE FUNCTION audit_log_immutable();

-- Answer keys: defence in depth. Create a separate role for the public API in production
-- (e.g. eduhub_api) and grant it NO access to "QuestionKey"; grading runs on a second role
-- (eduhub_grader). Do the role/GRANT part per environment, not in a migration:
--   REVOKE ALL ON "QuestionKey" FROM eduhub_api;
--   GRANT SELECT ON "QuestionKey" TO eduhub_grader;
COMMENT ON TABLE "QuestionKey" IS 'SECRET: answer keys. Never expose to student-facing queries.';
