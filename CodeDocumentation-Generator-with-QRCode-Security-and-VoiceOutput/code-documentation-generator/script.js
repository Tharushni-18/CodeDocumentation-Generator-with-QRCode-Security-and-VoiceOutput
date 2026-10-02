const KEY = "codeDocGenerator";
let current = null;
const $ = id => document.getElementById(id);

function stripComments(code, lang) {
  let s = code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  if (lang === "Python") s = s.replace(/#.*$/gm, "");
  return s.replace(/"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/g, '""');
}
function detectLanguage(code) {
  const t = {
    "Java": [/\bclass\s+\w+/, /public\s+static\s+void/, /System\.out\.print/, /\bString\[\]/],
    "Python": [/^\s*def\s+\w+\s*\(.*\)\s*:/m, /\bprint\s*\(/, /^\s*import\s+\w+/m, /\belif\b/, /:\s*$/m],
    "JavaScript": [/\bfunction\b/, /\b(let|const)\s+\w+/, /console\.log/, /=>/],
    "C": [/#include\s*<stdio\.h>/, /\bprintf\s*\(/, /\bscanf\s*\(/, /#include/],
    "C++": [/#include\s*<iostream>/, /\bcout\s*<</, /\bcin\s*>>/, /using\s+namespace\s+std/]
  };
  let best = "Unknown", top = 0;
  for (const [lang, res] of Object.entries(t)) {
    const score = res.filter(r => r.test(code)).length;
    if (score > top) { top = score; best = lang; }
  }
  return best;
}
function countLines(code) { return code.replace(/\s+$/, "").split(/\r?\n/).length; }
function countFunctions(code, lang) {
  const s = stripComments(code, lang);
  if (lang === "Python") return (s.match(/^\s*def\s+\w+\s*\(/gm) || []).length;
  if (lang === "JavaScript") return (s.match(/\bfunction\s*\w*\s*\(|(?:const|let|var)\s+\w+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g) || []).length;
  const m = s.match(/\b\w+(?:[\s\*&]+)(\w+)\s*\([^;{)]*\)\s*(?:const\s*)?\{/g) || [];
  return m.filter(x => !/\b(if|while|for|switch|catch|else|return)\s*\(/.test(x)).length;
}
function countVariables(code, lang) {
  const s = stripComments(code, lang);
  if (lang === "Python") return (s.match(/^\s*[A-Za-z_]\w*\s*=(?!=)/gm) || []).length;
  if (lang === "JavaScript") return (s.match(/\b(?:let|const|var)\s+\w+/g) || []).length;
  return (s.match(/\b(?:int|long|short|float|double|char|boolean|bool|String|byte|auto)\s+\w+\s*(?==|;|,)/g) || []).length;
}
function countLoops(code, lang) {
  const s = stripComments(code, lang);
  const re = lang === "Python" ? /^\s*(for|while)\b/gm : /\b(for|while)\s*\(|\bdo\s*\{/g;
  return (s.match(re) || []).length;
}
function countConditions(code, lang) {
  const s = stripComments(code, lang);
  const re = lang === "Python" ? /^\s*(if|elif)\b/gm : /\b(if|switch)\s*\(/g;
  return (s.match(re) || []).length;
}
function countComments(code, lang) {
  let n = (code.match(/\/\*[\s\S]*?\*\//g) || []).length;
  const noBlock = code.replace(/\/\*[\s\S]*?\*\//g, "");
  n += (noBlock.match(/(^|[^:"'])\/\/.*$/gm) || []).length;
  if (lang === "Python") n += (code.match(/^\s*#.*$|\s#\s.*$/gm) || []).length;
  return n;
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const clean = s => s.replace(/;\s*$/, "").trim();
const an = w => (/^[aeiou]/i.test(w) ? "an " : "a ") + w;
function stripParens(s) { s = s.trim(); return (s[0] === "(" && s[s.length - 1] === ")") ? s.slice(1, -1).trim() : s; }
function cond(t) { return stripParens(t.replace(/^\}?\s*(else\s+if|elif|if|while)\s*/, "").replace(/\s*[{:]\s*$/, "")); }

function explainLine(t, lang) {
  let m;
  if (/^(\/\/|\/\*|\*|#(?!include|define))/.test(t)) return "Comment (a note for readers, not run): " + t.replace(/^(\/\/|\/\*+|\*+\/?|#)\s*/, "").replace(/\*\/$/, "").trim();
  if ((m = t.match(/^#include\s*(.+)/))) return `Includes ${m[1].trim()} so the program can use its ready-made features.`;
  if (/^using\s+namespace/.test(t)) return "Lets the program use standard names (like cout) without typing std:: each time.";
  if ((m = t.match(/^(?:import|from)\s+(.+?);?$/))) return `Imports ${clean(m[1])} so the code can use its features.`;
  if ((m = t.match(/\bclass\s+(\w+)/))) return `Defines a class named ${m[1]}, a container that groups related code.`;
  if (/\bmain\s*\(/.test(t)) return "Starts the main function, which is where the program begins running.";
  if ((m = t.match(/^(?:async\s+)?def\s+(\w+)\s*\((.*?)\)/))) return `Defines a function named ${m[1]}` + (m[2].trim() ? ` that takes ${m[2].trim()}.` : " that takes no input.");
  if ((m = t.match(/^(?:async\s+)?function\s*(\w*)\s*\((.*?)\)/))) return `Defines a function named ${m[1] || "(unnamed)"}` + (m[2].trim() ? ` that takes ${m[2].trim()}.` : " that takes no input.");
  if ((m = t.match(/^(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\((.*?)\)\s*=>/))) return `Defines a function named ${m[1]}` + (m[2].trim() ? ` that takes ${m[2].trim()}.` : " that takes no input.");
  if ((m = t.match(/^(?:elif|if)\s+([^:]+):\s*(\S.*)$/))) return `Checks whether ${m[1].trim()}. If it is true: ${explainLine(m[2], lang)}`;
  if (/^\}?\s*(else\s+if|elif)\b/.test(t)) return `Otherwise, checks whether ${cond(t)}. If it is true, the block below runs.`;
  if (/^\}?\s*if\b/.test(t)) return `Checks whether ${cond(t)}. If it is true, the block below runs.`;
  if (/^\}?\s*else\s*[{:]?$/.test(t)) return "Otherwise (when the checks above were false), this block runs.";
  if ((m = t.match(/^for\s+(\w+)\s+in\s+(.+?):?$/))) return `Loops over ${m[2]}, running the block below once for each ${m[1]}.`;
  if ((m = t.match(/^for\s*\((.*)\)/))) return `Starts a for loop (${m[1].trim()}): the block below repeats until the condition becomes false.`;
  if (/^\}?\s*while\b/.test(t)) return `Repeats the block below as long as ${cond(t)} is true.`;
  if (/^do\s*\{?$/.test(t)) return "Starts a do-while loop: the block runs once, then repeats while its condition is true.";
  if (/^switch\b/.test(t)) return `Picks one of several cases depending on ${cond(t.replace(/^switch/, "if"))}.`;
  if ((m = t.match(/^case\s+(.+?):/))) return `Case ${m[1]}: runs when the value matches.`;
  if (/^default\s*:/.test(t)) return "Default case: runs when no other case matches.";
  if (/^(try|\}?\s*catch|\}?\s*finally|except)\b/.test(t)) return /try/.test(t) ? "Starts a block that tries code which might fail." : "Handles the error if the code above fails.";
  if (/^break\b/.test(t)) return "Stops the current loop or case immediately.";
  if (/^continue\b/.test(t)) return "Skips to the next round of the loop.";
  if ((m = t.match(/^return\b\s*(.*)$/))) return m[1].replace(/;$/, "") ? `Returns ${clean(m[1])} back to whoever called the function.` : "Ends the function.";
  if (/new\s+Scanner/.test(t)) return "Creates a Scanner so the program can read what the user types.";
  if (/scanf|cin\s*>>|nextInt|nextLine|nextDouble|nextFloat|\binput\s*\(|prompt\s*\(/.test(t)) {
    const v = (t.match(/(?:&|>>\s*)(\w+)/) || t.match(/(\w+)\s*=/) || [])[1];
    return v ? `Reads a value typed by the user and stores it in ${v}.` : "Reads a value typed by the user.";
  }
  if (/System\.out\.print|console\.log|\bprintf\s*\(|\bprint\s*\(|\bcout\s*<</.test(t)) {
    let a = (t.match(/(?:System\.out\.print(?:ln)?|console\.log|printf|print)\s*\((.*)\)\s*;?$/) || [])[1];
    if (a === undefined) a = clean(t.replace(/^.*?cout\s*<<\s*/, "").replace(/\s*<<\s*(endl|"\\n")/g, "")).replace(/\s*<<\s*/g, " and ");
    return `Prints ${a || "an empty line"} to the screen.`;
  }
  if ((m = t.match(/^(?:final\s+|const\s+)?(int|long|short|float|double|char|boolean|bool|String|byte|auto)\s+(\w+)\s*(?:=\s*(.+?))?;?$/)))
    return `Creates ${an(m[1])} variable named ${m[2]}` + (m[3] ? ` and sets it to ${m[3]}.` : " (no value yet).");
  if ((m = t.match(/^(?:let|const|var)\s+(\w+)\s*(?:=\s*(.+?))?;?$/))) return `Creates a variable named ${m[1]}` + (m[2] ? ` and sets it to ${m[2]}.` : " (no value yet).");
  if ((m = t.match(/^(\w+)(\+\+|--);?$/))) return `${m[2] === "++" ? "Adds" : "Subtracts"} 1 ${m[2] === "++" ? "to" : "from"} ${m[1]}.`;
  if ((m = t.match(/^([A-Za-z_][\w.\[\]]*)\s*([+\-*\/%]?=)(?!=)\s*(.+?);?$/)))
    return lang === "Python" && m[2] === "=" && /^[A-Za-z_]\w*$/.test(m[1]) ? `Creates (or updates) ${m[1]} and sets it to ${m[3]}.` : `Updates ${m[1]} using ${m[2]} ${m[3]}.`;
  if ((m = t.match(/^([\w.]+)\s*\((.*)\)\s*;?$/))) return `Calls ${m[1]}` + (m[2].trim() ? ` with ${m[2].trim()}.` : ".");
  return "Runs: " + clean(t);
}
function explainCode(code, lang) {
  const steps = [];
  code.split(/\r?\n/).forEach((raw, i) => {
    const t = raw.trim();
    if (!t || /^[{}\s;)]+$/.test(t)) return;
    steps.push({ n: i + 1, text: explainLine(t, lang) });
  });
  return steps;
}
function buildOverview(r, steps) {
  const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
  const parts = [];
  if (r.functions) parts.push(`defines ${plural(r.functions, "function")}`);
  if (r.variables) parts.push(`creates ${plural(r.variables, "variable")}`);
  if (r.conditions) parts.push(`makes ${plural(r.conditions, "decision")} with if/else checks`);
  if (r.loops) parts.push(`repeats work using ${plural(r.loops, "loop")}`);
  if (steps.some(s => /^Reads a value/.test(s.text))) parts.push("reads input from the user");
  if (steps.some(s => /^Prints /.test(s.text))) parts.push("prints results to the screen");
  const what = parts.length ? "It " + parts.join(", ").replace(/, ([^,]*)$/, " and $1") + "." : "It contains simple statements that run one after another.";
  return `This is a ${r.language === "Unknown" ? "code" : r.language} program of ${plural(r.lines, "line")}. ${what} The step-by-step explanation below says what each line does.`;
}
function buildDocText(d) {
  return `Overview: ${d.overview}\n\nStep by step:\n` + d.steps.map(s => `Line ${s.n}: ${s.text}`).join("\n");
}
function generateDocumentation() {
  const code = $("code").value;
  $("msg").textContent = ""; $("msg").style.color = "";
  if (!code.trim()) { $("msg").textContent = "Please enter some source code."; $("result").classList.add("hidden"); return; }
  const language = detectLanguage(code);
  const r = { language, lines: countLines(code), functions: countFunctions(code, language), variables: countVariables(code, language),
    loops: countLoops(code, language), conditions: countConditions(code, language) };
  const steps = explainCode(code, language);
  const overview = buildOverview(r, steps);
  current = { code, overview, steps, timestamp: new Date().toISOString() };
  current.documentation = buildDocText(current);
  $("overview").textContent = overview;
  $("steps").innerHTML = steps.map(s => `<li><b>Line ${s.n}:</b> ${esc(s.text)}</li>`).join("");
  $("result").classList.remove("hidden");
  generateQRCode(`Code Documentation\n${overview.split(" The step-by-step")[0]}\nDate: ${current.timestamp.slice(0, 10)}`);
}
function generateQRCode(text) {
  const box = $("qrcode"); box.innerHTML = ""; $("qrmsg").textContent = "";
  try {
    if (typeof QRCode === "undefined") throw new Error("lib");
    new QRCode(box, { text, width: 280, height: 280, correctLevel: QRCode.CorrectLevel.L });
  } catch (e) { $("qrmsg").textContent = "Unable to generate QR code."; }
}
function downloadQR() {
  const c = $("qrcode").querySelector("canvas"), i = $("qrcode").querySelector("img");
  let src = null;
  if (c) { const o = document.createElement("canvas"); o.width = o.height = c.width + 60; const x = o.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, o.width, o.height); x.drawImage(c, 30, 30); src = o.toDataURL("image/png"); }
  else if (i) src = i.src;
  if (!src) { $("qrmsg").textContent = "Unable to generate QR code."; return; }
  const a = document.createElement("a"); a.href = src; a.download = "documentation-qr.png"; a.click();
}
function saveDocumentation() {
  if (!current) { $("msg").textContent = "No documentation available. Generate it first."; return; }
  try { localStorage.setItem(KEY, JSON.stringify(current)); $("msg").style.color = "#0f6b73"; $("msg").textContent = "Documentation saved."; }
  catch (e) { $("msg").textContent = "Unable to save documentation."; }
}
function fullText(d) {
  return `CODE DOCUMENTATION\n==================\n${d.documentation}\n\nGenerated: ${d.timestamp}\n\nSource Code:\n${d.code}\n`;
}
function downloadDocumentation() {
  if (!current) { $("msg").textContent = "No documentation available."; return; }
  const url = URL.createObjectURL(new Blob([fullText(current)], { type: "text/plain" }));
  const a = document.createElement("a"); a.href = url; a.download = "documentation.txt"; a.click(); URL.revokeObjectURL(url);
}
function clearAll() {
  $("code").value = ""; $("msg").textContent = ""; $("result").classList.add("hidden"); $("qrcode").innerHTML = ""; current = null;
}
function loadSaved() {
  try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
}
function speakDocumentation() {
  const d = loadSaved();
  if (!d) { $("msg").textContent = "No saved documentation found."; return; }
  if (!("speechSynthesis" in window)) { $("msg").textContent = "Speech is not supported in this browser."; return; }
  speechSynthesis.cancel();
  speechSynthesis.speak(new SpeechSynthesisUtterance(d.documentation.replace(/\n+/g, ". ")));
}
function stopSpeaking() { if ("speechSynthesis" in window) speechSynthesis.cancel(); }
if ($("doc")) {
  const d = loadSaved();
  $("doc").textContent = d ? d.documentation + "\n\nSaved: " + d.timestamp : "No saved documentation found.";
}
