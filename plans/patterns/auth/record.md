# Auth pattern record

## Delivery

| Field | Value |
| ----- | ----- |
| Pattern | Auth (`docs/patterns/auth.mdx`, entry `src/patterns/auth.ts`, Storybook `Patterns/Auth`) |
| Requested | 2026-11-10: first pattern of the Patterns section; standardized login practice (forgot password, show/hide password, create account, OAuth providers and custom ones, errors and flows) |
| Standardization | High: follow established guidance, no novel composition |
| Specification | Component Library 0.57.1: Input reveal (`inrv-q1`) and keyboard hints (`inkh-q1`, `inkh-q2`) added for this pattern |
| Decisions | Registration entry plus copyable markup (no pattern elements); one preview per screen, real routes, preview link guard; provider-compliant buttons with official marks shipped in `icons/brands` (Google as the official gradient image); reveal built into Input |

## UX standards

| ID | Guidance | Source | Retrieved | Rule | Applied in | Evidence in page | Status |
| -- | -------- | ------ | --------- | ---- | ---------- | ---------------- | ------ |
| U-01 | Chrome sign-in form guidance | https://developer.chrome.com/docs/modern-web-guidance/guides/forms/autofill-sign-in-form | 2026-11-10 | Sign-in identifier uses `autocomplete="username"` with a stable name | Sign in, recovery, reset | `autocomplete="username"` | applied |
| U-02 | Chrome sign-in form guidance | https://developer.chrome.com/docs/modern-web-guidance/guides/forms/autofill-sign-in-form | 2026-11-10 | Existing password uses `autocomplete="current-password"` (mandatory) | Sign in | `autocomplete="current-password"` | applied |
| U-03 | Chrome sign-in form guidance | https://developer.chrome.com/docs/modern-web-guidance/guides/forms/autofill-sign-in-form | 2026-11-10 | New passwords use `autocomplete="new-password"` so browsers suggest a strong one | Create account, reset | `autocomplete="new-password"` | applied |
| U-04 | Chrome sign-in form guidance | https://developer.chrome.com/docs/modern-web-guidance/guides/forms/autofill-sign-in-form | 2026-11-10 | Email and password are `required`; email uses `type="email"` | All forms | `type="email" name="email" autocomplete="username" enterkeyhint="next" required` | applied |
| U-05 | Chrome sign-in form guidance | https://developer.chrome.com/docs/modern-web-guidance/guides/forms/autofill-sign-in-form | 2026-11-10 | A Show password toggle | Sign in, create account, reset | `revealable` | applied |
| U-06 | Chrome sign-in form guidance | https://developer.chrome.com/docs/modern-web-guidance/guides/forms/autofill-sign-in-form | 2026-11-10 | A Forgot password link | Sign in | `href="/forgot-password">Forgot password?` | applied |
| U-07 | Chrome sign-in form guidance | https://developer.chrome.com/docs/modern-web-guidance/guides/forms/autofill-sign-in-form | 2026-11-10 | Specific submit labels ("Sign in", not "Submit"); a real form and submit button | All forms | `type="submit" size="lg" style="inline-size: 100%">Sign in` | applied |
| U-08 | Chrome sign-in form guidance | https://developer.chrome.com/docs/modern-web-guidance/guides/forms/autofill-sign-in-form | 2026-11-10 | `enterkeyhint` labels the virtual keyboard's Enter key | All forms | `enterkeyhint="go"` | applied |
| U-09 | Chrome sign-in form guidance | https://developer.chrome.com/docs/modern-web-guidance/guides/forms/autofill-sign-in-form | 2026-11-10 | No duplicate password entry; confirm the email instead | Create account | `We'll send a code to confirm it.` | applied |
| U-10 | OWASP Authentication Cheat Sheet (generic error messages) | https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html | 2026-11-10 | One generic message for a wrong identifier or password | Sign in | `title="Incorrect email or password"` | applied |
| U-11 | OWASP Forgot Password Cheat Sheet | https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html | 2026-11-10 | Same response whether or not the account exists; reset links expire | Password recovery | `has a Tweakpad account, we sent it a link` | applied |
| U-12 | OWASP Authentication Cheat Sheet (account enumeration) | https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html | 2026-11-10 | Sign-up does not reveal an existing account | Create account | `It answers the same for a new or an existing address.` | applied |
| U-13 | NN/g registration and login checklist | https://www.nngroup.com/articles/checklist-registration-login/ | 2026-11-10 | Mask passwords by default with a way to show them; keep the identifier after a failed attempt | Sign in | `password.select();` | applied |
| U-14 | NIST SP 800-63B (memorized secrets) | https://pages.nist.gov/800-63-4/sp800-63b.html | 2026-11-10 | Length over composition rules; allow spaces and paste; state the rule up front | Create account, reset | `At least 12 characters. Spaces and symbols are welcome.` | applied |
| U-15 | GOV.UK Create accounts pattern | https://design-system.service.gov.uk/patterns/create-accounts/ | 2026-11-10 | Confirm the email address; use plain "Create an account" wording | Create account | `Create an account` | applied |
| U-16 | WCAG 2.2 SC 3.3.8 Accessible Authentication (Minimum) | https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html | 2026-11-10 | No cognitive test: paste and autofill work in every field, including the code | Verification code | `autocomplete="one-time-code"` | applied |
| U-17 | Sign in with Google branding guidelines | https://developers.google.com/identity/branding-guidelines | 2026-11-10 | Official color gradient "G" on a light or dark button (#FFFFFF/#747775/#1F1F1F, #131314/#8E918F/#E3E3E3), "Sign in with Google" wording, at least as prominent as other providers | Sign in, create account | `light-dark(#ffffff, #131314)` | applied |
| U-18 | Apple Human Interface Guidelines: Sign in with Apple | https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple | 2026-11-10 | Black button on light backgrounds, white on dark; title "Sign in/Sign up with Apple"; logo and title one color; no smaller than other sign-in buttons | Sign in, create account | `light-dark(#000000, #ffffff)` | applied |
| U-19 | Sign in with Microsoft branding guidelines | https://learn.microsoft.com/en-us/entra/identity-platform/howto-add-branding-in-apps | 2026-11-10 | Unaltered logo with "Sign in with Microsoft"; light (#FFFFFF, #8C8C8C border, #5E5E5E text) or dark (#2F2F2F, white text) button | Sign in | `Sign in with Microsoft` | applied |
| U-20 | Chrome sign-in form guidance | https://developer.chrome.com/docs/modern-web-guidance/guides/forms/autofill-sign-in-form | 2026-11-10 | One-time codes use `autocomplete="one-time-code"` and numeric entry | Verification code, create account | `validation-type="numeric"` | applied |
| U-21 | Sign in with Google branding guidelines | https://developers.google.com/identity/branding-guidelines | 2026-11-10 | The "G" alone is allowed for an action button, on the light (#FFFFFF, #747775 border) or dark (#131314, #8E918F border) theme, named for its action | Compact provider buttons | `size="icon-lg" style="--tp-control: light-dark(#ffffff, #131314)` | applied |
| U-22 | Apple Human Interface Guidelines: Sign in with Apple | https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple | 2026-11-10 | A logo-only button is square (1:1), black or white with a white or black logo, never smaller than the other sign-in buttons | Compact provider buttons | `size="icon-lg" style="--tp-control: light-dark(#000000, #ffffff)` | applied |
| U-23 | Sign in with Microsoft branding guidelines | https://learn.microsoft.com/en-us/entra/identity-platform/howto-add-branding-in-apps | 2026-11-10 | The logo is paired with "Sign in with Microsoft" (or "Sign in"); no logo-only button is described, so Microsoft stays out of the compact row | Compact provider buttons | `size="icon-lg">Sign in with GitHub</tp-button>` | applied |

Known deviation: the Apple mark uses Apple's own logo path at the icon size of the other provider marks instead of Apple's padded logo file at the button height (Apple allows insetting the logo to align it with other providers' logos). Apple App Review evaluates custom buttons; apps confirm their final buttons with each provider.

## Flow coverage

| Flow | Screen | Empty | Invalid | Server error | Pending | Success / next |
| ---- | ------ | ----- | ------- | ------------ | ------- | -------------- |
| Sign in | Sign in (full-width or compact provider buttons) | required errors on Email and Password, focus on the first | email format | generic alert, password selected | submit spinner, disabled but focusable | app (stand-in refuses) |
| Create account | Create account | required errors on all fields and the terms | email format, 12-character minimum | none (same answer for any address) | submit spinner | Check your email (code, resend cooldown, use a different email) |
| Password recovery | Request link | required error | email format | none (same answer for any address) | submit spinner | Check your email (resend cooldown, use a different email) |
| Password recovery | Set a new password | required error | 12-character minimum | expired-link alert with a new-link action | submit spinner | Password changed, Sign in |
| Verification code | Code | "Complete the code." | numeric only | field error on the code | submit spinner | app (stand-in refuses); recovery code fallback |

## Composition map

| Region | Element | Page |
| ------ | ------- | ---- |
| Screen frame, heading, description, footer links | `tp-card` | components/card |
| Provider list, "or" row, link rows | `tp-stack` | components/stack |
| Provider buttons, links, submit and resend | `tp-button` | components/button |
| "or" divider lines | `tp-separator` | components/separator |
| Native form, submission, server errors, error summary | `tp-form` | components/form |
| Labels, descriptions, errors | `tp-field` | components/field |
| Email, name, password (reveal), recovery code | `tp-input` | components/input |
| Keep me signed in, terms | `tp-checkbox` | components/checkbox |
| Generic sign-in error, expired link | `tp-alert` | components/alert |
| Verification and confirmation codes | `tp-one-time-code-field` | components/one-time-code-field |

## Component gaps

| Gap | Resolution | Status |
| --- | ---------- | ------ |
| Show/hide password | Input `revealable` and `reveal-label`, part `input-reveal` (Component Library 0.57.0/0.57.1) | done |
| `enterkeyhint` and `inputmode` from markup | Forwarded by Input and Text area (`inkh-q1`, `inkh-q2`) | done |
| Eye icons | `icons/eye`, `icons/eye-off` | done |
| Provider marks | `icons/brands` (`appleIcon`, `microsoftIcon`, `githubIcon`, `googleMarkUrl`) with `NOTICE.brands` | done |
| Captioned "or" divider | Composed from two Separators and text in a Stack; a captioned Separator would replace it if more patterns need one | open |
| Full-width submit | `style="inline-size: 100%"` on the Button; a Button option if more patterns repeat it | open |
| Form-level pending state | Set on the submitter by the script (`loadingPosition`, `disabled`, `focusableWhenDisabled`) | open |
| Site's own sign-in, password-recovery and verify-code pages | Remove them and redirect to `/patterns/auth` once a release ships the pattern | open |
| Clearing an uncontrolled Input | Not possible by contract (mode fixed per instance); the refused password is selected instead | not applicable |

## Verification

| ID | Scenario | Expected | Actual | Evidence | Status |
| -- | -------- | -------- | ------ | -------- | ------ |
| V-01 | Storybook `Patterns/Auth`: header, chips, import line, five sections, previews; no undefined elements | page renders, chips link to component Docs | as expected; Patterns last in the sidebar | DevTools evaluate, `tmp/component-verification/patterns/auth/storybook-sign-in.png` | passed |
| V-02 | Sign in: empty submit; Enter submits; refused attempt | required errors, focus Email; spinner while pending; alert (`role="alert"`) shown, password focused and selected | as expected | DevTools click, fill, press_key, evaluate samples | passed |
| V-03 | Accessibility tree of Sign in | named provider buttons, named form, required textboxes, Show password toggle, checkbox, links with routes | as expected | DevTools snapshot `tmp/component-verification/patterns/auth/snapshot.txt` | passed |
| V-04 | Create account: empty submit; short password; terms; valid submit | errors on each field; 12-character error; confirmation step with focus on the code and a 30 s resend | as expected (one DevTools click on the terms box was lost after a scroll; the next clicks toggled it) | DevTools fill, click, `sign-up-verify.png` | passed |
| V-05 | Recovery, reset, recovery-code switch (scripted) | identical confirmation; expired-link alert then success; recovery step shown | as expected | DevTools evaluate | passed |
| V-06 | Verification code typed | auto-submit on the sixth digit; field error | as expected | DevTools type_text, `verify-error.png` | passed |
| V-07 | Light and dark themes | provider buttons follow each provider's light and dark styles; themed controls follow the theme | as expected | `sign-in-light.png`, dark screenshots | passed |
| V-08 | Links inside previews | same-origin routes do not navigate the docs page | links keep their URLs; navigation prevented by the preview runtime | DevTools snapshot | passed |
| V-09 | Entry alone defines every tag | an app importing only `@tweakpad/ui/patterns/auth` has no undefined elements | `undefinedElements` is `[]` with every screen's markup | DevTools evaluate on `tests/fixtures/patterns/auth/` | passed |
| V-10 | Website rendering against the linked local build | `/patterns/auth` lists under Authentication and renders every preview; links stay; component pages relate Auth | as expected; site still builds against the published 0.3.2 with no patterns | `astro check`, both site builds, DevTools on `astro preview`, `site-*.png` | passed |
| V-11 | Compact provider buttons in both themes | 36px squares; Google light/dark theme with the color mark, Apple black (light) and white (dark), GitHub neutral; each named "Sign in with …" | as expected | DevTools evaluate and snapshot, `compact-dark.png`, `compact-light.png` | passed |
