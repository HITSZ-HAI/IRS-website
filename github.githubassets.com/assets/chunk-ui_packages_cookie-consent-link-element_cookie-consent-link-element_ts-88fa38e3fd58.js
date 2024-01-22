"use strict";
(globalThis.webpackChunk = globalThis.webpackChunk || []).push([
    ["ui_packages_cookie-consent-link-element_cookie-consent-link-element_ts"], {
        7328: (e, o, r) => {
            r.r(o), r.d(o, {
                CookieConsentLinkElement: () => i
            });
            var t = r(76006),
                a = r(48033);
            let i = class CookieConsentLinkElement extends HTMLElement {
                showConsentManagement() {
                    (0, a._8)()
                }
            };
            i = function(e, o, r, t) {
                var a, i = arguments.length,
                    n = i < 3 ? o : null === t ? t = Object.getOwnPropertyDescriptor(o, r) : t;
                if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) n = Reflect.decorate(e, o, r, t);
                else
                    for (var s = e.length - 1; s >= 0; s--)(a = e[s]) && (n = (i < 3 ? a(n) : i > 3 ? a(o, r, n) : a(o, r)) || n);
                return i > 3 && n && Object.defineProperty(o, r, n), n
            }([t.Ih], i)
        },
        48033: (e, o, r) => {
            let t;
            r.d(o, {
                gy: () => h,
                Ho: () => A,
                _$: () => k,
                Wu: () => g,
                Rw: () => w,
                mO: () => f,
                _8: () => v,
                lc: () => C
            });
            var a, i, n = r(64325),
                s = r(58749),
                c = r(94229);
            ! function(e) {
                e.Required = "Required", e.Analytics = "Analytics", e.SocialMedia = "SocialMedia", e.Advertising = "Advertising"
            }(a || (a = {})),
            function(e) {
                e.Required = "Required", e.Analytics = "Analytics", e.SocialMedia = "Social Media", e.Advertising = "Advertising"
            }(i || (i = {}));
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
                b = {
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
                p = {
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
                    $(e), t.hideBanner()
                };

            function g() {
                t = new c.ConsentControl("cookie-consent-banner", "en", m, d, b)
            }

            function v() {
                t.showPreferences(A() || {})
            }

            function f() {
                t.showBanner(p.Required)
            }

            function w() {
                $(p.NotRequired)
            }

            function k() {
                return null === A()
            }
            let x = new s.B;

            function C() {
                return x.promise
            }

            function $(e) {
                let o = Object.keys(e).map(o => `${o}:${e[o]?"1":"0"}`).join("-");
                (0, n.d8)(h, o, y.toUTCString()), x.resolve(e)
            }

            function A() {
                let e = (0, n.ej)(h);
                if (!e) return null;
                let o = e.value.split("-"),
                    r = {};
                for (let e of o) {
                    let [o, t] = e.split(":");
                    o && (r[o] = "1" === t)
                }
                return r
            }
            let H = A();
            H && x.resolve(H)
        },
        64325: (e, o, r) => {
            function t(e) {
                return a(e)[0]
            }

            function a(e) {
                let o = [];
                for (let r of function() {
                        try {
                            return document.cookie.split(";")
                        } catch {
                            return []
                        }
                    }()) {
                    let [t, a] = r.trim().split("=");
                    e === t && void 0 !== a && o.push({
                        key: t,
                        value: a
                    })
                }
                return o
            }

            function i(e, o, r = null, t = !1, a = "lax") {
                let i = document.domain;
                if (null == i) throw Error("Unable to get document domain");
                i.endsWith(".github.com") && (i = "github.com");
                let n = "https:" === location.protocol ? "; secure" : "",
                    s = r ? `; expires=${r}` : "";
                !1 === t && (i = `.${i}`);
                try {
                    document.cookie = `${e}=${o}; path=/; domain=${i}${s}${n}; samesite=${a}`
                } catch {}
            }

            function n(e, o = !1) {
                let r = document.domain;
                if (null == r) throw Error("Unable to get document domain");
                r.endsWith(".github.com") && (r = "github.com");
                let t = new Date().getTime(),
                    a = new Date(t - 1).toUTCString(),
                    i = "https:" === location.protocol ? "; secure" : "",
                    n = `; expires=${a}`;
                !1 === o && (r = `.${r}`);
                try {
                    document.cookie = `${e}=''; path=/; domain=${r}${n}${i}`
                } catch {}
            }
            r.d(o, {
                $1: () => a,
                d8: () => i,
                ej: () => t,
                kT: () => n
            })
        },
        58749: (e, o, r) => {
            r.d(o, {
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
//# sourceMappingURL=ui_packages_cookie-consent-link-element_cookie-consent-link-element_ts-b42262bb30b0.js.map