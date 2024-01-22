"use strict";
(globalThis.webpackChunk = globalThis.webpackChunk || []).push([
    ["sessions"], {
        254: (e, t, n) => {
            n.d(t, {
                ZG: () => s,
                q6: () => c,
                w4: () => u
            });
            var o = n(8439);
            let r = !1,
                i = new o.Z;

            function a(e) {
                let t = e.target;
                if (t instanceof HTMLElement && t.nodeType !== Node.DOCUMENT_NODE)
                    for (let e of i.matches(t)) e.data.call(null, t)
            }

            function s(e, t) {
                r || (r = !0, document.addEventListener("focus", a, !0)), i.add(e, t), document.activeElement instanceof HTMLElement && document.activeElement.matches(e) && t(document.activeElement)
            }

            function u(e, t, n) {
                function o(t) {
                    let r = t.currentTarget;
                    r && (r.removeEventListener(e, n), r.removeEventListener("blur", o))
                }
                s(t, function(t) {
                    t.addEventListener(e, n), t.addEventListener("blur", o)
                })
            }

            function c(e, t) {
                function n(e) {
                    let {
                        currentTarget: o
                    } = e;
                    o && (o.removeEventListener("input", t), o.removeEventListener("blur", n))
                }
                s(e, function(e) {
                    e.addEventListener("input", t), e.addEventListener("blur", n)
                })
            }
        },
        96056: (e, t, n) => {
            n.d(t, {
                Hu: () => d,
                _8: () => u,
                cj: () => s
            });
            var o = n(69567),
                r = n(36071);
            let i = "github-mobile-auth-flash";

            function a() {
                let e = document.querySelector("#js-flash-container");
                if (e)
                    for (let t of e.children) !t.classList.contains("js-flash-template") && t.classList.contains(i) && e.removeChild(t)
            }

            function s() {
                let e = document.getElementById("github-mobile-authenticate-prompt");
                e && (e.hidden = !0);
                let t = document.getElementById("github-mobile-authenticate-error-and-retry");
                t && (t.hidden = !1)
            }

            function u() {
                a();
                let e = document.getElementById("github-mobile-authenticate-prompt");
                e && (e.hidden = !1);
                let t = document.getElementById("github-mobile-authenticate-error-and-retry");
                t && (t.hidden = !0)
            }

            function c(e) {
                e && function(e) {
                    let t = new o.R(document.querySelector("template.js-flash-template"), {
                            className: `flash-error ${i}`,
                            message: e
                        }),
                        n = document.importNode(t, !0),
                        r = document.querySelector("#js-flash-container");
                    r && (a(), r.appendChild(n))
                }(e), s()
            }

            function l(e) {
                return document.getElementById("github-mobile-authenticate-error-and-retry").getAttribute(e)
            }
            async function d(e, t, n, o) {
                try {
                    var r;
                    await (r = e.getAttribute("data-poll-url"), async function e(i) {
                        let a, s, u;
                        if (o && o()) return;
                        let d = "STATUS_UNKNOWN";
                        try {
                            let e = document.getElementById("github-mobile-authenticate-form"),
                                t = e.querySelector(".js-data-url-csrf"),
                                n = await self.fetch(new Request(r, {
                                    method: "POST",
                                    body: new FormData(e),
                                    mode: "same-origin",
                                    headers: {
                                        Accept: "application/json",
                                        "Scoped-CSRF-Token": t.value,
                                        "X-Requested-With": "XMLHttpRequest"
                                    }
                                }));
                            if (n.ok) {
                                let e = await n.json();
                                d = e.status, a = e.token
                            } else d = "STATUS_ERROR"
                        } catch {
                            d = "STATUS_ERROR"
                        }
                        switch (d) {
                            case "STATUS_APPROVED":
                                var m;
                                return t ? t() : void((u = (m = a) ? new URL(`password_reset/${encodeURIComponent(m)}`, window.location.origin) : new URL("", window.location.href)).searchParams.set("redirect", "true"), window.location.assign(u));
                            case "STATUS_EXPIRED":
                                return s = l("timeout-flash"), n ? n(s) : c(s);
                            case "STATUS_ACTIVE":
                            case "STATUS_ERROR":
                            case "STATUS_UNKNOWN":
                                break;
                            case "STATUS_REJECTED":
                                return s = l("error-flash"), n ? n(s) : void document.getElementById("github-mobile-rejected-redirect").click();
                            default:
                                return s = l("error-flash"), n ? n(s) : c(s)
                        }
                        await new Promise(e => setTimeout(e, 3e3)), e(i)
                    }(0))
                } catch (t) {
                    let e = l("error-flash");
                    return c(e)
                }
            }(0, r.N7)(".js-poll-github-mobile-two-factor-authenticate", function(e) {
                d(e)
            }), (0, r.N7)(".js-poll-github-mobile-verified-device-authenticate", function(e) {
                d(e)
            }), (0, r.N7)(".js-poll-github-mobile-two-factor-password-reset-authenticate", function(e) {
                d(e)
            })
        },
        98576: (e, t, n) => {
            n.d(t, {
                C: () => s,
                v: () => u
            });
            var o = n(59753),
                r = n(254),
                i = n(65935),
                a = n(58700);

            function s() {
                document.body.classList.add("is-sending"), document.body.classList.remove("is-sent", "is-not-sent")
            }

            function u() {
                document.body.classList.add("is-sent"), document.body.classList.remove("is-sending")
            }(0, i.AC)(".js-send-auth-code", async (e, t) => {
                let n;
                s();
                try {
                    n = await t.text()
                } catch (e) {
                    ! function(e) {
                        e && (document.querySelector(".js-sms-error").textContent = e), document.body.classList.add("is-not-sent"), document.body.classList.remove("is-sending")
                    }(e.response.text)
                }
                n && u()
            }), (0, i.AC)(".js-two-factor-set-sms-fallback", async (e, t) => {
                let n;
                try {
                    n = await t.text()
                } catch (i) {
                    let t = e.querySelector(".js-configure-sms-fallback"),
                        n = e.querySelector(".js-verify-sms-fallback"),
                        o = t.hidden ? n : t,
                        r = o.querySelector(".flash");
                    switch (i.response.status) {
                        case 404:
                        case 422:
                        case 429:
                            r.textContent = JSON.parse(i.response.text).error, r.hidden = !1
                    }
                }
                if (n) switch (n.status) {
                    case 200:
                    case 201:
                        window.location.reload();
                        break;
                    case 202:
                        e.querySelector(".js-configure-sms-fallback").hidden = !0, e.querySelector(".js-verify-sms-fallback").hidden = !1, e.querySelector(".js-fallback-otp").focus()
                }
            }), (0, r.q6)(".js-verification-code-input-auto-submit", function(e) {
                let t = e.currentTarget,
                    n = t.pattern || "[0-9]{6}";
                RegExp(`^(${n})$`).test(t.value) && (0, a.Bt)(t.form)
            }), (0, o.on)("click", ".js-toggle-redacted-note-content", async e => {
                let t = e.currentTarget,
                    n = t.closest(".note");
                if (n) {
                    let e = n.getElementsByClassName("js-note")[0];
                    if (e) {
                        let n = t.getAttribute("data-content").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                        e.innerHTML = n
                    }
                }
                let o = n.getElementsByClassName("js-toggle-redacted-note-content");
                for (let e of o) e.hidden = !e.hidden
            })
        },
        5760: (e, t, n) => {
            var o = n(64325),
                r = n(36071);
            (0, r.N7)(".js-transform-notice", {
                constructor: HTMLElement,
                add(e) {
                    let t = (0, o.$1)("org_transform_notice");
                    for (let n of t) {
                        let t = document.createElement("span");
                        try {
                            t.textContent = atob(decodeURIComponent(n.value)), (0, o.kT)(n.key), e.appendChild(t), e.hidden = !1
                        } catch (e) {}
                        return
                    }
                }
            }), n(98576), n(96056);
            var i = n(27800),
                a = n(8433),
                s = n(58700);
            let u = new AbortController;
            async function c() {
                return await globalThis.PublicKeyCredential ? .isConditionalMediationAvailable ? .()
            }
            async function l() {
                let e = await (0, i.k)(),
                    t = document.querySelector(".js-conditional-webauthn-placeholder"),
                    n = document.querySelector("webauthn-get");
                if (n && null !== n.getAttribute("subtle-login")) return;
                let o = await c();
                if (t && o && "supported" === e) {
                    document.querySelector("#login_field") ? .setAttribute("autocomplete", "username webauthn");
                    let e = t.getAttribute("data-webauthn-sign-request");
                    if (!e) return;
                    n && n.addEventListener("webauthn-get-prompt", () => {
                        u.abort()
                    });
                    let o = JSON.parse(e),
                        r = (0, a.wz)(o);
                    r.signal = u.signal;
                    let i = await (0, a.U2)(r),
                        c = t.querySelector(".js-conditional-webauthn-response");
                    c.value = JSON.stringify(i), (0, s.Bt)(t)
                }
            }(0, r.N7)(".js-webauthn-support", {
                constructor: HTMLInputElement,
                add(e) {
                    (0, s.Se)(e, (0, i.T)())
                }
            }), (0, r.N7)(".js-webauthn-iuvpaa-support", {
                constructor: HTMLInputElement,
                async add(e) {
                    (0, s.Se)(e, await (0, i.k)())
                }
            }), (0, r.N7)(".js-support", {
                constructor: HTMLInputElement,
                async add(e) {
                    (0, s.Se)(e, "true")
                }
            }), (0, r.N7)(".js-conditional-webauthn-placeholder", function() {
                l()
            });
            var d = n(53729);

            function m(e) {
                let t = e.closest("form");
                if (!t) return;
                let n = t.querySelector(".js-password-field"),
                    o = t.querySelector(".js-sign-in-button");
                if (!n || !o) return;
                let r = e.value,
                    i = document.querySelector(".js-webauthn-login-emu-control"),
                    a = document.querySelector(".js-webauthn-subtle-emu-control"),
                    s = document.querySelector(".js-webauthn-hint-emu-control"),
                    u = document.querySelector("#forgot-password");
                !(!(0, d.ko)() && "true" !== o.getAttribute("disable-emu-sso") && r.includes("_")) || r.includes("@") || ["pj_nitin", "up_the_irons"].includes(r) || r.endsWith("_admin") || o.getAttribute("development") && r.endsWith("_fab") ? (n.removeAttribute("disabled"), o.value = o.getAttribute("data-signin-label") || " ", i ? .removeAttribute("hidden"), a ? .removeAttribute("hidden"), s ? .removeAttribute("hidden"), u ? .removeAttribute("hidden")) : (n.setAttribute("disabled", "true"), o.value = o.getAttribute("data-sso-label") || " ", i ? .setAttribute("hidden", "true"), a ? .setAttribute("hidden", "true"), s ? .setAttribute("hidden", "true"), u ? .setAttribute("hidden", "true"))
            }(0, r.N7)(".js-login-field", {
                constructor: HTMLInputElement,
                add(e) {
                    m(e), e.addEventListener("input", function() {
                        m(e)
                    })
                }
            })
        },
        64325: (e, t, n) => {
            function o(e) {
                return r(e)[0]
            }

            function r(e) {
                let t = [];
                for (let n of function() {
                        try {
                            return document.cookie.split(";")
                        } catch {
                            return []
                        }
                    }()) {
                    let [o, r] = n.trim().split("=");
                    e === o && void 0 !== r && t.push({
                        key: o,
                        value: r
                    })
                }
                return t
            }

            function i(e, t, n = null, o = !1, r = "lax") {
                let i = document.domain;
                if (null == i) throw Error("Unable to get document domain");
                i.endsWith(".github.com") && (i = "github.com");
                let a = "https:" === location.protocol ? "; secure" : "",
                    s = n ? `; expires=${n}` : "";
                !1 === o && (i = `.${i}`);
                try {
                    document.cookie = `${e}=${t}; path=/; domain=${i}${s}${a}; samesite=${r}`
                } catch {}
            }

            function a(e, t = !1) {
                let n = document.domain;
                if (null == n) throw Error("Unable to get document domain");
                n.endsWith(".github.com") && (n = "github.com");
                let o = new Date().getTime(),
                    r = new Date(o - 1).toUTCString(),
                    i = "https:" === location.protocol ? "; secure" : "",
                    a = `; expires=${r}`;
                !1 === t && (n = `.${n}`);
                try {
                    document.cookie = `${e}=''; path=/; domain=${n}${a}${i}`
                } catch {}
            }
            n.d(t, {
                $1: () => r,
                d8: () => i,
                ej: () => o,
                kT: () => a
            })
        },
        58700: (e, t, n) => {
            n.d(t, {
                Bt: () => i,
                DN: () => s,
                KL: () => l,
                Se: () => a,
                qC: () => d,
                sw: () => u
            });
            var o = n(5582);

            function r(e, t, n) {
                return e.dispatchEvent(new CustomEvent(t, {
                    bubbles: !0,
                    cancelable: n
                }))
            }

            function i(e, t) {
                t && (function(e, t) {
                    if (!(e instanceof HTMLFormElement)) throw TypeError("The specified element is not of type HTMLFormElement.");
                    if (!(t instanceof HTMLElement)) throw TypeError("The specified element is not of type HTMLElement.");
                    if ("submit" !== t.type) throw TypeError("The specified element is not a submit button.");
                    if (!e || e !== t.form) throw Error("The specified element is not owned by the form element.")
                }(e, t), (0, o.j)(t)), r(e, "submit", !0) && e.submit()
            }

            function a(e, t) {
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
                for (let n in t) {
                    let o = t[n],
                        r = e.elements.namedItem(n);
                    r instanceof HTMLInputElement ? r.value = o : r instanceof HTMLTextAreaElement && (r.value = o)
                }
            }

            function u(e) {
                if (!(e instanceof HTMLElement)) return !1;
                let t = e.nodeName.toLowerCase(),
                    n = (e.getAttribute("type") || "").toLowerCase();
                return "select" === t || "textarea" === t || "input" === t && "submit" !== n && "reset" !== n || e.isContentEditable
            }

            function c(e) {
                return new URLSearchParams(e)
            }

            function l(e, t) {
                let n = new URLSearchParams(e.search),
                    o = c(t);
                for (let [e, t] of o) n.append(e, t);
                return n.toString()
            }

            function d(e) {
                return c(new FormData(e)).toString()
            }
        },
        5582: (e, t, n) => {
            function o(e) {
                let t = e.closest("form");
                if (!(t instanceof HTMLFormElement)) return;
                let n = r(t);
                if (e.name) {
                    let o = e.matches("input[type=submit]") ? "Submit" : "",
                        r = e.value || o;
                    n || ((n = document.createElement("input")).type = "hidden", n.classList.add("js-submit-button-value"), t.prepend(n)), n.name = e.name, n.value = r
                } else n && n.remove()
            }

            function r(e) {
                let t = e.querySelector("input.js-submit-button-value");
                return t instanceof HTMLInputElement ? t : null
            }
            n.d(t, {
                j: () => o,
                u: () => r
            })
        },
        53729: (e, t, n) => {
            n.d(t, {
                A7: () => u,
                ko: () => s,
                q1: () => a
            });
            var o = n(15205),
                r = n(86283);
            let i = (0, o.Z)(function() {
                    return r.n4 ? .head ? .querySelector('meta[name="runtime-environment"]') ? .content || ""
                }),
                a = (0, o.Z)(function() {
                    return r.n4 ? .head ? .querySelector('meta[name="is-private-instance"]') ? .content === "true"
                }),
                s = (0, o.Z)(function() {
                    return "enterprise" === i()
                }),
                u = "webpack"
        },
        86283: (e, t, n) => {
            n.d(t, {
                Qg: () => o.Qg,
                W6: () => o.W6,
                cF: () => o.cF,
                iG: () => r.iG,
                n4: () => r.n4,
                ssrSafeLocation: () => r.jX,
                zu: () => r.zu
            });
            var o = n(35647),
                r = n(73614)
        },
        73614: (e, t, n) => {
            n.d(t, {
                iG: () => r,
                jX: () => a,
                n4: () => o,
                zu: () => i
            });
            let o = "undefined" == typeof document ? void 0 : document,
                r = "undefined" == typeof window ? void 0 : window,
                i = "undefined" == typeof history ? void 0 : history,
                a = "undefined" == typeof location ? {
                    pathname: "",
                    origin: "",
                    search: "",
                    hash: ""
                } : location
        },
        35647: (e, t, n) => {
            n.d(t, {
                Qg: () => i,
                W6: () => r,
                cF: () => a
            });
            var o = n(73614);
            let r = void 0 === o.n4,
                i = !r;

            function a() {
                return !!r || !!o.n4.querySelector('react-app[data-ssr="true"]')
            }
        },
        27800: (e, t, n) => {
            n.d(t, {
                T: () => r,
                k: () => i
            });
            var o = n(8433);

            function r() {
                return (0, o.Zh)() ? "supported" : "unsupported"
            }
            async function i() {
                return await window.PublicKeyCredential ? .isUserVerifyingPlatformAuthenticatorAvailable() ? "supported" : "unsupported"
            }
        }
    },
    e => {
        var t = t => e(e.s = t);
        e.O(0, ["vendors-node_modules_github_selector-observer_dist_index_esm_js", "vendors-node_modules_github_remote-form_dist_index_js-node_modules_delegated-events_dist_inde-94fd67"], () => t(5760)), e.O()
    }
]);
//# sourceMappingURL=sessions-01b5dd830c33.js.map