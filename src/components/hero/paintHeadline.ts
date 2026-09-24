/**
 * Rasterise a headline exactly where the DOM lays it out, word by word, with
 * each word's own computed font and colour, onto a canvas padded by `pad` css px
 * on every side. Width is corrected per word so canvas metrics never drift from
 * the DOM. Used by the hero to light the letters and to cast their shadows.
 */
export function paintHeadline(el: HTMLElement, dpr: number, pad: number) {
  const box = el.getBoundingClientRect();
  const bw = el.offsetWidth;
  const bh = el.offsetHeight;
  // Rects are post-transform (an intro scale, the 3D plane); layout sizes are
  // not. Dividing by the ratio maps every word back into untransformed space,
  // so the texture matches the type at rest whatever is animating when we paint.
  const sx = box.width / Math.max(1, bw) || 1;
  const sy = box.height / Math.max(1, bh) || 1;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.ceil((bw + pad * 2) * dpr));
  canvas.height = Math.max(1, Math.ceil((bh + pad * 2) * dpr));
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);

  const range = document.createRange();
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = node.textContent ?? "";
    const parent = node.parentElement;
    if (!parent || !text.trim()) continue;
    const cs = getComputedStyle(parent);
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    ctx.fillStyle = "#fff";
    const c2 = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
    if ("letterSpacing" in c2) c2.letterSpacing = cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
    const re = /\S+/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      range.setStart(node, m.index);
      range.setEnd(node, m.index + m[0].length);
      const r = range.getBoundingClientRect();
      if (!r.width) continue;
      const tm = ctx.measureText(m[0]);
      const ascent = tm.fontBoundingBoxAscent ?? tm.actualBoundingBoxAscent;
      const k = tm.width > 0 ? Math.min(1.08, Math.max(0.92, r.width / sx / tm.width)) : 1;
      ctx.save();
      ctx.translate((r.left - box.left) / sx + pad, (r.top - box.top) / sy + pad + ascent);
      ctx.scale(k, 1);
      ctx.fillText(m[0], 0, 0);
      ctx.restore();
    }
  }
  return { canvas, w: bw + pad * 2, h: bh + pad * 2 };
}

/** Offset of `el` within `host`, ignoring transforms (so the 3D plane can't skew it). */
export function offsetWithin(el: HTMLElement, host: HTMLElement) {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  const stop = host.offsetParent;
  while (node && node !== stop && node !== host) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return node === host ? { x, y } : { x: x - host.offsetLeft, y: y - host.offsetTop };
}
