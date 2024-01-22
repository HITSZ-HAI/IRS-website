"use strict";
(globalThis.webpackChunk = globalThis.webpackChunk || []).push([
    ["app_components_search_custom-scopes-element_ts"], {
        9655: (e, t, o) => {
            o.r(t), o.d(t, {
                CustomScopesElement: () => w
            });
            var s, a, i, n, r, c, l, d, u = o(76006),
                h = o(45974);

            function p(e, t) {
                if (t.has(e)) throw TypeError("Cannot initialize the same private elements twice on an object")
            }

            function m(e, t, o) {
                if (!t.has(e)) throw TypeError("attempted to " + o + " private field on non-instance");
                return t.get(e)
            }

            function y(e, t) {
                var o = m(e, t, "get");
                return o.get ? o.get.call(e) : o.value
            }

            function f(e, t, o) {
                p(e, t), t.set(e, o)
            }

            function S(e, t, o) {
                var s = m(e, t, "set");
                return ! function(e, t, o) {
                    if (t.set) t.set.call(e, o);
                    else {
                        if (!t.writable) throw TypeError("attempted to set read only private field");
                        t.value = o
                    }
                }(e, s, o), o
            }

            function v(e, t, o) {
                if (!t.has(e)) throw TypeError("attempted to get private field on non-instance");
                return o
            }

            function g(e, t) {
                p(e, t), t.add(e)
            }

            function b(e, t, o, s) {
                var a, i = arguments.length,
                    n = i < 3 ? t : null === s ? s = Object.getOwnPropertyDescriptor(t, o) : s;
                if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) n = Reflect.decorate(e, t, o, s);
                else
                    for (var r = e.length - 1; r >= 0; r--)(a = e[r]) && (n = (i < 3 ? a(n) : i > 3 ? a(t, o, n) : a(t, o)) || n);
                return i > 3 && n && Object.defineProperty(t, o, n), n
            }
            let w = (s = new WeakMap, a = new WeakMap, i = new WeakMap, n = new WeakMap, r = new WeakMap, c = new WeakSet, l = new WeakSet, d = new WeakSet, class CustomScopesElement extends HTMLElement {
                connectedCallback() {
                    S(this, s, parseInt(this.getAttribute("data-max-custom-scopes") || "10", 10))
                }
                initialize(e, t, o, s) {
                    S(this, a, e), S(this, i, t), S(this, n, o), S(this, r, s)
                }
                mode() {
                    return this.createCustomScopeForm.hidden ? "manage" : "create"
                }
                customScopesSubmit(e) {
                    "manage" === this.mode() ? this.create("") : this.saveCustomScope(e)
                }
                customScopesCancel() {
                    "manage" !== this.mode() && this.hasScopes ? this.setMode("manage") : this.customScopesModalDialog.close()
                }
                setMode(e) {
                    this.hasScopes && "manage" === e ? (this.createCustomScopeForm.hidden = !0, this.manageCustomScopesForm.hidden = !1, v(this, c, T).call(this, "Saved searches", "Create saved search")) : (this.createCustomScopeForm.hidden = !1, this.manageCustomScopesForm.hidden = !0)
                }
                async saveCustomScope(e) {
                    e.preventDefault();
                    let t = e.target.form;
                    if (!t.checkValidity()) {
                        t.reportValidity();
                        return
                    }
                    let o = await fetch(t.action, {
                        method: "POST",
                        body: new FormData(t)
                    });
                    if (o.ok) {
                        y(this, a) ? .clear();
                        let e = await y(this, i).call(this);
                        this.setScopes(e), t.reset(), this.setMode("manage")
                    }
                }
                async show() {
                    let e = await y(this, i).call(this);
                    this.setScopes(e), this.customScopesModalDialog.show(), this.setMode("manage")
                }
                openCustomScopesDialog(e) {
                    this.customScopesModalDialog.show(), e.stopPropagation()
                }
                async editCustomScope(e) {
                    e.stopPropagation(), e.preventDefault();
                    let t = e.target.getAttribute("data-id");
                    t || (t = e.target.closest("button") ? .getAttribute("data-id") || null);
                    let o = await v(this, d, E).call(this, t);
                    t && o && (v(this, c, T).call(this, "Update saved search", "Update saved search"), this.customScopesIdField.value = o.id, this.customScopesNameField.value = o.name, this.customScopesQueryField.value = o.query, v(this, l, C).call(this, !1), this.setMode("create"))
                }
                create(e) {
                    v(this, c, T).call(this, "Create saved search", "Create saved search"), this.customScopesIdField.value = "", this.customScopesNameField.value = "", this.customScopesQueryField.value = e, this.customScopesModalDialog.show(), v(this, l, C).call(this, !0), this.setMode("create")
                }
                async deleteCustomScope(e) {
                    let t = y(this, n),
                        o = e.target.getAttribute("data-id");
                    if (o || (o = e.target.closest("button") ? .getAttribute("data-id") || null), !t || !o) return;
                    let s = new FormData;
                    s.append("id", o), s.append("_method", "delete");
                    let c = await fetch(t, {
                        method: "POST",
                        headers: {
                            "Scoped-CSRF-Token": y(this, r)
                        },
                        body: s
                    });
                    if (c.ok) {
                        let e = await y(this, i).call(this);
                        this.setScopes(e)
                    }
                    y(this, a) ? .clear(), this.setMode("manage")
                }
                setScopes(e) {
                    this.hasScopes = e.length > 0;
                    let t = e.map(e => (0, h.dy)
                        `
        <div class="d-flex py-1">
          <div>
            <div class="text-bold">${e.name}</div>
            <div class="text-small color-fg-muted">${e.query}</div>
          </div>
          <div class="flex-1"></div>
          <button
            type="button"
            class="btn btn-octicon"
            data-action="click:qbsearch-input#editCustomScope"
            data-id="${e.id}"
            aria-label="Edit saved search"
          >
            ${(function(){let e=document.getElementById("pencil-icon");return(0,h.dy)([e?.innerHTML])})()}
          </button>
          <button
            type="button"
            class="btn btn-octicon btn-danger"
            data-action="click:custom-scopes#deleteCustomScope"
            data-id="${e.id}"
            aria-label="Delete saved search"
          >
            ${(function(){let e=document.getElementById("trash-icon");return(0,h.dy)([e?.innerHTML])})()}
          </button>
        </div>
      `);
                    (0, h.sY)((0, h.dy)
                        `${t}`, this.list)
                }
                constructor(...e) {
                    super(...e), g(this, c), g(this, l), g(this, d), f(this, s, {
                        writable: !0,
                        value: void 0
                    }), f(this, a, {
                        writable: !0,
                        value: void 0
                    }), f(this, i, {
                        writable: !0,
                        value: void 0
                    }), f(this, n, {
                        writable: !0,
                        value: void 0
                    }), f(this, r, {
                        writable: !0,
                        value: void 0
                    }), S(this, i, () => Promise.resolve([])), this.hasScopes = !1
                }
            });

            function T(e, t) {
                this.customScopesSubmitButton.textContent = t, this.customScopesModalDialog.getElementsByTagName("h1")[0].textContent = e
            }

            function C(e) {
                let t = e && (y(this, a) ? .len() || 0) >= y(this, s);
                t ? this.customScopesModalDialogFlash.innerHTML = `
        <div class="flash flash-warn mb-3">
          Limit of 10 saved searches reached. Please delete an existing saved search before creating a new one.
        </div>
      ` : this.customScopesModalDialogFlash.textContent = "", this.customScopesSubmitButton.disabled = t
            }
            async function E(e) {
                let t = y(this, a) ? .get();
                return void 0 === t && (t = await y(this, i).call(this)), t.find(t => t.id.toString() === e)
            }
            b([u.fA], w.prototype, "list", void 0), b([u.fA], w.prototype, "createCustomScopeForm", void 0), b([u.fA], w.prototype, "manageCustomScopesForm", void 0), b([u.fA], w.prototype, "customScopesModalDialog", void 0), b([u.fA], w.prototype, "customScopesModalDialogFlash", void 0), b([u.fA], w.prototype, "customScopesIdField", void 0), b([u.fA], w.prototype, "customScopesNameField", void 0), b([u.fA], w.prototype, "customScopesQueryField", void 0), b([u.fA], w.prototype, "customScopesSubmitButton", void 0), w = b([u.Ih], w)
        },
        95253: (e, t, o) => {
            let s;
            o.d(t, {
                YT: () => h,
                qP: () => p,
                yM: () => m
            });
            var a = o(88149),
                i = o(86058),
                n = o(44544),
                r = o(71643);
            let {
                getItem: c
            } = (0, n.Z)("localStorage"), l = "dimension_", d = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "scid"];
            try {
                let e = (0, a.n)("octolytics");
                delete e.baseContext, s = new i.R(e)
            } catch (e) {}

            function u(e) {
                let t = (0, a.n)("octolytics").baseContext || {};
                if (t)
                    for (let [e, o] of (delete t.app_id, delete t.event_url, delete t.host, Object.entries(t))) e.startsWith(l) && (t[e.replace(l, "")] = o, delete t[e]);
                let o = document.querySelector("meta[name=visitor-payload]");
                if (o) {
                    let e = JSON.parse(atob(o.content));
                    Object.assign(t, e)
                }
                let s = new URLSearchParams(window.location.search);
                for (let [e, o] of s) d.includes(e.toLowerCase()) && (t[e] = o);
                return t.staff = (0, r.B)().toString(), Object.assign(t, e)
            }

            function h(e) {
                s ? .sendPageView(u(e))
            }

            function p(e, t = {}) {
                let o = document.head ? .querySelector('meta[name="current-catalog-service"]') ? .content,
                    a = o ? {
                        service: o
                    } : {};
                for (let [e, o] of Object.entries(t)) null != o && (a[e] = `${o}`);
                if (s) {
                    let t = e || "unknown";
                    u(a), s.sendEvent(t, u(a))
                }
            }

            function m(e) {
                return Object.fromEntries(Object.entries(e).map(([e, t]) => [e, JSON.stringify(t)]))
            }
        },
        45974: (e, t, o) => {
            o.d(t, {
                dy: () => r.dy,
                sY: () => r.sY,
                Au: () => r.Au
            });
            var s = o(22490),
                a = o(7180);
            let i = "jtml-no-op",
                n = s.ZO.createPolicy(i, {
                    createHTML: e => a.O.apply({
                        policy: () => e,
                        policyName: i,
                        fallback: e,
                        fallbackOnError: !0
                    })
                });
            var r = o(20845);
            r.js.setCSPTrustedTypesPolicy(n)
        },
        7180: (e, t, o) => {
            o.d(t, {
                O: () => l,
                d: () => TrustedTypesPolicyError
            });
            var s = o(46426),
                a = o(71643),
                i = o(24601),
                n = o(27856),
                r = o.n(n),
                c = o(95253);
            let TrustedTypesPolicyError = class TrustedTypesPolicyError extends Error {};
            let l = {
                apply: function({
                    policy: e,
                    policyName: t,
                    fallback: o,
                    fallbackOnError: n = !1,
                    sanitize: l,
                    silenceErrorReporting: d = !1
                }) {
                    try {
                        if ((0, s.c)("BYPASS_TRUSTED_TYPES_POLICY_RULES")) return o;
                        (0, a.b)({
                            incrementKey: "TRUSTED_TYPES_POLICY_CALLED",
                            trustedTypesPolicyName: t
                        }, !1, .1);
                        let i = e();
                        return l && new Promise(e => {
                            let o = window.performance.now(),
                                s = r().sanitize(i, {
                                    FORBID_ATTR: []
                                }),
                                a = window.performance.now();
                            if (i.length !== s.length) {
                                let n = Error("Trusted Types policy output sanitized"),
                                    r = n.stack ? .slice(0, 1e3),
                                    l = i.slice(0, 250);
                                (0, c.qP)("trusted_types_policy.sanitize", {
                                    policyName: t,
                                    output: l,
                                    stack: r,
                                    outputLength: i.length,
                                    sanitizedLength: s.length,
                                    executionTime: a - o
                                }), e(i)
                            }
                        }), i
                    } catch (e) {
                        if (e instanceof TrustedTypesPolicyError || (d || (0, i.eK)(e), (0, a.b)({
                                incrementKey: "TRUSTED_TYPES_POLICY_ERROR",
                                trustedTypesPolicyName: t
                            }), !n)) throw e
                    }
                    return o
                }
            }
        },
        22490: (e, t, o) => {
            o.d(t, {
                ZO: () => l
            });
            var s = o(86283),
                a = o(71643);

            function i(e) {
                return () => {
                    throw TypeError(`The policy does not implement the function ${e}`)
                }
            }
            let n = {
                    createHTML: i("createHTML"),
                    createScript: i("createScript"),
                    createScriptURL: i("createScriptURL")
                },
                r = new Map,
                c = globalThis.trustedTypes ? ? {
                    createPolicy: (e, t) => ({
                        name: e,
                        ...n,
                        ...t
                    })
                },
                l = {
                    createPolicy: (e, t) => {
                        if (r.has(e)) return (0, a.b)({
                            incrementKey: "TRUSTED_TYPES_POLICY_INITIALIZED_TWICE"
                        }), r.get(e); {
                            let o = c.createPolicy(e, t);
                            return r.set(e, o), o
                        }
                    }
                },
                d = !1;
            s.n4 ? .addEventListener("securitypolicyviolation", e => {
                "require-trusted-types-for" !== e.violatedDirective || d || (console.warn(`Hi fellow Hubber!
    You're probably seeing a Report Only Trusted Types error near this message. This is intended behaviour, staff-only,
    does not impact application control flow, and is used solely for statistic collection. Unfortunately we
    can't gather these statistics without adding the above warnings to your console. Sorry about that!
    Feel free to drop by #pse-architecture if you have any additional questions about Trusted Types or CSP.`), d = !0)
            })
        }
    }
]);
//# sourceMappingURL=app_components_search_custom-scopes-element_ts-f0eb92f51b6e.js.map