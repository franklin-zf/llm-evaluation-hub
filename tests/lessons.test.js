import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { listAllLessons, getLessonByMilestone, getLessonsByWeek } from "../src/lessons.js";
import { CURRICULUM_DATA } from "../src/data.js";

describe("SLC-004: Comprehensive Courseware & Lesson Reader Engine", () => {
  test("BR-1: Normal path - all 16 curriculum milestones map to substantive lessons", () => {
    const allLessons = listAllLessons();
    assert.equal(allLessons.length, 16, "Should contain exactly 16 detailed lecture chapters");

    // Check each milestone in CURRICULUM_DATA has a corresponding lesson
    const allMilestoneIds = CURRICULUM_DATA.flatMap((w) => w.milestones.map((m) => m.id));
    assert.equal(allMilestoneIds.length, 16);

    for (const mId of allMilestoneIds) {
      const lesson = getLessonByMilestone(mId);
      assert.ok(lesson, `Milestone ${mId} must have a corresponding lesson`);
      assert.equal(lesson.milestoneId, mId);
      assert.ok(lesson.title.length > 5, "Title should be meaningful");
      assert.ok(lesson.summary.length > 20, "Summary should have substantive depth");
      assert.ok(lesson.readingTimeMinutes >= 3, "Reading time should be realistic");

      // Verify deepDiveContent richness
      const deep = lesson.deepDiveContent;
      assert.ok(deep, "Must have deepDiveContent");
      assert.ok(deep.background.length > 30, "Background should be detailed");
      assert.ok(deep.coreConcepts.length >= 1, "Must have at least one core concept definition");
      assert.ok(deep.practicalGuide.length >= 2, "Must have actionable practical guide steps");
      assert.ok(deep.pitfalls.length >= 1, "Must have at least one documented pitfall");
    }
  });

  test("BR-1: Normal path - filters lessons by week", () => {
    const week1Lessons = getLessonsByWeek(1);
    assert.equal(week1Lessons.length, 4);
    assert.ok(week1Lessons.every((l) => l.weekNum === 1));

    const week4Lessons = getLessonsByWeek(4);
    assert.equal(week4Lessons.length, 4);
    assert.ok(week4Lessons.every((l) => l.weekNum === 4));
  });

  test("BR-2: Invalid input - handles non-existent or invalid milestone IDs gracefully", () => {
    assert.equal(getLessonByMilestone(""), null);
    assert.equal(getLessonByMilestone(null), null);
    assert.equal(getLessonByMilestone(undefined), null);
    assert.equal(getLessonByMilestone("non-existent-id"), null);

    assert.deepEqual(getLessonsByWeek(999), []);
    assert.deepEqual(getLessonsByWeek(-1), []);
    assert.deepEqual(getLessonsByWeek("invalid"), []);
  });
});
