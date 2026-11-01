import { addons } from 'storybook/manager-api';
import { create, themes } from 'storybook/theming';

// Storybook's own UI (Controls descriptions) cannot read the library tokens, so its code font
// repeats the default `--tp-font-mono` stack. It follows the device's color scheme, as the Docs
// pages do by default (the Theme toolbar's System).
const systemDark = matchMedia('(prefers-color-scheme: dark)').matches;
// The area behind the preview frame shows until the preview paints, and Storybook draws it white
// in both themes. It takes the scheme the preview loads in (the Theme toolbar's `theme` global in
// the URL, else the device) and the dark docs background, as the preview's loading screen does.
const theme = /(?:^|;)theme:(\w+)/.exec(
  new URLSearchParams(location.search).get('globals') ?? '',
)?.[1];
const previewDark = theme === 'dark' || (theme !== 'light' && systemDark);
addons.setConfig({
  theme: create({
    ...(systemDark ? themes.dark : themes.normal),
    fontCode: "'Cascadia Mono', ui-monospace, sfmono-regular, menlo, monaco, consolas, monospace",
    ...(previewDark ? { appPreviewBg: '#222325' } : {}),
  }),
});
