"use strict";
(globalThis.webpackChunk = globalThis.webpackChunk || []).push([
    ["ui_packages_query-builder-element_query-builder-element_ts"], {
        45974: (t, e, i) => {
            i.d(e, {
                dy: () => l.dy,
                sY: () => l.sY,
                Au: () => l.Au
            });
            var s = i(22490),
                a = i(7180);
            let n = "jtml-no-op",
                r = s.ZO.createPolicy(n, {
                    createHTML: t => a.O.apply({
                        policy: () => t,
                        policyName: n,
                        fallback: t,
                        fallbackOnError: !0
                    })
                });
            var l = i(20845);
            l.js.setCSPTrustedTypesPolicy(r)
        },
        3399: (t, e, i) => {
            var s, a, n, r;
            i.d(e, {
                    Fi: () => s,
                    Ju: () => o,
                    L2: () => FilterItem,
                    T2: () => SearchItem,
                    UK: () => QueryEvent,
                    Z: () => FetchDataEvent,
                    gC: () => n,
                    i: () => l,
                    tj: () => r,
                    zi: () => a
                }),
                function(t) {
                    t.DIRECTORY = "Search in this directory", t.ORG = "Search in this organization", t.OWNER = "Search in this owner", t.REPO = "Search in this repository", t.GITHUB = "Search all of GitHub", t.GENERAL = "Submit search", t.COMMAND = "Run command", t.COPILOT = "Ask Copilot", t.DEFAULT = "Jump to"
                }(s || (s = {}));
            let l = "Autocomplete";
            let FilterItem = class FilterItem extends Event {
                constructor({
                    filter: t,
                    value: e,
                    name: i = "",
                    description: s = "",
                    inlineDescription: a = !1,
                    priority: n = 1 / 0,
                    icon: r,
                    avatar: l,
                    action: o
                }) {
                    super("filter-item"), this.inlineDescription = !1, this.filter = t, this.value = e, this.name = i, this.description = s, this.inlineDescription = a, this.priority = n, this.icon = r, this.avatar = l, this.action = o
                }
            };

            function o(t) {
                return t instanceof Object
            }! function(t) {
                t.Apps = "apps", t.Archived = "archived", t.Bookmark = "bookmark", t.Branch = "branch", t.Calendar = "calendar", t.Circle = "circle", t.Code = "code", t.Comment = "comment", t.Copilot = "copilot", t.Default = "default", t.Discussion = "discussion", t.Draft = "draft", t.FileIcon = "file-icon", t.FileCode = "file-code", t.Filter = "filter", t.Forbidden = "forbidden", t.History = "history", t.Issue = "issue", t.IssueClosed = "issueClosed", t.Iterations = "iterations", t.Mention = "mention", t.Merged = "merged", t.No = "no", t.Not = "not", t.Milestone = "milestone", t.Organization = "organization", t.Pencil = "pencil", t.Person = "person", t.PlusCircle = "plus-circle", t.Project = "project", t.PullRequest = "pullRequest", t.Reaction = "reaction", t.Repo = "repo", t.Search = "search", t.SingleSelect = "single-select", t.Sort = "sort", t.Tag = "tag", t.Team = "team", t.Trash = "trash", t.Question = "question"
            }(a || (a = {})),
            function(t) {
                t.Entity = "--color-prettylights-syntax-entity", t.Constant = "--color-prettylights-syntax-constant", t.Keyword = "--color-prettylights-syntax-keyword", t.Variable = "--color-prettylights-syntax-variable", t.String = "--color-prettylights-syntax-string"
            }(n || (n = {}));
            let SearchItem = class SearchItem extends Event {
                constructor({
                    priority: t,
                    value: e,
                    action: i,
                    description: s = "",
                    icon: a,
                    scope: n = "DEFAULT",
                    prefixText: r,
                    prefixColor: l,
                    isFallbackSuggestion: o
                }) {
                    super("search-item"), this.priority = t, this.value = e, this.prefixText = r, this.prefixColor = l, this.action = i, this.description = s, this.icon = a, this.scope = n, this.isFallbackSuggestion = o || !1
                }
            };
            ! function(t) {
                t.Normal = "normal", t.Entity = "entity", t.Constant = "constant", t.FilterValue = "filter-value"
            }(r || (r = {}));
            let FetchDataEvent = class FetchDataEvent extends Event {
                constructor(t) {
                    super("fetch-data"), this.fetchPromise = t
                }
            };
            let QueryEvent = class QueryEvent extends Event {
                toString() {
                    return this.rawQuery
                }
                constructor(t, e, i) {
                    super("query"), this.parsedQuery = t, this.rawQuery = e, this.parsedMetadata = i
                }
            }
        },
        90113: (t, e, i) => {
            i.r(e), i.d(e, {
                AutocompleteText: () => V.i,
                FetchDataEvent: () => V.Z,
                FilterItem: () => V.L2,
                Octicon: () => V.zi,
                PrefixColor: () => V.gC,
                QueryBuilderElement: () => X,
                QueryEvent: () => V.UK,
                SearchItem: () => V.T2,
                SearchScopeText: () => V.Fi,
                TextElementStyle: () => V.tj,
                isCustomIcon: () => V.Ju
            });
            var s, a, n, r, l, o, h, u, c, d, p, y, v, m, f, g, b, $, w, L, I, A, C, k, E, S, x, W, P, F, M, q, T, Q, R, B, O = i(76006),
                j = i(10160),
                D = i(45974),
                V = i(3399);

            function z(t, e) {
                if (e.has(t)) throw TypeError("Cannot initialize the same private elements twice on an object")
            }

            function N(t, e, i) {
                if (!e.has(t)) throw TypeError("attempted to " + i + " private field on non-instance");
                return e.get(t)
            }

            function K(t, e) {
                var i = N(t, e, "get");
                return i.get ? i.get.call(t) : i.value
            }

            function _(t, e, i) {
                z(t, e), e.set(t, i)
            }

            function U(t, e, i) {
                var s = N(t, e, "set");
                return ! function(t, e, i) {
                    if (e.set) e.set.call(t, i);
                    else {
                        if (!e.writable) throw TypeError("attempted to set read only private field");
                        e.value = i
                    }
                }(t, s, i), i
            }

            function H(t, e, i) {
                if (!e.has(t)) throw TypeError("attempted to get private field on non-instance");
                return i
            }

            function J(t, e) {
                z(t, e), e.add(t)
            }

            function G(t, e, i, s) {
                var a, n = arguments.length,
                    r = n < 3 ? e : null === s ? s = Object.getOwnPropertyDescriptor(e, i) : s;
                if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(t, e, i, s);
                else
                    for (var l = t.length - 1; l >= 0; l--)(a = t[l]) && (r = (n < 3 ? a(r) : n > 3 ? a(e, i, r) : a(e, i)) || r);
                return n > 3 && r && Object.defineProperty(e, i, r), r
            }
            let Y = class FeedbackEvent extends Event {
                    constructor(t, e, i) {
                        super("query-builder-feedback", {
                            bubbles: !0,
                            cancelable: !0
                        }), this.key = t, this.text = e, this.data = i, this.key = t, this.text = e, this.data = i
                    }
                },
                Z = (t, e) => t.priority - e.priority,
                X = (s = new WeakMap, a = new WeakMap, n = new WeakMap, r = new WeakMap, l = new WeakMap, o = new WeakMap, h = new WeakMap, u = new WeakMap, c = new WeakMap, d = new WeakMap, p = new WeakMap, y = new WeakMap, v = new WeakMap, m = new WeakMap, f = new WeakMap, g = new WeakMap, b = new WeakMap, $ = new WeakMap, w = new WeakMap, L = new WeakMap, I = new WeakMap, A = new WeakMap, C = new WeakMap, k = new WeakSet, E = new WeakSet, S = new WeakSet, x = new WeakSet, W = new WeakSet, P = new WeakSet, F = new WeakSet, M = new WeakSet, q = new WeakSet, T = new WeakSet, Q = new WeakSet, R = new WeakSet, B = new WeakSet, class QueryBuilderElement extends HTMLElement {
                    get input() {
                        return (0, O.P4)(this, "input")
                    }
                    get styledInputContent() {
                        return (0, O.P4)(this, "styledInputContent")
                    }
                    get styledInputContainer() {
                        return (0, O.P4)(this, "styledInputContainer")
                    }
                    get styledInput() {
                        return (0, O.P4)(this, "styledInput")
                    }
                    get overlay() {
                        return (0, O.P4)(this, "overlay")
                    }
                    get sizer() {
                        return (0, O.P4)(this, "sizer")
                    }
                    get clearButton() {
                        return (0, O.P4)(this, "clearButton")
                    }
                    get resultsList() {
                        return (0, O.P4)(this, "resultsList")
                    }
                    get screenReaderFeedback() {
                        return (0, O.P4)(this, "screenReaderFeedback")
                    }
                    get query() {
                        return this.input.value
                    }
                    get i18n() {
                        return {
                            suggestion: "suggestion",
                            suggestions: "suggestions",
                            clear_search: "Input cleared."
                        }
                    }
                    navigate(t) {
                        let e = t ? .target ? .closest("a") ? .getAttribute("href");
                        e && this.dispatchEvent(new CustomEvent("query-builder:navigate", {
                            bubbles: !0,
                            detail: {
                                url: e
                            }
                        }))
                    }
                    get closed() {
                        return this.overlay && this.overlay.hasAttribute("hidden")
                    }
                    set closed(t) {
                        if (t) this.closed || (this.overlay && (this.overlay.hidden = !0), this.input.setAttribute("aria-expanded", "false"), K(this, s) ? .clearSelection());
                        else {
                            if (!this.closed) return;
                            this.overlay && (this.overlay.hidden = !1), this.input.setAttribute("aria-expanded", "true")
                        }
                    }
                    show() {
                        this.closed = !1, this.overlay ? .scrollIntoView ? .({
                            behavior: "smooth",
                            block: "nearest"
                        })
                    }
                    hide() {
                        "false" === this.resultsList.getAttribute("data-persist-list") && (this.closed = !0)
                    }
                    initialize(t, e) {
                        for (let i of (this.parser = t, U(this, I, !0), U(this, w, !0), e)) this.attachProvider(i);
                        U(this, w, !1), U(this, r, e.reduce((t, e) => ({ ...t,
                            [e.value]: e
                        }), {}))
                    }
                    detachElementDefinitionReadyForProviders() {
                        this.removeEventListener("query-builder:ready-to-request-provider", this.elementDefinitionReadyForProviders)
                    }
                    connectedCallback() {
                        K(this, o) ? .abort();
                        let {
                            signal: t
                        } = U(this, o, new AbortController);
                        t.addEventListener("abort", () => {
                            U(this, r, {})
                        }), U(this, v, this.input.getAttribute("id")), this.hasAttribute("defer-request-providers") || (document.addEventListener("query-builder:ready-to-request-provider", this.elementDefinitionReadyForProviders, !0), this.readyForRequestProviders())
                    }
                    readyForRequestProviders() {
                        H(this, B, td).call(this) > 0 && K(this, L) || (U(this, s, K(this, s) || new j.Z(this.input, this.resultsList, {
                            tabInsertsSuggestions: !1
                        })), this.requestProviders())
                    }
                    async requestProviders() {
                        U(this, L, !0), await Promise.resolve(), U(this, w, !0), this.dispatchEvent(new Event("query-builder:request-provider", {
                            bubbles: !0
                        })), U(this, w, !1), U(this, f, new Map);
                        let t = this.parseInputValue();
                        this.styleInputText(t), this.toggleClearButtonVisibility()
                    }
                    parseInputValue() {
                        return this.parsedMetadata = this.parser.parse(this.input.value, this.input.selectionStart || 0), this.parser.flatten(this.parsedMetadata)
                    }
                    attachProvider(t) {
                        if (!K(this, o)) return;
                        let {
                            signal: e
                        } = K(this, o);
                        if (!K(this, w)) throw Error("Can't attach providers after the query builder has been connected");
                        K(this, r)[t.value] || (K(this, r)[t.value] = t, "filter" === t.type ? (K(this, l).add(t.value), t.addEventListener("filter-item", e => {
                            K(this, A).call(this, K(this, y), t), K(this, y).get(t) ? .push(e), H(this, k, tt).call(this)
                        }, {
                            signal: e
                        }), t.addEventListener("show", () => {
                            K(this, p).add(t), H(this, k, tt).call(this)
                        }, {
                            signal: e
                        }), t.addEventListener("fetch-data", async t => {
                            let e = new Promise(t => setTimeout(t, K(this, b)));
                            U(this, $, Promise.race([Promise.all([K(this, $), t.fetchPromise]), e]));
                            let i = K(this, $);
                            try {
                                await i
                            } catch (t) {
                                if ("AbortError" !== t.name) throw U(this, $, !1), t
                            }
                            i === K(this, $) && (U(this, $, !1), H(this, k, tt).call(this), this.updateVisibility())
                        }, {
                            signal: e
                        })) : (t.addEventListener("fetch-data", async e => {
                            K(this, d).delete(t), await e.fetchPromise, K(this, u).set(t, K(this, c).get(t) || []), K(this, c).delete(t), H(this, k, tt).call(this)
                        }), t.addEventListener("search-item", e => {
                            K(this, A).call(this, K(this, u), t), K(this, c).has(t) ? K(this, c).get(t) ? .push(e) : (K(this, d).has(t) && (K(this, u).set(t, []), K(this, d).delete(t)), K(this, u).get(t) ? .push(e), H(this, k, tt).call(this))
                        }, {
                            signal: e
                        })))
                    }
                    disconnectedCallback() {
                        K(this, o) ? .abort()
                    }
                    comboboxCommit(t) {
                        let e = t.target,
                            i = e ? .getAttribute("data-type"),
                            s = e ? .getAttribute("data-value") || "",
                            a = e ? .getAttribute("data-replace-query-with") || "",
                            n = parseInt(e ? .getAttribute("data-move-caret-to") || "0") || 0,
                            r = this.parseInputValue();
                        if ("url-result" === i);
                        else if ("filter-result" === i) r.pop(), r.push({
                            type: "filter",
                            filter: s,
                            value: ""
                        });
                        else if ("command-result" === i) {
                            let t = e.getAttribute("data-command-name") || "",
                                i = JSON.parse(e.getAttribute("data-command-payload") || "{}");
                            this.dispatchEvent(new CustomEvent(t, {
                                detail: i
                            }))
                        } else if ("query-result" === i) {
                            if (a) this.input.value = a, this.input.focus(), r = void 0;
                            else {
                                let t = this.parser.flatten(this.parser.parse(s, 0));
                                r.push(...t), r.push({
                                    type: "text",
                                    value: ""
                                })
                            }
                        } else "filter-item" === i && (a ? (this.input.value = a, this.input.focus(), r = void 0) : this.addSelectedItemToFilter(s, r));
                        if (this.parseQuery(r), a) {
                            let t = -1 === n ? this.input.value.length : n;
                            this.input.setSelectionRange(t, t)
                        }
                        this.input.removeAttribute("aria-activedescendant")
                    }
                    addSelectedItemToFilter(t, e) {
                        let i = /\s/.test(t),
                            s = e.pop();
                        if (s ? .type === "filter") {
                            let a = s.value.split(",");
                            a.pop(), a.push(i ? `"${t}"` : t), e.push({
                                type: "filter",
                                filter: s ? .filter,
                                value: a.join(",")
                            }), e.push({
                                type: "text",
                                value: ""
                            })
                        } else s && e.push(s)
                    }
                    async inputChange() {
                        await this.parseQuery()
                    }
                    inputBlur() {
                        if (K(this, a)) {
                            U(this, a, !1);
                            return
                        }
                        this.styledInput.classList.remove(K(this, m)), this.input.removeAttribute("aria-activedescendant"), this.hide()
                    }
                    resultsMousedown() {
                        U(this, a, !0)
                    }
                    async inputFocus() {
                        this.styledInput.classList.add(K(this, m)), this.readyForRequestProviders(), K(this, s).start();
                        let t = this.input.value;
                        this.lastParsedQuery && this.lastParsedQuery === this.input.value || await this.parseQuery(), this.closed && this.input.value === t && this.input.setSelectionRange(0, this.input.value.length), this.input.focus()
                    }
                    moveCaretToEndOfInput() {
                        this.input.setSelectionRange(this.input.value.length, this.input.value.length)
                    }
                    hasFocus() {
                        return this.styledInput.classList.contains(K(this, m))
                    }
                    inputKeydown(t) {
                        let e = t.key;
                        if ("Escape" === e) this.hide();
                        else if ("Enter" === e) {
                            let e = this.resultsList.querySelector('[aria-selected="true"], [data-combobox-option-default="true"]');
                            if (!e || "true" === e.getAttribute("aria-disabled")) return;
                            let i = e.querySelector("a");
                            if (i) {
                                let e = t.ctrlKey || t.metaKey;
                                e ? window.open(i.getAttribute("href") || "", "_blank") : i.click()
                            }
                        }
                    }
                    inputSubmit() {
                        this.hide()
                    }
                    clearButtonFocus(t) {
                        let e = t.relatedTarget;
                        e && e === this.input && this.show()
                    }
                    clearButtonBlur() {
                        this.hide()
                    }
                    toggleClearButtonVisibility() {
                        this.clearButton && ("" !== this.input.value ? !1 !== this.clearButton.hidden && (this.clearButton.hidden = !1) : this.clearButton.hidden = !0)
                    }
                    updateVisibility() {
                        this.hasFocus() && (K(this, y).size > 0 || K(this, u).size > 0 || K(this, p).size > 0 ? this.show() : K(this, $) || this.hide())
                    }
                    getLeadingVisual(t, e) {
                        if (e) {
                            let t = "org" === e.type ? "avatar avatar-1 avatar-small" : "avatar avatar-1 avatar-small circle";
                            return (0, D.dy)
                            `<img src="${e.url}" alt="" role="presentation" class="${t}" />`
                        }
                        if (t && (0, V.Ju)(t)) return (0, D.dy)([t.html]);
                        let i = document.getElementById(`${t}-icon`);
                        return (0, D.dy)([i ? .innerHTML])
                    }
                    updateScreenReaderFeedback(t) {
                        let e = new Y("NEW_RESULTS", t, {});
                        this.dispatchEvent(e), this.screenReaderFeedback.textContent = e.text
                    }
                    async clear() {
                        await this.parseQuery([]), U(this, n, !0)
                    }
                    async parseQuery(t, e = !0) {
                        K(this, h) ? .abort();
                        let {
                            signal: i
                        } = U(this, h, new AbortController);
                        if (t) {
                            let e = t.map(t => "filter" === t.type ? `${t.filter}:${t.value}` : t.value).join(K(this, I) ? "" : " "),
                                i = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this.input), "value") ? .set;
                            i ? i ? .call(this.input, e) : this.input.value = e, this.input.dispatchEvent(new Event("change", {
                                bubbles: !0
                            }))
                        } else t = this.parseInputValue();
                        if (this.lastParsedQuery = this.input.value, await new Promise(t => requestAnimationFrame(t)), i.aborted || (this.styleInputText(t), e && this.input.focus(), await new Promise(t => setTimeout(t, 100)), i.aborted)) return;
                        for (let t of K(this, u).keys()) K(this, d).add(t);
                        K(this, y).clear(), K(this, p).clear();
                        let s = new V.UK(t, this.input.value, this.parsedMetadata);
                        this.dispatchEvent(s);
                        let a = !1;
                        for (let t of K(this, d).keys()) K(this, u).delete(t), K(this, d).delete(t), a = !0;
                        a && H(this, k, tt).call(this), this.updateVisibility()
                    }
                    styleInputText(t) {
                        H(this, Q, tu).call(this, this.input.value);
                        let e = document.createDocumentFragment();
                        for (let i of t) {
                            let t = document.createElement("span"),
                                s = document.createElement("span");
                            s.textContent = " ";
                            let a = !K(this, I);
                            if ("filter" === i.type) {
                                let {
                                    filter: e,
                                    value: n
                                } = i, r = document.createElement("span");
                                t.setAttribute("data-type", "filter-expression"), r.setAttribute("data-type", "filter"), r.textContent = e;
                                let l = document.createElement("span");
                                l.textContent = this.filterKey;
                                let o = document.createElement("span");
                                o.setAttribute("data-type", "filter-value"), o.textContent = n, t.appendChild(r), t.appendChild(l), t.appendChild(o), a && t.appendChild(s)
                            } else a ? t.textContent = `${i.value} ` : t.textContent = i.value, i.style === V.tj.Constant ? t.classList.add("qb-constant") : i.style === V.tj.Entity ? t.classList.add("qb-entity") : i.style === V.tj.FilterValue && t.classList.add("qb-filter-value");
                            e.append(t), H(this, R, tc).call(this)
                        }
                        this.styledInputContent.replaceChildren(e)
                    }
                    constructor(...t) {
                        super(...t), J(this, k), J(this, E), J(this, S), J(this, x), J(this, W), J(this, P), J(this, F), J(this, M), J(this, q), J(this, T), J(this, Q), J(this, R), J(this, B), _(this, s, {
                            writable: !0,
                            value: void 0
                        }), _(this, a, {
                            writable: !0,
                            value: void 0
                        }), _(this, n, {
                            writable: !0,
                            value: void 0
                        }), _(this, r, {
                            writable: !0,
                            value: void 0
                        }), _(this, l, {
                            writable: !0,
                            value: void 0
                        }), _(this, o, {
                            writable: !0,
                            value: void 0
                        }), _(this, h, {
                            writable: !0,
                            value: void 0
                        }), _(this, u, {
                            writable: !0,
                            value: void 0
                        }), _(this, c, {
                            writable: !0,
                            value: void 0
                        }), _(this, d, {
                            writable: !0,
                            value: void 0
                        }), _(this, p, {
                            writable: !0,
                            value: void 0
                        }), _(this, y, {
                            writable: !0,
                            value: void 0
                        }), _(this, v, {
                            writable: !0,
                            value: void 0
                        }), _(this, m, {
                            writable: !0,
                            value: void 0
                        }), _(this, f, {
                            writable: !0,
                            value: void 0
                        }), _(this, g, {
                            writable: !0,
                            value: void 0
                        }), _(this, b, {
                            writable: !0,
                            value: void 0
                        }), _(this, $, {
                            writable: !0,
                            value: void 0
                        }), _(this, w, {
                            writable: !0,
                            value: void 0
                        }), _(this, L, {
                            writable: !0,
                            value: void 0
                        }), _(this, I, {
                            writable: !0,
                            value: void 0
                        }), _(this, A, {
                            writable: !0,
                            value: void 0
                        }), _(this, C, {
                            writable: !0,
                            value: void 0
                        }), U(this, a, !1), U(this, n, !1), U(this, r, {}), U(this, l, new Set), U(this, o, null), U(this, h, null), U(this, u, new Map), U(this, c, new Map), U(this, d, new Set), U(this, p, new Set), U(this, y, new Map), U(this, m, "QueryBuilder-focus"), U(this, f, new Map), U(this, g, 150), U(this, b, 3e3), U(this, $, !1), U(this, w, !1), U(this, L, !1), this.parser = {
                            parse: H(this, T, th).bind(this),
                            flatten: t => t
                        }, this.parsedMetadata = void 0, this.renderSingularItemNames = !1, U(this, I, !1), this.lastParsedQuery = void 0, this.minWidth = 300, this.elementDefinitionReadyForProviders = t => {
                            t.detail.id === K(this, v) && (this.readyForRequestProviders(), t.stopImmediatePropagation())
                        }, U(this, A, (t, e) => {
                            t.has(e) || t.set(e, [])
                        }), U(this, C, !1)
                    }
                });

            function tt() {
                K(this, C) || (U(this, C, !0), this.toggleClearButtonVisibility(), U(this, C, !1), H(this, x, ts).call(this))
            }

            function te() {
                if (0 !== K(this, p).size) return (0, D.dy)
                `<li role="presentation" class="ActionList-sectionDivider">
      <h3 role="presentation" class="ActionList-sectionDivider-title p-2 text-left" aria-hidden="true">
        Suggested filters
      </h3>
      <ul role="presentation">
        ${[...K(this,p)].sort(Z).map(t=>H(this,M,tl).call(this,t))}
      </ul>
    </li>`
            }

            function ti(t, e = !1) {
                let i = [],
                    s = this.parseInputValue().at(-1);
                if ("filter" === t.type) t.manuallyDetermineFilterEligibility ? i = K(this, y).get(t) ? .sort(Z).map(t => H(this, q, to).call(this, t)) || [] : s ? .type === "filter" && (i = K(this, y).get(t) ? .filter(t => t.filter === s.filter).sort(Z).map(t => H(this, q, to).call(this, t)) || []);
                else {
                    let s = K(this, u).get(t) || [];
                    i = [...s].filter(t => t.isFallbackSuggestion === e).sort(Z).map(t => H(this, P, tn).call(this, t))
                }
                if (i.length) return "" === t.name ? (0, D.dy)
                `<li role="presentation" class="ActionList-sectionDivider">
        <ul role="presentation">
          ${i}
        </ul>
      </li>`: (0, D.dy)
                `<li role="presentation" class="ActionList-sectionDivider">
        <h3
          role="presentation"
          class="ActionList-sectionDivider-title QueryBuilder-sectionTitle p-2 text-left"
          aria-hidden="true"
        >
          ${t.name}
        </h3>
        <ul role="presentation">
          ${i}
        </ul>
      </li>`
            }

            function ts() {
                let t, e = Object.values(K(this, r)).sort((t, e) => t.priority - e.priority).map(t => H(this, S, ti).call(this, t)).filter(t => void 0 !== t);
                K(this, $) || 0 !== e.length || (e = Object.values(K(this, r)).sort((t, e) => t.priority - e.priority).map(t => H(this, S, ti).call(this, t, !0)).filter(t => void 0 !== t));
                let i = H(this, E, te).call(this);
                i && e.push(i), 0 === e.length ? K(this, $) || (this.resultsList.textContent = "", (0, D.sY)((0, D.dy)
                    ``, this.resultsList)) : (0, D.sY)((0, D.dy)
                    `${e.map((t,i)=>i===e.length-1?t:(0,D.dy)`${t}
                <li aria-hidden="true" class="ActionList-sectionDivider"></li>`)}`, this.resultsList);
                let s = this.resultsList.querySelectorAll('[role="option"]').length,
                    a = 1 === s ? this.i18n.suggestion : this.i18n.suggestions;
                t = `${s} ${a}.`, K(this, n) && (t = `${this.i18n.clear_search} ${t}`, U(this, n, !1)), this.screenReaderFeedback.textContent === t && (t += "\xa0"), setTimeout(() => this.updateScreenReaderFeedback(t), K(this, g))
            }

            function ta(t) {
                if (t) return t.replace(/\s/g, "-").toLowerCase()
            }

            function tn({
                value: t,
                prefixText: e,
                prefixColor: i,
                target: s,
                action: a,
                description: n,
                icon: r,
                scope: l
            }) {
                if ("url" in a) {
                    let o = "GENERAL" === l ? `${V.Fi[l]}` : `jump to this ${s.singularItemName}`,
                        h = n ? `, ${n}` : "",
                        u = `${e?`${e} `:""}${t}${h}, ${o}`,
                        c = null;
                    return e && (c = (0, D.dy)
                        `
          <span>
            <div class="d-inline-flex position-relative">
              <div
                class="position-absolute rounded-1 flex-items-stretch height-full width-full"
                style="opacity: 0.1; background-color: var(${i})"
              ></div>
              <div class="px-1" style="color: var(${i})">${e}</div>
            </div>
            ${H(this,F,tr).call(this,t)}
          </span>
        `), (0, D.dy)
                    `<li
        role="option"
        class="ActionListItem"
        data-type="url-result"
        id="${K(this,v)||"search-item"}-result-${H(this,W,ta).call(this,t)}"
        data-value="${t}"
        aria-label="${u}"
      >
        <a
          href="${a.url}"
          data-action="click:query-builder#navigate"
          tabindex="-1"
          class="QueryBuilder-ListItem-link ActionListContent ActionListContent--visual16 QueryBuilder-ListItem"
        >
          ${r?(0,D.dy)`<span
                id="${K(this,v)||"search-item"}-result-${H(this,W,ta).call(this,t)}--leading"
                class="ActionListItem-visual ActionListItem-visual--leading"
              >
                ${this.getLeadingVisual(r)}
              </span>`:null}
          <span class="ActionListItem-descriptionWrap">
            <span class="ActionListItem-label text-normal"> ${c||H(this,F,tr).call(this,t)} </span>
            ${n?(0,D.dy)`<span class="ActionListItem-description">${n}</span>`:null}
          </span>

          <span aria-hidden="true" class="ActionListItem-description QueryBuilder-ListItem-trailing"
            >${V.Fi[l]}</span
          >
        </a>
      </li>`
                }
                if ("commandName" in a) {
                    let e = V.Fi[l] || V.Fi.COMMAND,
                        i = n ? `, ${n}` : "",
                        s = `${t}${i}, ${e}`;
                    return (0, D.dy)
                    `<li
        role="option"
        class="ActionListItem"
        data-type="command-result"
        id="${K(this,v)||"search-item"}-result-${H(this,W,ta).call(this,t)}"
        data-value="${t}"
        data-command-name="${a.commandName}"
        data-command-payload="${JSON.stringify(a.data)}"
        aria-label="${s}"
      >
        <span class="ActionListContent ActionListContent--visual16 QueryBuilder-ListItem">
          ${r?(0,D.dy)`<span
                id="${K(this,v)||"search-item"}-result-${H(this,W,ta).call(this,t)}--leading"
                class="ActionListItem-visual ActionListItem-visual--leading"
              >
                ${this.getLeadingVisual(r)}
              </span>`:null}
          <span class="ActionListItem-descriptionWrap">
            <span class="ActionListItem-label text-normal"> ${H(this,F,tr).call(this,t)} </span>
            ${n?(0,D.dy)`<span class="ActionListItem-description">${n}</span>`:null}
          </span>

          <span aria-hidden="true" class="ActionListItem-description QueryBuilder-ListItem-trailing"
            >${e}</span
          >
        </span>
      </li>`
                } {
                    let e = "",
                        i = 0;
                    "replaceQueryWith" in a && (e = a.replaceQueryWith, i = a.moveCaretTo);
                    let s = "query" in a ? V.Fi[l] : V.i;
                    return (0, D.dy)
                    ` <li
        role="option"
        class="ActionListItem"
        data-type="query-result"
        data-value="${t}"
        aria-label="${t}${n?`, ${n}`:""}"
        data-replace-query-with="${e}"
        data-move-caret-to="${i}"
        id="${K(this,v)||"search-item"}-result-${H(this,W,ta).call(this,t)}"
      >
        <span class="ActionListContent ActionListContent--visual16 QueryBuilder-ListItem">
          ${r?(0,D.dy)`<span
                id="${K(this,v)||"search-item"}-result-${H(this,W,ta).call(this,t)}--leading"
                class="ActionListItem-visual ActionListItem-visual--leading"
              >
                ${this.getLeadingVisual(r)}
              </span>`:null}
          <span class="ActionListItem-descriptionWrap">
            <span class="ActionListItem-label text-normal">${H(this,F,tr).call(this,t)}</span>
            ${n?(0,D.dy)`<span class="ActionListItem-description">${n}</span>`:null}
          </span>

          ${K(this,u).size>0?(0,D.dy)`<span aria-hidden="true" class="ActionListItem-description QueryBuilder-ListItem-trailing"
                >${s}</span
              >`:(0,D.dy)``}
        </span>
      </li>`
                }
            }

            function tr(t) {
                let e = this.parser.flatten(this.parser.parse(t, 0)),
                    i = !K(this, I),
                    s = [];
                for (let t of e)
                    if ("filter" === t.type) s.push((0, D.dy)
                        `<span>${t.filter}:</span
            ><span data-type="filter-value">${t.value}${i?" ":""}</span>`);
                    else {
                        let e = "";
                        t.style === V.tj.Constant ? e = "qb-constant" : t.style === V.tj.Entity ? e = "qb-entity" : t.style === V.tj.FilterValue && (e = "qb-filter-value"), s.push((0, D.dy)
                            `<span class="${e}">${t.value}${i?" ":""}</span>`)
                    }
                return s
            }

            function tl({
                singularItemName: t,
                icon: e,
                description: i,
                value: s
            }) {
                let a = i ? `, ${i}` : "",
                    n = `${this.renderSingularItemNames?t:s}${a}`;
                return (0, D.dy)
                ` <li
      role="option"
      class="ActionListItem"
      data-type="filter-result"
      data-value="${s}"
      id="${K(this,v)||"filter"}-result-${H(this,W,ta).call(this,s)}"
      aria-label="${n}, filter"
    >
      <span class="ActionListContent ActionListContent--visual16 QueryBuilder-ListItem">
        ${e?(0,D.dy)`<span
              id="${K(this,v)||"filter"}-result-${H(this,W,ta).call(this,s)}--leading"
              class="ActionListItem-visual ActionListItem-visual--leading"
            >
              ${this.getLeadingVisual(e)}
            </span>`:null}
        <span class="ActionListItem-descriptionWrap">
          <span class="ActionListItem-label text-normal">
            ${this.renderSingularItemNames?t:`${s}:`}
          </span>
          ${i?(0,D.dy)`<span class="ActionListItem-description">${i}</span>`:null}
        </span>

        ${K(this,u).size>0?(0,D.dy)`<span aria-hidden="true" class="ActionListItem-description QueryBuilder-ListItem-trailing"
              >${V.i}</span
            >`:(0,D.dy)``}
      </span>
    </li>`
            }

            function to({
                name: t,
                value: e,
                target: i,
                icon: s,
                avatar: a,
                description: n,
                inlineDescription: r,
                action: l
            }) {
                let o = t && t.length > 0 ? t : e,
                    h = n ? `, ${n}` : "",
                    c = i.singularItemName ? `${o}${h}, autocomplete this ${i.singularItemName}` : `${o}${h}, ${i.name}`,
                    d = "",
                    p = 0;
                return l && "replaceQueryWith" in l && (d = l.replaceQueryWith, p = l.moveCaretTo), (0, D.dy)
                ` <li
      role="option"
      class="ActionListItem"
      data-type="filter-item"
      data-replace-query-with="${d}"
      data-move-caret-to="${p}"
      data-value="${e}"
      id="${K(this,v)||"filter-item"}-result-${H(this,W,ta).call(this,e)}"
      aria-label="${c}"
    >
      <span class="ActionListContent ActionListContent--visual16 QueryBuilder-ListItem">
        ${s?(0,D.dy)`<span
              id="${K(this,v)||"filter-item"}-result-${H(this,W,ta).call(this,e)}--leading"
              class="ActionListItem-visual ActionListItem-visual--leading"
            >
              ${this.getLeadingVisual(s,a)}
            </span>`:null}
        <span class="${r?"ActionListItem-descriptionWrap-inline":"ActionListItem-descriptionWrap"}">
          <span class="ActionListItem-label text-normal">${o}</span>
          ${n?(0,D.dy)`<span class="ActionListItem-description">${n}</span>`:null}
        </span>

        ${K(this,u).size>0?(0,D.dy)`<span aria-hidden="true" class="ActionListItem-description QueryBuilder-ListItem-trailing"
              >${V.i}</span
            >`:(0,D.dy)``}
      </span>
    </li>`
            }

            function th(t) {
                let e = K(this, f).get(t);
                if (e) return e.slice(); {
                    let e = [],
                        i = t.split(/\s(?=(?:[^"]*"[^"]*")*[^"]*$)/g);
                    for (let t of i) {
                        let i = t.indexOf(this.filterKey);
                        if (i > 0) {
                            let s = t.substring(0, i),
                                a = t.substring(i + 1);
                            e.push(K(this, l).has(s) ? {
                                type: "filter",
                                filter: s,
                                value: a
                            } : {
                                type: "text",
                                value: t
                            })
                        } else e.push({
                            type: "text",
                            value: t
                        })
                    }
                    return K(this, f).set(t, [...e]), e
                }
            }

            function tu(t) {
                if (this.sizer.textContent = "", null !== this.input.selectionStart && this.input.selectionStart === this.input.selectionEnd) {
                    let e = this.input.selectionStart,
                        i = document.createElement("span");
                    this.sizer.append(t.substring(0, e), i, t.substring(e))
                } else this.sizer.textContent = t
            }

            function tc() {
                let t = this.minWidth;
                requestAnimationFrame(() => {
                    let e = this.sizer.querySelector("span");
                    e && (e.offsetLeft < this.styledInputContainer.scrollLeft ? this.styledInputContainer.scrollLeft = e.offsetLeft - t : e.offsetLeft > this.styledInputContainer.scrollLeft + this.styledInputContainer.clientWidth && (this.styledInputContainer.scrollLeft = e.offsetLeft - this.styledInputContainer.clientWidth + t));
                    let i = this.sizer.scrollWidth,
                        s = Math.max(i + 2, "" === this.input.value ? 2 : 0, t);
                    this.input.style.width = `${s}px`
                })
            }

            function td() {
                return Object.keys(K(this, r)).length
            }
            G([O.Lj], X.prototype, "filterKey", void 0), G([O.Lj], X.prototype, "minWidth", void 0), X = G([O.Ih], X)
        }
    }
]);
//# sourceMappingURL=ui_packages_query-builder-element_query-builder-element_ts-5eeb44cbab6c.js.map