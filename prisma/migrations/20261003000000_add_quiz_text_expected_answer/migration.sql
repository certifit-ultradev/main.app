-- Keep the old answer rows during the expand/contract rollout. The current
-- application still writes and reads them until TB-073 migrates its adapters.
BEGIN;

ALTER TABLE "QuizQuestion" ADD COLUMN "expected_answer" TEXT;

-- A legacy text question is unambiguous only when it has exactly one answer
-- row and that row is marked correct with a nonblank value. Include soft-
-- deleted rows: the existing reader does not filter them either.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "QuizQuestion" AS q
    LEFT JOIN "PossibleAnswerQuestion" AS a ON a."question_id" = q."id"
    WHERE q."type" = 'text' AND q."expected_answer" IS NULL
    GROUP BY q."id"
    HAVING COUNT(a."id") <> 1
      OR COUNT(a."id") FILTER (
        WHERE a."is_correct" AND NULLIF(BTRIM(a."value"), '') IS NOT NULL
      ) <> 1
  ) THEN
    RAISE EXCEPTION 'Cannot backfill QuizQuestion.expected_answer: text questions have missing, ambiguous, or blank legacy answers';
  END IF;
END $$;

UPDATE "QuizQuestion" AS q
SET "expected_answer" = a."value"
FROM "PossibleAnswerQuestion" AS a
WHERE q."id" = a."question_id"
  AND q."type" = 'text'
  AND q."expected_answer" IS NULL
  AND a."is_correct";

-- Fail atomically if a future change to the backfill leaves a text answer empty.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "QuizQuestion"
    WHERE "type" = 'text'
      AND NULLIF(BTRIM("expected_answer"), '') IS NULL
  ) THEN
    RAISE EXCEPTION 'QuizQuestion.expected_answer backfill left a text answer empty';
  END IF;
END $$;

COMMIT;
