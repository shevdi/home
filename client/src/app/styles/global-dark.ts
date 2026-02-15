import { createGlobalStyle } from 'styled-components'

export const DarkGlobalStyle = createGlobalStyle`
  :root {
    --modal-back-color: rgba(15, 22, 28, 0.97);
    --nav-back-color: #0f1619;
    --nav-back-color-end: #151d22;
    --nav-font-color: #e8e4df;
    --link-color: #e8e4df;
    --input-bg: rgba(26, 35, 42, 1);
    --input-border: rgba(213, 242, 227, 0.8);
    --input-focus: rgba(213, 242, 227, 1);
    --input-focus-shadow: rgba(213, 242, 227, 0.2);
    --input-disabled-color: #606473;
    --text-color: #e8e4df;
    --text-muted: #9ca3af;
    --surface: #0a0f12;
    --surface-elevated: rgba(26, 35, 42, 0.95);
    --dropdown-over-nav: rgba(26, 35, 42, 0.98);
    --accent: #73ba9b;
    --accent-hover: #73ba9b;
    --circle: #003e1f;
    --glass-bg: rgba(26, 35, 42, 0.7);
    --glass-border: rgba(255, 255, 255, 0.06);
    --glass-shadow: 0 4px 24px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(255, 255, 255, 0.03) inset;
  }

  body {
    color: var(--text-color);
    margin: 0;
    background: 
      radial-gradient(ellipse 100% 70% at 10% 0%, rgba(224, 125, 74, 0.05) 0%, transparent 45%),
      radial-gradient(ellipse 80% 50% at 90% 100%, rgba(74, 130, 140, 0.06) 0%, transparent 45%),
      linear-gradient(180deg, #0a0f12 0%, #0f1619 50%, #0d1318 100%);
    background-attachment: fixed;
    min-height: 100vh;

    &::after {
      content: '';
      position: fixed;
      inset: 0;
      background-image: url('/background-dark.jpg');
      background-size: cover;
      background-position: center;
      opacity: 0.08;
      pointer-events: none;
      z-index: 0;
    }

    h1, h2, h3, h4, h5, h6, div {
      color: var(--text-color);
    }

    a {
      color: var(--link-color);
    }
  }

  /* react-calendar dark mode */
  .react-calendar {
    background: var(--input-bg);
    border-color: var(--input-border);
    color: var(--text-color);
  }

  .react-calendar__navigation button {
    color: var(--text-color);
  }

  .react-calendar__navigation button:disabled {
    background-color: var(--input-disabled-color);
    color: var(--text-muted);
  }

  .react-calendar__navigation button:enabled:hover,
  .react-calendar__navigation button:enabled:focus {
    background-color: var(--input-focus-shadow);
  }

  .react-calendar__month-view__weekdays__weekday {
    color: var(--text-muted);
  }

  /* .react-calendar__month-view__days__day--weekend {
    color: var(--accent);
  } */

  .react-calendar__month-view__days__day--neighboringMonth,
  .react-calendar__decade-view__years__year--neighboringDecade,
  .react-calendar__century-view__decades__decade--neighboringCentury {
    color: var(--text-muted);
    opacity: 0.6;
  }

  .react-calendar__tile {
    color: var(--text-color);
  }

  .react-calendar__tile:disabled {
    background-color: var(--input-disabled-color);
    color: var(--text-muted);
  }

  .react-calendar__tile:enabled:hover,
  .react-calendar__tile:enabled:focus {
    background-color: var(--input-focus-shadow);
  }

  .react-calendar__tile--now {
    background: var(--input-focus-shadow);
  }

  .react-calendar__tile--now:enabled:hover,
  .react-calendar__tile--now:enabled:focus {
    background: var(--input-focus-shadow);
    filter: brightness(1.1);
  }

  .react-calendar__tile--hasActive {
    background: rgba(224, 125, 74, 0.3);
  }

  .react-calendar__tile--hasActive:enabled:hover,
  .react-calendar__tile--hasActive:enabled:focus {
    background: rgba(224, 125, 74, 0.4);
  }

  /* .react-calendar__tile--active,
  .react-calendar__tile--rangeStart,
  .react-calendar__tile--rangeEnd,
  .react-calendar__tile--rangeBothEnds {
    color: white;
    border-radius: 50%;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  } */

  .react-calendar__tile--active:enabled:hover,
  .react-calendar__tile--active:enabled:focus,
  .react-calendar--selectRange .react-calendar__tile--hover {
    background: var(--accent-hover) !important;
    color: white;
  }
`
