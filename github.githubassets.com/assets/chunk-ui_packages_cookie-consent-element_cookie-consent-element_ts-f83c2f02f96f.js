"use strict";
(globalThis.webpackChunk = globalThis.webpackChunk || []).push([
    ["ui_packages_cookie-consent-element_cookie-consent-element_ts"], {
        76796: (e, o, t) => {
            t.r(o), t.d(o, {
                CookieConsentElement: () => s
            });
            var r, i = t(76006),
                a = t(48033);

            function n(e, o, t, r) {
                var i, a = arguments.length,
                    n = a < 3 ? o : null === r ? r = Object.getOwnPropertyDescriptor(o, t) : r;
                if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) n = Reflect.decorate(e, o, t, r);
                else
                    for (var s = e.length - 1; s >= 0; s--)(i = e[s]) && (n = (a < 3 ? i(n) : a > 3 ? i(o, t, n) : i(o, t)) || n);
                return a > 3 && n && Object.defineProperty(o, t, n), n
            }
            let s = (r = new WeakSet, class CookieConsentElement extends HTMLElement {
                connectedCallback() {
                    (0, a.Wu)(), this.initialCookieConsentAllowed && (0, a._$)() && (function(e, o, t) {
                        if (!o.has(e)) throw TypeError("attempted to get private field on non-instance");
                        return t
                    })(this, r, c).call(this)
                }
                constructor(...e) {
                    super(...e),
                        function(e, o) {
                            (function(e, o) {
                                if (o.has(e)) throw TypeError("Cannot initialize the same private elements twice on an object")
                            })(e, o), o.add(e)
                        }(this, r)
                }
            });

            function c() {
                this.cookieConsentRequired ? (0, a.mO)() : (0, a.Rw)()
            }
            n([i.Lj], s.prototype, "initialCookieConsentAllowed", void 0), n([i.Lj], s.prototype, "cookieConsentRequired", void 0), s = n([i.Ih], s)
        },
        48033: (e, o, t) => {
            let r;
            t.d(o, {
                gy: () => h,
                Ho: () => $,
                _$: () => k,
                Wu: () => g,
                Rw: () => w,
                mO: () => f,
                _8: () => v,
                lc: () => x
            });
            var i, a, n = t(64325),
                s = t(58749),
                c = t(94229);
            ! function(e) {
                e.Required = "Required", e.Analytics = "Analytics", e.SocialMedia = "SocialMedia", e.Advertising = "Advertising"
            }(i || (i = {})),
            function(e) {
                e.Required = "Required", e.Analytics = "Analytics", e.SocialMedia = "Social Media", e.Advertising = "Advertising"
            }(a || (a = {}));
            let l = "https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement",
                d = [{
                    id: "Required",
                    name: "Required",
                    descHtml: "GitHub uses required cookies to perform essential website functions and to provide the services. For example, cookies are used to log you in, save your language preferences, provide a shopping cart experience, improve performance, route traffic between web servers, detect the size of your screen, determine page load times, improve user experience, and for audience measurement. These cookies are necessary for our websites to work.",
                    isUnswitchable: !0
                }, {
                    id: "Analytics",
                    name: "Analytics",
                    descHtml: "We allow third parties to use analytics cookies to understand how you use our websites so we can make them better. For example, cookies are used to gather information about the pages you visit and how many clicks you need to accomplish a task. We also use some analytics cookies to provide personalized advertising."
                }, {
                    id: "SocialMedia",
                    name: "Social Media",
                    descHtml: "GitHub and third parties use social media cookies to show you ads and content based on your social media profiles and activity on GitHub's websites. This ensures that the ads and content you see on our websites and on social media will better reflect your interests. This also enables third parties to develop and improve their products, which they may use on websites that are not owned or operated by GitHub."
                }, {
                    id: "Advertising",
                    name: "Advertising",
                    descHtml: "In addition, GitHub and third parties use advertising cookies to show you new ads based on ads you've already seen. Cookies also track which ads you click or purchases you make after clicking an ad. This is done to show you ads that are more relevant to you and for business purposes with our advertising partners. For example, cookies are used to detect when you click an ad and to show you ads based on your social media interests and website browsing history."
                }],
                u = {
                    bannerMessageHtml: `We use optional cookies to improve your experience on our websites and to display personalized advertising based on your online activity. If you reject optional cookies, only cookies necessary to provide you the services listed above will be used. You may change your selection on which cookies to accept by clicking "Manage Cookies" at the bottom of the page to change your selection. This selection is maintained for 180 days. Please review your selections regularly. <br/> <br/> <a href="https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-personal-account-settings/managing-your-cookie-preferences-for-githubs-enterprise-marketing-pages">How to manage cookie preferences</a> | <a href="${l}">Privacy Statement</a> | <a href="https://docs.github.com/en/site-policy/privacy-policies/github-subprocessors-and-cookies">Third-Party Cookies</a>.`,
                    acceptAllLabel: "Accept",
                    rejectAllLabel: "Reject",
                    moreInfoLabel: "Manage cookies",
                    preferencesDialogCloseLabel: "Close",
                    preferencesDialogTitle: "Manage cookie preferences",
                    preferencesDialogDescHtml: `Most GitHub websites use cookies. Cookies are small text files placed on your device to store data so web servers can use it later. GitHub and our third-party partners use cookies to remember your preferences and settings, help you sign in, show you personalized ads, and analyze how well our websites are working. For more info, see the Cookies and similar technologies section of the <a href="${l}">Privacy Statement</a>.`
                },
                p = {
                    textResources: u,
                    themes: {
                        github: {
                            "close-button-color": "var(--color-scale-purple-2)",
                            "secondary-button-disabled-opacity": "0.5",
                            "secondary-button-hover-shadow": "none",
                            "primary-button-disabled-opacity": "0.5",
                            "primary-button-hover-border": "1px solid transparent",
                            "primary-button-disabled-border": "1px solid transparent",
                            "primary-button-hover-shadow": "none",
                            "banner-background-color": "var(--color-scale-gray-9)",
                            "dialog-background-color": "var(--color-scale-gray-9)",
                            "primary-button-color": "var(--color-scale-white)",
                            "text-color": "var(--color-scale-white)",
                            "secondary-button-color": "var(--color-scale-gray-8)",
                            "secondary-button-disabled-color": "var(--color-scale-gray-7)",
                            "secondary-button-border": "1px solid var(--color-scale-gray-1)",
                            "background-color-between-page-and-dialog": "rgba(23, 23, 23, 0.8)",
                            "dialog-border-color": "var(--color-scale-purple-2)",
                            "hyperlink-font-color": "var(--color-scale-purple-2)",
                            "secondary-button-hover-color": "var(--color-scale-gray-9)",
                            "secondary-button-hover-border": "1px solid var(--color-scale-white)",
                            "secondary-button-disabled-border": "1px solid var(--color-scale-gray-5)",
                            "secondary-button-focus-border-color": "var(--color-scale-gray-5)",
                            "secondary-button-text-color": "var(--color-scale-white)",
                            "secondary-button-disabled-text-color": "var(--color-scale-white)",
                            "primary-button-hover-color": "var(--color-scale-purple-2)",
                            "primary-button-disabled-color": "var(--color-scale-white)",
                            "primary-button-border": "1px solid var(--color-scale-white)",
                            "primary-button-focus-border-color": "var(--color-scale-white)",
                            "primary-button-text-color": "var(--color-scale-black)",
                            "primary-button-disabled-text-color": "var(--color-scale-black)",
                            "radio-button-border-color": "var(--color-scale-purple-2)",
                            "radio-button-checked-background-color": "var(--color-scale-purple-2)",
                            "radio-button-hover-border-color": "var(--color-scale-white)",
                            "radio-button-hover-background-color": "var(--color-scale-white)",
                            "radio-button-disabled-color": "rgba(227, 227, 227, 0.2)",
                            "radio-button-disabled-border-color": "rgba(227, 227, 227, 0.2)"
                        }
                    },
                    initialTheme: "github"
                },
                b = {
                    Required: {
                        Required: !0,
                        Analytics: !1,
                        SocialMedia: !1,
                        Advertising: !1
                    },
                    NotRequired: {
                        Required: !0,
                        Analytics: !0,
                        SocialMedia: !0,
                        Advertising: !0
                    }
                },
                h = "GHCC",
                y = new Date(new Date().getTime() + 15552e6),
                m = e => {
                    A(e), r.hideBanner()
                };

            function g() {
                r = new c.ConsentControl("cookie-consent-banner", "en", m, d, p)
            }

            function v() {
                r.showPreferences($() || {})
            }

            function f() {
                r.showBanner(b.Required)
            }

            function w() {
                A(b.NotRequired)
            }

            function k() {
                return null === $()
            }
            let C = new s.B;

            function x() {
                return C.promise
            }

            function A(e) {
                let o = Object.keys(e).map(o => `${o}:${e[o]?"1":"0"}`).join("-");
                (0, n.d8)(h, o, y.toUTCString()), C.resolve(e)
            }

            function $() {
                let e = (0, n.ej)(h);
                if (!e) return null;
                let o = e.value.split("-"),
                    t = {};
                for (let e of o) {
                    let [o, r] = e.split(":");
                    o && (t[o] = "1" === r)
                }
                return t
            }
            let R = $();
            R && C.resolve(R)
        },
        64325: (e, o, t) => {
            function r(e) {
                return i(e)[0]
            }

            function i(e) {
                let o = [];
                for (let t of function() {
                        try {
                            return document.cookie.split(";")
                        } catch {
                            return []
                        }
                    }()) {
                    let [r, i] = t.trim().split("=");
                    e === r && void 0 !== i && o.push({
                        key: r,
                        value: i
                    })
                }
                return o
            }

            function a(e, o, t = null, r = !1, i = "lax") {
                let a = document.domain;
                if (null == a) throw Error("Unable to get document domain");
                a.endsWith(".github.com") && (a = "github.com");
                let n = "https:" === location.protocol ? "; secure" : "",
                    s = t ? `; expires=${t}` : "";
                !1 === r && (a = `.${a}`);
                try {
                    document.cookie = `${e}=${o}; path=/; domain=${a}${s}${n}; samesite=${i}`
                } catch {}
            }

            function n(e, o = !1) {
                let t = document.domain;
                if (null == t) throw Error("Unable to get document domain");
                t.endsWith(".github.com") && (t = "github.com");
                let r = new Date().getTime(),
                    i = new Date(r - 1).toUTCString(),
                    a = "https:" === location.protocol ? "; secure" : "",
                    n = `; expires=${i}`;
                !1 === o && (t = `.${t}`);
                try {
                    document.cookie = `${e}=''; path=/; domain=${t}${n}${a}`
                } catch {}
            }
            t.d(o, {
                $1: () => i,
                d8: () => a,
                ej: () => r,
                kT: () => n
            })
        },
        58749: (e, o, t) => {
            t.d(o, {
                B: () => Deferred
            });
            let Deferred = class Deferred {
                constructor() {
                    this.promise = new Promise((e, o) => {
                        this.resolve = e, this.reject = o
                    })
                }
            }
        }
    }
]);
//# sourceMappingURL=ui_packages_cookie-consent-element_cookie-consent-element_ts-0a17127d802f.js.map