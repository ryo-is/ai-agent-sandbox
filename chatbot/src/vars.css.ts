import { createGlobalTheme } from '@vanilla-extract/css';

export const vars = createGlobalTheme('#spr-aladdin_generate_client', {
  color: {
    service: {
      primary: '#0083C1',
    },
    text: {
      primary: '#333333',
      sub: '#73797C',
      revert: '#ffffff',
    },
    background: {
      primary: '#eef4f7',
      revert: '#0083C1',
      white: '#ffffff',
    },
  },
});
