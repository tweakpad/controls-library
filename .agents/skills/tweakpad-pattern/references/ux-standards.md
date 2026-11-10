# UX standards baseline

Start from these sources, read them, and add what the pattern's domain needs. Record every rule
the pattern follows in its record with the URL, the retrieval date and evidence in the page.

## Every pattern

- WCAG 2.2: https://www.w3.org/TR/WCAG22/ (forms, errors, focus, target size, accessible
  authentication)
- web.dev Learn Forms: https://web.dev/learn/forms
- NN/g form and error guidance: https://www.nngroup.com/articles/errors-forms-design-guidelines/

## Authentication

- Chrome sign-in form guidance: https://developer.chrome.com/docs/modern-web-guidance/guides/forms/autofill-sign-in-form
- web.dev sign-up form best practices: https://web.dev/articles/codelab-sign-up-form-best-practices
- OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- OWASP Forgot Password Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html
- NIST SP 800-63B: https://pages.nist.gov/800-63-4/sp800-63b.html
- NN/g registration and login checklist: https://www.nngroup.com/articles/checklist-registration-login/
- GOV.UK create accounts: https://design-system.service.gov.uk/patterns/create-accounts/
- GOV.UK passwords: https://design-system.service.gov.uk/patterns/passwords/
- WCAG 2.2 SC 3.3.8: https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html

## Identity provider marks

Read the owner's page every time; rules change (Google replaced its flat "G" with a gradient mark).

- Google: https://developers.google.com/identity/branding-guidelines
- Apple: https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple
- Microsoft: https://learn.microsoft.com/en-us/entra/identity-platform/howto-add-branding-in-apps
- GitHub: https://github.com/logos

Marks ship in `src/icons/brands.ts` with `src/icons/NOTICE.brands`; an image-only mark (a
gradient) ships as an image URL.
