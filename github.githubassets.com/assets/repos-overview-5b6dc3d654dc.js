"use strict";
(globalThis.webpackChunk = globalThis.webpackChunk || []).push([
    ["repos-overview"], {
        82102: (e, t, r) => {
            var n = r(9067),
                o = r(85893),
                s = r(67294),
                a = r(80895),
                i = r(34232),
                c = r(32769),
                d = r(17891),
                l = r(90874),
                u = r(69942);

            function _({
                initialPayload: e,
                appPayload: t
            }) {
                let [r] = s.useState(e ? .repo), [n] = s.useState(e ? .currentUser), _ = (0, s.useMemo)(() => ({}), []);
                return (0, s.useEffect)(() => {
                    let e = document.querySelector(".footer");
                    e && (e.querySelector(".mt-6") ? .classList.replace("mt-6", "mt-0"), e.querySelector(".border-top") ? .classList.remove("border-top"))
                }, []), (0, o.jsx)(d.E.Provider, {
                    value: t,
                    children: (0, o.jsx)(u.xp, {
                        initialValue: u._G.xxxlarge,
                        children: (0, o.jsx)(i.n, {
                            appName: "react-code-view-overview",
                            category: "",
                            metadata: _,
                            children: (0, o.jsx)(l.M, {
                                user: n,
                                children: (0, o.jsx)(c.d, {
                                    repository: r,
                                    children: (0, o.jsx)(a.Z, {
                                        initialPayload: e
                                    })
                                })
                            })
                        })
                    })
                })
            }
            try {
                _.displayName || (_.displayName = "ReposOverview")
            } catch {}(0, n.t)("repos-overview", {
                Component: _
            })
        },
        15345: (e, t, r) => {
            r.d(t, {
                N: () => o,
                x: () => s
            });
            var n = r(86283);

            function o(e, t) {
                s((e.getAttribute("aria-label") || e.innerText || "").trim(), t)
            }

            function s(e, t) {
                let {
                    assertive: r
                } = t ? ? {};
                ! function(e, t) {
                    let r = n.n4 ? .querySelector(t ? "#js-global-screen-reader-notice-assertive" : "#js-global-screen-reader-notice");
                    r && (r.textContent === e ? r.textContent = `${e}\u00A0` : r.textContent = e)
                }(e, r)
            }
        },
        95253: (e, t, r) => {
            let n;
            r.d(t, {
                YT: () => _,
                qP: () => m,
                yM: () => p
            });
            var o = r(88149),
                s = r(86058),
                a = r(44544),
                i = r(71643);
            let {
                getItem: c
            } = (0, a.Z)("localStorage"), d = "dimension_", l = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "scid"];
            try {
                let e = (0, o.n)("octolytics");
                delete e.baseContext, n = new s.R(e)
            } catch (e) {}

            function u(e) {
                let t = (0, o.n)("octolytics").baseContext || {};
                if (t)
                    for (let [e, r] of (delete t.app_id, delete t.event_url, delete t.host, Object.entries(t))) e.startsWith(d) && (t[e.replace(d, "")] = r, delete t[e]);
                let r = document.querySelector("meta[name=visitor-payload]");
                if (r) {
                    let e = JSON.parse(atob(r.content));
                    Object.assign(t, e)
                }
                let n = new URLSearchParams(window.location.search);
                for (let [e, r] of n) l.includes(e.toLowerCase()) && (t[e] = r);
                return t.staff = (0, i.B)().toString(), Object.assign(t, e)
            }

            function _(e) {
                n ? .sendPageView(u(e))
            }

            function m(e, t = {}) {
                let r = document.head ? .querySelector('meta[name="current-catalog-service"]') ? .content,
                    o = r ? {
                        service: r
                    } : {};
                for (let [e, r] of Object.entries(t)) null != r && (o[e] = `${r}`);
                if (n) {
                    let t = e || "unknown";
                    u(o), n.sendEvent(t, u(o))
                }
            }

            function p(e) {
                return Object.fromEntries(Object.entries(e).map(([e, t]) => [e, JSON.stringify(t)]))
            }
        },
        96843: (e, t, r) => {
            r.d(t, {
                e: () => DeferredRegistry
            });
            let DeferredRegistry = class DeferredRegistry {
                register(e, t) {
                    let r = this.registrationEntries[e];
                    r ? r.resolve ? .(t) : this.registrationEntries[e] = {
                        promise: Promise.resolve(t)
                    }
                }
                getRegistration(e) {
                    var t;
                    return (t = this.registrationEntries)[e] || (t[e] = new n), this.registrationEntries[e].promise
                }
                constructor() {
                    this.registrationEntries = {}
                }
            };
            let n = class Deferred {
                constructor() {
                    this.promise = new Promise(e => {
                        this.resolve = e
                    })
                }
            }
        },
        9067: (e, t, r) => {
            r.d(t, {
                t: () => l
            });
            var n = r(96843);
            let o = new n.e;
            var s = r(85893),
                a = r(76006),
                i = r(88003),
                c = r(32369);
            let d = class ReactPartialElement extends i.S {
                async getReactNode(e) {
                    var t;
                    let {
                        Component: r
                    } = await (t = this.name, o.getRegistration(t));
                    return (0, s.jsx)(c.S, {
                        partialName: this.name,
                        embeddedData: e,
                        Component: r,
                        wasServerRendered: this.hasSSRContent,
                        ssrError: !!this.ssrError
                    })
                }
                constructor(...e) {
                    super(...e), this.nameAttribute = "partial-name"
                }
            };

            function l(e, t) {
                o.register(e, t)
            }
            d = function(e, t, r, n) {
                var o, s = arguments.length,
                    a = s < 3 ? t : null === n ? n = Object.getOwnPropertyDescriptor(t, r) : n;
                if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) a = Reflect.decorate(e, t, r, n);
                else
                    for (var i = e.length - 1; i >= 0; i--)(o = e[i]) && (a = (s < 3 ? o(a) : s > 3 ? o(t, r, a) : o(t, r)) || a);
                return s > 3 && a && Object.defineProperty(t, r, a), a
            }([a.Ih], d)
        },
        34634: (e, t, r) => {
            r.d(t, {
                A: () => o
            });
            var n = r(67294);
            let o = (0, n.createContext)({})
        },
        17891: (e, t, r) => {
            r.d(t, {
                E: () => o,
                M: () => s
            });
            var n = r(67294);
            let o = (0, n.createContext)(void 0);

            function s() {
                let e = (0, n.useContext)(o);
                return e
            }
        },
        89226: (e, t, r) => {
            r.d(t, {
                V: () => a
            });
            var n = r(67294),
                o = r(89250),
                s = r(34634);

            function a() {
                let e = (0, n.useContext)(s.A),
                    t = (0, o.TH)();
                return e[t.key]
            }
        },
        73968: (e, t, r) => {
            r.d(t, {
                T: () => o
            });
            var n = r(89226);

            function o() {
                let e = (0, n.V)(),
                    t = e && "loaded" === e.type ? e.data : void 0;
                return t ? .payload
            }
        },
        51145: (e, t, r) => {
            r.d(t, {
                Z: () => c
            });
            var n = r(44544);
            let {
                getItem: o,
                setItem: s,
                removeItem: a
            } = (0, n.Z)("localStorage"), i = "REACT_PROFILING_ENABLED", c = {
                enable: () => s(i, "true"),
                disable: () => a(i),
                isEnabled: () => !!o(i)
            }
        },
        76951: (e, t, r) => {
            r.d(t, {
                $g: () => SoftNavSuccessEvent,
                OV: () => SoftNavStartEvent,
                QW: () => SoftNavErrorEvent,
                Xr: () => SoftNavEndEvent
            });
            var n = r(55908);
            let o = class SoftNavEvent extends Event {
                constructor(e, t) {
                    super(t), this.mechanism = e
                }
            };
            let SoftNavStartEvent = class SoftNavStartEvent extends o {
                constructor(e) {
                    super(e, n.Q.START)
                }
            };
            let SoftNavSuccessEvent = class SoftNavSuccessEvent extends o {
                constructor(e, t) {
                    super(e, n.Q.SUCCESS), this.visitCount = t
                }
            };
            let SoftNavErrorEvent = class SoftNavErrorEvent extends o {
                constructor(e, t) {
                    super(e, n.Q.ERROR), this.error = t
                }
            };
            let SoftNavEndEvent = class SoftNavEndEvent extends o {
                constructor(e) {
                    super(e, n.Q.END)
                }
            }
        },
        75214: (e, t, r) => {
            r.d(t, {
                BT: () => l,
                FP: () => _,
                LD: () => d,
                TL: () => m,
                Yl: () => c,
                r_: () => u,
                u5: () => p
            });
            var n = r(55908),
                o = r(76951),
                s = r(55009),
                a = r(99484);
            let i = 0;

            function c() {
                i = 0, document.dispatchEvent(new Event(n.Q.INITIAL)), (0, a.XL)()
            }

            function d(e) {
                (0, a.sj)() || (document.dispatchEvent(new Event(n.Q.PROGRESS_BAR.START)), document.dispatchEvent(new o.OV(e)), (0, a.U6)(e), (0, a.J$)(), (0, a.Nt)(), (0, s.hY)())
            }

            function l(e = {}) {
                f(e) && (i += 1, document.dispatchEvent(new o.$g((0, a.Gj)(), i)), _(e))
            }

            function u(e = {}) {
                if (!f(e)) return;
                i = 0;
                let t = (0, a.Wl)() || a.jN;
                document.dispatchEvent(new o.QW((0, a.Gj)(), t)), v(), (0, s.t3)(t), (0, a.XL)()
            }

            function _(e = {}) {
                f(e) && (v(), document.dispatchEvent(new o.Xr((0, a.Gj)())), (0, a.pS)())
            }

            function m(e = {}) {
                f(e) && ((0, s.mr)(), document.dispatchEvent(new Event(n.Q.RENDER)))
            }

            function p() {
                document.dispatchEvent(new Event(n.Q.FRAME_UPDATE))
            }

            function v() {
                document.dispatchEvent(new Event(n.Q.PROGRESS_BAR.END))
            }

            function f({
                skipIfGoingToReactApp: e,
                allowedMechanisms: t = []
            } = {}) {
                return (0, a.sj)() && (0 === t.length || t.includes((0, a.Gj)())) && (!e || !(0, a.Nb)())
            }
        },
        55908: (e, t, r) => {
            r.d(t, {
                Q: () => n
            });
            let n = Object.freeze({
                INITIAL: "soft-nav:initial",
                START: "soft-nav:start",
                SUCCESS: "soft-nav:success",
                ERROR: "soft-nav:error",
                FRAME_UPDATE: "soft-nav:frame-update",
                END: "soft-nav:end",
                RENDER: "soft-nav:render",
                PROGRESS_BAR: {
                    START: "soft-nav:progress-bar:start",
                    END: "soft-nav:progress-bar:end"
                }
            })
        },
        55009: (e, t, r) => {
            r.d(t, {
                CF: () => a,
                aq: () => s,
                hY: () => i,
                mr: () => d,
                t3: () => c
            });
            var n = r(71643),
                o = r(99484);
            let s = "stats:soft-nav-duration",
                a = {
                    turbo: "TURBO",
                    react: "REACT",
                    "turbo.frame": "FRAME",
                    ui: "UI",
                    hard: "HARD"
                };

            function i() {
                performance.clearResourceTimings(), performance.mark(s)
            }

            function c(e) {
                (0, n.b)({
                    turboFailureReason: e,
                    turboStartUrl: (0, o.wP)(),
                    turboEndUrl: window.location.href
                })
            }

            function d() {
                let e = function() {
                    if (0 === performance.getEntriesByName(s).length) return null;
                    performance.measure(s, s);
                    let e = performance.getEntriesByName(s),
                        t = e.pop();
                    return t ? t.duration : null
                }();
                if (!e) return;
                let t = a[(0, o.Gj)()],
                    r = Math.round(e);
                t === a.react && document.dispatchEvent(new CustomEvent("staffbar-update", {
                    detail: {
                        duration: r
                    }
                })), (0, n.b)({
                    requestUrl: window.location.href,
                    softNavigationTiming: {
                        mechanism: t,
                        destination: (0, o.Nb)() || "rails",
                        duration: r,
                        initiator: (0, o.CI)() || "rails"
                    }
                })
            }
        },
        81738: (e, t, r) => {
            r.d(t, {
                b: () => s
            });
            var n = r(86283),
                o = r(67294);
            let s = void 0 !== n.iG ? .document ? .createElement ? o.useLayoutEffect : o.useEffect
        },
        88479: (e, t, r) => {
            r.d(t, {
                W: () => p,
                h: () => m
            });
            var n = r(85893),
                o = r(58989),
                s = r(89250),
                a = r(67294),
                i = r(55908),
                c = r(17891),
                d = r(73968);

            function l({
                App: e
            }) {
                return ! function() {
                    let e = (0, d.T)(),
                        t = (0, c.M)();
                    (0, a.useEffect)(() => {
                        function r() {
                            document.dispatchEvent(new CustomEvent("soft-nav:payload", {
                                detail: {
                                    payload: e,
                                    appPayload: t
                                }
                            }))
                        }
                        return document.addEventListener(i.Q.INITIAL, r), () => {
                            document.removeEventListener(i.Q.INITIAL, r)
                        }
                    }, []), (0, a.useEffect)(() => {
                        document.dispatchEvent(new CustomEvent("soft-nav:payload", {
                            detail: {
                                payload: e,
                                appPayload: t
                            }
                        }))
                    }, [t, e])
                }(), e ? (0, n.jsx)(e, {
                    children: (0, n.jsx)(s.j3, {})
                }) : (0, n.jsx)(s.j3, {})
            }
            try {
                l.displayName || (l.displayName = "AppWrapper")
            } catch {}
            var u = r(17551),
                _ = r(34634);
            let m = (0, a.createContext)(null);

            function p({
                App: e,
                appPayload: t,
                children: r,
                error: a,
                history: i,
                location: d,
                navigateOnError: p,
                Router: v,
                routes: f,
                routeStateMap: h
            }) {
                return (0, n.jsx)(o.i, {
                    routes: f,
                    history: i,
                    children: a && !p ? (0, n.jsx)(u.m, { ...a
                    }) : (0, n.jsx)(c.E.Provider, {
                        value: t,
                        children: (0, n.jsx)(m.Provider, {
                            value: a,
                            children: (0, n.jsx)(_.A.Provider, {
                                value: h,
                                children: (0, n.jsxs)(v, {
                                    location: d,
                                    navigator: i,
                                    children: [(0, n.jsx)(s.Z5, {
                                        children: (0, n.jsx)(s.AW, {
                                            element: (0, n.jsx)(l, {
                                                App: e
                                            }),
                                            children: f.map(({
                                                path: e,
                                                Component: t
                                            }, r) => (0, n.jsx)(s.AW, {
                                                path: e,
                                                element: (0, n.jsx)(t, {})
                                            }, r))
                                        })
                                    }), r]
                                })
                            })
                        })
                    })
                })
            }
            try {
                m.displayName || (m.displayName = "NavigationErrorContext")
            } catch {}
            try {
                p.displayName || (p.displayName = "AppRouter")
            } catch {}
        },
        72982: (e, t, r) => {
            r.d(t, {
                S: () => ErrorBoundary
            });
            var n = r(85893),
                o = r(17551),
                s = r(67294);
            let ErrorBoundary = class ErrorBoundary extends s.Component {
                static getDerivedStateFromError(e) {
                    return {
                        error: e
                    }
                }
                componentDidCatch(e) {
                    "function" == typeof this.props.onError ? this.props.onError(e) : setTimeout(() => {
                        throw e
                    })
                }
                render() {
                    return this.state.error ? this.props.fallback || (0, n.jsx)(o.m, {
                        type: "httpError"
                    }) : this.props.children
                }
                constructor(e) {
                    super(e), this.state = {
                        error: null
                    }
                }
            }
        },
        17551: (e, t, r) => {
            r.d(t, {
                m: () => i
            });
            var n = r(85893),
                o = r(75308),
                s = r(42483);
            let a = {
                404: "Didn\u2019t find anything here!",
                500: "Looks like something went wrong!"
            };

            function i({
                httpStatus: e,
                type: t
            }) {
                let r = "fetchError" === t ? "Looks like network is down!" : a[e || 500];
                return (0, n.jsxs)(o.Z, {
                    as: "h1",
                    tabIndex: -1,
                    sx: {
                        display: "flex",
                        flexDirection: "column",
                        minWidth: "100%",
                        minHeight: "100%",
                        alignItems: "center",
                        justifyContent: "center"
                    },
                    children: ["Error", e ? (0, n.jsx)(s.Z, {
                        sx: {
                            fontSize: "144px",
                            fontWeight: "bold",
                            lineHeight: 1
                        },
                        children: e
                    }) : null, (0, n.jsx)(s.Z, {
                        sx: {
                            fontSize: 4,
                            pt: 2
                        },
                        children: r
                    })]
                })
            }
            try {
                i.displayName || (i.displayName = "ErrorPage")
            } catch {}
        },
        32369: (e, t, r) => {
            r.d(t, {
                S: () => m
            });
            var n = r(85893),
                o = r(67294),
                s = r(1343),
                a = r(12599),
                i = r(58989),
                c = r(89250),
                d = r(78249);

            function l({
                children: e,
                history: t
            }) {
                let [r, s] = (0, o.useState)({
                    location: t.location
                });
                return (0, d.g)(() => t.listen(s), [t]), (0, n.jsx)(c.F0, {
                    location: r.location,
                    navigator: t,
                    children: e
                })
            }
            try {
                l.displayName || (l.displayName = "PartialRouter")
            } catch {}
            var u = r(77617),
                _ = r(59112);

            function m({
                partialName: e,
                embeddedData: t,
                Component: r,
                wasServerRendered: c,
                ssrError: d
            }) {
                let m = o.useRef(),
                    p = globalThis.window;
                m.current || (m.current = p ? (0, _.l)({
                    window: p
                }) : (0, a.PP)({
                    initialEntries: [{
                        pathname: "/"
                    }]
                }));
                let v = m.current;
                return (0, n.jsx)(s.R, {
                    appName: e,
                    wasServerRendered: c,
                    children: (0, n.jsx)(i.i, {
                        history: v,
                        routes: [],
                        children: (0, n.jsxs)(l, {
                            history: v,
                            children: [(0, n.jsx)(r, { ...t.props
                            }), (0, n.jsx)(u.P, {
                                ssrError: d
                            })]
                        })
                    })
                })
            }
            try {
                m.displayName || (m.displayName = "PartialEntry")
            } catch {}
        },
        88003: (e, t, r) => {
            r.d(t, {
                S: () => ReactBaseElement
            });
            var n = r(85893),
                o = r(76006),
                s = r(20745),
                a = r(67294),
                i = r(51145);

            function c(e, t, r, n) {
                var o, s = arguments.length,
                    a = s < 3 ? t : null === n ? n = Object.getOwnPropertyDescriptor(t, r) : n;
                if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) a = Reflect.decorate(e, t, r, n);
                else
                    for (var i = e.length - 1; i >= 0; i--)(o = e[i]) && (a = (s < 3 ? o(a) : s > 3 ? o(t, r, a) : o(t, r)) || a);
                return s > 3 && a && Object.defineProperty(t, r, a), a
            }
            let ReactBaseElement = class ReactBaseElement extends HTMLElement {
                get name() {
                    return this.getAttribute(this.nameAttribute)
                }
                get embeddedDataText() {
                    let e = this.embeddedData ? .textContent;
                    if (!e) throw Error(`No embedded data provided for react element ${this.name}`);
                    return e
                }
                get hasSSRContent() {
                    return "true" === this.getAttribute("data-ssr")
                }
                connectedCallback() {
                    this.renderReact()
                }
                disconnectedCallback() {
                    this.root ? .unmount(), this.root = void 0
                }
                async renderReact() {
                    let e = {
                        createRoot: s.s,
                        hydrateRoot: s.a
                    };
                    i.Z.isEnabled() && (e = await this.getReactDomWithProfiling());
                    let t = JSON.parse(this.embeddedDataText),
                        r = this.ssrError ? .textContent,
                        o = await this.getReactNode(t),
                        c = (0, n.jsx)(a.StrictMode, {
                            children: o
                        });
                    if (r && this.logSSRError(r), this.hasSSRContent) {
                        let t = this.querySelector('style[data-styled="true"]');
                        t && document.head.appendChild(t), this.root = e.hydrateRoot(this.reactRoot, c, {
                            onRecoverableError: () => {}
                        }), t && requestIdleCallback(() => {
                            t.parentElement ? .removeChild(t)
                        })
                    } else this.root = e.createRoot(this.reactRoot), this.root.render(c);
                    this.classList.add("loaded")
                }
                getReactDomWithProfiling() {
                    return r.e("react-profiling").then(r.t.bind(r, 62518, 19))
                }
                logSSRError(e) {
                    let t = JSON.parse(e),
                        r = function(e) {
                            if (!e.stacktrace) return "";
                            let t = "\n ",
                                r = e.stacktrace.map(e => {
                                    let {
                                        function: r,
                                        filename: n,
                                        lineno: o,
                                        colno: s
                                    } = e, a = `${t} at ${r} (${n}:${o}:${s})`;
                                    return t = " ", a
                                });
                            return r.join("\n")
                        }(t);
                    console.error("Error During Alloy SSR:", `${t.type}: ${t.value}
`, t, r)
                }
            };
            c([o.fA], ReactBaseElement.prototype, "embeddedData", void 0), c([o.fA], ReactBaseElement.prototype, "ssrError", void 0), c([o.fA], ReactBaseElement.prototype, "reactRoot", void 0)
        }
    },
    e => {
        var t = t => e(e.s = t);
        e.O(0, ["react-lib", "vendors-node_modules_dompurify_dist_purify_js", "vendors-node_modules_stacktrace-parser_dist_stack-trace-parser_esm_js-node_modules_github_bro-a4c183", "vendors-node_modules_primer_octicons-react_dist_index_esm_js-node_modules_primer_react_lib-es-2e8e7c", "vendors-node_modules_primer_react_lib-esm_Box_Box_js", "vendors-node_modules_primer_react_lib-esm_Button_Button_js", "vendors-node_modules_primer_react_lib-esm_ActionList_index_js", "vendors-node_modules_primer_behaviors_dist_esm_focus-zone_js", "vendors-node_modules_primer_react_lib-esm_Overlay_Overlay_js-node_modules_primer_react_lib-es-fa1130", "vendors-node_modules_primer_react_lib-esm_Text_Text_js-node_modules_primer_react_lib-esm_Text-85a14b", "vendors-node_modules_primer_react_lib-esm_ActionMenu_ActionMenu_js", "vendors-node_modules_primer_react_lib-esm_FormControl_FormControl_js", "vendors-node_modules_react-router-dom_dist_index_js", "vendors-node_modules_primer_react_lib-esm_PageLayout_PageLayout_js", "vendors-node_modules_github_relative-time-element_dist_index_js", "vendors-node_modules_primer_react_lib-esm_ConfirmationDialog_ConfirmationDialog_js", "vendors-node_modules_github_mini-throttle_dist_index_js-node_modules_github_alive-client_dist-bf5aa2", "vendors-node_modules_primer_react_lib-esm_UnderlineNav_index_js", "vendors-node_modules_primer_react_lib-esm_AvatarStack_AvatarStack_js-node_modules_primer_reac-77637a", "vendors-node_modules_primer_react_lib-esm_Avatar_Avatar_js-node_modules_primer_react_lib-esm_-45b3fc", "vendors-node_modules_github_catalyst_lib_index_js-node_modules_github_hydro-analytics-client_-978abc2", "ui_packages_failbot_failbot_ts", "ui_packages_react-core_create-browser-history_ts-ui_packages_react-core_AppContextProvider_ts-809ab9", "ui_packages_paths_index_ts", "ui_packages_ref-selector_RefSelector_tsx", "ui_packages_commit-attribution_index_ts-ui_packages_commit-checks-status_index_ts-ui_packages-f5e52c", "app_assets_modules_github_blob-anchor_ts-app_assets_modules_github_filter-sort_ts-app_assets_-681869", "app_assets_modules_react-code-view_pages_CodeView_tsx"], () => t(82102)), e.O()
    }
]);
//# sourceMappingURL=repos-overview-88411dc0649e.js.map