import type { PresentationDictionary } from '../resolver.js';
import { fillHidden } from './shared/fill.js';

const rangeBacking = {
  content: "''",
  position: 'absolute',
  'inset-block': '0',
  'inline-size': '50%',
  'z-index': '-1',
  background: 'var(--tp-muted)',
};

/** Calendar roles augment the actual Button/NativeSelect owners. */
export const calendarAppearance: PresentationDictionary = {
  calendar: [
    {
      declarations: {
        padding: 'var(--tp-space-2)',
        // The containing surface (page, Card, Popover) owns the fill, so the calendar stays
        // transparent inside card and popover content; the calendar part can still set one.
        color: 'var(--tp-foreground)',
        'font-size': 'var(--tp-text-sm)',
        gap: 'var(--tp-space-3)',
      },
    },
    // A range endpoint's cell carries a half-width backing toward the range interior so
    // the primary endpoint button and the muted middle read as one continuous band.
    {
      selector: '& .day-cell[data-range-start]:not([data-range-end])::after',
      declarations: { ...rangeBacking, 'inset-inline-end': '0' },
    },
    {
      selector: '& .day-cell[data-range-end]:not([data-range-start])::after',
      declarations: { ...rangeBacking, 'inset-inline-start': '0' },
    },
    // Marker dots on a selected day take its foreground, so they show on the primary fill.
    {
      selector: '& .day-cell[data-selected]:not([data-range-middle]) .day-markers > tp-status-dot',
      declarations: { '--tp-status-dot-color': 'currentColor' },
    },
    // Range middles round where a week row or the strip starts or ends.
    {
      selector:
        '& :is(.week, .strip-row) > .day-cell:nth-child(1 of .day-cell)[data-range-middle] .day::part(button)',
      declarations: {
        'border-start-start-radius': 'var(--tp-radius-md)',
        'border-end-start-radius': 'var(--tp-radius-md)',
      },
    },
    {
      selector:
        '& :is(.week, .strip-row) > .day-cell:nth-last-child(1 of .day-cell)[data-range-middle] .day::part(button)',
      declarations: {
        'border-start-end-radius': 'var(--tp-radius-md)',
        'border-end-end-radius': 'var(--tp-radius-md)',
      },
    },
  ],
  'calendar-months': [{ declarations: { gap: 'var(--tp-space-4)' } }],
  'calendar-month': [{ declarations: { gap: 'var(--tp-space-3)' } }],
  'calendar-caption-label': [{ declarations: { 'font-weight': 'var(--tp-font-medium)' } }],
  'calendar-dropdowns': [{ declarations: { gap: 'var(--tp-space-1)' } }],
  'calendar-month-dropdown': [
    {
      declarations: {
        'padding-inline-start': 'var(--tp-space-2)',
        'font-size': 'var(--tp-text-sm)',
        'box-shadow': 'none',
      },
    },
  ],
  'calendar-year-dropdown': [
    {
      declarations: {
        'padding-inline-start': 'var(--tp-space-2)',
        'font-size': 'var(--tp-text-sm)',
        'box-shadow': 'none',
      },
    },
  ],
  'calendar-month-grid': [{ declarations: { gap: 'var(--tp-space-2)' } }],
  'calendar-weekday': [
    {
      declarations: {
        color: 'var(--tp-muted-foreground)',
        'font-size': 'var(--tp-text-xs)',
        'font-weight': 'var(--tp-font-normal)',
      },
    },
  ],
  'calendar-weeks': [{ declarations: { gap: 'var(--tp-space-2)' } }],
  'calendar-week-number': [
    { declarations: { color: 'var(--tp-muted-foreground)', 'font-size': 'var(--tp-text-xs)' } },
  ],
  'calendar-day': [
    {
      declarations: {
        'font-size': 'var(--tp-text-sm)',
        'font-weight': 'var(--tp-font-normal)',
        'border-radius': 'var(--tp-radius-md)',
        border: '0',
        // Selection moves between days at once. An inherited Button fade crosses the
        // fill and text colors, so the deselected digit blinks out mid-transition.
        transition: 'none',
      },
    },
    { selector: '&::before', declarations: { transition: 'none' } },
    // Hover never covers a day's own selected, today or range fill.
    fillHidden("&:is([data-today-indicator='fill'], [data-selected], [data-range-middle])"),
    { selector: '&[data-outside]', declarations: { color: 'var(--tp-muted-foreground)' } },
    {
      selector: "&[data-today-indicator='fill']:not([data-selected])",
      declarations: { background: 'var(--tp-muted)', color: 'var(--tp-foreground)' },
    },
    {
      selector: '&[data-selected]:not([data-range-middle])',
      declarations: { background: 'var(--tp-primary)', color: 'var(--tp-primary-foreground)' },
    },
    {
      selector: '&[data-range-middle]',
      declarations: {
        background: 'var(--tp-muted)',
        color: 'var(--tp-foreground)',
        'border-radius': '0',
      },
    },
    {
      selector: '&[data-range-middle][data-outside]',
      declarations: { color: 'var(--tp-muted-foreground)' },
    },
  ],
  'calendar-strip': [{ declarations: { gap: 'var(--tp-space-1)' } }],
  'calendar-day-weekday': [
    {
      declarations: {
        color: 'var(--tp-muted-foreground)',
        'font-size': 'var(--tp-text-xs)',
        'line-height': 'var(--tp-leading-tight)',
      },
    },
    // On a filled day the weekday takes the day's own color.
    {
      selector: "&:is([data-selected], [data-today-indicator='fill'], [data-range-middle])",
      declarations: { color: 'inherit' },
    },
  ],
  // In the strip the number is set larger under its weekday.
  'calendar-day-number': [
    {
      selector: '&[data-strip]',
      declarations: {
        'font-size': 'var(--tp-text-base)',
        'line-height': 'var(--tp-leading-tight)',
        'font-weight': 'var(--tp-font-medium)',
      },
    },
    { selector: '&[data-crossed-out]', declarations: { 'text-decoration-line': 'line-through' } },
    {
      selector: "&[data-today-indicator='underline']",
      declarations: {
        'text-decoration-line': 'underline',
        'text-decoration-thickness': '2px',
        'text-underline-offset': '0.2em',
      },
    },
    {
      selector: "&[data-crossed-out][data-today-indicator='underline']",
      declarations: { 'text-decoration-line': 'underline line-through' },
    },
  ],
  'calendar-day-markers': [
    {
      declarations: {
        gap: '2px',
        '--tp-status-dot-size': 'calc(var(--tp-spacing) * 1.25)',
      },
    },
  ],
  'calendar-footer': [{ declarations: { 'font-size': 'var(--tp-text-sm)' } }],
};
