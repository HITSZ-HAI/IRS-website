"use strict";
(globalThis.webpackChunk = globalThis.webpackChunk || []).push([
    ["ui_packages_trusted-types-policies_policy_ts-ui_packages_trusted-types_trusted-types_ts-node_-38f8f1", "vendors-node_modules_github_hydro-analytics-client_dist_analytics-client_js-node_modules_gith-ffadee0", "vendors-node_modules_github_hydro-analytics-client_dist_analytics-client_js-node_modules_gith-ffadee1", "vendors-node_modules_github_hydro-analytics-client_dist_analytics-client_js-node_modules_gith-ffadee2", "vendors-node_modules_github_hydro-analytics-client_dist_analytics-client_js-node_modules_gith-ffadee3"], {
        95253: (e, t, n) => {
            let i;
            n.d(t, {
                YT: () => p,
                qP: () => h,
                yM: () => m
            });
            var r = n(88149),
                s = n(86058),
                o = n(44544),
                a = n(71643);
            let {
                getItem: l
            } = (0, o.Z)("localStorage"), c = "dimension_", u = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "scid"];
            try {
                let e = (0, r.n)("octolytics");
                delete e.baseContext, i = new s.R(e)
            } catch (e) {}

            function d(e) {
                let t = (0, r.n)("octolytics").baseContext || {};
                if (t)
                    for (let [e, n] of (delete t.app_id, delete t.event_url, delete t.host, Object.entries(t))) e.startsWith(c) && (t[e.replace(c, "")] = n, delete t[e]);
                let n = document.querySelector("meta[name=visitor-payload]");
                if (n) {
                    let e = JSON.parse(atob(n.content));
                    Object.assign(t, e)
                }
                let i = new URLSearchParams(window.location.search);
                for (let [e, n] of i) u.includes(e.toLowerCase()) && (t[e] = n);
                return t.staff = (0, a.B)().toString(), Object.assign(t, e)
            }

            function p(e) {
                i ? .sendPageView(d(e))
            }

            function h(e, t = {}) {
                let n = document.head ? .querySelector('meta[name="current-catalog-service"]') ? .content,
                    r = n ? {
                        service: n
                    } : {};
                for (let [e, n] of Object.entries(t)) null != n && (r[e] = `${n}`);
                if (i) {
                    let t = e || "unknown";
                    d(r), i.sendEvent(t, d(r))
                }
            }

            function m(e) {
                return Object.fromEntries(Object.entries(e).map(([e, t]) => [e, JSON.stringify(t)]))
            }
        },
        7180: (e, t, n) => {
            n.d(t, {
                O: () => c,
                d: () => TrustedTypesPolicyError
            });
            var i = n(46426),
                r = n(71643),
                s = n(24601),
                o = n(27856),
                a = n.n(o),
                l = n(95253);
            let TrustedTypesPolicyError = class TrustedTypesPolicyError extends Error {};
            let c = {
                apply: function({
                    policy: e,
                    policyName: t,
                    fallback: n,
                    fallbackOnError: o = !1,
                    sanitize: c,
                    silenceErrorReporting: u = !1
                }) {
                    try {
                        if ((0, i.c)("BYPASS_TRUSTED_TYPES_POLICY_RULES")) return n;
                        (0, r.b)({
                            incrementKey: "TRUSTED_TYPES_POLICY_CALLED",
                            trustedTypesPolicyName: t
                        }, !1, .1);
                        let s = e();
                        return c && new Promise(e => {
                            let n = window.performance.now(),
                                i = a().sanitize(s, {
                                    FORBID_ATTR: []
                                }),
                                r = window.performance.now();
                            if (s.length !== i.length) {
                                let o = Error("Trusted Types policy output sanitized"),
                                    a = o.stack ? .slice(0, 1e3),
                                    c = s.slice(0, 250);
                                (0, l.qP)("trusted_types_policy.sanitize", {
                                    policyName: t,
                                    output: c,
                                    stack: a,
                                    outputLength: s.length,
                                    sanitizedLength: i.length,
                                    executionTime: r - n
                                }), e(s)
                            }
                        }), s
                    } catch (e) {
                        if (e instanceof TrustedTypesPolicyError || (u || (0, s.eK)(e), (0, r.b)({
                                incrementKey: "TRUSTED_TYPES_POLICY_ERROR",
                                trustedTypesPolicyName: t
                            }), !o)) throw e
                    }
                    return n
                }
            }
        },
        22490: (e, t, n) => {
            n.d(t, {
                ZO: () => c
            });
            var i = n(86283),
                r = n(71643);

            function s(e) {
                return () => {
                    throw TypeError(`The policy does not implement the function ${e}`)
                }
            }
            let o = {
                    createHTML: s("createHTML"),
                    createScript: s("createScript"),
                    createScriptURL: s("createScriptURL")
                },
                a = new Map,
                l = globalThis.trustedTypes ? ? {
                    createPolicy: (e, t) => ({
                        name: e,
                        ...o,
                        ...t
                    })
                },
                c = {
                    createPolicy: (e, t) => {
                        if (a.has(e)) return (0, r.b)({
                            incrementKey: "TRUSTED_TYPES_POLICY_INITIALIZED_TWICE"
                        }), a.get(e); {
                            let n = l.createPolicy(e, t);
                            return a.set(e, n), n
                        }
                    }
                },
                u = !1;
            i.n4 ? .addEventListener("securitypolicyviolation", e => {
                "require-trusted-types-for" !== e.violatedDirective || u || (console.warn(`Hi fellow Hubber!
    You're probably seeing a Report Only Trusted Types error near this message. This is intended behaviour, staff-only,
    does not impact application control flow, and is used solely for statistic collection. Unfortunately we
    can't gather these statistics without adding the above warnings to your console. Sorry about that!
    Feel free to drop by #pse-architecture if you have any additional questions about Trusted Types or CSP.`), u = !0)
            })
        },
        10160: (e, t, n) => {
            n.d(t, {
                Z: () => Combobox
            });
            let Combobox = class Combobox {
                constructor(e, t, {
                    tabInsertsSuggestions: n,
                    defaultFirstOption: i
                } = {}) {
                    this.input = e, this.list = t, this.tabInsertsSuggestions = null == n || n, this.defaultFirstOption = null != i && i, this.isComposing = !1, t.id || (t.id = `combobox-${Math.random().toString().slice(2,6)}`), this.ctrlBindings = !!navigator.userAgent.match(/Macintosh/), this.keyboardEventHandler = e => (function(e, t) {
                        if (!e.shiftKey && !e.metaKey && !e.altKey && (t.ctrlBindings || !e.ctrlKey) && !t.isComposing) switch (e.key) {
                            case "Enter":
                                r(t.input, t.list) && e.preventDefault();
                                break;
                            case "Tab":
                                t.tabInsertsSuggestions && r(t.input, t.list) && e.preventDefault();
                                break;
                            case "Escape":
                                t.clearSelection();
                                break;
                            case "ArrowDown":
                                t.navigate(1), e.preventDefault();
                                break;
                            case "ArrowUp":
                                t.navigate(-1), e.preventDefault();
                                break;
                            case "n":
                                t.ctrlBindings && e.ctrlKey && (t.navigate(1), e.preventDefault());
                                break;
                            case "p":
                                t.ctrlBindings && e.ctrlKey && (t.navigate(-1), e.preventDefault());
                                break;
                            default:
                                if (e.ctrlKey) break;
                                t.clearSelection()
                        }
                    })(e, this), this.compositionEventHandler = e => (function(e, t) {
                        t.isComposing = "compositionstart" === e.type;
                        let n = document.getElementById(t.input.getAttribute("aria-controls") || "");
                        n && t.clearSelection()
                    })(e, this), this.inputHandler = this.clearSelection.bind(this), e.setAttribute("role", "combobox"), e.setAttribute("aria-controls", t.id), e.setAttribute("aria-expanded", "false"), e.setAttribute("aria-autocomplete", "list"), e.setAttribute("aria-haspopup", "listbox")
                }
                destroy() {
                    this.clearSelection(), this.stop(), this.input.removeAttribute("role"), this.input.removeAttribute("aria-controls"), this.input.removeAttribute("aria-expanded"), this.input.removeAttribute("aria-autocomplete"), this.input.removeAttribute("aria-haspopup")
                }
                start() {
                    this.input.setAttribute("aria-expanded", "true"), this.input.addEventListener("compositionstart", this.compositionEventHandler), this.input.addEventListener("compositionend", this.compositionEventHandler), this.input.addEventListener("input", this.inputHandler), this.input.addEventListener("keydown", this.keyboardEventHandler), this.list.addEventListener("click", i), this.indicateDefaultOption()
                }
                stop() {
                    this.clearSelection(), this.input.setAttribute("aria-expanded", "false"), this.input.removeEventListener("compositionstart", this.compositionEventHandler), this.input.removeEventListener("compositionend", this.compositionEventHandler), this.input.removeEventListener("input", this.inputHandler), this.input.removeEventListener("keydown", this.keyboardEventHandler), this.list.removeEventListener("click", i)
                }
                indicateDefaultOption() {
                    var e;
                    this.defaultFirstOption && (null === (e = Array.from(this.list.querySelectorAll('[role="option"]:not([aria-disabled="true"])')).filter(s)[0]) || void 0 === e || e.setAttribute("data-combobox-option-default", "true"))
                }
                navigate(e = 1) {
                    let t = Array.from(this.list.querySelectorAll('[aria-selected="true"]')).filter(s)[0],
                        n = Array.from(this.list.querySelectorAll('[role="option"]')).filter(s),
                        i = n.indexOf(t);
                    if (i === n.length - 1 && 1 === e || 0 === i && -1 === e) {
                        this.clearSelection(), this.input.focus();
                        return
                    }
                    let r = 1 === e ? 0 : n.length - 1;
                    if (t && i >= 0) {
                        let t = i + e;
                        t >= 0 && t < n.length && (r = t)
                    }
                    let o = n[r];
                    if (o)
                        for (let e of n) {
                            var a;
                            e.removeAttribute("data-combobox-option-default"), o === e ? (this.input.setAttribute("aria-activedescendant", o.id), o.setAttribute("aria-selected", "true"), ! function(e, t) {
                                let n = e.scrollTop,
                                    i = n + e.clientHeight,
                                    r = t.offsetTop,
                                    s = r + t.clientHeight;
                                return r >= n && s <= i
                            }(a = this.list, o) && (a.scrollTop = o.offsetTop)) : e.removeAttribute("aria-selected")
                        }
                }
                clearSelection() {
                    for (let e of (this.input.removeAttribute("aria-activedescendant"), this.list.querySelectorAll('[aria-selected="true"]'))) e.removeAttribute("aria-selected");
                    this.indicateDefaultOption()
                }
            };

            function i(e) {
                if (!(e.target instanceof Element)) return;
                let t = e.target.closest('[role="option"]');
                t && "true" !== t.getAttribute("aria-disabled") && function(e, t) {
                    e.dispatchEvent(new CustomEvent("combobox-commit", {
                        bubbles: !0,
                        detail: t
                    }))
                }(t, {
                    event: e
                })
            }

            function r(e, t) {
                let n = t.querySelector('[aria-selected="true"], [data-combobox-option-default="true"]');
                return !!n && ("true" === n.getAttribute("aria-disabled") || (n.click(), !0))
            }

            function s(e) {
                return !e.hidden && !(e instanceof HTMLInputElement && "hidden" === e.type) && (e.offsetWidth > 0 || e.offsetHeight > 0)
            }
        },
        86058: (e, t, n) => {
            n.d(t, {
                R: () => AnalyticsClient
            });
            var i = n(82918);
            let AnalyticsClient = class AnalyticsClient {
                constructor(e) {
                    this.options = e
                }
                get collectorUrl() {
                    return this.options.collectorUrl
                }
                get clientId() {
                    return this.options.clientId ? this.options.clientId : (0, i.b)()
                }
                createEvent(e) {
                    return {
                        page: location.href,
                        title: document.title,
                        context: { ...this.options.baseContext,
                            ...e
                        }
                    }
                }
                sendPageView(e) {
                    let t = this.createEvent(e);
                    this.send({
                        page_views: [t]
                    })
                }
                sendEvent(e, t) {
                    let n = { ...this.createEvent(t),
                        type: e
                    };
                    this.send({
                        events: [n]
                    })
                }
                send({
                    page_views: e,
                    events: t
                }) {
                    let n = {
                            client_id: this.clientId,
                            page_views: e,
                            events: t,
                            request_context: {
                                referrer: function() {
                                    let e;
                                    try {
                                        e = window.top.document.referrer
                                    } catch (t) {
                                        if (window.parent) try {
                                            e = window.parent.document.referrer
                                        } catch (e) {}
                                    }
                                    return "" === e && (e = document.referrer), e
                                }(),
                                user_agent: navigator.userAgent,
                                screen_resolution: function() {
                                    try {
                                        return `${screen.width}x${screen.height}`
                                    } catch (e) {
                                        return "unknown"
                                    }
                                }(),
                                browser_resolution: function() {
                                    let e = 0,
                                        t = 0;
                                    try {
                                        return "number" == typeof window.innerWidth ? (t = window.innerWidth, e = window.innerHeight) : null != document.documentElement && null != document.documentElement.clientWidth ? (t = document.documentElement.clientWidth, e = document.documentElement.clientHeight) : null != document.body && null != document.body.clientWidth && (t = document.body.clientWidth, e = document.body.clientHeight), `${t}x${e}`
                                    } catch (e) {
                                        return "unknown"
                                    }
                                }(),
                                browser_languages: navigator.languages ? navigator.languages.join(",") : navigator.language || "",
                                pixel_ratio: window.devicePixelRatio,
                                timestamp: Date.now(),
                                tz_seconds: -60 * new Date().getTimezoneOffset()
                            }
                        },
                        i = JSON.stringify(n);
                    try {
                        if (navigator.sendBeacon) {
                            navigator.sendBeacon(this.collectorUrl, i);
                            return
                        }
                    } catch {}
                    fetch(this.collectorUrl, {
                        method: "POST",
                        cache: "no-cache",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: i,
                        keepalive: !1
                    })
                }
            }
        },
        88149: (e, t, n) => {
            n.d(t, {
                n: () => i
            });

            function i(e = "ha") {
                let t;
                let n = {},
                    i = document.head.querySelectorAll(`meta[name^="${e}-"]`);
                for (let r of Array.from(i)) {
                    let {
                        name: i,
                        content: s
                    } = r, o = i.replace(`${e}-`, "").replace(/-/g, "_");
                    "url" === o ? t = s : n[o] = s
                }
                if (!t) throw Error(`AnalyticsClient ${e}-url meta tag not found`);
                return {
                    collectorUrl: t,
                    ...Object.keys(n).length > 0 ? {
                        baseContext: n
                    } : {}
                }
            }
        },
        20845: (e, t, n) => {
            n.d(t, {
                js: () => TemplateResult,
                dy: () => E,
                sY: () => b,
                Au: () => A
            });
            let i = new Map;

            function r(e) {
                if (i.has(e)) return i.get(e);
                let t = e.length,
                    n = 0,
                    r = 0,
                    s = 0,
                    o = [];
                for (let i = 0; i < t; i += 1) {
                    let t = e[i],
                        a = e[i + 1],
                        l = e[i - 1];
                    "{" === t && "{" === a && "\\" !== l ? (1 === (s += 1) && (r = i), i += 1) : "}" === t && "}" === a && "\\" !== l && s && 0 == (s -= 1) && (r > n && (o.push(Object.freeze({
                        type: "string",
                        start: n,
                        end: r,
                        value: e.slice(n, r)
                    })), n = r), o.push(Object.freeze({
                        type: "part",
                        start: r,
                        end: i + 2,
                        value: e.slice(n + 2, i).trim()
                    })), i += 1, n = i + 1)
                }
                return n < t && o.push(Object.freeze({
                    type: "string",
                    start: n,
                    end: t,
                    value: e.slice(n, t)
                })), i.set(e, Object.freeze(o)), i.get(e)
            }
            let s = new WeakMap,
                o = new WeakMap;
            let AttributeTemplatePart = class AttributeTemplatePart {
                constructor(e, t) {
                    this.expression = t, s.set(this, e), e.updateParent("")
                }
                get attributeName() {
                    return s.get(this).attr.name
                }
                get attributeNamespace() {
                    return s.get(this).attr.namespaceURI
                }
                get value() {
                    return o.get(this)
                }
                set value(e) {
                    o.set(this, e || ""), s.get(this).updateParent(e)
                }
                get element() {
                    return s.get(this).element
                }
                get booleanValue() {
                    return s.get(this).booleanValue
                }
                set booleanValue(e) {
                    s.get(this).booleanValue = e
                }
            };
            let AttributeValueSetter = class AttributeValueSetter {
                constructor(e, t) {
                    this.element = e, this.attr = t, this.partList = []
                }
                get booleanValue() {
                    return this.element.hasAttributeNS(this.attr.namespaceURI, this.attr.name)
                }
                set booleanValue(e) {
                    if (1 !== this.partList.length) throw new DOMException("Operation not supported", "NotSupportedError");
                    this.partList[0].value = e ? "" : null
                }
                append(e) {
                    this.partList.push(e)
                }
                updateParent(e) {
                    if (1 === this.partList.length && null === e) this.element.removeAttributeNS(this.attr.namespaceURI, this.attr.name);
                    else {
                        let e = this.partList.map(e => "string" == typeof e ? e : e.value).join("");
                        this.element.setAttributeNS(this.attr.namespaceURI, this.attr.name, e)
                    }
                }
            };
            let a = new WeakMap;
            let NodeTemplatePart = class NodeTemplatePart {
                constructor(e, t) {
                    this.expression = t, a.set(this, [e]), e.textContent = ""
                }
                get value() {
                    return a.get(this).map(e => e.textContent).join("")
                }
                set value(e) {
                    this.replace(e)
                }
                get previousSibling() {
                    return a.get(this)[0].previousSibling
                }
                get nextSibling() {
                    return a.get(this)[a.get(this).length - 1].nextSibling
                }
                replace(...e) {
                    let t = e.map(e => "string" == typeof e ? new Text(e) : e);
                    for (let e of (t.length || t.push(new Text("")), a.get(this)[0].before(...t), a.get(this))) e.remove();
                    a.set(this, t)
                }
            };

            function l(e) {
                return {
                    processCallback(t, n, i) {
                        var r;
                        if ("object" == typeof i && i) {
                            for (let t of n)
                                if (t.expression in i) {
                                    let n = null !== (r = i[t.expression]) && void 0 !== r ? r : "";
                                    e(t, n)
                                }
                        }
                    }
                }
            }

            function c(e, t) {
                e.value = String(t)
            }

            function u(e, t) {
                return "boolean" == typeof t && e instanceof AttributeTemplatePart && "boolean" == typeof e.element[e.attributeName] && (e.booleanValue = t, !0)
            }
            let d = l(c);
            l((e, t) => {
                u(e, t) || c(e, t)
            });
            let p = new WeakMap,
                h = new WeakMap;
            let TemplateInstance = class TemplateInstance extends DocumentFragment {
                constructor(e, t, n = d) {
                    var i, s;
                    super(), Object.getPrototypeOf(this) !== TemplateInstance.prototype && Object.setPrototypeOf(this, TemplateInstance.prototype), this.appendChild(e.content.cloneNode(!0)), h.set(this, Array.from(function*(e) {
                        let t;
                        let n = e.ownerDocument.createTreeWalker(e, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null, !1);
                        for (; t = n.nextNode();)
                            if (t instanceof Element && t.hasAttributes())
                                for (let e = 0; e < t.attributes.length; e += 1) {
                                    let n = t.attributes.item(e);
                                    if (n && n.value.includes("{{")) {
                                        let e = new AttributeValueSetter(t, n);
                                        for (let t of r(n.value))
                                            if ("string" === t.type) e.append(t.value);
                                            else {
                                                let n = new AttributeTemplatePart(e, t.value);
                                                e.append(n), yield n
                                            }
                                    }
                                } else if (t instanceof Text && t.textContent && t.textContent.includes("{{")) {
                                    let e = r(t.textContent);
                                    for (let n = 0; n < e.length; n += 1) {
                                        let i = e[n];
                                        i.end < t.textContent.length && t.splitText(i.end), "part" === i.type && (yield new NodeTemplatePart(t, i.value));
                                        break
                                    }
                                }
                    }(this))), p.set(this, n), null === (s = (i = p.get(this)).createCallback) || void 0 === s || s.call(i, this, h.get(this), t), p.get(this).processCallback(this, h.get(this), t)
                }
                update(e) {
                    p.get(this).processCallback(this, h.get(this), e)
                }
            };
            let m = new WeakMap,
                f = new WeakMap,
                g = new WeakMap;
            let TemplateResult = class TemplateResult {
                constructor(e, t, n) {
                    this.strings = e, this.values = t, this.processor = n
                }
                static setCSPTrustedTypesPolicy(e) {
                    TemplateResult.cspTrustedTypesPolicy = e
                }
                get template() {
                    var e, t;
                    if (m.has(this.strings)) return m.get(this.strings); {
                        let n = document.createElement("template"),
                            i = this.strings.length - 1,
                            r = this.strings.reduce((e, t, n) => e + t + (n < i ? `{{ ${n} }}` : ""), ""),
                            s = null !== (t = null === (e = TemplateResult.cspTrustedTypesPolicy) || void 0 === e ? void 0 : e.createHTML(r)) && void 0 !== t ? t : r;
                        return n.innerHTML = s, m.set(this.strings, n), n
                    }
                }
                renderInto(e) {
                    let t = this.template;
                    if (f.get(e) !== t) {
                        f.set(e, t);
                        let n = new TemplateInstance(t, this.values, this.processor);
                        g.set(e, n), e instanceof NodeTemplatePart ? e.replace(...n.children) : e.appendChild(n);
                        return
                    }
                    g.get(e).update(this.values)
                }
            };

            function b(e, t) {
                e.renderInto(t)
            }
            TemplateResult.cspTrustedTypesPolicy = null;
            let y = new WeakSet;

            function v(e) {
                return (...t) => {
                    let n = e(...t);
                    return y.add(n), n
                }
            }
            let T = new WeakMap;
            let EventHandler = class EventHandler {
                constructor(e, t) {
                    this.element = e, this.type = t, this.element.addEventListener(this.type, this), T.get(this.element).set(this.type, this)
                }
                set(e) {
                    "function" == typeof e ? this.handleEvent = e.bind(this.element) : "object" == typeof e && "function" == typeof e.handleEvent ? this.handleEvent = e.handleEvent.bind(e) : (this.element.removeEventListener(this.type, this), T.get(this.element).delete(this.type))
                }
                static
                for (e) {
                    T.has(e.element) || T.set(e.element, new Map);
                    let t = e.attributeName.slice(2),
                        n = T.get(e.element);
                    return n.has(t) ? n.get(t) : new EventHandler(e.element, t)
                }
            };

            function w(e, t) {
                y.has(t) && (t(e), 1) || u(e, t) || e instanceof AttributeTemplatePart && e.attributeName.startsWith("on") && (EventHandler.for(e).set(t), e.element.removeAttributeNS(e.attributeNamespace, e.attributeName), 1) || t instanceof TemplateResult && e instanceof NodeTemplatePart && (t.renderInto(e), 1) || t instanceof DocumentFragment && e instanceof NodeTemplatePart && (t.childNodes.length && e.replace(...t.childNodes), 1) || function(e, t) {
                    if (!("object" == typeof t && Symbol.iterator in t)) return !1;
                    if (!(e instanceof NodeTemplatePart)) return e.value = Array.from(t).join(" "), !0; {
                        let n = [];
                        for (let e of t)
                            if (e instanceof TemplateResult) {
                                let t = document.createDocumentFragment();
                                e.renderInto(t), n.push(...t.childNodes)
                            } else e instanceof DocumentFragment ? n.push(...e.childNodes) : n.push(String(e));
                        return n.length && e.replace(...n), !0
                    }
                }(e, t) || c(e, t)
            }
            let _ = l(w);

            function E(e, ...t) {
                return new TemplateResult(e, t, _)
            }
            let S = new WeakMap;
            v((...e) => t => {
                S.has(t) || S.set(t, {
                    i: e.length
                });
                let n = S.get(t);
                for (let i = 0; i < e.length; i += 1) e[i] instanceof Promise ? Promise.resolve(e[i]).then(e => {
                    i < n.i && (n.i = i, w(t, e))
                }) : i <= n.i && (n.i = i, w(t, e[i]))
            });
            let A = v(e => t => {
                var n, i;
                if (!(t instanceof NodeTemplatePart)) return;
                let r = document.createElement("template"),
                    s = null !== (i = null === (n = TemplateResult.cspTrustedTypesPolicy) || void 0 === n ? void 0 : n.createHTML(e)) && void 0 !== i ? i : e;
                r.innerHTML = s;
                let o = document.importNode(r.content, !0);
                t.replace(...o.childNodes)
            })
        }
    }
]);
//# sourceMappingURL=ui_packages_trusted-types-policies_policy_ts-ui_packages_trusted-types_trusted-types_ts-node_-38f8f1-24ea2355a3d2.js.map