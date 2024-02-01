import { getBottomLeft as H, getWidth as L, getHeight as $ } from "ol/extent.js";
import { MVT as W } from "ol/format.js";
import { create as Z, translate as P, scale as J } from "ol/transform.js";
import { renderFeature as K } from "ol/renderer/vector.js";
import { toContext as Q } from "ol/render.js";
import { transform2D as j } from "ol/geom/flat/transform.js";
import G from "ol/render/canvas/BuilderGroup.js";
import U from "ol/render/canvas/ExecutorGroup.js";
function k(i, t, e) {
  const n = Z(), s = H(i), o = L(i), r = $(i), a = o / r, c = t / e;
  return console.assert(
    Math.abs(a / c - 1) < 0.02,
    `extent and canvas don't have same ratio: ${a}, ${c}`
  ), P(n, 0, e), J(
    n,
    t / o,
    -e / r
    // we multiply by -1 due to CSS coordinate system
  ), P(n, -s[0], -s[1]), n;
}
function tt(i, t, e) {
  const n = e.getZForResolution(t, 0.01), s = [];
  return e.forEachTileCoord(i, n, (o) => {
    const r = e.getTileCoordExtent(o);
    s.push({
      coord: o,
      extent: r
    });
  }), s;
}
let E;
function et(i, t) {
  if (t === 1)
    return i;
  E || (E = document.createElement("canvas"));
  const e = E;
  e.width = i.width, e.height = i.height;
  const n = e.getContext("2d");
  return n.globalAlpha = t, n.drawImage(i, 0, 0), e;
}
function nt(i, t, e, n, s) {
  D(i, t, e || 0, n || i.length - 1, s || it);
}
function D(i, t, e, n, s) {
  for (; n > e; ) {
    if (n - e > 600) {
      var o = n - e + 1, r = t - e + 1, a = Math.log(o), c = 0.5 * Math.exp(2 * a / 3), h = 0.5 * Math.sqrt(a * c * (o - c) / o) * (r - o / 2 < 0 ? -1 : 1), l = Math.max(e, Math.floor(t - r * c / o + h)), u = Math.min(n, Math.floor(t + (o - r) * c / o + h));
      D(i, t, l, u, s);
    }
    var m = i[t], d = e, f = n;
    for (X(i, e, t), s(i[n], m) > 0 && X(i, e, n); d < f; ) {
      for (X(i, d, f), d++, f--; s(i[d], m) < 0; )
        d++;
      for (; s(i[f], m) > 0; )
        f--;
    }
    s(i[e], m) === 0 ? X(i, e, f) : (f++, X(i, f, n)), f <= t && (e = f + 1), t <= f && (n = f - 1);
  }
}
function X(i, t, e) {
  var n = i[t];
  i[t] = i[e], i[e] = n;
}
function it(i, t) {
  return i < t ? -1 : i > t ? 1 : 0;
}
class ot {
  constructor(t = 9) {
    this._maxEntries = Math.max(4, t), this._minEntries = Math.max(2, Math.ceil(this._maxEntries * 0.4)), this.clear();
  }
  all() {
    return this._all(this.data, []);
  }
  search(t) {
    let e = this.data;
    const n = [];
    if (!I(t, e))
      return n;
    const s = this.toBBox, o = [];
    for (; e; ) {
      for (let r = 0; r < e.children.length; r++) {
        const a = e.children[r], c = e.leaf ? s(a) : a;
        I(t, c) && (e.leaf ? n.push(a) : S(t, c) ? this._all(a, n) : o.push(a));
      }
      e = o.pop();
    }
    return n;
  }
  collides(t) {
    let e = this.data;
    if (!I(t, e))
      return !1;
    const n = [];
    for (; e; ) {
      for (let s = 0; s < e.children.length; s++) {
        const o = e.children[s], r = e.leaf ? this.toBBox(o) : o;
        if (I(t, r)) {
          if (e.leaf || S(t, r))
            return !0;
          n.push(o);
        }
      }
      e = n.pop();
    }
    return !1;
  }
  load(t) {
    if (!(t && t.length))
      return this;
    if (t.length < this._minEntries) {
      for (let n = 0; n < t.length; n++)
        this.insert(t[n]);
      return this;
    }
    let e = this._build(t.slice(), 0, t.length - 1, 0);
    if (!this.data.children.length)
      this.data = e;
    else if (this.data.height === e.height)
      this._splitRoot(this.data, e);
    else {
      if (this.data.height < e.height) {
        const n = this.data;
        this.data = e, e = n;
      }
      this._insert(e, this.data.height - e.height - 1, !0);
    }
    return this;
  }
  insert(t) {
    return t && this._insert(t, this.data.height - 1), this;
  }
  clear() {
    return this.data = B([]), this;
  }
  remove(t, e) {
    if (!t)
      return this;
    let n = this.data;
    const s = this.toBBox(t), o = [], r = [];
    let a, c, h;
    for (; n || o.length; ) {
      if (n || (n = o.pop(), c = o[o.length - 1], a = r.pop(), h = !0), n.leaf) {
        const l = st(t, n.children, e);
        if (l !== -1)
          return n.children.splice(l, 1), o.push(n), this._condense(o), this;
      }
      !h && !n.leaf && S(n, s) ? (o.push(n), r.push(a), a = 0, c = n, n = n.children[0]) : c ? (a++, n = c.children[a], h = !1) : n = null;
    }
    return this;
  }
  toBBox(t) {
    return t;
  }
  compareMinX(t, e) {
    return t.minX - e.minX;
  }
  compareMinY(t, e) {
    return t.minY - e.minY;
  }
  toJSON() {
    return this.data;
  }
  fromJSON(t) {
    return this.data = t, this;
  }
  _all(t, e) {
    const n = [];
    for (; t; )
      t.leaf ? e.push(...t.children) : n.push(...t.children), t = n.pop();
    return e;
  }
  _build(t, e, n, s) {
    const o = n - e + 1;
    let r = this._maxEntries, a;
    if (o <= r)
      return a = B(t.slice(e, n + 1)), M(a, this.toBBox), a;
    s || (s = Math.ceil(Math.log(o) / Math.log(r)), r = Math.ceil(o / Math.pow(r, s - 1))), a = B([]), a.leaf = !1, a.height = s;
    const c = Math.ceil(o / r), h = c * Math.ceil(Math.sqrt(r));
    z(t, e, n, h, this.compareMinX);
    for (let l = e; l <= n; l += h) {
      const u = Math.min(l + h - 1, n);
      z(t, l, u, c, this.compareMinY);
      for (let m = l; m <= u; m += c) {
        const d = Math.min(m + c - 1, u);
        a.children.push(this._build(t, m, d, s - 1));
      }
    }
    return M(a, this.toBBox), a;
  }
  _chooseSubtree(t, e, n, s) {
    for (; s.push(e), !(e.leaf || s.length - 1 === n); ) {
      let o = 1 / 0, r = 1 / 0, a;
      for (let c = 0; c < e.children.length; c++) {
        const h = e.children[c], l = C(h), u = ct(t, h) - l;
        u < r ? (r = u, o = l < o ? l : o, a = h) : u === r && l < o && (o = l, a = h);
      }
      e = a || e.children[0];
    }
    return e;
  }
  _insert(t, e, n) {
    const s = n ? t : this.toBBox(t), o = [], r = this._chooseSubtree(s, this.data, e, o);
    for (r.children.push(t), Y(r, s); e >= 0 && o[e].children.length > this._maxEntries; )
      this._split(o, e), e--;
    this._adjustParentBBoxes(s, o, e);
  }
  // split overflowed node into two
  _split(t, e) {
    const n = t[e], s = n.children.length, o = this._minEntries;
    this._chooseSplitAxis(n, o, s);
    const r = this._chooseSplitIndex(n, o, s), a = B(n.children.splice(r, n.children.length - r));
    a.height = n.height, a.leaf = n.leaf, M(n, this.toBBox), M(a, this.toBBox), e ? t[e - 1].children.push(a) : this._splitRoot(n, a);
  }
  _splitRoot(t, e) {
    this.data = B([t, e]), this.data.height = t.height + 1, this.data.leaf = !1, M(this.data, this.toBBox);
  }
  _chooseSplitIndex(t, e, n) {
    let s, o = 1 / 0, r = 1 / 0;
    for (let a = e; a <= n - e; a++) {
      const c = w(t, 0, a, this.toBBox), h = w(t, a, n, this.toBBox), l = lt(c, h), u = C(c) + C(h);
      l < o ? (o = l, s = a, r = u < r ? u : r) : l === o && u < r && (r = u, s = a);
    }
    return s || n - e;
  }
  // sorts node children by the best axis for split
  _chooseSplitAxis(t, e, n) {
    const s = t.leaf ? this.compareMinX : rt, o = t.leaf ? this.compareMinY : at, r = this._allDistMargin(t, e, n, s), a = this._allDistMargin(t, e, n, o);
    r < a && t.children.sort(s);
  }
  // total margin of all possible split distributions where each node is at least m full
  _allDistMargin(t, e, n, s) {
    t.children.sort(s);
    const o = this.toBBox, r = w(t, 0, e, o), a = w(t, n - e, n, o);
    let c = _(r) + _(a);
    for (let h = e; h < n - e; h++) {
      const l = t.children[h];
      Y(r, t.leaf ? o(l) : l), c += _(r);
    }
    for (let h = n - e - 1; h >= e; h--) {
      const l = t.children[h];
      Y(a, t.leaf ? o(l) : l), c += _(a);
    }
    return c;
  }
  _adjustParentBBoxes(t, e, n) {
    for (let s = n; s >= 0; s--)
      Y(e[s], t);
  }
  _condense(t) {
    for (let e = t.length - 1, n; e >= 0; e--)
      t[e].children.length === 0 ? e > 0 ? (n = t[e - 1].children, n.splice(n.indexOf(t[e]), 1)) : this.clear() : M(t[e], this.toBBox);
  }
}
function st(i, t, e) {
  if (!e)
    return t.indexOf(i);
  for (let n = 0; n < t.length; n++)
    if (e(i, t[n]))
      return n;
  return -1;
}
function M(i, t) {
  w(i, 0, i.children.length, t, i);
}
function w(i, t, e, n, s) {
  s || (s = B(null)), s.minX = 1 / 0, s.minY = 1 / 0, s.maxX = -1 / 0, s.maxY = -1 / 0;
  for (let o = t; o < e; o++) {
    const r = i.children[o];
    Y(s, i.leaf ? n(r) : r);
  }
  return s;
}
function Y(i, t) {
  return i.minX = Math.min(i.minX, t.minX), i.minY = Math.min(i.minY, t.minY), i.maxX = Math.max(i.maxX, t.maxX), i.maxY = Math.max(i.maxY, t.maxY), i;
}
function rt(i, t) {
  return i.minX - t.minX;
}
function at(i, t) {
  return i.minY - t.minY;
}
function C(i) {
  return (i.maxX - i.minX) * (i.maxY - i.minY);
}
function _(i) {
  return i.maxX - i.minX + (i.maxY - i.minY);
}
function ct(i, t) {
  return (Math.max(t.maxX, i.maxX) - Math.min(t.minX, i.minX)) * (Math.max(t.maxY, i.maxY) - Math.min(t.minY, i.minY));
}
function lt(i, t) {
  const e = Math.max(i.minX, t.minX), n = Math.max(i.minY, t.minY), s = Math.min(i.maxX, t.maxX), o = Math.min(i.maxY, t.maxY);
  return Math.max(0, s - e) * Math.max(0, o - n);
}
function S(i, t) {
  return i.minX <= t.minX && i.minY <= t.minY && t.maxX <= i.maxX && t.maxY <= i.maxY;
}
function I(i, t) {
  return t.minX <= i.maxX && t.minY <= i.maxY && t.maxX >= i.minX && t.maxY >= i.minY;
}
function B(i) {
  return {
    children: i,
    height: 1,
    leaf: !0,
    minX: 1 / 0,
    minY: 1 / 0,
    maxX: -1 / 0,
    maxY: -1 / 0
  };
}
function z(i, t, e, n, s) {
  const o = [t, e];
  for (; o.length; ) {
    if (e = o.pop(), t = o.pop(), e - t <= n)
      continue;
    const r = t + Math.ceil((e - t) / n / 2) * n;
    nt(i, r, t, e, s), o.push(t, r, r, e);
  }
}
class ht {
  fetch(t, e) {
    return typeof fetch < "u" ? fetch(t, e) : Promise.reject("no Fetch");
  }
}
const ut = new ht(), ft = new W(), b = class V {
  /**
   * @param featuresExtent A list of features to render (in world coordinates)
   * @param styleFunction The style function for the features
   * @param styleResolution The resolution used in the style function
   * @param coordinateToPixelTransform World to CSS coordinates transform (top-left is 0)
   * @param context
   * @param renderBuffer
   * @param declutterTree
   */
  drawFeaturesToContextUsingRenderAPI_(t, e, n, s, o, r, a) {
    const h = new G(
      0,
      t.extent,
      n,
      1
    );
    let l;
    a && (l = new G(
      0,
      t.extent,
      n,
      1
    ));
    function u() {
      console.log(
        "FIXME: some resource is now available, we should regenerate the image"
      );
    }
    const m = function(p) {
      let g;
      const O = p.getStyleFunction() || e;
      O && (g = O(p, n));
      let R = !1;
      if (g) {
        Array.isArray(g) || (g = [g]);
        const N = 0;
        for (const q of g)
          R = K(
            h,
            p,
            q,
            N,
            u,
            void 0,
            l
          ) || R;
      }
      return R;
    };
    let d = !1;
    t.features.forEach((p) => {
      d = m(p) || d;
    }), d && console.log("FIXME: some styles are still loading");
    const f = !0, x = h.finish(), v = new U(
      t.extent,
      n,
      1,
      f,
      x,
      r
    ), T = 1, y = s, A = 0, F = !0;
    v.execute(
      o,
      T,
      y,
      A,
      F,
      void 0,
      null
      // we don't want to declutter the base layer
    ), l && new U(
      t.extent,
      n,
      1,
      f,
      l.finish(),
      r
    ).execute(
      o,
      T,
      y,
      A,
      F,
      void 0,
      a
    );
  }
  /**
   *
   * @param features A list of features to render (in world coordinates)
   * @param styleFunction The style function for the features
   * @param styleResolution The resolution used in the style function
   * @param coordinateToPixelTransform World to CSS coordinates transform (top-left is 0)
   * @param vectorContext
   */
  drawFeaturesToContextUsingImmediateAPI_(t, e, n, s, o) {
    const r = [];
    let a = 0;
    t.forEach((c) => {
      const h = e(c, n);
      h && (Array.isArray(h) ? h.forEach((l, u) => {
        r.push({
          zIndex: l.getZIndex(),
          feature: c,
          naturalOrder: ++a,
          styleIdx: u
        });
      }) : r.push({
        zIndex: h.getZIndex(),
        feature: c,
        naturalOrder: ++a,
        styleIdx: -1
      }));
    }), r.sort((c, h) => (c.zIndex || 0) - (h.zIndex || 0) || c.naturalOrder - h.naturalOrder);
    for (const c of r) {
      const h = e(c.feature, n), l = c.styleIdx === -1 ? h : h[c.styleIdx];
      o.setStyle(l);
      let u = l.getGeometry();
      typeof u == "function" && (u = u()), u || (u = c.feature.getGeometry()), u = Object.assign(
        Object.create(Object.getPrototypeOf(u)),
        u
      );
      const m = u.flatCoordinates_, d = u.flatCoordinates_ = new Array(m.length), f = u.getStride();
      j(
        m,
        0,
        m.length,
        f,
        s,
        d
      ), o.drawGeometry(u);
    }
  }
  snapTileResolution(t, e) {
    const n = t.getResolutions();
    let s = n[n.length - 2];
    for (let o = n.length - 2; o >= 0; o--) {
      const r = n[o];
      if (r <= e)
        s = r;
      else
        break;
    }
    return s;
  }
  assertCanvasSize(t, e) {
    const n = L(t) / $(t), s = e[0] / e[1];
    if (Math.abs(n / s - 1) > 0.02) {
      const o = `The print extent ratio ${n} and the canvas ratio ${s} mismatch: ${Math.abs(n / s - 1) * 100} %`;
      throw new Error(o);
    }
  }
  // avoid polyfilling
  async allFullfilled(t) {
    const e = [];
    for (const n of t)
      await n.then(
        (s) => e.push(s),
        () => {
        }
      );
    return e;
  }
  async fetchFeatures(t, e) {
    const n = e.getTileUrlFunction(), s = e.getProjection(), o = t.map((r) => {
      const a = n(r.coord, 1, s);
      return a ? ut.fetch(a).then((c) => c.arrayBuffer()).then((c) => ({
        features: ft.readFeatures(c, {
          extent: r.extent,
          featureProjection: s
        }),
        extent: r.extent,
        url: a
      })) : Promise.reject("Could not create URL");
    });
    return this.allFullfilled(o);
  }
  /**
   * @param options
   */
  async encodeMVTLayer(t) {
    const e = t.layer, n = t.outputFormat || "png", s = e.getRenderBuffer() || 100, o = e.getSource(), r = o.getTileGrid(), a = this.snapTileResolution(
      r,
      t.tileResolution
    );
    a !== t.tileResolution && (console.warn(
      `snapped and tile resolution mismatch: ${a} != ${t.tileResolution}`
    ), t.tileResolution = a);
    const c = t.printExtent, h = tt(
      c,
      a,
      r
    ), l = await this.fetchFeatures(h, o), u = t.canvasSize;
    this.assertCanvasSize(c, u);
    const m = [
      {
        printExtent: c,
        // print extent
        canvasSize: u
        // the size in pixel for the canvas
      }
    ], d = t.styleResolution || a, f = e.getStyleFunction(), x = e.get("opacity"), v = e.getDeclutter() ? new ot(9) : void 0;
    return m.map(
      (y) => this.renderTile(
        l,
        y.printExtent,
        y.canvasSize,
        d,
        f,
        x,
        s,
        v,
        n
      )
    );
  }
  renderTile(t, e, n, s, o, r, a, c, h) {
    const l = document.createElement("canvas"), u = l.getContext("2d");
    console.assert(
      u,
      `Could not get the context ${l.width}x${l.height}`
    );
    const m = Q(u, {
      size: n,
      pixelRatio: 1
    });
    t.forEach((f) => {
      const x = k(
        e,
        l.width,
        l.height
      );
      V.useImmediateAPI ? this.drawFeaturesToContextUsingImmediateAPI_(
        f.features,
        o,
        s,
        x,
        m
      ) : this.drawFeaturesToContextUsingRenderAPI_(
        f,
        o,
        s,
        x,
        u,
        a,
        c
      );
    });
    const d = (r === 1 ? l : et(l, r)).toDataURL(h);
    return {
      extent: e,
      baseURL: d
    };
  }
};
b.useImmediateAPI = !1;
let Xt = b;
export {
  Xt as MVTEncoder
};
//# sourceMappingURL=print.js.map
