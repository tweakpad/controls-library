import { css } from 'lit';

export const calendarStyles = css`
  :host {
    --tp-calendar-cell-size: var(--tp-control-height-sm);

    display: inline-block;
    max-inline-size: 100%;
  }

  .root {
    display: grid;
    max-inline-size: 100%;
  }

  .months {
    display: flex;
    flex-wrap: wrap;
    position: relative;
  }

  :host([orientation='vertical']) .months {
    flex-direction: column;
  }

  /* Stack months on narrow viewports, as the reference's flex-col md:flex-row, so the
     calendar box fits one month; wrapping still covers narrow containers. */
  @media (width < 48rem) {
    .months {
      flex-direction: column;
    }
  }

  /* Months and columns grow to fill an inline size wider than the cells need, while rows keep the
     cell height and days keep the cell size; without one the calendar keeps its natural size. */
  .month {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-inline-size: 0;
  }

  .header {
    position: relative;
    display: flex;
    align-items: center;
    min-block-size: var(--tp-calendar-cell-size);
  }

  .caption {
    display: flex;
    flex: 1;
    justify-content: center;
    align-items: center;
    min-inline-size: 0;
    padding-inline: var(--tp-calendar-cell-size);
  }

  .caption-label {
    text-align: center;
  }

  .dropdowns {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .navigation {
    position: absolute;
    inset-block-start: 0;
    z-index: 1;
  }

  .previous::part(button-leading-mark) {
    rotate: 180deg;
  }

  :host(:dir(rtl)) .previous::part(button-leading-mark) {
    rotate: 0deg;
  }

  :host(:dir(rtl)) .next::part(button-leading-mark) {
    rotate: 180deg;
  }

  .previous {
    inset-inline-start: 0;
  }

  .next {
    inset-inline-end: 0;
  }

  .navigation::part(button) {
    inline-size: var(--tp-calendar-cell-size);
    block-size: var(--tp-calendar-cell-size);
    min-block-size: 0;
    padding: 0;
  }

  .grid,
  .weeks {
    display: grid;
  }

  .weekdays,
  .week {
    display: grid;
    grid-template-columns: repeat(7, minmax(var(--tp-calendar-cell-size), 1fr));
  }

  .grid[data-week-numbers] :is(.weekdays, .week) {
    grid-template-columns: repeat(8, minmax(var(--tp-calendar-cell-size), 1fr));
  }

  .weekday,
  .week-number {
    display: grid;
    place-items: center;
  }

  .day-cell {
    position: relative;
    isolation: isolate;
    display: grid;
    justify-items: center;
    min-inline-size: 0;
    block-size: var(--tp-calendar-cell-size);
  }

  .day {
    display: block;
    inline-size: var(--tp-calendar-cell-size);
    min-inline-size: 0;
  }

  /* Positioned, so the marker dots anchor to the day button and never move its content. */
  .day::part(button) {
    position: relative;
    inline-size: 100%;
    block-size: 100%;
    min-block-size: 0;
    padding: 0;
  }

  .day-markers {
    position: absolute;
    inset-inline: 0;
    inset-block-end: 2px;
    display: flex;
    justify-content: center;
    pointer-events: none;
  }

  /* A marker's own color, when it has one, replaces the dot's variant color. */
  .day-markers > tp-status-dot {
    --tp-status-dot-color: var(--_tp-calendar-marker-color);
  }

  /* Static, so the marker dots anchor to the button's bottom edge instead of the label. */
  .day::part(button-label) {
    position: static;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  /* With markers, every grid day's content rises alike, leaving the dots room under it. */
  .root[data-markers] .grid .day::part(button-label) {
    padding-block-end: 6px;
  }

  .day:focus-within {
    position: relative;
    z-index: 2;
  }

  /* A range interior spans its whole column, so the band stays continuous across wide columns;
     strip days always fill theirs. */
  :is(.day-cell[data-range-middle], .strip-row > .day-cell) .day {
    inline-size: 100%;
  }

  .dropdown::part(native-select-control) {
    /* Caption selectors stay compact controls; only cells and navigation follow the cell size. */
    block-size: min(var(--tp-calendar-cell-size), var(--tp-control-height-sm));
    min-block-size: 0;
  }

  .weekday {
    position: relative;
    overflow: hidden;
    white-space: nowrap;
  }

  /* The narrow labels show when a short label overflows its cell; the short labels stay laid out,
     out of flow and hidden, so their widths keep deciding. */
  .weekday-narrow {
    display: none;
  }

  .grid[data-narrow-weekdays] .weekday-short {
    position: absolute;
    visibility: hidden;
  }

  .grid[data-narrow-weekdays] .weekday-narrow {
    display: inline;
  }

  /* The strip: one row of consecutive days between its day controls. Days share the row's inline
     size, each a weekday over a day number. */
  .strip {
    display: flex;
    align-items: center;
    min-inline-size: 0;
  }

  .strip .navigation {
    position: static;
    flex: none;
  }

  /* Days prefer one and a half cells, give way to the cell size where room is short, and share
     any wider inline size. */
  .days {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    flex: 1 1 auto;
    inline-size: calc(var(--_tp-calendar-visible-days, 5) * var(--tp-calendar-cell-size) * 1.5);
    min-inline-size: 0;
  }

  /* While the strip slides it renders the days moving out as well, one fixed-width column each,
     and clips them to its own box. */
  .days:has(> .strip-row[data-sliding]) {
    overflow: clip;
  }

  .strip-row[data-sliding] {
    grid-template-columns: repeat(var(--_tp-calendar-strip-count), var(--_tp-calendar-strip-track));
  }

  .strip-row {
    display: grid;
    grid-template-columns: repeat(
      var(--_tp-calendar-visible-days, 5),
      minmax(var(--tp-calendar-cell-size), 1fr)
    );
  }

  .strip-row > .day-cell {
    block-size: calc(var(--tp-calendar-cell-size) * 2);
  }

  .day-weekday,
  .day-number {
    white-space: nowrap;
  }

  .footer[hidden] {
    display: none;
  }

  /* Unavailable days are crossed out at full strength; disabled ones stay dimmed. */
  .day-cell[data-unavailable]:not([data-disabled]) .day {
    opacity: 1;
  }
`;
