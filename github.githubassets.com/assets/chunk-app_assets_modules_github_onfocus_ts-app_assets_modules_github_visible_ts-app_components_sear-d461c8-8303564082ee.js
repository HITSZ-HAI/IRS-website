"use strict";
(globalThis.webpackChunk = globalThis.webpackChunk || []).push([
    ["app_assets_modules_github_onfocus_ts-app_assets_modules_github_visible_ts-app_components_sear-d461c8", "ui_packages_soft-navigate_soft-navigate_ts"], {
        3626: (e, t, i) => {
            function n(e) {
                let t = function(e) {
                        let t = [...Object.values(e)].reduce((e, t) => e + t.visitCount, 0);
                        return new Map(Object.keys(e).map(i => [i, e[i].visitCount / t]))
                    }(e),
                    i = function(e) {
                        var t, i;
                        let n = (t = [...Object.keys(e)], i = t => e[t].lastVisitedAt, t.sort((e, t) => i(e) - i(t))),
                            r = n.length;
                        return new Map(n.map((e, t) => [e, (t + 1) / r]))
                    }(e);
                return function(e) {
                    return .6 * (t.get(e) || 0) + .4 * (i.get(e) || 0)
                }
            }
            i.d(t, {
                vt: () => d,
                WF: () => u,
                DV: () => c,
                jW: () => f,
                Nc: () => s,
                $t: () => n
            });
            let r = /^\/orgs\/([a-z0-9-]+)\/teams\/([\w-]+)/,
                a = [/^\/([^/]+)\/([^/]+)\/?$/, /^\/([^/]+)\/([^/]+)\/blob/, /^\/([^/]+)\/([^/]+)\/tree/, /^\/([^/]+)\/([^/]+)\/issues/, /^\/([^/]+)\/([^/]+)\/pulls?/, /^\/([^/]+)\/([^/]+)\/pulse/],
                o = [
                    ["organization", /^\/orgs\/([a-z0-9-]+)\/projects\/([0-9-]+)/],
                    ["repository", /^\/([^/]+)\/([^/]+)\/projects\/([0-9-]+)/]
                ];

            function s(e) {
                let t, i;
                let n = e.match(r);
                if (n) {
                    l(c(n[1], n[2]));
                    return
                }
                for (let i = 0, n = o.length; i < n; i++) {
                    let [n, r] = o[i];
                    if (t = e.match(r)) {
                        let e = null,
                            i = null;
                        switch (n) {
                            case "organization":
                                e = t[1], i = t[2];
                                break;
                            case "repository":
                                e = `${t[1]}/${t[2]}`, i = t[3]
                        }
                        e && i && l(d(e, i));
                        return
                    }
                }
                for (let t = 0, n = a.length; t < n; t++)
                    if (i = e.match(a[t])) {
                        l(u(i[1], i[2]));
                        return
                    }
            }

            function l(e) {
                let t = f(),
                    i = Math.floor(Date.now() / 1e3),
                    r = t[e] || {
                        lastVisitedAt: i,
                        visitCount: 0
                    };
                r.visitCount += 1, r.lastVisitedAt = i, t[e] = r, m(function(e) {
                    let t = Object.keys(e);
                    if (t.length <= 100) return e;
                    let i = n(e),
                        r = t.sort((e, t) => i(t) - i(e)).slice(0, 50);
                    return Object.fromEntries(r.map(t => [t, e[t]]))
                }(t))
            }

            function c(e, t) {
                return `team:${e}/${t}`
            }

            function u(e, t) {
                return `repository:${e}/${t}`
            }

            function d(e, t) {
                return `project:${e}/${t}`
            }
            let h = /^(team|repository|project):[^/]+\/[^/]+(\/([^/]+))?$/,
                p = "jump_to:page_views";

            function m(e) {
                ! function(e, t) {
                    try {
                        window.localStorage.setItem(e, t)
                    } catch {}
                }(p, JSON.stringify(e))
            }

            function f() {
                let e;
                let t = function(e) {
                    try {
                        return window.localStorage.getItem(e)
                    } catch {
                        return null
                    }
                }(p);
                if (!t) return {};
                try {
                    e = JSON.parse(t)
                } catch {
                    return m({}), {}
                }
                let i = {};
                for (let t in e) t.match(h) && (i[t] = e[t]);
                return i
            }
        },
        254: (e, t, i) => {
            i.d(t, {
                ZG: () => s,
                q6: () => c,
                w4: () => l
            });
            var n = i(8439);
            let r = !1,
                a = new n.Z;

            function o(e) {
                let t = e.target;
                if (t instanceof HTMLElement && t.nodeType !== Node.DOCUMENT_NODE)
                    for (let e of a.matches(t)) e.data.call(null, t)
            }

            function s(e, t) {
                r || (r = !0, document.addEventListener("focus", o, !0)), a.add(e, t), document.activeElement instanceof HTMLElement && document.activeElement.matches(e) && t(document.activeElement)
            }

            function l(e, t, i) {
                function n(t) {
                    let r = t.currentTarget;
                    r && (r.removeEventListener(e, i), r.removeEventListener("blur", n))
                }
                s(t, function(t) {
                    t.addEventListener(e, i), t.addEventListener("blur", n)
                })
            }

            function c(e, t) {
                function i(e) {
                    let {
                        currentTarget: n
                    } = e;
                    n && (n.removeEventListener("input", t), n.removeEventListener("blur", i))
                }
                s(e, function(e) {
                    e.addEventListener("input", t), e.addEventListener("blur", i)
                })
            }
        },
        97629: (e, t, i) => {
            i.d(t, {
                Z: () => n
            });

            function n(e) {
                return !(e.offsetWidth <= 0 && e.offsetHeight <= 0)
            }
        },
        54529: (e, t, i) => {
            i.d(t, {
                Cx: () => s,
                F1: () => c,
                GS: () => l,
                ZV: () => o
            });
            var n = i(44544);
            let r = "blackbird_experiments",
                a = "blackbird_debug_scoring";

            function o() {
                let e = (0, n.Z)("localStorage").getItem(r);
                return e ? e.split(",") : []
            }

            function s(e) {
                (0, n.Z)("localStorage").setItem(r, e.join(","))
            }

            function l() {
                let e = (0, n.Z)("localStorage").getItem(a);
                return null !== e
            }

            function c(e) {
                e ? (0, n.Z)("localStorage").setItem(a, "1") : (0, n.Z)("localStorage").removeItem(a)
            }
        },
        81732: (e, t, i) => {
            var n;

            function r(e) {
                return !!e.qualifier
            }

            function a(e) {
                return !!r(e) && "Saved" === e.qualifier
            }
            i.d(t, {
                    MO: () => s,
                    T$: () => u,
                    ZI: () => function e(t, i) {
                        if (r(t) && t.qualifier === i) return !0;
                        if (c(t)) {
                            for (let n of t.children)
                                if (e(n, i)) return !0
                        }
                        return !1
                    },
                    az: () => r,
                    eH: () => a,
                    g8: () => c,
                    gq: () => h,
                    hs: () => l,
                    o8: () => d,
                    tT: () => n
                }),
                function(e) {
                    e[e.Is = 0] = "Is", e[e.Repository = 1] = "Repository", e[e.Owner = 2] = "Owner", e[e.Language = 3] = "Language", e[e.Path = 4] = "Path", e[e.Regex = 5] = "Regex", e[e.Text = 6] = "Text", e[e.Saved = 7] = "Saved", e[e.OtherQualifier = 8] = "OtherQualifier"
                }(n || (n = {}));
            let o = RegExp("\\/", "g");

            function s(e, t) {
                if (r(e) && l(e.content)) {
                    if ("Repo" === e.qualifier) {
                        if (1 != [...e.content.value.toString().matchAll(o)].length) return null
                    } else if ("Org" !== e.qualifier) return null;
                    else if (0 != [...e.content.value.toString().matchAll(o)].length) return null;
                    if (e.content.value.toString().startsWith("/")) return null;
                    let i = `/${e.content.value.toString().split("/").map(encodeURIComponent).join("/")}`;
                    return i === t ? null : i
                }
                return null
            }

            function l(e) {
                return void 0 !== e.value
            }

            function c(e) {
                return !!e.children
            }

            function u(e) {
                return c(e) ? e.children.map(u).filter(e => e.length > 0).join(" ") : r(e) || "Regex" === e.kind ? "" : l(e) ? e.value.toString() : ""
            }

            function d(e) {
                if ("Not" === e.kind) return [];
                if (c(e)) return e.children.map(d).flat();
                if (r(e)) {
                    if ("Repo" === e.qualifier && l(e.content)) return [{
                        kind: "repo",
                        value: e.content.value.toString()
                    }];
                    if ("Org" === e.qualifier && l(e.content)) return [{
                        kind: "org",
                        value: e.content.value.toString()
                    }];
                    if (a(e) && l(e.content)) return [{
                        kind: "saved",
                        value: e.content.value.toString()
                    }]
                }
                return []
            }

            function h(e, t) {
                let i = new Set(d(e).map(e => "org" === e.kind ? e.value : "repo" === e.kind && e.value.includes("/") ? e.value.split("/")[0] : null).filter(e => null !== e).map(e => e ? .toLowerCase()));
                return 0 === i.size ? t : t.filter(e => i.has(e.toLowerCase()))
            }
        },
        58604: (e, t, i) => {
            i.r(t), i.d(t, {
                QbsearchInputElement: () => eH
            }), i(11095);
            var n, r, a, o, s, l, c, u, d, h, p, m, f, v, y, g, b = i(76006),
                w = i(81732),
                S = i(3626),
                E = i(95253),
                T = i(75198),
                C = i(54529),
                q = i(56334),
                L = i(3399),
                N = i(44544);
            let k = (0, N.Z)("localStorage");
            let HistoryProvider = class HistoryProvider extends EventTarget {
                handleEvent(e) {
                    let t = e.parsedMetadata;
                    if (!t || t.caretPositionKind !== w.tT.Text) return [];
                    let i = e.toString(),
                        n = JSON.parse(k.getItem("github-search-history") ? ? "[]"),
                        r = t.query.trim();
                    if (0 !== r.length) return [];
                    let a = {};
                    n = n.filter(e => !a[e] && (a[e] = !0, !0));
                    let o = 0;
                    for (let e of n) {
                        if (o >= 5) break;
                        let t = e.trim();
                        t.startsWith(i) && (o += 1, this.dispatchEvent(new L.T2({
                            value: t,
                            icon: L.zi.Search,
                            scope: "GENERAL",
                            priority: t.length,
                            action: {
                                url: `/search?q=${t}`
                            }
                        })))
                    }
                }
                constructor(e) {
                    super(), this.queryBuilder = e, this.priority = 5, this.name = "History", this.singularItemName = "history", this.value = "history", this.type = "search", this.queryBuilder.addEventListener("query", this)
                }
            };
            var x = i(41982),
                B = i(45974),
                A = i(87738);
            let R = [{
                name: "C++",
                color: "#f34b7d"
            }, {
                name: "Go",
                color: "#00ADD8"
            }, {
                name: "Java",
                color: "#b07219"
            }, {
                name: "JavaScript",
                color: "#f1e05a"
            }, {
                name: "PHP",
                color: "#4F5D95"
            }, {
                name: "Python",
                color: "#3572A5"
            }, {
                name: "Ruby",
                color: "#701516"
            }, {
                name: "TypeScript",
                color: "#2b7489"
            }, {
                name: "ABAP",
                color: "#E8274B"
            }, {
                name: "AGS Script",
                color: "#B9D9FF"
            }, {
                name: "AMPL",
                color: "#E6EFBB"
            }, {
                name: "ANTLR",
                color: "#9DC3FF"
            }, {
                name: "API Blueprint",
                color: "#2ACCA8"
            }, {
                name: "APL",
                color: "#5A8164"
            }, {
                name: "ASP",
                color: "#6a40fd"
            }, {
                name: "ATS",
                color: "#1ac620"
            }, {
                name: "ActionScript",
                color: "#882B0F"
            }, {
                name: "Ada",
                color: "#02f88c"
            }, {
                name: "Agda",
                color: "#315665"
            }, {
                name: "Alloy",
                color: "#64C800"
            }, {
                name: "AngelScript",
                color: "#C7D7DC"
            }, {
                name: "AppleScript",
                color: "#101F1F"
            }, {
                name: "Arc",
                color: "#aa2afe"
            }, {
                name: "AspectJ",
                color: "#a957b0"
            }, {
                name: "Assembly",
                color: "#6E4C13"
            }, {
                name: "Asymptote",
                color: "#4a0c0c"
            }, {
                name: "AutoHotkey",
                color: "#6594b9"
            }, {
                name: "AutoIt",
                color: "#1C3552"
            }, {
                name: "Ballerina",
                color: "#FF5000"
            }, {
                name: "Batchfile",
                color: "#C1F12E"
            }, {
                name: "BlitzMax",
                color: "#cd6400"
            }, {
                name: "Boo",
                color: "#d4bec1"
            }, {
                name: "C",
                color: "#555555"
            }, {
                name: "C#",
                color: "#178600"
            }, {
                name: "CSS",
                color: "#563d7c"
            }, {
                name: "Ceylon",
                color: "#dfa535"
            }, {
                name: "Chapel",
                color: "#8dc63f"
            }, {
                name: "Cirru",
                color: "#ccccff"
            }, {
                name: "Clarion",
                color: "#db901e"
            }, {
                name: "Clean",
                color: "#3F85AF"
            }, {
                name: "Click",
                color: "#E4E6F3"
            }, {
                name: "Clojure",
                color: "#db5855"
            }, {
                name: "CoffeeScript",
                color: "#244776"
            }, {
                name: "ColdFusion",
                color: "#ed2cd6"
            }, {
                name: "Common Lisp",
                color: "#3fb68b"
            }, {
                name: "Common Workflow Language",
                color: "#B5314C"
            }, {
                name: "Component Pascal",
                color: "#B0CE4E"
            }, {
                name: "Crystal",
                color: "#000100"
            }, {
                name: "Cuda",
                color: "#3A4E3A"
            }, {
                name: "D",
                color: "#ba595e"
            }, {
                name: "DM",
                color: "#447265"
            }, {
                name: "Dart",
                color: "#00B4AB"
            }, {
                name: "DataWeave",
                color: "#003a52"
            }, {
                name: "Dhall",
                color: "#dfafff"
            }, {
                name: "Dockerfile",
                color: "#384d54"
            }, {
                name: "Dogescript",
                color: "#cca760"
            }, {
                name: "Dylan",
                color: "#6c616e"
            }, {
                name: "E",
                color: "#ccce35"
            }, {
                name: "ECL",
                color: "#8a1267"
            }, {
                name: "EQ",
                color: "#a78649"
            }, {
                name: "Eiffel",
                color: "#946d57"
            }, {
                name: "Elixir",
                color: "#6e4a7e"
            }, {
                name: "Elm",
                color: "#60B5CC"
            }, {
                name: "Emacs Lisp",
                color: "#c065db"
            }, {
                name: "EmberScript",
                color: "#FFF4F3"
            }, {
                name: "Erlang",
                color: "#B83998"
            }, {
                name: "F#",
                color: "#b845fc"
            }, {
                name: "F*",
                color: "#572e30"
            }, {
                name: "FLUX",
                color: "#88ccff"
            }, {
                name: "Factor",
                color: "#636746"
            }, {
                name: "Fancy",
                color: "#7b9db4"
            }, {
                name: "Fantom",
                color: "#14253c"
            }, {
                name: "Forth",
                color: "#341708"
            }, {
                name: "Fortran",
                color: "#4d41b1"
            }, {
                name: "FreeMarker",
                color: "#0050b2"
            }, {
                name: "Frege",
                color: "#00cafe"
            }, {
                name: "G-code",
                color: "#D08CF2"
            }, {
                name: "GDScript",
                color: "#355570"
            }, {
                name: "Game Maker Language",
                color: "#71b417"
            }, {
                name: "Genie",
                color: "#fb855d"
            }, {
                name: "Gherkin",
                color: "#5B2063"
            }, {
                name: "Glyph",
                color: "#c1ac7f"
            }, {
                name: "Gnuplot",
                color: "#f0a9f0"
            }, {
                name: "Groovy",
                color: "#e69f56"
            }, {
                name: "HTML",
                color: "#e34c26"
            }, {
                name: "Hack",
                color: "#878787"
            }, {
                name: "Harbour",
                color: "#0e60e3"
            }, {
                name: "Haskell",
                color: "#5e5086"
            }, {
                name: "Haxe",
                color: "#df7900"
            }, {
                name: "HiveQL",
                color: "#dce200"
            }, {
                name: "HolyC",
                color: "#ffefaf"
            }, {
                name: "Hy",
                color: "#7790B2"
            }, {
                name: "IDL",
                color: "#a3522f"
            }, {
                name: "Idris",
                color: "#b30000"
            }, {
                name: "Io",
                color: "#a9188d"
            }, {
                name: "Ioke",
                color: "#078193"
            }, {
                name: "Isabelle",
                color: "#FEFE00"
            }, {
                name: "J",
                color: "#9EEDFF"
            }, {
                name: "JSONiq",
                color: "#40d47e"
            }, {
                name: "Jolie",
                color: "#843179"
            }, {
                name: "Jsonnet",
                color: "#0064bd"
            }, {
                name: "Julia",
                color: "#a270ba"
            }, {
                name: "Jupyter Notebook",
                color: "#DA5B0B"
            }, {
                name: "KRL",
                color: "#28430A"
            }, {
                name: "Kotlin",
                color: "#F18E33"
            }, {
                name: "LFE",
                color: "#4C3023"
            }, {
                name: "LLVM",
                color: "#185619"
            }, {
                name: "LSL",
                color: "#3d9970"
            }, {
                name: "Lasso",
                color: "#999999"
            }, {
                name: "Lex",
                color: "#DBCA00"
            }, {
                name: "LiveScript",
                color: "#499886"
            }, {
                name: "LookML",
                color: "#652B81"
            }, {
                name: "Lua",
                color: "#000080"
            }, {
                name: "MATLAB",
                color: "#e16737"
            }, {
                name: "MAXScript",
                color: "#00a6a6"
            }, {
                name: "MQL4",
                color: "#62A8D6"
            }, {
                name: "MQL5",
                color: "#4A76B8"
            }, {
                name: "MTML",
                color: "#b7e1f4"
            }, {
                name: "Makefile",
                color: "#427819"
            }, {
                name: "Markdown",
                color: "#083fa1"
            }, {
                name: "Mask",
                color: "#f97732"
            }, {
                name: "Max",
                color: "#c4a79c"
            }, {
                name: "Mercury",
                color: "#ff2b2b"
            }, {
                name: "Meson",
                color: "#007800"
            }, {
                name: "Metal",
                color: "#8f14e9"
            }, {
                name: "Mirah",
                color: "#c7a938"
            }, {
                name: "Modula-3",
                color: "#223388"
            }, {
                name: "NCL",
                color: "#28431f"
            }, {
                name: "Nearley",
                color: "#990000"
            }, {
                name: "Nemerle",
                color: "#3d3c6e"
            }, {
                name: "NetLinx",
                color: "#0aa0ff"
            }, {
                name: "NetLinx+ERB",
                color: "#747faa"
            }, {
                name: "NetLogo",
                color: "#ff6375"
            }, {
                name: "NewLisp",
                color: "#87AED7"
            }, {
                name: "Nextflow",
                color: "#3ac486"
            }, {
                name: "Nim",
                color: "#37775b"
            }, {
                name: "Nit",
                color: "#009917"
            }, {
                name: "Nix",
                color: "#7e7eff"
            }, {
                name: "Nu",
                color: "#c9df40"
            }, {
                name: "OCaml",
                color: "#3be133"
            }, {
                name: "ObjectScript",
                color: "#424893"
            }, {
                name: "Objective-C",
                color: "#438eff"
            }, {
                name: "Objective-C++",
                color: "#6866fb"
            }, {
                name: "Objective-J",
                color: "#ff0c5a"
            }, {
                name: "Omgrofl",
                color: "#cabbff"
            }, {
                name: "Opal",
                color: "#f7ede0"
            }, {
                name: "Oxygene",
                color: "#cdd0e3"
            }, {
                name: "Oz",
                color: "#fab738"
            }, {
                name: "P4",
                color: "#7055b5"
            }, {
                name: "PLSQL",
                color: "#dad8d8"
            }, {
                name: "Pan",
                color: "#cc0000"
            }, {
                name: "Papyrus",
                color: "#6600cc"
            }, {
                name: "Parrot",
                color: "#f3ca0a"
            }, {
                name: "Pascal",
                color: "#E3F171"
            }, {
                name: "Pawn",
                color: "#dbb284"
            }, {
                name: "Pep8",
                color: "#C76F5B"
            }, {
                name: "Perl",
                color: "#0298c3"
            }, {
                name: "Perl 6",
                color: "#0000fb"
            }, {
                name: "PigLatin",
                color: "#fcd7de"
            }, {
                name: "Pike",
                color: "#005390"
            }, {
                name: "PogoScript",
                color: "#d80074"
            }, {
                name: "PostScript",
                color: "#da291c"
            }, {
                name: "PowerBuilder",
                color: "#8f0f8d"
            }, {
                name: "PowerShell",
                color: "#012456"
            }, {
                name: "Processing",
                color: "#0096D8"
            }, {
                name: "Prolog",
                color: "#74283c"
            }, {
                name: "Propeller Spin",
                color: "#7fa2a7"
            }, {
                name: "Puppet",
                color: "#302B6D"
            }, {
                name: "PureBasic",
                color: "#5a6986"
            }, {
                name: "PureScript",
                color: "#1D222D"
            }, {
                name: "Protocol Buffers",
                color: "#CCCCCC"
            }, {
                name: "QML",
                color: "#44a51c"
            }, {
                name: "Quake",
                color: "#882233"
            }, {
                name: "R",
                color: "#198CE7"
            }, {
                name: "RAML",
                color: "#77d9fb"
            }, {
                name: "Racket",
                color: "#3c5caa"
            }, {
                name: "Ragel",
                color: "#9d5200"
            }, {
                name: "Rascal",
                color: "#fffaa0"
            }, {
                name: "Rebol",
                color: "#358a5b"
            }, {
                name: "Red",
                color: "#f50000"
            }, {
                name: "Ren'Py",
                color: "#ff7f7f"
            }, {
                name: "Ring",
                color: "#2D54CB"
            }, {
                name: "Roff",
                color: "#ecdebe"
            }, {
                name: "Rouge",
                color: "#cc0088"
            }, {
                name: "Rust",
                color: "#dea584"
            }, {
                name: "SAS",
                color: "#B34936"
            }, {
                name: "SQF",
                color: "#3F3F3F"
            }, {
                name: "SQL",
                color: "#e38c00"
            }, {
                name: "SRecode Template",
                color: "#348a34"
            }, {
                name: "SaltStack",
                color: "#646464"
            }, {
                name: "Scala",
                color: "#c22d40"
            }, {
                name: "Scheme",
                color: "#1e4aec"
            }, {
                name: "Self",
                color: "#0579aa"
            }, {
                name: "Shell",
                color: "#89e051"
            }, {
                name: "Shen",
                color: "#120F14"
            }, {
                name: "Slash",
                color: "#007eff"
            }, {
                name: "Slice",
                color: "#003fa2"
            }, {
                name: "Smalltalk",
                color: "#596706"
            }, {
                name: "Solidity",
                color: "#AA6746"
            }, {
                name: "SourcePawn",
                color: "#5c7611"
            }, {
                name: "Squirrel",
                color: "#800000"
            }, {
                name: "Stan",
                color: "#b2011d"
            }, {
                name: "Standard ML",
                color: "#dc566d"
            }, {
                name: "SuperCollider",
                color: "#46390b"
            }, {
                name: "Swift",
                color: "#ffac45"
            }, {
                name: "SystemVerilog",
                color: "#DAE1C2"
            }, {
                name: "TI Program",
                color: "#A0AA87"
            }, {
                name: "Tcl",
                color: "#e4cc98"
            }, {
                name: "TeX",
                color: "#3D6117"
            }, {
                name: "Terra",
                color: "#00004c"
            }, {
                name: "Turing",
                color: "#cf142b"
            }, {
                name: "UnrealScript",
                color: "#a54c4d"
            }, {
                name: "VCL",
                color: "#148AA8"
            }, {
                name: "VHDL",
                color: "#adb2cb"
            }, {
                name: "Vala",
                color: "#fbe5cd"
            }, {
                name: "Verilog",
                color: "#b2b7f8"
            }, {
                name: "Vim script",
                color: "#199f4b"
            }, {
                name: "Visual Basic",
                color: "#945db7"
            }, {
                name: "Volt",
                color: "#1F1F1F"
            }, {
                name: "Vue",
                color: "#2c3e50"
            }, {
                name: "WebAssembly",
                color: "#04133b"
            }, {
                name: "Wollok",
                color: "#a23738"
            }, {
                name: "X10",
                color: "#4B6BEF"
            }, {
                name: "XC",
                color: "#99DA07"
            }, {
                name: "XQuery",
                color: "#5232e7"
            }, {
                name: "XSLT",
                color: "#EB8CEB"
            }, {
                name: "YARA",
                color: "#220000"
            }, {
                name: "YASnippet",
                color: "#32AB90"
            }, {
                name: "Yacc",
                color: "#4B6C4B"
            }, {
                name: "ZAP",
                color: "#0d665e"
            }, {
                name: "ZIL",
                color: "#dc75e5"
            }, {
                name: "ZenScript",
                color: "#00BCD1"
            }, {
                name: "Zephir",
                color: "#118f9e"
            }, {
                name: "Zig",
                color: "#ec915c"
            }, {
                name: "eC",
                color: "#913960"
            }, {
                name: "mcfunction",
                color: "#E22837"
            }, {
                name: "nesC",
                color: "#94B0C7"
            }, {
                name: "ooc",
                color: "#b0b77e"
            }, {
                name: "sed",
                color: "#64b970"
            }, {
                name: "wdl",
                color: "#42f1f4"
            }, {
                name: "wisp",
                color: "#7582D1"
            }, {
                name: "xBase",
                color: "#403a40"
            }];
            var P = new WeakSet;
            let LanguagesProvider = class LanguagesProvider extends EventTarget {
                handleEvent(e) {
                    let t = e.parsedMetadata;
                    if (!t || t.caretPositionKind !== w.tT.Language) return [];
                    let i = "";
                    if (!(t.caretSelectedNode && (0, w.az)(t.caretSelectedNode))) return [];
                    (0, w.hs)(t.caretSelectedNode.content) && (i = t.caretSelectedNode.content.value);
                    let n = R.slice(0, 7);
                    if (1 === i.length) n = R.filter(e => e.name.startsWith(i.toUpperCase())).slice(0, 7);
                    else if (i.length > 1) {
                        let e = i.replace(/\s/g, "");
                        n = (0, x.W)(R, t => {
                            let i = (0, A.EW)(t.name, e);
                            return i > 0 ? {
                                score: i,
                                text: t.name
                            } : null
                        }, A.qu)
                    }
                    for (let e of n) {
                        let i = t.caretSelectedNode.location.end,
                            n = t.caretSelectedNode.location.end;
                        (0, w.hs)(t.caretSelectedNode.content) && (i = t.caretSelectedNode.content.location.start, n = t.caretSelectedNode.content.location.end);
                        let r = e.name.includes(" ") ? `"${e.name}"` : e.name,
                            a = `${t.query.slice(0,i)+r} ${t.query.slice(n)}`;
                        this.dispatchEvent(new L.L2({
                            filter: "lang",
                            value: e.name,
                            icon: (function(e, t, i) {
                                if (!t.has(e)) throw TypeError("attempted to get private field on non-instance");
                                return i
                            })(this, P, _).call(this, e.color),
                            priority: 0,
                            action: {
                                query: a,
                                replaceQueryWith: a,
                                moveCaretTo: i + r.length + 1
                            }
                        }))
                    }
                }
                constructor(e) {
                    super(),
                        function(e, t) {
                            (function(e, t) {
                                if (t.has(e)) throw TypeError("Cannot initialize the same private elements twice on an object")
                            })(e, t), t.add(e)
                        }(this, P), this.queryBuilder = e, this.priority = 10, this.name = "Languages", this.singularItemName = "language", this.value = "language", this.type = "filter", this.manuallyDetermineFilterEligibility = !0, this.queryBuilder.addEventListener("query", this)
                }
            };

            function _(e) {
                let t = document.createElement("div"),
                    i = (0, B.dy)
                `<div
      style="border-radius: 8px; display: inline-block; height: 10px; width: 10px; background-color: ${e}"
    ></div>`;
                return i.renderInto(t), {
                    html: t.innerHTML
                }
            }
            var M = i(65674);

            function I(e, t, i) {
                if (!t.has(e)) throw TypeError("attempted to " + i + " private field on non-instance");
                return t.get(e)
            }

            function D(e, t) {
                var i = I(e, t, "get");
                return i.get ? i.get.call(e) : i.value
            }

            function F(e, t, i) {
                ! function(e, t) {
                    if (t.has(e)) throw TypeError("Cannot initialize the same private elements twice on an object")
                }(e, t), t.set(e, i)
            }

            function O(e, t, i) {
                var n = I(e, t, "set");
                return ! function(e, t, i) {
                    if (t.set) t.set.call(e, i);
                    else {
                        if (!t.writable) throw TypeError("attempted to set read only private field");
                        t.value = i
                    }
                }(e, n, i), i
            }
            var j = new WeakMap,
                $ = new WeakMap;
            let W = class ReposProviderBase extends EventTarget {
                async getMatchingRepositories({
                    state: e
                }) {
                    let t = "",
                        i = [];
                    if (e.ast) {
                        let n = (0, w.o8)(e.ast),
                            r = !1;
                        for (let e of n) "repo" === e.kind || "saved" === e.kind ? r = !0 : "org" === e.kind && i.push(e.value.toLowerCase());
                        if (r && e.caretPositionKind !== w.tT.Repository) return [];
                        t = (0, w.T$)(e.ast)
                    }
                    e.caretSelectedNode && (0, w.az)(e.caretSelectedNode) && (t = (0, w.hs)(e.caretSelectedNode.content) ? e.caretSelectedNode.content.value : ""), null === D(this, $) && O(this, $, (await (0, M.getSuggestions)(D(this, j))).filter(e => "Repository" === e.type).map(e => e.name));
                    let n = D(this, $);
                    if (t.length > 0) {
                        let e = t.replace(/\s/g, "");
                        n = (0, x.W)(D(this, $), t => {
                            let i = (0, A.EW)(t, e);
                            return i > 0 ? {
                                score: i,
                                text: t
                            } : null
                        }, A.qu)
                    }
                    return i.length > 0 && (n = n.filter(e => {
                        let t = e.split("/")[0].toLowerCase();
                        return i.find(e => t.startsWith(e))
                    })), n
                }
                constructor(e) {
                    super(), F(this, j, {
                        writable: !0,
                        value: void 0
                    }), F(this, $, {
                        writable: !0,
                        value: void 0
                    }), O(this, $, null), O(this, j, e)
                }
            };
            let ReposFilterProvider = class ReposFilterProvider extends W {
                async handleEvent(e) {
                    let t = e.parsedMetadata;
                    if (!t || t.caretPositionKind !== w.tT.Repository && t.caretPositionKind !== w.tT.Owner) return [];
                    let i = await this.getMatchingRepositories({
                        state: t
                    });
                    for (let e of i.slice(0, 5)) {
                        let i = {
                            url: `/${e}`
                        };
                        if (t.caretSelectedNode && (0, w.az)(t.caretSelectedNode)) {
                            let n = t.caretSelectedNode.location.end,
                                r = t.caretSelectedNode.location.end;
                            (0, w.hs)(t.caretSelectedNode.content) && (n = t.caretSelectedNode.content.location.start, r = t.caretSelectedNode.content.location.end);
                            let a = `${t.query.slice(0,n)+e} ${t.query.slice(r)}`;
                            i = {
                                replaceQueryWith: a,
                                moveCaretTo: n + e.length + 1
                            }
                        }
                        this.dispatchEvent(new L.L2({
                            filter: "repo",
                            value: e,
                            icon: L.zi.Repo,
                            priority: 0,
                            action: i
                        }))
                    }
                }
                constructor(e, t) {
                    super(t), this.queryBuilder = e, this.priority = 6, this.name = "Repositories", this.singularItemName = "repository", this.value = "repository-filter", this.type = "filter", this.manuallyDetermineFilterEligibility = !0, this.queryBuilder.addEventListener("query", this)
                }
            };
            let ReposSearchProvider = class ReposSearchProvider extends W {
                async handleEvent(e) {
                    let t = e.parsedMetadata;
                    if (!t || t.caretPositionKind !== w.tT.Text) return [];
                    let i = await this.getMatchingRepositories({
                        state: t
                    });
                    for (let e of i.slice(0, 5)) this.dispatchEvent(new L.T2({
                        value: e,
                        icon: L.zi.Repo,
                        priority: 0,
                        action: {
                            url: `/${e}`
                        }
                    }))
                }
                constructor(e, t) {
                    super(t), this.queryBuilder = e, this.priority = 6, this.name = "Repositories", this.singularItemName = "repository", this.value = "repository-search", this.type = "search", this.manuallyDetermineFilterEligibility = !0, this.queryBuilder.addEventListener("query", this)
                }
            };

            function Q(e, t) {
                if (t.has(e)) throw TypeError("Cannot initialize the same private elements twice on an object")
            }

            function z(e, t, i) {
                if (!t.has(e)) throw TypeError("attempted to " + i + " private field on non-instance");
                return t.get(e)
            }

            function H(e, t) {
                var i = z(e, t, "get");
                return i.get ? i.get.call(e) : i.value
            }

            function G(e, t, i) {
                Q(e, t), t.set(e, i)
            }

            function U(e, t, i) {
                var n = z(e, t, "set");
                return ! function(e, t, i) {
                    if (t.set) t.set.call(e, i);
                    else {
                        if (!t.writable) throw TypeError("attempted to set read only private field");
                        t.value = i
                    }
                }(e, n, i), i
            }
            var V = new WeakMap,
                K = new WeakMap;
            let CustomScopeCache = class CustomScopeCache {
                set(e) {
                    U(this, V, e), U(this, K, !0)
                }
                get() {
                    if (H(this, K)) return H(this, V)
                }
                len() {
                    return H(this, V).length
                }
                clear() {
                    U(this, K, !1), U(this, V, [])
                }
                constructor() {
                    G(this, V, {
                        writable: !0,
                        value: void 0
                    }), G(this, K, {
                        writable: !0,
                        value: void 0
                    }), U(this, V, [])
                }
            };
            var Z = new WeakMap,
                J = new WeakSet;
            let SavedScopeProvider = class SavedScopeProvider extends EventTarget {
                async fetchSuggestions() {
                    let e = [];
                    if (H(this, Z)) {
                        let t = await fetch(H(this, Z), {
                            method: "GET",
                            mode: "same-origin",
                            headers: {
                                Accept: "application/json"
                            }
                        });
                        if (!t.ok) return [];
                        e = await t.json(), (function(e, t, i) {
                            if (!t.has(e)) throw TypeError("attempted to get private field on non-instance");
                            return i
                        })(this, J, X).call(this, e)
                    }
                    return e
                }
                async handleEvent(e) {
                    let t = e.parsedMetadata;
                    if (!t || t.caretPositionKind !== w.tT.Text && t.caretPositionKind !== w.tT.Saved || t.caretPositionKind !== w.tT.Saved && t.ast && (0, w.ZI)(t.ast, "Saved") || t.ast && ((0, w.ZI)(t.ast, "Repo") || (0, w.ZI)(t.ast, "Org"))) return [];
                    let i = "";
                    t.caretSelectedNode && ((0, w.eH)(t.caretSelectedNode) ? (0, w.hs)(t.caretSelectedNode.content) && (i = String(t.caretSelectedNode.content.value)) : (0, w.hs)(t.caretSelectedNode) && (i = String(t.caretSelectedNode.value)));
                    let n = this.customScopesCache.get();
                    if (void 0 === n && (n = await this.fetchSuggestions()), i.trim().length > 0) {
                        let e = i.replace(/[\s"]/g, "");
                        n = (0, x.W)(n, t => {
                            let i = (0, A.EW)(t.name, e);
                            return i > 0 ? {
                                score: i,
                                text: t.name
                            } : null
                        }, A.qu)
                    }
                    for (let e of n) {
                        let i = "saved:",
                            n = e.name.includes(" ") ? `"${e.name}"` : e.name,
                            r = "",
                            a = (r = t.query.endsWith(" ") || "" === t.query ? `${t.query}${i+n} ` : `${t.query} ${i+n} `).length;
                        if (t.caretSelectedNode && ((0, w.hs)(t.caretSelectedNode) || (0, w.az)(t.caretSelectedNode))) {
                            let e = t.caretSelectedNode.location.start,
                                o = t.caretSelectedNode.location.end;
                            (0, w.az)(t.caretSelectedNode) && (0, w.hs)(t.caretSelectedNode.content) && (o = t.caretSelectedNode.content.location.end);
                            let s = t.query.slice(0, e),
                                l = t.query.slice(o).trimEnd();
                            "" === l && (n += " ");
                            let c = s + i + n + l;
                            r = c, a = e + i.length + n.length
                        }
                        this.dispatchEvent(new L.T2({
                            value: `saved:${e.name}`,
                            icon: L.zi.Bookmark,
                            priority: 0,
                            action: {
                                replaceQueryWith: r,
                                moveCaretTo: a
                            }
                        }))
                    }
                    t.caretPositionKind === w.tT.Saved && this.dispatchEvent(new L.T2({
                        value: "Manage saved searches",
                        icon: L.zi.PlusCircle,
                        scope: "COMMAND",
                        priority: 0,
                        action: {
                            commandName: "blackbird-monolith.manageCustomScopes",
                            data: {}
                        }
                    }))
                }
                constructor(e, t) {
                    super(),
                        function(e, t) {
                            Q(e, t), t.add(e)
                        }(this, J), G(this, Z, {
                            writable: !0,
                            value: void 0
                        }), this.queryBuilder = e, this.priority = 4, this.name = "Saved queries", this.singularItemName = "saved query", this.value = "saved query", this.type = "search", this.customScopesCache = new CustomScopeCache, U(this, Z, t), this.queryBuilder.addEventListener("query", this)
                }
            };

            function X(e) {
                this.customScopesCache.set(e)
            }

            function Y(e, t, i) {
                if (!t.has(e)) throw TypeError("attempted to " + i + " private field on non-instance");
                return t.get(e)
            }

            function ee(e, t) {
                var i = Y(e, t, "get");
                return i.get ? i.get.call(e) : i.value
            }

            function et(e, t, i) {
                ! function(e, t) {
                    if (t.has(e)) throw TypeError("Cannot initialize the same private elements twice on an object")
                }(e, t), t.set(e, i)
            }

            function ei(e, t, i) {
                var n = Y(e, t, "set");
                return ! function(e, t, i) {
                    if (t.set) t.set.call(e, i);
                    else {
                        if (!t.writable) throw TypeError("attempted to set read only private field");
                        t.value = i
                    }
                }(e, n, i), i
            }
            var en = new WeakMap,
                er = new WeakMap;
            let OwnersProvider = class OwnersProvider extends EventTarget {
                async handleEvent(e) {
                    let t = e.parsedMetadata;
                    if (!t) return [];
                    if (t.caretPositionKind === w.tT.Text && t.ast) {
                        if ((0, w.o8)(t.ast).length) return []
                    } else if (t.caretPositionKind !== w.tT.Owner) return [];
                    let i = "",
                        n = [];
                    if (t.ast && (i = (0, w.T$)(t.ast)), t.caretSelectedNode && (0, w.az)(t.caretSelectedNode) && (i = (0, w.hs)(t.caretSelectedNode.content) ? t.caretSelectedNode.content.value : ""), null === ee(this, en)) {
                        let e = (await (0, M.getSuggestions)(ee(this, er))).filter(e => "Repository" === e.type).map(e => e.name.split("/")[0]);
                        ei(this, en, [...new Set(e)])
                    }
                    let r = ee(this, en);
                    if (i.length > 0) {
                        let e = i.replace(/\s/g, "");
                        r = (0, x.W)(ee(this, en), t => {
                            let i = (0, A.EW)(t, e);
                            return i > 0 ? {
                                score: i,
                                text: t
                            } : null
                        }, A.qu)
                    }
                    for (let e of (n.length > 0 && (r = r.filter(e => {
                            let t = e.split("/")[0].toLowerCase();
                            return n.find(e => t.startsWith(e))
                        })), r.slice(0, 5))) {
                        let i = {
                            url: `/${e}`
                        };
                        if (t.caretSelectedNode && (0, w.az)(t.caretSelectedNode)) {
                            let n = t.caretSelectedNode.location.end,
                                r = t.caretSelectedNode.location.end;
                            (0, w.hs)(t.caretSelectedNode.content) && (n = t.caretSelectedNode.content.location.start, r = t.caretSelectedNode.content.location.end);
                            let a = `${t.query.slice(0,n)+e} ${t.query.slice(r)}`;
                            i = {
                                replaceQueryWith: a,
                                moveCaretTo: n + e.length + 1
                            }
                        }
                        this.dispatchEvent(new L.T2({
                            value: e,
                            icon: L.zi.Repo,
                            priority: 0,
                            action: i
                        }))
                    }
                }
                constructor(e, t) {
                    super(), et(this, en, {
                        writable: !0,
                        value: void 0
                    }), et(this, er, {
                        writable: !0,
                        value: void 0
                    }), this.queryBuilder = e, this.priority = 5, this.name = "Owners", this.singularItemName = "owner", this.value = "owner", this.type = "search", this.manuallyDetermineFilterEligibility = !0, ei(this, en, null), this.queryBuilder.addEventListener("query", this), ei(this, er, t)
                }
            };

            function ea(e, t, i) {
                if (!t.has(e)) throw TypeError("attempted to " + i + " private field on non-instance");
                return t.get(e)
            }

            function eo(e, t) {
                var i = ea(e, t, "get");
                return i.get ? i.get.call(e) : i.value
            }
            var es = new WeakMap;
            let FixedValuesProvider = class FixedValuesProvider extends EventTarget {
                async handleEvent(e) {
                    let t = e.parsedMetadata;
                    if (!t || t.caretPositionKind !== w.tT.OtherQualifier && t.caretPositionKind !== w.tT.Is || !t.caretSelectedNode || !(0, w.az)(t.caretSelectedNode)) return [];
                    if (!eo(this, es)) {
                        var n;
                        n = await Promise.all([i.e("vendors-node_modules_github_blackbird-parser_dist_blackbird_js"), i.e("app_components_search_parsing_parsing_ts")]).then(i.bind(i, 91691)),
                            function(e, t, i) {
                                if (t.set) t.set.call(e, i);
                                else {
                                    if (!t.writable) throw TypeError("attempted to set read only private field");
                                    t.value = i
                                }
                            }(this, ea(this, es, "set"), n)
                    }
                    let r = [],
                        a = "License" === t.caretSelectedNode.qualifier,
                        o = "Language" === t.caretSelectedNode.qualifier;
                    r = a ? [
                        ["BSD Zero Clause License", "0bsd"],
                        ["MIT License", "mit"],
                        ["Apache License 2.0", "apache-2.0"],
                        ["Creative Commons", "cc"],
                        ["GNU General Public License", "gpl"],
                        ["GNU Lesser General Public License", "lgpl"]
                    ] : eo(this, es).getPossibleQualifierValues(eo(this, es).chooseSearchType(t.ast, !0), t.caretSelectedNode.qualifier).map(e => [e, e]);
                    let s = t.query;
                    if (t.caretSelectedNode && (0, w.az)(t.caretSelectedNode) && (s = (0, w.hs)(t.caretSelectedNode.content) ? t.caretSelectedNode.content.value : ""), s.length > 0) {
                        let e = s.replace(/\s/g, "");
                        r = (0, x.W)(r, t => {
                            let i = t[0] === t[1] ? t[0] : `${t[0]} ${t[1]}`,
                                n = (0, A.EW)(i, e);
                            return n > 0 ? {
                                score: n,
                                text: i
                            } : void 0
                        }, A.qu)
                    }
                    for (let e of r.slice(0, 5))
                        if (t.caretSelectedNode && (0, w.az)(t.caretSelectedNode)) {
                            let i = t.caretSelectedNode.location.end,
                                n = t.caretSelectedNode.location.end;
                            (0, w.hs)(t.caretSelectedNode.content) && (i = t.caretSelectedNode.content.location.start, n = t.caretSelectedNode.content.location.end);
                            let r = e[1].includes(" ") ? `"${e[1]}"` : e[1],
                                a = `${t.query.slice(0,i)+r} ${t.query.slice(n)}`,
                                s = {
                                    replaceQueryWith: a,
                                    moveCaretTo: i + r.length + 1
                                };
                            this.dispatchEvent(new L.L2({
                                filter: "owner",
                                value: e[0],
                                icon: o ? L.zi.Circle : void 0,
                                priority: 0,
                                action: s
                            }))
                        }
                }
                constructor(e) {
                    super(),
                        function(e, t, i) {
                            (function(e, t) {
                                if (t.has(e)) throw TypeError("Cannot initialize the same private elements twice on an object")
                            })(e, t), t.set(e, i)
                        }(this, es, {
                            writable: !0,
                            value: void 0
                        }), this.queryBuilder = e, this.priority = 3, this.name = "Values", this.singularItemName = "value", this.value = "value", this.type = "filter", this.manuallyDetermineFilterEligibility = !0, this.queryBuilder.addEventListener("query", this)
                }
            };

            function el(e, t, i) {
                if (!t.has(e)) throw TypeError("attempted to " + i + " private field on non-instance");
                return t.get(e)
            }

            function ec(e, t) {
                var i = el(e, t, "get");
                return i.get ? i.get.call(e) : i.value
            }

            function eu(e, t, i) {
                ! function(e, t) {
                    if (t.has(e)) throw TypeError("Cannot initialize the same private elements twice on an object")
                }(e, t), t.set(e, i)
            }

            function ed(e, t, i) {
                var n = el(e, t, "set");
                return ! function(e, t, i) {
                    if (t.set) t.set.call(e, i);
                    else {
                        if (!t.writable) throw TypeError("attempted to set read only private field");
                        t.value = i
                    }
                }(e, n, i), i
            }
            var eh = new WeakMap,
                ep = new WeakMap;
            let TeamsProvider = class TeamsProvider extends EventTarget {
                async handleEvent(e) {
                    let t = e.parsedMetadata;
                    if (!t || t.caretPositionKind !== w.tT.Text) return [];
                    let i = t.query;
                    t.caretSelectedNode && (0, w.az)(t.caretSelectedNode) && (i = (0, w.hs)(t.caretSelectedNode.content) ? t.caretSelectedNode.content.value : ""), null === ec(this, eh) && ed(this, eh, (await (0, M.getSuggestions)(ec(this, ep))).filter(e => "Team" === e.type).map(e => ({
                        name: e.name,
                        path: e.path
                    })));
                    let n = ec(this, eh).slice(0, 4);
                    if (i.length > 0) {
                        let e = i.replace(/\s/g, "");
                        n = (0, x.W)(ec(this, eh), t => {
                            let i = (0, A.EW)(t.name, e);
                            return i > 0 ? {
                                score: i,
                                text: t.name
                            } : null
                        }, A.qu)
                    }
                    for (let e of n.slice(0, 5)) this.dispatchEvent(new L.T2({
                        value: e.name,
                        icon: L.zi.Team,
                        priority: 0,
                        action: {
                            url: e.path
                        }
                    }))
                }
                constructor(e, t) {
                    super(), eu(this, eh, {
                        writable: !0,
                        value: void 0
                    }), eu(this, ep, {
                        writable: !0,
                        value: void 0
                    }), this.queryBuilder = e, this.priority = 7, this.name = "Teams", this.singularItemName = "team", this.value = "team", this.type = "search", this.manuallyDetermineFilterEligibility = !0, ed(this, eh, null), this.queryBuilder.addEventListener("query", this), ed(this, ep, t)
                }
            };

            function em(e, t, i) {
                if (!t.has(e)) throw TypeError("attempted to " + i + " private field on non-instance");
                return t.get(e)
            }

            function ef(e, t) {
                var i = em(e, t, "get");
                return i.get ? i.get.call(e) : i.value
            }

            function ev(e, t, i) {
                ! function(e, t) {
                    if (t.has(e)) throw TypeError("Cannot initialize the same private elements twice on an object")
                }(e, t), t.set(e, i)
            }

            function ey(e, t, i) {
                var n = em(e, t, "set");
                return ! function(e, t, i) {
                    if (t.set) t.set.call(e, i);
                    else {
                        if (!t.writable) throw TypeError("attempted to set read only private field");
                        t.value = i
                    }
                }(e, n, i), i
            }
            var eg = new WeakMap,
                eb = new WeakMap;
            let ProjectsProvider = class ProjectsProvider extends EventTarget {
                async handleEvent(e) {
                    let t = e.parsedMetadata;
                    if (!t || t.caretPositionKind !== w.tT.Text) return [];
                    let i = t.query;
                    t.caretSelectedNode && (0, w.az)(t.caretSelectedNode) && (i = (0, w.hs)(t.caretSelectedNode.content) ? t.caretSelectedNode.content.value : ""), null === ef(this, eg) && ey(this, eg, (await (0, M.getSuggestions)(ef(this, eb))).filter(e => "Project" === e.type).map(e => ({
                        name: e.name,
                        path: e.path
                    })));
                    let n = ef(this, eg).slice(0, 4);
                    if (i.length > 0) {
                        let e = i.replace(/\s/g, "");
                        n = (0, x.W)(ef(this, eg), t => {
                            let i = (0, A.EW)(t.name, e);
                            return i > 0 ? {
                                score: i,
                                text: t.name
                            } : null
                        }, A.qu)
                    }
                    for (let e of n.slice(0, 5)) this.dispatchEvent(new L.L2({
                        filter: "project",
                        value: e.name,
                        icon: L.zi.Project,
                        priority: 0,
                        action: {
                            url: e.path
                        }
                    }))
                }
                constructor(e, t) {
                    super(), ev(this, eg, {
                        writable: !0,
                        value: void 0
                    }), ev(this, eb, {
                        writable: !0,
                        value: void 0
                    }), this.queryBuilder = e, this.priority = 8, this.name = "Projects", this.singularItemName = "project", this.value = "project", this.type = "filter", this.manuallyDetermineFilterEligibility = !0, ey(this, eg, null), this.queryBuilder.addEventListener("query", this), ey(this, eb, t)
                }
            };
            var ew = i(92059);

            function eS(e, t, i) {
                if (!t.has(e)) throw TypeError("attempted to " + i + " private field on non-instance");
                return t.get(e)
            }

            function eE(e, t) {
                var i = eS(e, t, "get");
                return i.get ? i.get.call(e) : i.value
            }

            function eT(e, t, i) {
                ! function(e, t) {
                    if (t.has(e)) throw TypeError("Cannot initialize the same private elements twice on an object")
                }(e, t), t.set(e, i)
            }

            function eC(e, t, i) {
                var n = eS(e, t, "set");
                return ! function(e, t, i) {
                    if (t.set) t.set.call(e, i);
                    else {
                        if (!t.writable) throw TypeError("attempted to set read only private field");
                        t.value = i
                    }
                }(e, n, i), i
            }
            var eq = new WeakMap,
                eL = new WeakMap;
            let BlackbirdProvider = class BlackbirdProvider extends EventTarget {
                async handleEvent(e) {
                    let t = this.fetchData(e);
                    this.dispatchEvent(new L.Z(t));
                    let i = await t,
                        n = 0;
                    for (let e of i) {
                        if (n >= 5) return;
                        if ("SUGGESTION_KIND_PATH" === e.kind) {
                            if (!e.path) continue;
                            let t = e.path.lastIndexOf("/"),
                                i = e.path.substring(t + 1),
                                n = eN(e.path.substring(0, t + 1)),
                                r = e.repository_nwo,
                                a = r.length > 0 && n.length > 0 ? " \xb7 " : "",
                                o = e.path.split("/").map(encodeURIComponent).join("/");
                            this.dispatchEvent(new L.T2({
                                value: i,
                                icon: L.zi.FileCode,
                                description: `${r}${a}${n}`,
                                priority: 0,
                                action: {
                                    url: `/${e.repository_nwo}/blob/${e.commit_sha}/${o}#L${e.line_number}`
                                }
                            }))
                        } else {
                            if ("SUGGESTION_KIND_SYMBOL" !== e.kind) continue;
                            let t = eN(e.path),
                                i = e.repository_nwo,
                                n = i.length > 0 && t.length > 0 ? " \xb7 " : "",
                                r = e.path.split("/").map(encodeURIComponent).join("/"),
                                a = new ew.cR({
                                    kind: e.symbol ? .kind ? ? ""
                                });
                            this.dispatchEvent(new L.T2({
                                value: e.symbol ? .fully_qualified_name ? ? "",
                                prefixText: a.fullName,
                                prefixColor: function(e) {
                                    switch (e.plColor) {
                                        case "prettylights.syntax.entity":
                                        default:
                                            return L.gC.Entity;
                                        case "prettylights.syntax.constant":
                                            return L.gC.Constant;
                                        case "prettylights.syntax.keyword":
                                            return L.gC.Keyword;
                                        case "prettylights.syntax.variable":
                                            return L.gC.Variable;
                                        case "prettylights.syntax.string":
                                            return L.gC.String
                                    }
                                }(a),
                                icon: L.zi.FileCode,
                                description: `${i}${n}${t}`,
                                priority: 0,
                                action: {
                                    url: `/${e.repository_nwo}/blob/${e.commit_sha}/${r}#L${e.line_number}`
                                }
                            }))
                        }
                        n++
                    }
                }
                async fetchData(e) {
                    let t = e.parsedMetadata;
                    if (!t || !t.query || t.caretPositionKind !== w.tT.Text && t.caretPositionKind !== w.tT.Path) return [];
                    if (eE(this, eq)[t.query]) return eE(this, eq)[t.query];
                    if ("false" === eE(this, eL).getAttribute("data-logged-in")) return [];
                    let i = new URLSearchParams({
                            query: t.query,
                            saved_searches: JSON.stringify(t.customScopes)
                        }),
                        n = eE(this, eL).getAttribute("data-blackbird-suggestions-path");
                    if (!n) throw Error("could not get blackbird suggestions path");
                    let r = await (await fetch(`${n}?${i}`, {
                        method: "GET",
                        mode: "same-origin",
                        headers: {
                            Accept: "application/json"
                        }
                    })).json();
                    return r.failed ? [] : (eE(this, eq)[t.query] = r.suggestions, r.suggestions)
                }
                constructor(e, t) {
                    super(), eT(this, eq, {
                        writable: !0,
                        value: void 0
                    }), eT(this, eL, {
                        writable: !0,
                        value: void 0
                    }), this.queryBuilder = e, this.priority = 9, this.name = "Code", this.singularItemName = "code", this.value = "code", this.type = "search", this.manuallyDetermineFilterEligibility = !0, eC(this, eq, {}), this.queryBuilder.addEventListener("query", this), eC(this, eL, t)
                }
            };

            function eN(e) {
                return e.length > 60 ? `...${e.substring(e.length-60+3)}` : e
            }

            function ek(e, t, i) {
                if (!t.has(e)) throw TypeError("attempted to " + i + " private field on non-instance");
                return t.get(e)
            }

            function ex(e, t) {
                var i = ek(e, t, "get");
                return i.get ? i.get.call(e) : i.value
            }

            function eB(e, t, i) {
                ! function(e, t) {
                    if (t.has(e)) throw TypeError("Cannot initialize the same private elements twice on an object")
                }(e, t), t.set(e, i)
            }

            function eA(e, t, i) {
                var n = ek(e, t, "set");
                return ! function(e, t, i) {
                    if (t.set) t.set.call(e, i);
                    else {
                        if (!t.writable) throw TypeError("attempted to set read only private field");
                        t.value = i
                    }
                }(e, n, i), i
            }! function(e) {
                e.INDEXING = "indexing", e.INDEXED = "indexed", e.NOTINDEXED = "notindexed", e.UNKNOWN = "unknown"
            }(n || (n = {}));
            var eR = new WeakMap,
                eP = new WeakMap,
                e_ = new WeakMap;
            let InputProvider = class InputProvider extends EventTarget {
                async fetchInitialRepoIndexingStatus() {
                    let e = ex(this, eR).getAttribute("data-current-repository"),
                        t = ex(this, eR).getAttribute("data-blackbird-indexed-repo-csrf");
                    if (e && t) {
                        let i = new URL(`/search/check_indexing_status?nwo=${encodeURIComponent(e)}`, window.location.origin),
                            n = await fetch(i.href, {
                                method: "GET",
                                mode: "same-origin",
                                headers: {
                                    Accept: "application/json",
                                    "Scoped-CSRF-Token": t,
                                    "X-Requested-With": "XMLHttpRequest"
                                }
                            });
                        if (n.ok) {
                            let t = await n.json(),
                                i = t.code_status;
                            "indexing" !== i && (ex(this, eP)[e] = i)
                        }
                    }
                }
                async handleEvent(e) {
                    let t;
                    let n = e.parsedMetadata;
                    if (e.rawQuery && this.dispatchEvent(new L.T2({
                            value: e.rawQuery,
                            scope: "GITHUB",
                            icon: L.zi.Search,
                            priority: 0,
                            action: {
                                query: e.rawQuery
                            },
                            isFallbackSuggestion: !0
                        })), !n || n.caretPositionKind !== w.tT.Text) return [];
                    let r = n.query.trim(),
                        a = ex(this, eR).getAttribute("data-current-repository"),
                        o = ex(this, eR).getAttribute("data-current-org"),
                        s = ex(this, eR).getAttribute("data-current-owner");
                    ex(this, e_) || eA(this, e_, await Promise.all([i.e("vendors-node_modules_github_blackbird-parser_dist_blackbird_js"), i.e("app_components_search_parsing_parsing_ts")]).then(i.bind(i, 91691)));
                    let l = ex(this, e_).parseString(r || "");
                    if (l.children) {
                        let e = l.children.filter(e => "Qualifier" === e.kind);
                        a = e.find(e => "Repo" === e.qualifier) ? .content ? .value ? .toString() || a, t = e.find(e => "Org" === e.qualifier), o = t ? .content ? .value ? .toString() || o, s = e.find(e => "Org" === e.qualifier && "user:" === e.raw) ? .content ? .value ? .toString() || s, a && !t && (o = a.split("/")[0])
                    }
                    let c = [],
                        u = !1;
                    if (n.ast) {
                        let e = n.ast;
                        if ((0, w.g8)(e)) {
                            r = e.children.filter(e => "Text" === e.kind).map(e => e.value).join(" ");
                            let t = (0, w.o8)(e);
                            if (t.find(e => "saved" === e.kind)) return [];
                            t.length && (u = !0)
                        } else(0, w.az)(e) && (r = "");
                        a && a.length > 0 && c.push({
                            query: `repo:${a} ${r}`,
                            scope: "REPO"
                        }), t ? c.push({
                            query: `${t.raw}${o} ${r}`,
                            scope: "ORG"
                        }) : (o && o.length > 0 && c.push({
                            query: `org:${o} ${r}`,
                            scope: "ORG"
                        }), s && s.length > 0 && c.push({
                            query: `user:${s} ${r}`,
                            scope: "OWNER"
                        }))
                    }
                    r.length > 0 && (u ? c.push({
                        query: r,
                        scope: "GITHUB"
                    }) : c.unshift({
                        query: r,
                        scope: "GITHUB"
                    }));
                    let d = ex(this, eR).getAttribute("data-blackbird-indexed-repo-csrf"),
                        h = null !== a && a.length > 0 && r.length > 0 && this.copilotChatEnabled && void 0 !== d,
                        p = function(e) {
                            let t = /^\/[^/]+\/[^/]+\/tree\/[^/]+\/(.*)/.exec(e);
                            if (t) {
                                for (let e = 1; e < t.length; e++)
                                    if (t[e]) return function(e) {
                                        (e = decodeURIComponent(e)).endsWith("/") && (e = e.substring(0, e.length - 1));
                                        let t = e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                                        return `/^${t.replaceAll("/","\\/")}\\//`
                                    }(t[e])
                            }
                        }(window.location.pathname);
                    if (p) {
                        let e = `repo:${a} path:${p} ${r}`;
                        this.dispatchEvent(new L.T2({
                            value: e,
                            scope: "DIRECTORY",
                            icon: L.zi.Search,
                            priority: 0,
                            action: {
                                commandName: "blackbird-monolith.search",
                                data: {
                                    query: e
                                }
                            }
                        }))
                    }
                    for (let e of c.slice(h ? 1 : 0, 3)) this.dispatchEvent(new L.T2({
                        value: e.query,
                        scope: e.scope,
                        icon: L.zi.Search,
                        priority: 0,
                        action: {
                            commandName: "blackbird-monolith.search",
                            data: {
                                query: e.query
                            }
                        }
                    }));
                    if (h && d) {
                        let e = new URL(`/search/check_indexing_status?nwo=${encodeURIComponent(a)}`, window.location.origin),
                            t = ex(this, eP)[a] ? ? "unknown";
                        if ("unknown" === t) {
                            let i = fetch(e.href, {
                                method: "GET",
                                mode: "same-origin",
                                headers: {
                                    Accept: "application/json",
                                    "Scoped-CSRF-Token": d,
                                    "X-Requested-With": "XMLHttpRequest"
                                }
                            });
                            this.dispatchEvent(new L.Z(i));
                            let n = await i;
                            if (n.ok) {
                                let e = await n.json();
                                "indexing" !== (t = e.code_status) && (ex(this, eP)[a] = t)
                            }
                        }
                        "indexed" === t && this.dispatchEvent(new L.T2({
                            value: `repo:${a} ${r}`,
                            scope: "COPILOT",
                            icon: L.zi.Copilot,
                            priority: 0,
                            action: {
                                commandName: "search-copilot-chat",
                                data: {
                                    content: r,
                                    repoNwo: a
                                }
                            }
                        }))
                    }
                }
                getQualifierType(e) {
                    return e.includes("repo") ? "In this repository" : e.includes("org") ? "In this organization" : e.includes("user") ? "In this user" : e.includes("owner") ? "In this owner" : "All of GitHub"
                }
                constructor(e, t, i) {
                    super(), eB(this, eR, {
                        writable: !0,
                        value: void 0
                    }), eB(this, eP, {
                        writable: !0,
                        value: void 0
                    }), eB(this, e_, {
                        writable: !0,
                        value: void 0
                    }), this.queryBuilder = e, this.priority = 0, this.name = "", this.singularItemName = "search", this.value = "search", this.type = "search", this.copilotChatEnabled = !1, eA(this, eP, {}), this.queryBuilder.addEventListener("query", this), eA(this, eR, t), this.copilotChatEnabled = i, i && this.fetchInitialRepoIndexingStatus()
                }
            };

            function eM(e, t) {
                if (t.has(e)) throw TypeError("Cannot initialize the same private elements twice on an object")
            }

            function eI(e, t, i) {
                if (!t.has(e)) throw TypeError("attempted to " + i + " private field on non-instance");
                return t.get(e)
            }

            function eD(e, t) {
                var i = eI(e, t, "get");
                return i.get ? i.get.call(e) : i.value
            }

            function eF(e, t, i) {
                eM(e, t), t.set(e, i)
            }

            function eO(e, t, i) {
                var n = eI(e, t, "set");
                return ! function(e, t, i) {
                    if (t.set) t.set.call(e, i);
                    else {
                        if (!t.writable) throw TypeError("attempted to set read only private field");
                        t.value = i
                    }
                }(e, n, i), i
            }

            function ej(e, t, i) {
                if (!t.has(e)) throw TypeError("attempted to get private field on non-instance");
                return i
            }

            function e$(e, t) {
                eM(e, t), t.add(e)
            }

            function eW(e, t, i, n) {
                var r, a = arguments.length,
                    o = a < 3 ? t : null === n ? n = Object.getOwnPropertyDescriptor(t, i) : n;
                if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o = Reflect.decorate(e, t, i, n);
                else
                    for (var s = e.length - 1; s >= 0; s--)(r = e[s]) && (o = (a < 3 ? r(o) : a > 3 ? r(t, i, o) : r(t, i)) || o);
                return a > 3 && o && Object.defineProperty(t, i, o), o
            }
            let eQ = String.fromCharCode(160),
                ez = 'Type <kbd class="AppHeader-search-kbd">/</kbd> to search',
                eH = (r = new WeakMap, a = new WeakMap, o = new WeakMap, s = new WeakMap, l = new WeakMap, c = new WeakMap, u = new WeakMap, d = new WeakMap, h = new WeakMap, p = new WeakMap, m = new WeakMap, f = new WeakSet, v = new WeakMap, y = new WeakMap, g = new WeakSet, class QbsearchInputElement extends HTMLElement {
                    get query() {
                        return this.queryBuilder.input ? .value || ""
                    }
                    set query(e) {
                        this.queryBuilder.input && (this.queryBuilder.input.value = e, this.queryBuilder.parseQuery(), this.setButtonText(e), (async () => {
                            await this.parseSearchInputRaw(), this.syncRichButtonText()
                        })())
                    }
                    flattenASTForQueryBuilder(e) {
                        let t = this.parsing ? .getHighlights(e.ast) || [];
                        t.sort((e, t) => e.location.start - t.location.start);
                        let i = 0,
                            n = [];
                        for (let r of t) {
                            if (r.location.start > i && n.push({
                                    type: "text",
                                    value: e.query.substring(i, r.location.start)
                                }), i > r.location.start) continue;
                            let t = L.tj.Normal;
                            "pl-en" === r.className ? t = L.tj.Entity : "pl-c1" === r.className ? t = L.tj.Constant : "input-parsed-symbol" === r.className && (t = L.tj.FilterValue), n.push({
                                type: "text",
                                value: e.query.substring(r.location.start, r.location.end),
                                style: t
                            }), i = r.location.end
                        }
                        return i < e.query.length && n.push({
                            type: "text",
                            value: e.query.substring(i)
                        }), n
                    }
                    isLoggedIn() {
                        return "true" === this.getAttribute("data-logged-in")
                    }
                    copilotChatEnabled() {
                        return "true" === this.getAttribute("data-copilot-chat-enabled")
                    }
                    connectedCallback() {
                        eO(this, r, !1), this.isLoggedIn() && (eO(this, p, this.getAttribute("data-custom-scopes-path") || ""), eO(this, u, new SavedScopeProvider(this.queryBuilder, eD(this, p))), (async () => {
                            await window.customElements.whenDefined("custom-scopes"), this.customScopesManager.initialize(eD(this, u).customScopesCache, () => eD(this, u).fetchSuggestions(), eD(this, p), this.getAttribute("data-delete-custom-scopes-csrf") || ""), eO(this, m, !0)
                        })());
                        let {
                            signal: e
                        } = eO(this, a, new AbortController);
                        window.addEventListener("blackbird_monolith_react_connected", () => {
                            eO(this, r, !0)
                        }, {
                            signal: e
                        }), window.addEventListener("blackbird_monolith_react_disconnected", () => {
                            eO(this, r, !1)
                        }, {
                            signal: e
                        }), window.addEventListener("blackbird_provide_feedback", () => {
                            this.feedbackDialog.show()
                        }, {
                            signal: e
                        }), window.addEventListener("blackbird_monolith_set_global_nav_visibility", e => {
                            let t = e.detail;
                            this.setGlobalNavVisibility(t), this.setGlobalBarAlwaysExpanded(!t), eO(this, s, !t), eD(this, s) ? this.classList.add("flex-1") : this.classList.remove("flex-1"), this.setButtonText(this.query)
                        }, {
                            signal: e
                        }), window.dispatchEvent(new CustomEvent("blackbird_monolith_retransmit_react")), window.addEventListener("blackbird_monolith_update_input", e => {
                            this.query = e.detail
                        }, {
                            signal: e
                        }), window.addEventListener("blackbird_monolith_append_and_focus_input", async e => {
                            let {
                                appendQuery: t,
                                retainScrollPosition: i,
                                returnTarget: n
                            } = e.detail;
                            n && i ? this.expandAndRetainScrollPosition(n) : (await this.expand(), n && eO(this, h, n)), t && !this.query.trim().endsWith(t) && (this.query += ` ${t}`), this.parsing || await this.loadParser(), this.moveCaretToEndOfInput(), await this.parseSearchInputRaw()
                        }, {
                            signal: e
                        }), window.addEventListener("blackbird_monolith_save_query_as_custom_scope", e => {
                            this.saveQueryAsCustomScope(e)
                        }, {
                            signal: e
                        }), (async () => {
                            await window.customElements.whenDefined("query-builder");
                            let e = [new HistoryProvider(this.queryBuilder), new SavedScopeProvider(this.queryBuilder, eD(this, p)), new BlackbirdProvider(this.queryBuilder, this)],
                                t = [new LanguagesProvider(this.queryBuilder), new ReposFilterProvider(this.queryBuilder, this), new ReposSearchProvider(this.queryBuilder, this), new OwnersProvider(this.queryBuilder, this), new FixedValuesProvider(this.queryBuilder), new TeamsProvider(this.queryBuilder, this), new ProjectsProvider(this.queryBuilder, this), new InputProvider(this.queryBuilder, this, this.copilotChatEnabled())];
                            this.isLoggedIn() && t.push(...e), this.queryBuilder.initialize(this.parser, t), this.query = this.getAttribute("data-initial-value") || ""
                        })(), this.queryBuilder.parentElement ? .addEventListener("submit", e => {
                            this.search(this.queryBuilder.query), this.retract(), this.queryBuilder.inputSubmit(), e.preventDefault()
                        }), this.queryBuilder.addEventListener("blackbird-monolith.manageCustomScopes", e => {
                            eD(this, m) && ej(this, g, eV).call(this, e)
                        }), this.queryBuilder.addEventListener("query-builder:navigate", e => {
                            let t = e.detail ? .url;
                            if (t) {
                                let e = new URL(t, window.location.origin);
                                if (e.origin === window.location.origin && e.pathname === window.location.pathname) {
                                    let t = (0, q.n6)(e.hash);
                                    t.blobRange ? .start ? .line && window.dispatchEvent(new CustomEvent("react_blob_view_scroll_line_into_view", {
                                        detail: {
                                            line: t.blobRange.start.line
                                        }
                                    }))
                                }
                            }
                            this.retract()
                        }), this.queryBuilder.addEventListener("blackbird-monolith.search", e => {
                            this.search(e.detail ? .query ? ? "")
                        }), this.queryBuilder.addEventListener("search-copilot-chat", e => {
                            window.dispatchEvent(new eG(e.detail ? .content, e.detail ? .repoNwo)), this.retract()
                        }), (0, S.Nc)(window.location.pathname)
                    }
                    syncRichButtonText() {
                        if (eD(this, s)) {
                            if ("" === this.query) {
                                let e = this.inputButton.getAttribute("placeholder");
                                e ? this.inputButtonText.textContent = this.inputButton.getAttribute("placeholder") : this.inputButtonText.innerHTML = ez, this.inputButton.classList.add("placeholder")
                            } else {
                                let e = this.parser.flatten(this.parser.parse(this.query, void 0)),
                                    t = [];
                                for (let i of e) {
                                    let e = document.createElement("span");
                                    e.textContent = i.value, i.style === L.tj.FilterValue ? e.classList.add("input-parsed-symbol") : i.style === L.tj.Constant ? e.classList.add("pl-c1") : i.style === L.tj.Entity && e.classList.add("pl-en"), t.push(e)
                                }
                                this.inputButtonText.replaceChildren(...t)
                            }
                        }
                    }
                    setButtonText(e) {
                        if (eD(this, s) && "" !== e.trim()) this.inputButtonText.textContent = e, this.inputButton.classList.remove("placeholder");
                        else {
                            let e = this.inputButton.getAttribute("placeholder");
                            e ? this.inputButtonText.textContent = this.inputButton.getAttribute("placeholder") : this.inputButtonText.innerHTML.trim() !== ez && (this.inputButtonText.innerHTML = ez), this.inputButton.classList.add("placeholder")
                        }
                    }
                    async moveCaretToEndOfInput() {
                        await window.customElements.whenDefined("query-builder"), this.queryBuilder.moveCaretToEndOfInput()
                    }
                    disconnectedCallback() {
                        eD(this, a) ? .abort()
                    }
                    getSuggestionInputState() {
                        let e = [];
                        return this.ast && (e = ej(this, f, eU).call(this, this.ast)), {
                            query: this.query.replaceAll(eQ, " "),
                            ast: this.ast,
                            selectedNode: eD(this, c),
                            mode: eD(this, l),
                            customScopes: e,
                            type: this.ast ? this.chooseSearchType(this.ast) : ""
                        }
                    }
                    setGlobalNavVisibility(e) {
                        let t = document.querySelector("#global-nav"),
                            i = window.matchMedia("(min-width: 768px)");
                        t && i.matches && (t.hidden = !e)
                    }
                    setGlobalBarAlwaysExpanded(e) {
                        if (!this.headerRedesignEnabled) return;
                        let t = document.querySelector(".js-global-bar");
                        t && (e ? t.classList.add("always-expanded") : t.classList.remove("always-expanded"))
                    }
                    setGlobalBarModalOpen(e) {
                        if (!this.headerRedesignEnabled) return;
                        let t = document.querySelector(".js-global-bar");
                        t && (e ? t.classList.add("search-expanded") : t.classList.remove("search-expanded"))
                    }
                    searchInputContainerClicked(e) {
                        e.target.classList.contains("search-input-container") && this.expand(), (0, E.qP)("blackbird.click", {
                            target: "SEARCH_BOX"
                        })
                    }
                    async updateQueryBuilderVisibility() {
                        await window.customElements.whenDefined("query-builder"), this.queryBuilderContainer.hidden = !this.classList.contains("expanded"), this.darkBackdrop.hidden = this.queryBuilderContainer.hidden
                    }
                    expandAndRetainScrollPosition(e) {
                        window.scrollY > 200 ? (this.classList.add("search-input-absolute"), this.style.top = `${window.scrollY+25}px`, this.expand(!0), eO(this, h, e)) : this.expand()
                    }
                    handleExpand() {
                        this.expand(!1)
                    }
                    async expand(e) {
                        this.possiblyWarmCaches(), this.classList.contains("expanded") || (e || window.scrollTo(0, 0), eO(this, h, this.inputButton), this.searchSuggestionsDialog.show(), this.classList.add("expanded"), this.setGlobalNavVisibility(!1), this.setGlobalBarModalOpen(!0), this.updateQueryBuilderVisibility(), await window.customElements.whenDefined("query-builder"), "" === this.query && this.getAttribute("data-scope") && (this.query = `${this.getAttribute("data-scope")} `), this.queryBuilder.inputFocus(), this.moveCaretToEndOfInput(), this.queryBuilder.inputChange(), this.parseSearchInputRaw())
                    }
                    possiblyWarmCaches() {
                        !eD(this, o) && this.isLoggedIn() && (eO(this, o, !0), fetch("/search/warm_blackbird_caches", {
                            headers: {
                                Accept: "application/json",
                                "X-Requested-With": "XMLHttpRequest"
                            }
                        }))
                    }
                    chooseSearchType(e) {
                        let t = new URLSearchParams(window.location.search).get("type");
                        return t ? this.parsing.mapURLParamToSearchType(t) : this.parsing.chooseSearchType(e, this.isLoggedIn())
                    }
                    async search(e, t = !1) {
                        let i = await this.loadParser(),
                            n = i.parseString(e),
                            a = ej(this, f, eU).call(this, n),
                            o = i.mapSearchTypeToURLParam(this.chooseSearchType(n)),
                            s = (0, w.MO)(n, window.location.pathname);
                        if (s) {
                            (0, T.softNavigate)(s);
                            return
                        }
                        if (eD(this, r) && !t) {
                            let t = {
                                type: o,
                                p: null,
                                l: null
                            };
                            a.length > 0 ? (t.saved_searches = JSON.stringify(a), t.expanded_query = i.getExpandedQuery(e, a, n)) : (t.saved_searches = void 0, t.expanded_query = void 0), window.dispatchEvent(new CustomEvent("blackbird_monolith_search", {
                                detail: {
                                    search: e,
                                    searchParams: t
                                }
                            }))
                        } else {
                            let r = "";
                            "" !== o && (r = `&type=${encodeURIComponent(o)}`);
                            let s = `/search?q=${encodeURIComponent(e)}${r}`;
                            if (a.length > 0) {
                                s += `&saved_searches=${encodeURIComponent(JSON.stringify(a))}`;
                                let t = encodeURIComponent(i.getExpandedQuery(e, a, n));
                                s += `&expanded_query=${t}`
                            }
                            let l = (0, C.ZV)().join(",");
                            "" !== l && (s += `&experiments=${l}`), t ? window.open(s, "_blank") : (0, T.softNavigate)(s)
                        }
                    }
                    setLocalHistory(e) {
                        if ("" === e.trim()) return;
                        let t = JSON.parse(window.localStorage.getItem("github-search-history") ? ? "[]");
                        t.length >= 50 && (t = t.slice(0, 49)), t.find(t => t.toLowerCase() === e.toLowerCase()) || t.unshift(e), window.localStorage.setItem("github-search-history", JSON.stringify(t))
                    }
                    handleChange() {
                        this.parseSearchInput()
                    }
                    async loadParser() {
                        return this.parsingPromise || (this.parsingPromise = Promise.all([i.e("vendors-node_modules_github_blackbird-parser_dist_blackbird_js"), i.e("app_components_search_parsing_parsing_ts")]).then(i.bind(i, 91691)), this.parsing = await this.parsingPromise), this.parsingPromise
                    }
                    parseSearchInput() {
                        let e = Date.now();
                        e - eD(this, y) > 15 && !eD(this, v) ? this.parseSearchInputRaw() : eD(this, v) || (eO(this, v, !0), setTimeout(() => {
                            eO(this, v, !1), this.parseSearchInputRaw()
                        }, 15 - (e - eD(this, y))))
                    }
                    async parseSearchInputRaw() {
                        if (!this.query) {
                            this.lastParsedQuery = this.query, this.ast = {
                                kind: "Nothing"
                            }, eO(this, l, w.tT.Text), eO(this, c, void 0);
                            return
                        }
                        if (this.parsing || await this.loadParser(), eO(this, y, Date.now()), !this.ast || this.query !== this.lastParsedQuery) {
                            this.lastParsedQuery = this.query;
                            let [e] = this.parsing.parseSearchInput(this.lastParsedQuery);
                            this.ast = e
                        }
                        let e = this.parsing.getCaretPositionKindFromIndex(this.ast, 0);
                        eO(this, l, e.kind), eO(this, c, e.node)
                    }
                    handleSubmit(e = !1) {
                        0 !== this.query.trim().length && (this.setLocalHistory(this.query), this.search(this.query, e), this.retract())
                    }
                    editCustomScope(e) {
                        this.customScopesManager.editCustomScope(e)
                    }
                    newCustomScope(e) {
                        this.customScopesManager.create(""), e.stopPropagation()
                    }
                    saveQueryAsCustomScope(e) {
                        this.customScopesManager.create(this.query), eO(this, d, e.detail)
                    }
                    handleDialogClose() {
                        setTimeout(() => {
                            eD(this, d) ? (eD(this, d) ? .focus(), eO(this, d, void 0)) : this.inputButton.focus()
                        })
                    }
                    showFeedbackDialog(e) {
                        this.feedbackDialog.show(), this.retract(), e.stopPropagation(), e.preventDefault()
                    }
                    async submitFeedback(e) {
                        e.preventDefault();
                        let t = e.target.form;
                        await fetch(t.action, {
                            method: "POST",
                            body: new FormData(t)
                        }), this.feedbackDialog.close()
                    }
                    constructor(...e) {
                        super(...e), e$(this, f), e$(this, g), eF(this, r, {
                            writable: !0,
                            value: void 0
                        }), eF(this, a, {
                            writable: !0,
                            value: void 0
                        }), eF(this, o, {
                            writable: !0,
                            value: void 0
                        }), eF(this, s, {
                            writable: !0,
                            value: void 0
                        }), eF(this, l, {
                            writable: !0,
                            value: void 0
                        }), eF(this, c, {
                            writable: !0,
                            value: void 0
                        }), eF(this, u, {
                            writable: !0,
                            value: void 0
                        }), eF(this, d, {
                            writable: !0,
                            value: void 0
                        }), eF(this, h, {
                            writable: !0,
                            value: void 0
                        }), eF(this, p, {
                            writable: !0,
                            value: void 0
                        }), eF(this, m, {
                            writable: !0,
                            value: void 0
                        }), eF(this, v, {
                            writable: !0,
                            value: void 0
                        }), eF(this, y, {
                            writable: !0,
                            value: void 0
                        }), this.headerRedesignEnabled = !1, eO(this, o, !1), eO(this, s, !1), eO(this, l, w.tT.Text), eO(this, h, null), eO(this, m, !1), this.parser = {
                            parse: (e, t) => {
                                let i, n;
                                if (!this.parsing) return (e || this.classList.contains("expanded")) && (async () => {
                                    await this.loadParser(), this.queryBuilder.parseQuery()
                                })(), {
                                    query: e
                                };
                                let [r] = this.parsing.parseSearchInput(e), a = ej(this, f, eU).call(this, r);
                                if (void 0 !== t) {
                                    let e = this.parsing.getCaretPositionKindFromIndex(r, t);
                                    i = e.kind, n = e.node
                                }
                                return {
                                    ast: r,
                                    query: e,
                                    caretPositionKind: i,
                                    caretSelectedNode: n,
                                    customScopes: a
                                }
                            },
                            flatten: this.flattenASTForQueryBuilder.bind(this)
                        }, this.handleClose = e => {
                            this.syncRichButtonText(), this.classList.remove("expanded"), eD(this, s) || this.setGlobalNavVisibility(!0), this.setGlobalBarModalOpen(!1), this.updateQueryBuilderVisibility(), e.preventDefault(), this.classList.contains("search-input-absolute") && this.classList.remove("search-input-absolute"), setTimeout(() => {
                                eD(this, h) ? .focus()
                            }, 0)
                        }, this.retract = () => {
                            this.searchSuggestionsDialog.close(), eD(this, h) ? .focus()
                        }, eO(this, v, !1), eO(this, y, 0)
                    }
                });
            eW([b.fA], eH.prototype, "inputButton", void 0), eW([b.fA], eH.prototype, "inputButtonText", void 0), eW([b.fA], eH.prototype, "queryBuilder", void 0), eW([b.fA], eH.prototype, "queryBuilderContainer", void 0), eW([b.fA], eH.prototype, "clearInputButton", void 0), eW([b.fA], eH.prototype, "clearInputButtonSeparator", void 0), eW([b.fA], eH.prototype, "searchSuggestionsDialog", void 0), eW([b.fA], eH.prototype, "suggestionHeadingTemplate", void 0), eW([b.fA], eH.prototype, "suggestionTemplate", void 0), eW([b.fA], eH.prototype, "darkBackdrop", void 0), eW([b.fA], eH.prototype, "customScopesManager", void 0), eW([b.fA], eH.prototype, "feedbackDialog", void 0), eW([b.Lj], eH.prototype, "headerRedesignEnabled", void 0), eH = eW([b.Ih], eH);
            let eG = class SearchCopilotEvent extends Event {
                constructor(e, t) {
                    super("search-copilot-chat", {
                        bubbles: !1,
                        cancelable: !0
                    }), this.content = e, this.repoNwo = t
                }
            };

            function eU(e) {
                let t;
                if (!this.parsing) return [];
                let i = this.parsing.getCustomScopeNames(e);
                try {
                    t = JSON.parse(new URLSearchParams(window.location.search).get("saved_searches") || "[]"), Array.isArray(t) || (t = [])
                } catch (e) {
                    t = []
                }
                let n = [];
                for (let e of i) {
                    let i = t.find(t => t.name === e) || eD(this, u).customScopesCache.get() ? .find(t => t.name === e);
                    i && n.push({
                        name: i.name,
                        query: i.query
                    })
                }
                return n
            }
            async function eV(e) {
                this.retract(), this.customScopesManager.show(), e.stopPropagation()
            }
        },
        58700: (e, t, i) => {
            i.d(t, {
                Bt: () => a,
                DN: () => s,
                KL: () => u,
                Se: () => o,
                qC: () => d,
                sw: () => l
            });
            var n = i(5582);

            function r(e, t, i) {
                return e.dispatchEvent(new CustomEvent(t, {
                    bubbles: !0,
                    cancelable: i
                }))
            }

            function a(e, t) {
                t && (function(e, t) {
                    if (!(e instanceof HTMLFormElement)) throw TypeError("The specified element is not of type HTMLFormElement.");
                    if (!(t instanceof HTMLElement)) throw TypeError("The specified element is not of type HTMLElement.");
                    if ("submit" !== t.type) throw TypeError("The specified element is not a submit button.");
                    if (!e || e !== t.form) throw Error("The specified element is not owned by the form element.")
                }(e, t), (0, n.j)(t)), r(e, "submit", !0) && e.submit()
            }

            function o(e, t) {
                if ("boolean" == typeof t) {
                    if (e instanceof HTMLInputElement) e.checked = t;
                    else throw TypeError("only checkboxes can be set to boolean value")
                } else {
                    if ("checkbox" === e.type) throw TypeError("checkbox can't be set to string value");
                    e.value = t
                }
                r(e, "change", !1)
            }

            function s(e, t) {
                for (let i in t) {
                    let n = t[i],
                        r = e.elements.namedItem(i);
                    r instanceof HTMLInputElement ? r.value = n : r instanceof HTMLTextAreaElement && (r.value = n)
                }
            }

            function l(e) {
                if (!(e instanceof HTMLElement)) return !1;
                let t = e.nodeName.toLowerCase(),
                    i = (e.getAttribute("type") || "").toLowerCase();
                return "select" === t || "textarea" === t || "input" === t && "submit" !== i && "reset" !== i || e.isContentEditable
            }

            function c(e) {
                return new URLSearchParams(e)
            }

            function u(e, t) {
                let i = new URLSearchParams(e.search),
                    n = c(t);
                for (let [e, t] of n) i.append(e, t);
                return i.toString()
            }

            function d(e) {
                return c(new FormData(e)).toString()
            }
        },
        5582: (e, t, i) => {
            function n(e) {
                let t = e.closest("form");
                if (!(t instanceof HTMLFormElement)) return;
                let i = r(t);
                if (e.name) {
                    let n = e.matches("input[type=submit]") ? "Submit" : "",
                        r = e.value || n;
                    i || ((i = document.createElement("input")).type = "hidden", i.classList.add("js-submit-button-value"), t.prepend(i)), i.name = e.name, i.value = r
                } else i && i.remove()
            }

            function r(e) {
                let t = e.querySelector("input.js-submit-button-value");
                return t instanceof HTMLInputElement ? t : null
            }
            i.d(t, {
                j: () => n,
                u: () => r
            })
        },
        67044: (e, t, i) => {
            i.d(t, {
                DV: () => a,
                D_: () => n.D_,
                EL: () => n.EL,
                N9: () => n.N9,
                Tz: () => n.Tz,
                k0: () => n.k0
            });
            var n = i(11793);
            let r = /(?:^|,)((?:[^,]|,(?=\+| |$))*(?:,(?=,))?)/g;

            function a(e) {
                return Array.from(e.matchAll(r)).map(([, e]) => e)
            }
        },
        76134: (e, t, i) => {
            i.d(t, {
                Ty: () => a,
                YE: () => o,
                Zf: () => l
            });
            var n = i(46426),
                r = i(67044);
            let a = () => {
                    let e = document.querySelector("meta[name=keyboard-shortcuts-preference]");
                    return !e || "all" === e.content
                },
                o = e => /Enter|Arrow|Escape|Meta|Control|Mod|Esc/.test(e) || e.includes("Alt") && e.includes("Shift"),
                s = new Set(["button", "checkbox", "color", "file", "hidden", "image", "radio", "range", "reset", "submit"]),
                l = e => {
                    let t = (0, r.EL)(e),
                        i = function(e) {
                            if (!(e instanceof HTMLElement)) return !1;
                            let t = e.nodeName.toLowerCase(),
                                i = e.getAttribute("type") ? .toLowerCase() ? ? "text",
                                n = "true" === e.ariaReadOnly || "true" === e.getAttribute("aria-readonly") || null !== e.getAttribute("readonly");
                            return ("select" === t || "textarea" === t || "input" === t && !s.has(i) || e.isContentEditable) && !n
                        }(e.target) && (0, n.c)("no_character_key_shortcuts_in_inputs"),
                        l = a() && !i;
                    return o(t) || l
                }
        },
        95253: (e, t, i) => {
            let n;
            i.d(t, {
                YT: () => h,
                qP: () => p,
                yM: () => m
            });
            var r = i(88149),
                a = i(86058),
                o = i(44544),
                s = i(71643);
            let {
                getItem: l
            } = (0, o.Z)("localStorage"), c = "dimension_", u = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "scid"];
            try {
                let e = (0, r.n)("octolytics");
                delete e.baseContext, n = new a.R(e)
            } catch (e) {}

            function d(e) {
                let t = (0, r.n)("octolytics").baseContext || {};
                if (t)
                    for (let [e, i] of (delete t.app_id, delete t.event_url, delete t.host, Object.entries(t))) e.startsWith(c) && (t[e.replace(c, "")] = i, delete t[e]);
                let i = document.querySelector("meta[name=visitor-payload]");
                if (i) {
                    let e = JSON.parse(atob(i.content));
                    Object.assign(t, e)
                }
                let n = new URLSearchParams(window.location.search);
                for (let [e, i] of n) u.includes(e.toLowerCase()) && (t[e] = i);
                return t.staff = (0, s.B)().toString(), Object.assign(t, e)
            }

            function h(e) {
                n ? .sendPageView(d(e))
            }

            function p(e, t = {}) {
                let i = document.head ? .querySelector('meta[name="current-catalog-service"]') ? .content,
                    r = i ? {
                        service: i
                    } : {};
                for (let [e, i] of Object.entries(t)) null != i && (r[e] = `${i}`);
                if (n) {
                    let t = e || "unknown";
                    d(r), n.sendEvent(t, d(r))
                }
            }

            function m(e) {
                return Object.fromEntries(Object.entries(e).map(([e, t]) => [e, JSON.stringify(t)]))
            }
        },
        45974: (e, t, i) => {
            i.d(t, {
                dy: () => s.dy,
                sY: () => s.sY,
                Au: () => s.Au
            });
            var n = i(22490),
                r = i(7180);
            let a = "jtml-no-op",
                o = n.ZO.createPolicy(a, {
                    createHTML: e => r.O.apply({
                        policy: () => e,
                        policyName: a,
                        fallback: e,
                        fallbackOnError: !0
                    })
                });
            var s = i(20845);
            s.js.setCSPTrustedTypesPolicy(o)
        },
        3399: (e, t, i) => {
            var n, r, a, o;
            i.d(t, {
                    Fi: () => n,
                    Ju: () => l,
                    L2: () => FilterItem,
                    T2: () => SearchItem,
                    UK: () => QueryEvent,
                    Z: () => FetchDataEvent,
                    gC: () => a,
                    i: () => s,
                    tj: () => o,
                    zi: () => r
                }),
                function(e) {
                    e.DIRECTORY = "Search in this directory", e.ORG = "Search in this organization", e.OWNER = "Search in this owner", e.REPO = "Search in this repository", e.GITHUB = "Search all of GitHub", e.GENERAL = "Submit search", e.COMMAND = "Run command", e.COPILOT = "Ask Copilot", e.DEFAULT = "Jump to"
                }(n || (n = {}));
            let s = "Autocomplete";
            let FilterItem = class FilterItem extends Event {
                constructor({
                    filter: e,
                    value: t,
                    name: i = "",
                    description: n = "",
                    inlineDescription: r = !1,
                    priority: a = 1 / 0,
                    icon: o,
                    avatar: s,
                    action: l
                }) {
                    super("filter-item"), this.inlineDescription = !1, this.filter = e, this.value = t, this.name = i, this.description = n, this.inlineDescription = r, this.priority = a, this.icon = o, this.avatar = s, this.action = l
                }
            };

            function l(e) {
                return e instanceof Object
            }! function(e) {
                e.Apps = "apps", e.Archived = "archived", e.Bookmark = "bookmark", e.Branch = "branch", e.Calendar = "calendar", e.Circle = "circle", e.Code = "code", e.Comment = "comment", e.Copilot = "copilot", e.Default = "default", e.Discussion = "discussion", e.Draft = "draft", e.FileIcon = "file-icon", e.FileCode = "file-code", e.Filter = "filter", e.Forbidden = "forbidden", e.History = "history", e.Issue = "issue", e.IssueClosed = "issueClosed", e.Iterations = "iterations", e.Mention = "mention", e.Merged = "merged", e.No = "no", e.Not = "not", e.Milestone = "milestone", e.Organization = "organization", e.Pencil = "pencil", e.Person = "person", e.PlusCircle = "plus-circle", e.Project = "project", e.PullRequest = "pullRequest", e.Reaction = "reaction", e.Repo = "repo", e.Search = "search", e.SingleSelect = "single-select", e.Sort = "sort", e.Tag = "tag", e.Team = "team", e.Trash = "trash", e.Question = "question"
            }(r || (r = {})),
            function(e) {
                e.Entity = "--color-prettylights-syntax-entity", e.Constant = "--color-prettylights-syntax-constant", e.Keyword = "--color-prettylights-syntax-keyword", e.Variable = "--color-prettylights-syntax-variable", e.String = "--color-prettylights-syntax-string"
            }(a || (a = {}));
            let SearchItem = class SearchItem extends Event {
                constructor({
                    priority: e,
                    value: t,
                    action: i,
                    description: n = "",
                    icon: r,
                    scope: a = "DEFAULT",
                    prefixText: o,
                    prefixColor: s,
                    isFallbackSuggestion: l
                }) {
                    super("search-item"), this.priority = e, this.value = t, this.prefixText = o, this.prefixColor = s, this.action = i, this.description = n, this.icon = r, this.scope = a, this.isFallbackSuggestion = l || !1
                }
            };
            ! function(e) {
                e.Normal = "normal", e.Entity = "entity", e.Constant = "constant", e.FilterValue = "filter-value"
            }(o || (o = {}));
            let FetchDataEvent = class FetchDataEvent extends Event {
                constructor(e) {
                    super("fetch-data"), this.fetchPromise = e
                }
            };
            let QueryEvent = class QueryEvent extends Event {
                toString() {
                    return this.rawQuery
                }
                constructor(e, t, i) {
                    super("query"), this.parsedQuery = e, this.rawQuery = t, this.parsedMetadata = i
                }
            }
        },
        76951: (e, t, i) => {
            i.d(t, {
                $g: () => SoftNavSuccessEvent,
                OV: () => SoftNavStartEvent,
                QW: () => SoftNavErrorEvent,
                Xr: () => SoftNavEndEvent
            });
            var n = i(55908);
            let r = class SoftNavEvent extends Event {
                constructor(e, t) {
                    super(t), this.mechanism = e
                }
            };
            let SoftNavStartEvent = class SoftNavStartEvent extends r {
                constructor(e) {
                    super(e, n.Q.START)
                }
            };
            let SoftNavSuccessEvent = class SoftNavSuccessEvent extends r {
                constructor(e, t) {
                    super(e, n.Q.SUCCESS), this.visitCount = t
                }
            };
            let SoftNavErrorEvent = class SoftNavErrorEvent extends r {
                constructor(e, t) {
                    super(e, n.Q.ERROR), this.error = t
                }
            };
            let SoftNavEndEvent = class SoftNavEndEvent extends r {
                constructor(e) {
                    super(e, n.Q.END)
                }
            }
        },
        75214: (e, t, i) => {
            i.d(t, {
                BT: () => u,
                FP: () => h,
                LD: () => c,
                TL: () => p,
                Yl: () => l,
                r_: () => d,
                u5: () => m
            });
            var n = i(55908),
                r = i(76951),
                a = i(55009),
                o = i(99484);
            let s = 0;

            function l() {
                s = 0, document.dispatchEvent(new Event(n.Q.INITIAL)), (0, o.XL)()
            }

            function c(e) {
                (0, o.sj)() || (document.dispatchEvent(new Event(n.Q.PROGRESS_BAR.START)), document.dispatchEvent(new r.OV(e)), (0, o.U6)(e), (0, o.J$)(), (0, o.Nt)(), (0, a.hY)())
            }

            function u(e = {}) {
                v(e) && (s += 1, document.dispatchEvent(new r.$g((0, o.Gj)(), s)), h(e))
            }

            function d(e = {}) {
                if (!v(e)) return;
                s = 0;
                let t = (0, o.Wl)() || o.jN;
                document.dispatchEvent(new r.QW((0, o.Gj)(), t)), f(), (0, a.t3)(t), (0, o.XL)()
            }

            function h(e = {}) {
                v(e) && (f(), document.dispatchEvent(new r.Xr((0, o.Gj)())), (0, o.pS)())
            }

            function p(e = {}) {
                v(e) && ((0, a.mr)(), document.dispatchEvent(new Event(n.Q.RENDER)))
            }

            function m() {
                document.dispatchEvent(new Event(n.Q.FRAME_UPDATE))
            }

            function f() {
                document.dispatchEvent(new Event(n.Q.PROGRESS_BAR.END))
            }

            function v({
                skipIfGoingToReactApp: e,
                allowedMechanisms: t = []
            } = {}) {
                return (0, o.sj)() && (0 === t.length || t.includes((0, o.Gj)())) && (!e || !(0, o.Nb)())
            }
        },
        55908: (e, t, i) => {
            i.d(t, {
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
        55009: (e, t, i) => {
            i.d(t, {
                CF: () => o,
                aq: () => a,
                hY: () => s,
                mr: () => c,
                t3: () => l
            });
            var n = i(71643),
                r = i(99484);
            let a = "stats:soft-nav-duration",
                o = {
                    turbo: "TURBO",
                    react: "REACT",
                    "turbo.frame": "FRAME",
                    ui: "UI",
                    hard: "HARD"
                };

            function s() {
                performance.clearResourceTimings(), performance.mark(a)
            }

            function l(e) {
                (0, n.b)({
                    turboFailureReason: e,
                    turboStartUrl: (0, r.wP)(),
                    turboEndUrl: window.location.href
                })
            }

            function c() {
                let e = function() {
                    if (0 === performance.getEntriesByName(a).length) return null;
                    performance.measure(a, a);
                    let e = performance.getEntriesByName(a),
                        t = e.pop();
                    return t ? t.duration : null
                }();
                if (!e) return;
                let t = o[(0, r.Gj)()],
                    i = Math.round(e);
                t === o.react && document.dispatchEvent(new CustomEvent("staffbar-update", {
                    detail: {
                        duration: i
                    }
                })), (0, n.b)({
                    requestUrl: window.location.href,
                    softNavigationTiming: {
                        mechanism: t,
                        destination: (0, r.Nb)() || "rails",
                        duration: i,
                        initiator: (0, r.CI)() || "rails"
                    }
                })
            }
        },
        75198: (e, t, i) => {
            i.d(t, {
                softNavigate: () => a
            });
            var n = i(75214),
                r = i(67852);

            function a(e, t) {
                (0, n.LD)("turbo"), (0, r.Vn)(e, { ...t
                })
            }
        },
        56959: (e, t, i) => {
            i.d(t, {
                RB: () => n,
                qC: () => r,
                w0: () => Subscription
            });
            let Subscription = class Subscription {
                constructor(e) {
                    this.closed = !1, this.unsubscribe = () => {
                        e(), this.closed = !0
                    }
                }
            };

            function n(e, t, i, n = {
                capture: !1
            }) {
                return e.addEventListener(t, i, n), new Subscription(() => {
                    e.removeEventListener(t, i, n)
                })
            }

            function r(...e) {
                return new Subscription(() => {
                    for (let t of e) t.unsubscribe()
                })
            }
        },
        89445: (e, t, i) => {
            function n(e, t = {}) {
                if (e.match(/^(https?:|\/\/)/)) throw Error("Can not make cross-origin requests from verifiedFetch");
                let i = { ...t.headers,
                    "GitHub-Verified-Fetch": "true",
                    "X-Requested-With": "XMLHttpRequest"
                };
                return fetch(e, { ...t,
                    headers: i
                })
            }

            function r(e, t) {
                let i = t ? .headers ? ? {},
                    r = { ...i,
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    a = t ? .body ? JSON.stringify(t.body) : void 0;
                return n(e, { ...t,
                    body: a,
                    headers: r
                })
            }
            i.d(t, {
                Q: () => n,
                v: () => r
            })
        }
    }
]);
//# sourceMappingURL=app_assets_modules_github_onfocus_ts-app_assets_modules_github_visible_ts-app_components_sear-d461c8-8f4cddf035fd.js.map