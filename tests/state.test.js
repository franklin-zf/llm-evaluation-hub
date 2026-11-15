import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { StateStore } from "../src/state.js";
import { CURRICULUM_DATA } from "../src/data.js";

describe("SLC-001: StateStore & Curriculum Engine", () => {
  test("BR-1: Normal path - initializes default state and calculates progress", () => {
    const memoryBackend = {};
    const mockStorage = {
      getItem: (key) => memoryBackend[key] || null,
      setItem: (key, val) => { memoryBackend[key] = String(val); },
    };

    const store = new StateStore(mockStorage);
    const initial = store.getState();
    assert.deepEqual(initial.completedMilestones, []);
    assert.equal(store.getProgress(), 0);

    // Toggle one milestone
    const mId = CURRICULUM_DATA[0].milestones[0].id;
    const toggled = store.toggleMilestone(mId);
    assert.equal(toggled, true);
    assert.deepEqual(store.getState().completedMilestones, [mId]);

    // Progress should be positive
    const progress = store.getProgress();
    assert.ok(progress > 0 && progress <= 100);
  });

  test("BR-2: Invalid input - rejects invalid milestone IDs safely", () => {
    const memoryBackend = {};
    const mockStorage = {
      getItem: (key) => memoryBackend[key] || null,
      setItem: (key, val) => { memoryBackend[key] = String(val); },
    };
    const store = new StateStore(mockStorage);

    assert.equal(store.toggleMilestone(""), false);
    assert.equal(store.toggleMilestone(null), false);
    assert.equal(store.toggleMilestone(undefined), false);
    assert.equal(store.toggleMilestone(123), false);
    assert.deepEqual(store.getState().completedMilestones, []);
  });

  test("BR-3: Boundary cases - 0% and 100% progress edge conditions", () => {
    const memoryBackend = {};
    const mockStorage = {
      getItem: (key) => memoryBackend[key] || null,
      setItem: (key, val) => { memoryBackend[key] = String(val); },
    };
    const store = new StateStore(mockStorage);

    // 0 milestones
    assert.equal(store.getProgress(), 0);

    // Complete all milestones
    const allIds = CURRICULUM_DATA.flatMap((w) => w.milestones.map((m) => m.id));
    for (const id of allIds) {
      store.toggleMilestone(id);
    }
    assert.equal(store.getProgress(), 100);
  });

  test("BR-4 & BR-7: Storage failure & graceful degradation to in-memory store", () => {
    // Failing storage throws errors on access
    const brokenStorage = {
      getItem: () => { throw new Error("SecurityError: Storage is disabled"); },
      setItem: () => { throw new Error("QuotaExceededError"); },
    };

    const store = new StateStore(brokenStorage);
    // Should not crash, fallback to memory safely
    const mId = CURRICULUM_DATA[0].milestones[0].id;
    const res = store.toggleMilestone(mId);
    assert.equal(res, true);
    assert.deepEqual(store.getState().completedMilestones, [mId]);
  });

  test("BR-5: Idempotency - double toggling Milestone returns to original state", () => {
    const memoryBackend = {};
    const mockStorage = {
      getItem: (key) => memoryBackend[key] || null,
      setItem: (key, val) => { memoryBackend[key] = String(val); },
    };
    const store = new StateStore(mockStorage);
    const mId = CURRICULUM_DATA[0].milestones[0].id;

    store.toggleMilestone(mId);
    assert.equal(store.isMilestoneCompleted(mId), true);

    store.toggleMilestone(mId);
    assert.equal(store.isMilestoneCompleted(mId), false);
  });

  test("BR-6: Atomic serialization and state hygiene", () => {
    const memoryBackend = {};
    const mockStorage = {
      getItem: (key) => memoryBackend[key] || null,
      setItem: (key, val) => { memoryBackend[key] = String(val); },
    };
    const store = new StateStore(mockStorage);
    store.setTheme("dark");
    assert.equal(store.getState().theme, "dark");

    store.setTheme("light");
    assert.equal(store.getState().theme, "light");

    // Invalid theme rejected
    store.setTheme("neon-pink");
    assert.equal(store.getState().theme, "light");
  });
});
