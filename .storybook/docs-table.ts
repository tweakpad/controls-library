import { createElement, type ComponentProps } from 'react';
import { styled } from 'storybook/theming';

// A Markdown table in a page takes the design of the API Reference tables (Storybook's args
// table): muted headers and a bordered, rounded body with row lines only, from the same theme
// values, so both schemes follow the Theme toolbar.
const DocsTableFrame = styled.table(({ theme }) => {
  const line = `1px solid ${theme.appBorderColor}`;
  return {
    '&&': {
      borderSpacing: 0,
      color: theme.color.defaultText,
      fontSize: theme.typography.size.s2 - 1,
      lineHeight: '19px',
      textAlign: 'left',
      width: '100%',
      marginTop: 25,
      marginBottom: 40,
      marginInline: 1,
      'td, th': { padding: '10px 15px', border: 'none', verticalAlign: 'top' },
      'th:first-of-type, td:first-of-type': { paddingLeft: 20 },
      'th:last-of-type, td:last-of-type': { paddingRight: 20 },
      th: { color: theme.textMutedColor, background: 'none' },
      tr: { background: 'none' },
      tbody: {
        filter:
          theme.base === 'light'
            ? 'drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.10))'
            : 'drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.20))',
        '> tr > td, > tr > th': { background: theme.background.content, borderTop: line },
        '> tr:first-of-type > td, > tr:first-of-type > th': { borderBlockStart: line },
        '> tr:last-of-type > td, > tr:last-of-type > th': { borderBlockEnd: line },
        '> tr > :first-child': { borderInlineStart: line },
        '> tr > :last-child': { borderInlineEnd: line },
        '> tr:first-of-type > :first-child': { borderTopLeftRadius: theme.appBorderRadius },
        '> tr:first-of-type > :last-child': { borderTopRightRadius: theme.appBorderRadius },
        '> tr:last-of-type > :first-child': { borderBottomLeftRadius: theme.appBorderRadius },
        '> tr:last-of-type > :last-child': { borderBottomRightRadius: theme.appBorderRadius },
      },
      '@media (forced-colors: active)': {
        tbody: { filter: 'none', '> tr > td, > tr > th': { borderColor: 'CanvasText' } },
      },
    },
  };
});

/** The `table` element of a docs page; `sb-unstyled` keeps Storybook's own Markdown table style off. */
export function DocsTable({ className, ...props }: ComponentProps<'table'>) {
  return createElement(DocsTableFrame, {
    ...props,
    className: ['sb-unstyled', className].filter(Boolean).join(' '),
  });
}
