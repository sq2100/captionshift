export const $ = (id) => document.getElementById(id);
export function message(text, error = false) {
  const el = $("message");
  el.textContent = text;
  el.classList.toggle("error", error);
}
export function download(content, name, type = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(
    content instanceof Blob ? content : new Blob([content], { type }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
export function table(headers, rows, target = "output") {
  const el = $(target);
  el.replaceChildren();
  const wrap = document.createElement("div");
  wrap.className = "table-wrap";
  const tab = document.createElement("table"),
    head = document.createElement("thead"),
    body = document.createElement("tbody");
  const tr = document.createElement("tr");
  for (const h of headers) {
    const th = document.createElement("th");
    th.textContent = h;
    tr.append(th);
  }
  head.append(tr);
  for (const row of rows.slice(0, 500)) {
    const tr = document.createElement("tr");
    for (const value of row) {
      const td = document.createElement("td");
      td.textContent = String(value ?? "");
      tr.append(td);
    }
    body.append(tr);
  }
  tab.append(head, body);
  wrap.append(tab);
  el.append(wrap);
  if (rows.length > 500) {
    const p = document.createElement("p");
    p.className = "hint";
    p.textContent =
      "Showing the first 500 rows. Downloads include the complete result.";
    el.append(p);
  }
}
export function stats(items) {
  const root = $("stats");
  root.replaceChildren();
  for (const [label, value] of items) {
    const card = document.createElement("div");
    card.className = "stat";
    const strong = document.createElement("strong"),
      small = document.createElement("span");
    strong.textContent = value;
    small.textContent = label;
    card.append(strong, small);
    root.append(card);
  }
}
export function csv(rows) {
  return (
    "\uFEFF" +
    rows
      .map((row) =>
        row
          .map(
            (value) =>
              '"' +
              String(value ?? "")
                .replace(/^(\s*[=+@\-\t\r])/, "'$1")
                .replaceAll('"', '""') +
              '"',
          )
          .join(","),
      )
      .join("\r\n")
  );
}
export function textImport(inputId, targetId, callback = () => {}) {
  $(inputId).onchange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      if (file.size > 5 * 1024 * 1024)
        throw new Error("Choose a UTF-8 text file smaller than 5 MiB.");
      $(targetId).value = new TextDecoder("utf-8", { fatal: true }).decode(
        await file.arrayBuffer(),
      );
      callback();
      message(`Loaded ${file.name}. Processed locally.`);
    } catch (e) {
      message(e.message, true);
    } finally {
      event.target.value = "";
    }
  };
}
export function guard(fn) {
  return async (...args) => {
    try {
      await fn(...args);
    } catch (error) {
      document
        .querySelectorAll("[data-export]")
        .forEach((el) => (el.disabled = true));
      message(error.message || "Could not complete this operation.", true);
    }
  };
}
export function ready() {
  document
    .querySelectorAll("[data-export]")
    .forEach((el) => (el.disabled = false));
}
export function init() {
  document.querySelectorAll("[data-clear]").forEach(
    (button) =>
      (button.onclick = () => {
        $(button.dataset.clear).value = "";
        $(button.dataset.clear).dispatchEvent(new Event("input"));
      }),
  );
  $("privacy").onclick = () => $("privacy-dialog").showModal();
  $("close-privacy").onclick = () => $("privacy-dialog").close();
  document.querySelectorAll("textarea,input,select").forEach((el) =>
    el.addEventListener("input", () => {
      if (["filter", "foreground", "background", "target"].includes(el.id))
        return;
      document
        .querySelectorAll("[data-export]")
        .forEach((b) => (b.disabled = true));
      message("Inputs changed. Run the tool again to update your result.");
    }),
  );
}
