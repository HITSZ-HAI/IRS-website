"use strict";
(globalThis.webpackChunk = globalThis.webpackChunk || []).push([
    ["app_assets_modules_github_jump-to_ts"], {
        65674: (e, t, n) => {
            let o;
            n.r(t), n.d(t, {
                clearSuggestionsCache: () => _,
                getSuggestions: () => H
            });
            var a = n(3626);

            function i(e, t) {
                let n = new URL(e, window.location.origin),
                    o = new URLSearchParams(n.search.slice(1));
                o.set("q", t);
                let a = new URLSearchParams(window.location.search).get("type");
                return a && o.set("type", a), n.search = o.toString(), n.toString()
            }
            var r = n(87738),
                s = n(95253);
            let c = {};

            function l(e) {
                let t = e.getAttribute("data-target-type");
                if ("Search" === t) {
                    let t = document.querySelector(".js-site-search-form"),
                        n = t.getAttribute("data-scope-type"),
                        o = e.getAttribute("data-item-type");
                    n && f({
                        scope_id: parseInt(t.getAttribute("data-scope-id") || "").toString(),
                        scope_type: n,
                        target_scope: o || ""
                    }), u("search")
                } else("Project" === t || "Repository" === t || "Team" === t) && (f({
                    target_id: parseInt(e.getAttribute("data-target-id") || "").toString(),
                    target_type: t,
                    target_scope: "",
                    client_rank: parseInt(e.getAttribute("data-client-rank") || "").toString(),
                    server_rank: parseInt(e.getAttribute("data-server-rank") || "").toString()
                }), u("click"))
            }

            function u(e) {
                let t = parseInt(document.head ? .querySelector('meta[name="octolytics-actor-id"]') ? .content || "");
                if (!t) return !1;
                let n = c.session_id;
                return ("menu-activation" !== e || !n) && ("menu-activation" === e || !!n) && ("menu-activation" === e && f({
                    session_id: n = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(e) {
                        let t = 16 * Math.random() | 0;
                        return ("x" === e ? t : 3 & t | 8).toString(16)
                    })
                }), !!n && ((0, s.qP)(`jump-to-${e}`, c), ("menu-deactivation" === e || "click" === e || "search" === e) && (c = {}), !0))
            }

            function f(e) {
                Object.assign(c, e)
            }

            function d(e) {
                document.querySelector(".js-jump-to-suggestions-container") ? .classList.remove("d-none"), e.classList.add("jump-to-dropdown-visible"), document.querySelector(".js-jump-to-field") ? .setAttribute("aria-expanded", "true")
            }

            function g() {
                document.querySelector(".js-jump-to-suggestions-container") ? .classList.add("d-none");
                let e = document.querySelector(".js-jump-to-field");
                e ? .classList.remove("jump-to-dropdown-visible"), e ? .setAttribute("aria-expanded", "false"), u("menu-deactivation")
            }

            function m(e) {
                let t = e.form,
                    n = document.querySelector(".js-jump-to-suggestions-results-container"),
                    o = e.value.trim(),
                    a = !!(e.form && e.form.getAttribute("data-scope-type")),
                    r = "Repository" === (e.form && e.form.getAttribute("data-scope-type")),
                    s = n ? .querySelector(".js-jump-to-scoped-search"),
                    c = n ? .querySelector(".js-jump-to-owner-scoped-search"),
                    l = n ? .querySelector(".js-jump-to-global-search");
                if (s ? .classList.toggle("d-none", !o || !a), c && c.classList.toggle("d-none", !o || !r), l ? .classList.toggle("d-none", !o), o && a) {
                    let e = t ? .getAttribute("action"),
                        a = v(s || new HTMLElement, o, i(e || "", o), !0, !1);
                    n ? .replaceChild(a, s || new HTMLElement)
                }
                if (c && o && a) {
                    let e = t ? .getAttribute("data-owner-scoped-search-url"),
                        a = v(c, o, i(e || "", o), !0, !0);
                    n ? .replaceChild(a, c)
                }
                if (o) {
                    let e = t ? .getAttribute("data-unscoped-search-url"),
                        a = v(l || new HTMLElement, o, i(e || "", o), !1, !1);
                    n ? .replaceChild(a, l || new HTMLElement)
                }
            }

            function p(e) {
                let t = document.querySelector(".js-jump-to-suggestions-results-container");
                if (t) {
                    for (let e of t.querySelectorAll(".js-jump-to-suggestion")) e.parentNode ? .removeChild(e);
                    t.appendChild(e)
                }
            }

            function j(e, t) {
                let n = e.querySelector(".js-jump-to-octicon"),
                    o = n ? .querySelector(t);
                n ? .classList.remove("d-none"), o ? .classList.remove("d-none")
            }

            function v(e, t, n, o, a) {
                let i = e.cloneNode(!0);
                o ? i.id = `jump-to-suggestion-search-${a?"scoped-owner":"scoped"}` : i.id = "jump-to-suggestion-search-global";
                let r = i.querySelector(".js-jump-to-suggestion-path");
                r && (r.href = n, r.setAttribute("data-target-type", "Search"));
                let s = i.querySelector(".js-jump-to-suggestion-name");
                s && (s.textContent = t, s.setAttribute("aria-label", t)), j(i, ".js-jump-to-octicon-search");
                let c = i.querySelector(".js-jump-to-badge-search");
                return c && (c.classList.remove("d-none"), o ? c.querySelector(".js-jump-to-badge-search-text-default") ? .classList.remove("d-none") : c.querySelector(".js-jump-to-badge-search-text-global") ? .classList.remove("d-none")), i
            }

            function h(e) {
                let t = document.querySelector(".js-jump-to-suggestions-container");
                return t ? .querySelector(e) ? .firstElementChild
            }
            var y = n(41982);

            function w(e, t) {
                let n = e.value.trim(),
                    o = function(e, t) {
                        let n = (0, a.$t)(t);
                        return e.sort((e, t) => n(t.pageKey) - n(e.pageKey))
                    }(function(e, t, n) {
                        let o = t.replace(/\s/g, "").toLowerCase(),
                            a = e.filter(e => e.path !== n);
                        return o ? (0, y.W)(a, e => {
                            let t = e.name,
                                n = (0, r.EW)(t, o);
                            return n > 0 ? {
                                score: n,
                                text: t
                            } : null
                        }, r.qu) : a
                    }(t, n, window.location.pathname), (0, a.jW)()),
                    i = o.slice(0, 7);
                f({
                        result_count: o.length.toString(),
                        display_count: i.length.toString(),
                        filter_count: (t.length - o.length).toString(),
                        query: n,
                        display_set: JSON.stringify(i.map(e => [e.type, e.databaseId]))
                    }),
                    function(e, t, n) {
                        let o = e.form;
                        if (!o) return;
                        let a = h(".js-jump-to-suggestions-template-container"),
                            i = document.createDocumentFragment();
                        if (n.length < 1 && !t)(function() {
                            if (!document.head ? .querySelector('meta[name="user-login"]') ? .content) return;
                            let e = h(".js-jump-to-no-results-template-container"),
                                t = e.cloneNode(!0);
                            t instanceof HTMLElement && t.classList.remove("d-none"), p(t)
                        })();
                        else {
                            for (let [e, o] of n.entries()) i.appendChild(function(e, t, n, o) {
                                let a = e.cloneNode(!0);
                                a.id = `jump-to-suggestion-${t.type.toLowerCase()}-${t.databaseId}`;
                                let i = a.querySelector(".js-jump-to-suggestion-path");
                                i && (i.href = t.path, i.setAttribute("data-target-type", t.type), i.setAttribute("data-target-id", `${t.databaseId}`), i.setAttribute("data-client-rank", `${o}`), i.setAttribute("data-server-rank", `${t.rank}`));
                                let s = a.querySelector(".js-jump-to-suggestion-name");
                                switch (s && (s.textContent = t.name, s.setAttribute("aria-label", t.name)), (0, r.Qw)(s || new Element, n.replace(/\s/g, "")), t.type) {
                                    case "Team":
                                        {
                                            let e = a.querySelector(".js-jump-to-suggestion-avatar");e && (e.alt = t.name, e.src = t.avatarUrl ? t.avatarUrl : "", e.classList.remove("d-none"));
                                            break
                                        }
                                    case "Project":
                                        j(a, ".js-jump-to-octicon-project");
                                        break;
                                    case "Repository":
                                        j(a, ".js-jump-to-octicon-repo")
                                }
                                let c = a.querySelector(".js-jump-to-badge-jump");
                                return c ? .classList.remove("d-none"), a
                            }(a, o, t, e));
                            p(i)
                        }
                    }(e, n, i), u("menu-activation") || u("query")
            }
            var b = n(4738),
                S = n(46263),
                L = n(36071),
                E = n(59753),
                q = n(254),
                k = n(58700),
                x = n(15205),
                T = n(15754);
            (0, L.N7)(".js-jump-to-field", {
                constructor: HTMLInputElement,
                add(e) {
                    e.addEventListener("input", (0, S.D)(async function() {
                        m(e), K(e), w(e, await o)
                    }, 100)), document.activeElement && document.activeElement === e && D(e)
                }
            });
            let A = new Map;

            function _() {
                A.clear()
            }
            async function C(e, t) {
                let n = function(e) {
                    let t = new FormData;
                    for (let e of Object.keys((0, a.jW)()).slice(0, 10)) t.append("variables[pageViews][]", e);
                    return t
                }(0);
                n.set("_method", "GET");
                let o = [],
                    i = new URL(e, window.location.origin);
                location.search.match(/_tracing=true/) && i.searchParams.set("graphql_query_trace", "true");
                let r = await fetch(i.href, {
                    method: "POST",
                    mode: "same-origin",
                    body: n,
                    headers: {
                        Accept: "application/json",
                        "Scoped-CSRF-Token": t,
                        "X-Requested-With": "XMLHttpRequest"
                    }
                });
                if (r.ok) {
                    let e = await r.json();
                    (0, T.d5)(e), o = function(e) {
                        if ("errors" in e.data) return [];
                        let t = 1,
                            n = [];
                        for (let o of e.data.suggestions.nodes) null != o && (o.rank = t++, o.pageKey = function(e) {
                            let t;
                            let [n, o] = e.name.split("/") || [];
                            switch (e.type) {
                                case "Project":
                                    t = (0, a.vt)(e.owner.name, `${e.number}`);
                                    break;
                                case "Repository":
                                    t = (0, a.WF)(n, o);
                                    break;
                                case "Team":
                                    t = (0, a.DV)(n, o);
                                    break;
                                default:
                                    throw Error(`Invalid Suggestion type: ${e.type}`)
                            }
                            return t
                        }(o), "Team" === o.type && (o.name = `@${o.name}`), n.push(o));
                        return n
                    }(e)
                }
                let s = document.querySelector(".js-search-commands");
                if (s instanceof HTMLInputElement) {
                    let e = s.value,
                        t = [];
                    try {
                        t = JSON.parse(e).commands
                    } catch (e) {}
                    o = o.concat(t)
                }
                return o
            }
            let M = 0,
                R = (0, x.Z)(C, {
                    cache: A
                });
            async function H(e) {
                let t = e.getAttribute("data-jump-to-suggestions-path");
                if (!t) throw Error("could not get jump to suggestions path");
                let n = function e(t, n) {
                    let o = t.nextElementSibling;
                    return o instanceof HTMLElement ? o.classList.contains(n) ? o : e(o, n) : null
                }(e, "js-data-jump-to-suggestions-path-csrf");
                return n ? (Date.now() - M > 5e3 && _(), M = Date.now(), R(t, n.value)) : []
            }
            async function D(e) {
                e.classList.add("js-navigation-enable"), e.classList.add("jump-to-field-active"), e.parentElement ? .classList.add("search-wrapper-suggestions-active"), d(e), o || (o = H(e)), m(e), K(e), w(e, await o)
            }(0, q.ZG)(".js-jump-to-field", D), (0, E.on)("navigation:keydown", ".js-site-search-form", function(e) {
                let t = e.currentTarget.querySelector(".js-navigation-item.navigation-focus");
                switch (e.detail.hotkey) {
                    case "Enter":
                        if (t) l(t.querySelector(".js-jump-to-suggestion-path"));
                        else {
                            let t = e.currentTarget;
                            (0, k.Bt)(t)
                        }
                        break;
                    case "Escape":
                        e.currentTarget.querySelector(".js-jump-to-field").blur(), g()
                }
            }), (0, E.on)("navigation:focus", ".js-site-search-form", function(e) {
                let t = document.querySelector(".js-jump-to-field"),
                    n = e.target.id,
                    o = e.target.closest(".js-jump-to-suggestions-results-container");
                for (let t of o.querySelectorAll(".js-navigation-item")) t.setAttribute("aria-selected", (e.target === t).toString());
                t.setAttribute("aria-activedescendant", n)
            });
            let V = null;

            function K(e) {
                let t = e.value.trim(),
                    n = document.querySelector(".js-jump-to-suggestions-results-container");
                t ? (0, b.T_)(n) : (0, b.QZ)(n)
            }(0, E.on)("focusout", ".js-jump-to", function() {
                let e = document.querySelector(".js-jump-to-field");
                V = window.setTimeout(() => {
                    e.classList.remove("js-navigation-enable"), e.classList.remove("jump-to-field-active"), e.parentElement ? .classList.remove("search-wrapper-suggestions-active"), g()
                }, 200)
            }), (0, E.on)("focusin", ".js-jump-to", function() {
                V && window.clearTimeout(V);
                let e = document.querySelector(".js-jump-to-field");
                d(e)
            }), (0, E.on)("click", ".js-jump-to-suggestion-path", function(e) {
                let t = e.currentTarget;
                if ("Search" === t.getAttribute("data-target-type")) {
                    let e = document.querySelector(".js-jump-to-field");
                    t.href = function(e, t) {
                        let n = new URL(t, window.location.origin),
                            o = new URLSearchParams(n.search.slice(1));
                        return o.get("q") && o.set("q", e), n.search = o.toString(), n.toString()
                    }(e.value.trim(), t.href)
                }
                l(t)
            }), (0, E.on)("submit", ".js-site-search-form", function(e) {
                if (!document.querySelector(".js-jump-to-field")) return;
                let t = e.target;
                t.getAttribute("data-scoped-search-url") && f({}), u("search")
            })
        },
        4738: (e, t, n) => {
            n.d(t, {
                QZ: () => b,
                ZH: () => x,
                jK: () => S,
                T_: () => k,
                Sw: () => q,
                VF: () => E,
                VH: () => T
            });
            var o = n(56959),
                a = n(59753),
                i = n(98105),
                r = n(67044),
                s = n(76134),
                c = n(36071);

            function l(e, t) {
                let n = e,
                    o = e.ownerDocument;
                (n === o || n === o.defaultView || n === o.documentElement || n === o.body) && (n = o);
                let a = o.defaultView.Document;
                if (n instanceof a) {
                    let e = null != t.top ? t.top : o.defaultView.pageYOffset,
                        n = null != t.left ? t.left : o.defaultView.pageXOffset;
                    o.defaultView.scrollTo(n, e);
                    return
                }
                let i = o.defaultView.HTMLElement;
                if (!(n instanceof i)) throw Error("invariant");
                n.scrollTop = t.top, null != t.left && (n.scrollLeft = t.left)
            }
            var u = n(97629);
            let f = navigator.userAgent.match(/Macintosh/),
                d = f ? "metaKey" : "ctrlKey",
                g = f ? "Meta" : "Control",
                m = !1,
                p = {
                    x: 0,
                    y: 0
                };

            function j(e) {
                e instanceof MouseEvent && ((p.x !== e.clientX || p.y !== e.clientY) && (m = !1), p = {
                    x: e.clientX,
                    y: e.clientY
                })
            }

            function v(e) {
                if (m) return;
                let t = e.currentTarget,
                    {
                        target: n
                    } = e;
                if (!(n instanceof Element) || !(t instanceof HTMLElement) || !t.closest(".js-active-navigation-container")) return;
                let o = n.closest(".js-navigation-item");
                o && M(o, t)
            }(0, c.N7)(".js-navigation-container:not(.js-navigation-container-no-mouse)", {
                subscribe: e => (0, o.qC)((0, o.RB)(e, "mouseover", j), (0, o.RB)(e, "mouseover", v))
            });
            let h = 0;

            function y(e) {
                if (e.target !== document.body && e.target instanceof HTMLElement && !e.target.classList.contains("js-navigation-enable")) return;
                m = !0;
                let t = R(),
                    n = !1;
                if (t) {
                    let o = t.querySelector(".js-navigation-item.navigation-focus") || t;
                    n = (0, a.f)(o, "navigation:keydown", {
                        hotkey: (0, r.EL)(e),
                        originalEvent: e,
                        originalTarget: e.target
                    })
                }
                n || e.preventDefault()
            }

            function w(e) {
                let t = e.modifierKey || e.altKey || e.ctrlKey || e.metaKey,
                    n = (0, a.f)(e.currentTarget, "navigation:open", {
                        modifierKey: t,
                        shiftKey: e.shiftKey
                    });
                n || e.preventDefault()
            }

            function b(e) {
                let t = R();
                e !== t && (null !== t && S(t), e ? .classList.add("js-active-navigation-container"))
            }

            function S(e) {
                e.classList.remove("js-active-navigation-container")
            }(0, c.N7)(".js-active-navigation-container", {
                add() {
                    1 == ++h && document.addEventListener("keydown", y)
                },
                remove() {
                    0 == --h && document.removeEventListener("keydown", y)
                }
            }), (0, a.on)("navigation:keydown", ".js-active-navigation-container", function(e) {
                let t = e.currentTarget,
                    n = e.detail.originalTarget.matches("input, textarea"),
                    o = e.target;
                if ((0, s.Zf)(e.detail.originalEvent)) {
                    if (o.classList.contains("js-navigation-item")) {
                        if (n) {
                            if (f) switch ((0, r.EL)(e.detail.originalEvent)) {
                                case "Control+n":
                                    _(o, t);
                                    break;
                                case "Control+p":
                                    A(o, t)
                            }
                            switch ((0, r.EL)(e.detail.originalEvent)) {
                                case "ArrowUp":
                                    A(o, t);
                                    break;
                                case "ArrowDown":
                                    _(o, t);
                                    break;
                                case "Enter":
                                case `${g}+Enter`:
                                    C(o, e.detail.originalEvent[d])
                            }
                        } else {
                            if (f) switch ((0, r.EL)(e.detail.originalEvent)) {
                                case "Control+n":
                                    _(o, t);
                                    break;
                                case "Control+p":
                                    A(o, t);
                                    break;
                                case "Alt+v":
                                    (function(e, t) {
                                        let n, o;
                                        let a = H(t),
                                            r = a.indexOf(e),
                                            s = (0, i.VZ)(e);
                                        if (null != s) {
                                            for (;
                                                (n = a[r - 1]) && (o = (0, i._C)(n, s)) && o.top >= 0;) r--;
                                            if (n) {
                                                let e = M(n, t);
                                                if (e) return;
                                                V(s, n)
                                            }
                                        }
                                    })(o, t);
                                    break;
                                case "Control+v":
                                    (function(e, t) {
                                        let n, o;
                                        let a = H(t),
                                            r = a.indexOf(e),
                                            s = (0, i.VZ)(e);
                                        if (null != s) {
                                            for (;
                                                (n = a[r + 1]) && (o = (0, i._C)(n, s)) && o.bottom >= 0;) r++;
                                            if (n) {
                                                let e = M(n, t);
                                                if (e) return;
                                                V(s, n)
                                            }
                                        }
                                    })(o, t)
                            }
                            switch ((0, r.EL)(e.detail.originalEvent)) {
                                case "j":
                                case "J":
                                    _(o, t);
                                    break;
                                case "k":
                                case "Shift+K":
                                    A(o, t);
                                    break;
                                case "o":
                                case "Enter":
                                case `${g}+Enter`:
                                    C(o, e.detail[d])
                            }
                        }
                    } else {
                        let o = H(t)[0];
                        if (o) {
                            if (n) f && "Control+n" === (0, r.EL)(e.detail.originalEvent) && M(o, t), "ArrowDown" === (0, r.EL)(e.detail.originalEvent) && M(o, t);
                            else {
                                if (f) switch ((0, r.EL)(e.detail.originalEvent)) {
                                    case "Control+n":
                                    case "Control+v":
                                        M(o, t)
                                }
                                "j" === (0, r.EL)(e.detail.originalEvent) && M(o, t)
                            }
                        }
                    }
                    if (n) {
                        if (f) switch ((0, r.EL)(e.detail.originalEvent)) {
                            case "Control+n":
                            case "Control+p":
                                e.preventDefault()
                        }
                        switch ((0, r.EL)(e.detail.originalEvent)) {
                            case "ArrowUp":
                            case "ArrowDown":
                            case "Enter":
                                e.preventDefault()
                        }
                    } else {
                        if (f) switch ((0, r.EL)(e.detail.originalEvent)) {
                            case "Control+n":
                            case "Control+p":
                            case "Control+v":
                            case "Alt+v":
                                e.preventDefault()
                        }
                        switch ((0, r.EL)(e.detail.originalEvent)) {
                            case "j":
                            case "k":
                            case "o":
                            case "Enter":
                            case `${d}+Enter`:
                                e.preventDefault()
                        }
                    }
                }
            }), (0, a.on)("click", ".js-active-navigation-container .js-navigation-item", function(e) {
                w(e)
            }), (0, a.on)("navigation:keyopen", ".js-active-navigation-container .js-navigation-item", function(e) {
                let t = e.currentTarget.classList.contains("js-navigation-open") ? e.currentTarget : e.currentTarget.querySelector(".js-navigation-open");
                if (t instanceof HTMLAnchorElement) {
                    if (e.detail.modifierKey) window.open(t.href, "_blank"), window.focus();
                    else {
                        let e = t.dispatchEvent(new MouseEvent("click", {
                            bubbles: !0,
                            cancelable: !0
                        }));
                        e && t.click()
                    }
                    e.preventDefault()
                } else w(e)
            });
            let L = [];

            function E(e) {
                let t = R();
                t && L.push(t), b(e)
            }

            function q(e) {
                S(e), x(e);
                let t = L.pop();
                t && b(t)
            }

            function k(e, t) {
                let n = t || e,
                    o = H(e)[0],
                    a = n.closest(".js-navigation-item") || o;
                if (b(e), a instanceof HTMLElement) {
                    let t = M(a, e);
                    if (t) return;
                    let n = (0, i.VZ)(a);
                    K(n, a)
                }
            }

            function x(e) {
                let t = e.querySelectorAll(".js-navigation-item.navigation-focus");
                for (let e of t) e.classList.remove("navigation-focus")
            }

            function T(e, t) {
                x(e), k(e, t)
            }

            function A(e, t) {
                let n = H(t),
                    o = n.indexOf(e),
                    a = n[o - 1];
                if (a) {
                    let e = M(a, t);
                    if (e) return;
                    let n = (0, i.VZ)(a);
                    "page" === D(t) ? V(n, a) : K(n, a)
                }
            }

            function _(e, t) {
                let n = H(t),
                    o = n.indexOf(e),
                    a = n[o + 1];
                if (a) {
                    let e = M(a, t);
                    if (e) return;
                    let n = (0, i.VZ)(a);
                    "page" === D(t) ? V(n, a) : K(n, a)
                }
            }

            function C(e, t = !1) {
                (0, a.f)(e, "navigation:keyopen", {
                    modifierKey: t
                })
            }

            function M(e, t) {
                return !(0, a.f)(e, "navigation:focus") || (x(t), e.classList.add("navigation-focus"), !1)
            }

            function R() {
                return document.querySelector(".js-active-navigation-container")
            }

            function H(e) {
                let t = [];
                for (let n of e.querySelectorAll(".js-navigation-item")) n instanceof HTMLElement && (0, u.Z)(n) && t.push(n);
                return t
            }

            function D(e) {
                return e.getAttribute("data-navigation-scroll") || "item"
            }

            function V(e, t, n = "smooth") {
                let o = (0, i._C)(t, e);
                o && (o.bottom <= 0 ? t.scrollIntoView({
                    behavior: n,
                    block: "start"
                }) : o.top <= 0 && t.scrollIntoView({
                    behavior: n,
                    block: "end"
                }))
            }

            function K(e, t) {
                let n = (0, i.oE)(t, e),
                    o = (0, i._C)(t, e);
                if (null != n && null != o) {
                    if (o.bottom <= 0 && document.body) {
                        let t = null != e.offsetParent ? e.scrollHeight : document.body.scrollHeight,
                            a = t - (n.bottom + o.height);
                        l(e, {
                            top: a
                        })
                    } else o.top <= 0 && l(e, {
                        top: n.top
                    })
                }
            }
        },
        15754: (e, t, n) => {
            n.d(t, {
                O1: () => u,
                ZU: () => i,
                aZ: () => c,
                d5: () => s,
                eN: () => a,
                lm: () => f,
                th: () => d
            });
            var o = n(86283);
            let a = "GraphQLTraces",
                i = "GraphQLTracingRefresh",
                r = decodeURIComponent(new URLSearchParams(o.ssrSafeLocation.search).get("disable_clusters") || "").split(",").filter(e => "" !== e);

            function s(e) {
                if (!o.iG || !c() || !e) return;
                let t = o.iG;
                t[a] || (t[a] = []), e.__trace && (t[a].push(e.__trace), "function" == typeof t[i] && t[i]())
            }

            function c() {
                let e = o.iG;
                return "true" === new URLSearchParams(o.ssrSafeLocation.search).get("_tracing") || void 0 !== e[a]
            }

            function l() {
                return r.length > 0
            }

            function u(e) {
                if (!c() && !l()) return e;
                let t = new URL(e, o.ssrSafeLocation.origin);
                return c() && t.searchParams.set("_tracing", "true"), l() && t.searchParams.set("disable_clusters", r.join(",")), t.pathname + t.search
            }

            function f(e) {
                return r.indexOf(e) > -1
            }

            function d(e) {
                let t = r.indexOf(e);
                t > -1 ? r.splice(t, 1) : r.push(e);
                let n = new URLSearchParams(o.ssrSafeLocation.search);
                n.set("disable_clusters", r.join(","));
                let a = o.ssrSafeLocation;
                a.search = n.toString()
            }
        }
    }
]);
//# sourceMappingURL=app_assets_modules_github_jump-to_ts-1da77486905d.js.map