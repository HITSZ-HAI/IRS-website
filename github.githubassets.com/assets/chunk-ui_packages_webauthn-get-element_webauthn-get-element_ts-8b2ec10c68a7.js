"use strict";
(globalThis.webpackChunk = globalThis.webpackChunk || []).push([
    ["ui_packages_webauthn-get-element_webauthn-get-element_ts"], {
        58700: (t, e, n) => {
            n.d(e, {
                Bt: () => s,
                DN: () => a,
                KL: () => c,
                Se: () => o,
                qC: () => d,
                sw: () => u
            });
            var i = n(5582);

            function r(t, e, n) {
                return t.dispatchEvent(new CustomEvent(e, {
                    bubbles: !0,
                    cancelable: n
                }))
            }

            function s(t, e) {
                e && (function(t, e) {
                    if (!(t instanceof HTMLFormElement)) throw TypeError("The specified element is not of type HTMLFormElement.");
                    if (!(e instanceof HTMLElement)) throw TypeError("The specified element is not of type HTMLElement.");
                    if ("submit" !== e.type) throw TypeError("The specified element is not a submit button.");
                    if (!t || t !== e.form) throw Error("The specified element is not owned by the form element.")
                }(t, e), (0, i.j)(e)), r(t, "submit", !0) && t.submit()
            }

            function o(t, e) {
                if ("boolean" == typeof e) {
                    if (t instanceof HTMLInputElement) t.checked = e;
                    else throw TypeError("only checkboxes can be set to boolean value")
                } else {
                    if ("checkbox" === t.type) throw TypeError("checkbox can't be set to string value");
                    t.value = e
                }
                r(t, "change", !1)
            }

            function a(t, e) {
                for (let n in e) {
                    let i = e[n],
                        r = t.elements.namedItem(n);
                    r instanceof HTMLInputElement ? r.value = i : r instanceof HTMLTextAreaElement && (r.value = i)
                }
            }

            function u(t) {
                if (!(t instanceof HTMLElement)) return !1;
                let e = t.nodeName.toLowerCase(),
                    n = (t.getAttribute("type") || "").toLowerCase();
                return "select" === e || "textarea" === e || "input" === e && "submit" !== n && "reset" !== n || t.isContentEditable
            }

            function l(t) {
                return new URLSearchParams(t)
            }

            function c(t, e) {
                let n = new URLSearchParams(t.search),
                    i = l(e);
                for (let [t, e] of i) n.append(t, e);
                return n.toString()
            }

            function d(t) {
                return l(new FormData(t)).toString()
            }
        },
        5582: (t, e, n) => {
            function i(t) {
                let e = t.closest("form");
                if (!(e instanceof HTMLFormElement)) return;
                let n = r(e);
                if (t.name) {
                    let i = t.matches("input[type=submit]") ? "Submit" : "",
                        r = t.value || i;
                    n || ((n = document.createElement("input")).type = "hidden", n.classList.add("js-submit-button-value"), e.prepend(n)), n.name = t.name, n.value = r
                } else n && n.remove()
            }

            function r(t) {
                let e = t.querySelector("input.js-submit-button-value");
                return e instanceof HTMLInputElement ? e : null
            }
            n.d(e, {
                j: () => i,
                u: () => r
            })
        },
        59840: (t, e, n) => {
            n.r(e), n.d(e, {
                State: () => r,
                WebauthnGetElement: () => l
            });
            var i, r, s = n(76006),
                o = n(8433),
                a = n(58700);

            function u(t, e, n, i) {
                var r, s = arguments.length,
                    o = s < 3 ? e : null === i ? i = Object.getOwnPropertyDescriptor(e, n) : i;
                if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o = Reflect.decorate(t, e, n, i);
                else
                    for (var a = t.length - 1; a >= 0; a--)(r = t[a]) && (o = (s < 3 ? r(o) : s > 3 ? r(e, n, o) : r(e, n)) || o);
                return s > 3 && o && Object.defineProperty(e, n, o), o
            }! function(t) {
                t.Initializing = "initializing", t.Unsupported = "unsupported", t.Ready = "ready", t.Waiting = "waiting", t.Error = "error", t.Submitting = "submitting"
            }(r || (r = {}));
            let l = ((i = class WebauthnGetElement extends HTMLElement {
                async connectedCallback() {
                    this.originalButtonText = this.getCurrentButtonText(), this.originalErrorText = this.errorText.textContent, this.setState((0, o.Zh)() ? "ready" : "unsupported"), this.passkeySupport = await window.PublicKeyCredential ? .isUserVerifyingPlatformAuthenticatorAvailable(), "unsupported" !== this.state && !this.passkeySupport && this.passkeysUnsupportedMessage && (this.passkeysUnsupportedMessage.hidden = !1), this.subtleLogin ? this.handleWebauthnSubtle() : this.showWebauthnLoginFragment()
                }
                handleWebauthnSubtle() {
                    let t = document.querySelector(".js-webauthn-subtle");
                    t && (t.hidden = !1, this.updateWebauthnSubtleParentBoxVisibility(!1), t.addEventListener("webauthn-subtle-submit", () => {
                        this.showWebauthnLoginFragment(), "unsupported" !== this.state && this.prompt()
                    }))
                }
                showWebauthnLoginFragment() {
                    let t = document.querySelector(".js-webauthn-login-section");
                    t && (t.hidden = !1, this.updateWebauthnSubtleParentBoxVisibility(!0))
                }
                updateWebauthnSubtleParentBoxVisibility(t) {
                    let e = document.querySelector(".js-webauthn-hint");
                    e && (e.hidden = t)
                }
                getCurrentButtonText() {
                    return this.buttonText.textContent || ""
                }
                setCurrentButtonText(t) {
                    this.buttonText.textContent = t
                }
                setState(t) {
                    let e = this.button.getAttribute("data-retry-message") || this.originalButtonText,
                        n = this.hasErrored ? e : this.originalButtonText;
                    for (let t of (this.setCurrentButtonText(n), this.button.disabled = !1, this.button.hidden = !1, this.errorText.textContent = "", this.messages)) t.hidden = !0;
                    switch (t) {
                        case "initializing":
                            this.button.disabled = !0;
                            break;
                        case "unsupported":
                            this.button.disabled = !0, this.unsupportedMessage.hidden = !1, this.passkeysUnsupportedMessage && (this.passkeysUnsupportedMessage.hidden = !0);
                            break;
                        case "ready":
                            break;
                        case "waiting":
                            this.waitingMessage.hidden = !1, this.button.hidden = !0;
                            break;
                        case "error":
                            this.errorMessage.hidden = !1, this.errorText.textContent = this.originalErrorText;
                            break;
                        case "submitting":
                            this.setCurrentButtonText("Verifying\u2026"), this.button.disabled = !0;
                            break;
                        default:
                            throw Error("invalid state")
                    }
                    this.state = t
                }
                async prompt(t, e) {
                    t ? .preventDefault(), this.dispatchEvent(new CustomEvent("webauthn-get-prompt"));
                    try {
                        e || this.setState("waiting");
                        let t = JSON.parse(this.dataJson),
                            n = await (0, o.U2)((0, o.wz)(t));
                        this.setState("submitting");
                        let i = this.closest(".js-webauthn-form"),
                            r = i.querySelector(".js-webauthn-response");
                        r.value = JSON.stringify(n), (0, a.Bt)(i)
                    } catch (t) {
                        if (!e) throw this.hasErrored = !0, this.setState("error"), t
                    }
                }
                constructor(...t) {
                    super(...t), this.state = "initializing", this.dataJson = "", this.subtleLogin = !1, this.hasErrored = !1
                }
            }).attrPrefix = "", i);
            u([s.fA], l.prototype, "button", void 0), u([s.fA], l.prototype, "buttonText", void 0), u([s.GO], l.prototype, "messages", void 0), u([s.fA], l.prototype, "capitalizedDescription", void 0), u([s.fA], l.prototype, "unsupportedMessage", void 0), u([s.fA], l.prototype, "passkeysUnsupportedMessage", void 0), u([s.fA], l.prototype, "waitingMessage", void 0), u([s.fA], l.prototype, "errorMessage", void 0), u([s.fA], l.prototype, "errorText", void 0), u([s.Lj], l.prototype, "dataJson", void 0), u([s.Lj], l.prototype, "subtleLogin", void 0), l = u([s.Ih], l)
        },
        8433: (t, e, n) => {
            function i(t) {
                let e = "==".slice(0, (4 - t.length % 4) % 4),
                    n = t.replace(/-/g, "+").replace(/_/g, "/") + e,
                    i = atob(n),
                    r = new ArrayBuffer(i.length),
                    s = new Uint8Array(r);
                for (let t = 0; t < i.length; t++) s[t] = i.charCodeAt(t);
                return r
            }

            function r(t) {
                let e = new Uint8Array(t),
                    n = "";
                for (let t of e) n += String.fromCharCode(t);
                let i = btoa(n),
                    r = i.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
                return r
            }
            n.d(e, {
                JO: () => y,
                U2: () => T,
                Ue: () => x,
                Zh: () => v,
                wz: () => w
            });
            var s = "copy",
                o = "convert";

            function a(t, e, n) {
                if (e === s) return n;
                if (e === o) return t(n);
                if (e instanceof Array) return n.map(n => a(t, e[0], n));
                if (e instanceof Object) {
                    let i = {};
                    for (let [r, s] of Object.entries(e)) {
                        if (s.derive) {
                            let t = s.derive(n);
                            void 0 !== t && (n[r] = t)
                        }
                        if (!(r in n)) {
                            if (s.required) throw Error(`Missing key: ${r}`);
                            continue
                        }
                        if (null == n[r]) {
                            i[r] = null;
                            continue
                        }
                        i[r] = a(t, s.schema, n[r])
                    }
                    return i
                }
            }

            function u(t, e) {
                return {
                    required: !0,
                    schema: t,
                    derive: e
                }
            }

            function l(t) {
                return {
                    required: !0,
                    schema: t
                }
            }

            function c(t) {
                return {
                    required: !1,
                    schema: t
                }
            }
            var d = {
                    type: l(s),
                    id: l(o),
                    transports: c(s)
                },
                h = {
                    appid: c(s),
                    appidExclude: c(s),
                    credProps: c(s)
                },
                p = {
                    appid: c(s),
                    appidExclude: c(s),
                    credProps: c(s)
                },
                b = {
                    publicKey: l({
                        rp: l(s),
                        user: l({
                            id: l(o),
                            name: l(s),
                            displayName: l(s)
                        }),
                        challenge: l(o),
                        pubKeyCredParams: l(s),
                        timeout: c(s),
                        excludeCredentials: c([d]),
                        authenticatorSelection: c(s),
                        attestation: c(s),
                        extensions: c(h)
                    }),
                    signal: c(s)
                },
                f = {
                    type: l(s),
                    id: l(s),
                    rawId: l(o),
                    authenticatorAttachment: c(s),
                    response: l({
                        clientDataJSON: l(o),
                        attestationObject: l(o),
                        transports: u(s, t => {
                            var e;
                            return (null == (e = t.getTransports) ? void 0 : e.call(t)) || []
                        })
                    }),
                    clientExtensionResults: u(p, t => t.getClientExtensionResults())
                },
                g = {
                    mediation: c(s),
                    publicKey: l({
                        challenge: l(o),
                        timeout: c(s),
                        rpId: c(s),
                        allowCredentials: c([d]),
                        userVerification: c(s),
                        extensions: c(h)
                    }),
                    signal: c(s)
                },
                m = {
                    type: l(s),
                    id: l(s),
                    rawId: l(o),
                    authenticatorAttachment: c(s),
                    response: l({
                        clientDataJSON: l(o),
                        authenticatorData: l(o),
                        signature: l(o),
                        userHandle: l(o)
                    }),
                    clientExtensionResults: u(p, t => t.getClientExtensionResults())
                };

            function y(t) {
                return a(i, b, t)
            }

            function w(t) {
                return a(i, g, t)
            }

            function v() {
                return !!(navigator.credentials && navigator.credentials.create && navigator.credentials.get && window.PublicKeyCredential)
            }
            async function x(t) {
                let e = await navigator.credentials.create(t);
                return e.toJSON = () => a(r, f, e), e
            }
            async function T(t) {
                let e = await navigator.credentials.get(t);
                return e.toJSON = () => a(r, m, e), e
            }
        }
    }
]);
//# sourceMappingURL=ui_packages_webauthn-get-element_webauthn-get-element_ts-5f006996038b.js.map