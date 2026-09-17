import { parseSubtitles, retime, serialize, formatTime } from "./core.js";
import {
  $,
  init,
  message,
  table,
  stats,
  download,
  textImport,
  guard,
  ready,
} from "./ui.js";
init();
let output = "";
function run() {
  const parsed = parseSubtitles($("source").value),
    cues = retime(
      parsed.cues,
      Number($("offset").value),
      Number($("scale").value),
    ),
    format = $("format").value;
  output = serialize(cues, format);
  const overlaps = cues.slice(1).filter((c, i) => c.start < cues[i].end).length;
  stats([
    ["Cues", cues.length],
    ["Shift (seconds)", $("offset").value],
    ["Multiplier", $("scale").value],
    ["Adjacent overlaps", overlaps],
  ]);
  table(
    ["#", "Start", "End", "Text"],
    cues.map((c, i) => [
      i + 1,
      formatTime(c.start, format),
      formatTime(c.end, format),
      c.text,
    ]),
  );
  message(
    [
      "Timing updated.",
      ...parsed.warnings,
      ...(format === "srt" && cues.some((c) => c.settings)
        ? ["WebVTT cue settings are omitted in SRT."]
        : []),
    ].join(" "),
  );
  ready();
}
$("run").onclick = guard(run);
textImport("file-source", "source", () => {
  $("export").disabled = true;
});
$("export").onclick = () =>
  download(output, `captionshift.${$("format").value}`);
$("demo").onclick = guard(() => {
  $("source").value =
    "1\n00:00:01,000 --> 00:00:03,200\nA small idea, a useful tool.\n\n2\n00:00:04,500 --> 00:00:07,000\nEverything stays in your browser.\n\n3\n00:00:08,000 --> 00:00:10,400\nNow the timing feels right.";
  $("offset").value = "1.5";
  $("scale").value = "1";
  $("format").value = "vtt";
  run();
});
