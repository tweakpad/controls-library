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

  .day::part(button) {
    inline-size: 100%;
    block-size: 100%;
    min-block-size: 0;
    padding: 0;
  }

  .day::part(button-label) {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .day:focus-within {
    position: relative;
    z-index: 2;
  }

  /* A range interior spans its whole column, so the band stays continuous across wide columns. */
  .day-cell[data-range-middle] .day {
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

  .footer[hidden] {
    display: none;
  }
`;
