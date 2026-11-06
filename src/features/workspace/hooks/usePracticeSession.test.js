import { beforeEach, describe, expect, it } from "vitest";
import { recordNotePress, takePracticeSession } from "./usePracticeSession";

const pressAt = (times) => times.forEach((time) => recordNotePress(time));

describe("practice session", () => {
  beforeEach(() => {
    takePracticeSession();
  });

  it("does not count fewer than 5 notes", () => {
    pressAt([0, 1000, 2000, 3000]);
    expect(takePracticeSession()).toBeNull();
  });

  it("counts notes and playing time from 5 notes", () => {
    pressAt([0, 1000, 2000, 3000, 4000]);
    expect(takePracticeSession()).toEqual({ noteCount: 5, durationSec: 4 });
  });

  it("does not count idle gaps longer than 10 seconds", () => {
    pressAt([0, 2000, 60000, 62000, 64000]);
    expect(takePracticeSession()).toEqual({ noteCount: 5, durationSec: 6 });
  });

  it("starts over after a session is taken", () => {
    pressAt([0, 1000, 2000, 3000, 4000]);
    takePracticeSession();
    expect(takePracticeSession()).toBeNull();
  });
});
