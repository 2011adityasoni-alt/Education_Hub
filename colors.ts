/** Brand palette (as specified). Semantic usage lives in theme/themes.ts. */
export const palette = {
  navy: '#101828',
  purple: '#7545FF',
  lime: '#B7F500',
  white: '#FFFFFF',
  softGrey: '#F2F4F7',
  textSecondary: '#667085',
  success: '#12B76A',
  error: '#F04438',

  // Derived steps, added for contrast. Raw brand colours fail WCAG AA as small text on some surfaces:
  //   #12B76A on white ≈ 2.6:1, #F04438 on white ≈ 3.9:1, #7545FF on navy ≈ 3.4:1.
  purpleText: '#6A3AF2', // purple text on white / soft grey / purpleSoft (≥ 5.1:1; raw #7545FF is 4.4:1 on purpleSoft)
  purpleOnDark: '#A58BFF', // ≥ 5.5:1 on navy surfaces
  purpleSoft: '#EFEAFF',
  purpleSoftDark: '#2A2160',
  successText: '#067647', // ≥ 5:1 on white
  successSoft: '#E7F8EF',
  errorText: '#B42318', // ≥ 5.7:1 on white and on errorSoft
  danger: '#D92D20', // destructive button fill; white label = 4.8:1
  errorSoft: '#FEECEB',
  slate900: '#0B1220', // dark-mode canvas (one step below navy surfaces)
  slate800: '#1D2939',
  slate700: '#344054',
  slate300: '#D0D5DD',
  slate400: '#98A2B3',
} as const;
