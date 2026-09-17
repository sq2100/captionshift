export function timestamp(text) {
  const m = text.match(/^(?:(\d{2,}):)?([0-5]\d):([0-5]\d)[,.](\d{3})$/);
  if (!m) throw new Error(`Invalid timestamp: ${text}`);
  return (
    (Number(m[1] || 0) * 3600 + Number(m[2]) * 60 + Number(m[3])) * 1000 +
    Number(m[4])
  );
}
export function parseSubtitles(text) {
  text = text
    .replace(/^\uFEFF/, "")
    .replace(/\r\n?/g, "\n")
    .trim();
  if (!text) throw new Error("Add an SRT or WebVTT subtitle file.");
  const vtt = /^WEBVTT(?:[ \t].*)?(?:\n|$)/.test(text);
  const blocks = text.split(/\n[ \t]*\n/);
  const cues = [],
    warnings = [];
  for (let block of blocks) {
    const lines = block.split("\n");
    if (vtt && /^WEBVTT/.test(lines[0])) {
      lines.shift();
      if (lines.length) warnings.push("WebVTT header metadata was omitted.");
      continue;
    }
    if (vtt && /^(NOTE(?:\s|$)|STYLE$|REGION$)/.test(lines[0])) {
      warnings.push(
        `${lines[0].split(" ")[0]} block omitted from cue-only export.`,
      );
      continue;
    }
    const at = lines.findIndex((l) => l.includes("-->"));
    if (at < 0 || at > 1)
      throw new Error("Each subtitle block needs one timing line.");
    const match = lines[at].match(/^(\S+)\s+-->\s+(\S+)(.*)$/);
    if (!match) throw new Error("Invalid subtitle timing line.");
    const start = timestamp(match[1]),
      end = timestamp(match[2]);
    if (end <= start)
      throw new Error("A subtitle ends before or at its start.");
    const content = lines.slice(at + 1).join("\n");
    if (!content) throw new Error("A subtitle has no text.");
    cues.push({
      start,
      end,
      text: content,
      settings: match[3].trim(),
      id: at ? lines[0] : "",
    });
  }
  if (!cues.length) throw new Error("No subtitle cues found.");
  return { cues, warnings, format: vtt ? "vtt" : "srt" };
}
export function retime(cues, offsetSeconds, scale) {
  if (
    !Number.isFinite(offsetSeconds) ||
    !Number.isFinite(scale) ||
    scale <= 0 ||
    scale > 10
  )
    throw new Error(
      "Use a finite offset and a speed multiplier above 0 and at most 10.",
    );
  return cues.map((c) => {
    const start = Math.round(c.start * scale + offsetSeconds * 1000),
      end = Math.round(c.end * scale + offsetSeconds * 1000);
    if (start < 0)
      throw new Error(
        "This shift would put a cue before 00:00:00. Reduce the negative offset.",
      );
    if (end <= start || end > 359999999)
      throw new Error(
        "Transformed timing is outside the supported range (under 100 hours).",
      );
    return { ...c, start, end };
  });
}
export function formatTime(ms, format = "srt") {
  const h = Math.floor(ms / 3600000),
    m = Math.floor(ms / 60000) % 60,
    s = Math.floor(ms / 1000) % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}${format === "vtt" ? "." : ","}${String(ms % 1000).padStart(3, "0")}`;
}
export function serialize(cues, format) {
  if (!["srt", "vtt"].includes(format))
    throw new Error("Choose SRT or WebVTT.");
  return (
    (format === "vtt" ? "WEBVTT\n\n" : "") +
    cues
      .map(
        (c, i) =>
          `${format === "srt" ? i + 1 : c.id || i + 1}\n${formatTime(c.start, format)} --> ${formatTime(c.end, format)}${format === "vtt" && c.settings ? " " + c.settings : ""}\n${c.text}`,
      )
      .join("\n\n") +
    "\n"
  );
}
