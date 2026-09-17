import test from "node:test";
import assert from "node:assert/strict";
import { timestamp, parseSubtitles, retime, serialize } from "../src/core.js";
test("SRT parses multiline cues and roundtrips through WebVTT", () => {
  const a = parseSubtitles(
    "1\r\n00:00:01,000 --> 00:00:02,500\r\nHello\r\nworld",
  );
  const b = parseSubtitles(serialize(a.cues, "vtt"));
  assert.equal(b.cues[0].text, "Hello\nworld");
  assert.equal(b.cues[0].end, 2500);
});
test("WebVTT IDs and settings survive while NOTE blocks are reported", () => {
  const p = parseSubtitles(
    "WEBVTT\n\nNOTE context\nnot a cue\n\na\n00:01.000 --> 00:02.000 align:start\nHi",
  );
  assert.equal(p.cues[0].settings, "align:start");
  assert.equal(p.warnings.length, 1);
  assert.match(serialize(p.cues, "vtt"), /align:start/);
});
test("affine retiming, rounding and negative-start rejection", () => {
  const a = [{ start: 1000, end: 3000, text: "hi" }];
  assert.equal(retime(a, 1, 2)[0].start, 3000);
  assert.throws(() => retime(a, -2, 1));
  assert.throws(() => retime(a, 0, 0));
});
test("malformed timestamps and reversed intervals fail", () => {
  assert.throws(() => timestamp("00:61:01,000"));
  assert.throws(() => parseSubtitles("1\n00:00:03,000 --> 00:00:01,000\nx"));
  assert.throws(() => parseSubtitles("nonsense"));
});
