import { chromium } from "playwright";
const OUT = "/tmp/claude-1000/-home-danny-Desktop-programming-Best-Price/82f6437a-6674-40fe-b945-b360bb89e651/scratchpad";
const b = await chromium.launch();
const errs = [];
for (const [vp, w] of [["desktop", 1280], ["mobile", 390]]) {
  const c = await b.newContext({ viewport: { width: w, height: 900 } });
  const p = await c.newPage();
  p.on("pageerror", (e) => errs.push(`[${vp}] ${e.message}`));
  p.on("console", (m) => m.type() === "error" && errs.push(`[${vp}] console: ${m.text()}`));
  await p.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await p.evaluate(async () => { await new Promise((res) => { let y=0; const s=()=>{ window.scrollBy(0,700); y+=700; if(y>=document.body.scrollHeight){window.scrollTo(0,0);res();} else setTimeout(s,70);}; s(); }); });
  await p.waitForTimeout(700);
  await p.screenshot({ path: `${OUT}/final-${vp}.png`, fullPage: true });
  await p.screenshot({ path: `${OUT}/final-fold-${vp}.png` });
  console.log("shot", vp);
  await c.close();
}
await b.close();
console.log("ERRORS:", errs.length ? errs.join("\n") : "none");
