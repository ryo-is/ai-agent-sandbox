import { keyframes, style, globalStyle } from '@vanilla-extract/css';
import { vars } from './vars.css.ts';

const fadeInAnimation = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
});

const popAnimation = keyframes({
  '0': { transform: 'scale(1)' },
  '33%': { transform: 'scale(1.1)' },
  '66%': { transform: 'scale(0.9)' },
  '100%': { transform: 'scale(1)' },
});

export const container = style({
  position: 'relative',
  width: 'fit-content',
  color: vars.color.text.primary,
});

export const chatToggleButtonWrapper = style({
  position: 'absolute',
  right: 0,
  bottom: 0,
  zIndex: 0,
  transition:
    'opacity 0.1s ease-out, visibility 0.1s ease-out, transform 0.1s ease-out',

  ':hover': {
    transform: 'scale(1.1)',
    transition:
      'opacity 0.2s ease-out, visibility 0.2s ease-out, transform 0.2s ease-out',
  },

  selectors: {
    [`${container}[data-isopen="true"] &`]: {
      opacity: 0,
      visibility: 'hidden',
    },
  },
});

export const chatToggleButton = style({
  opacity: 0.5,
  animation: `${popAnimation} 0.4s ease-out 0.2s, ${fadeInAnimation} 0.3s linear forwards`,
  borderRadius: '50%',
  width: '64px',
  height: '64px',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: vars.color.background.revert,
  cursor: 'pointer',
  visibility: 'visible',
  transform: 'scale(1)',
});

export const chatToggleIcon = style({
  verticalAlign: 'middle',
});

export const chat = style({
  position: 'relative',
  zIndex: '1',
  width: '350px',
  height: '520px',
  maxWidth: '100%',
  maxHeight: '100svh',
  minWidth: 'min(240px, 100vw)',
  minHeight: 'min(200px, 100svh)',
  backgroundColor: vars.color.background.primary,
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 -4px 4px 0 rgb(0 0 0 / .25)', // 一反転させているので影の方向も逆にする
  opacity: 0,
  visibility: 'hidden',
  transform: 'scale(-1, -1)', // resizeのつまみ位置を左上にする。あまりこの方法でやりたくはない
  resize: 'both',
  transition: 'opacity 0.3s ease, visibility 0.3s ease',

  selectors: {
    [`${container}[data-isopen="true"] &`]: {
      opacity: 1,
      visibility: 'visible',
    },
  },
});

export const chatInner = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  width: '100%',
  height: '100%',
  transform: 'scale(-1, -1)',
});

export const chatHead = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: vars.color.background.revert,
  padding: '16px',
  color: vars.color.text.revert,
});

export const chatCloseButton = style({
  width: '18px',
  height: '18px',
  cursor: 'pointer',
  transition: 'opacity 0.2s ease',
  ':hover': {
    opacity: 0.8,
  },
});

export const chatTitle = style({
  margin: 0,
  fontSize: '16px',
  fontWeight: 'bold',
  letterSpacing: '0.03em',
  fontFeatureSettings: '"palt"',
});

export const chatBody = style({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  rowGap: '20px',
  overflow: 'auto',
  overscrollBehavior: 'contain',
  scrollBehavior: 'smooth',
  padding: '20px 16px',
});

export const chatContent = style({
  display: 'flex',
  alignItems: 'flex-end',
  columnGap: '12px',

  selectors: {
    // biome-ignore lint/complexity/useLiteralKeys: <explanation>
    [`&[data-chatrole="user"]`]: {
      flexFlow: 'row-reverse',
    },
  },
});

export const balloon = style({
  padding: '12px',
  width: '85%',
  backgroundColor: vars.color.background.white,
  fontSize: '14px',
  wordBreak: 'break-word',

  selectors: {
    // biome-ignore lint/complexity/useLiteralKeys: <explanation>
    [`&[data-chatrole="user"]`]: {
      borderRadius: '12px 12px 0 12px',
    },

    // biome-ignore lint/complexity/useLiteralKeys: <explanation>
    [`&[data-chatrole="model"]`]: {
      backgroundColor: `color-mix(in hsl, ${vars.color.background.primary}, #000 8%)`,
      borderRadius: '12px 12px 12px 0',
    },
  },
});

// HTMLタグのスタイル
globalStyle(
  `.${balloon} > h1, .${balloon} > h2, .${balloon} > h3, .${balloon} > h4, .${balloon} > h5, .${balloon} > h6`,
  {
    fontWeight: 'bold',
    margin: '0.8em 0 0.4em',
  },
);

globalStyle(`.${balloon} h1`, { fontSize: '1.4em' });
globalStyle(`.${balloon} h2`, { fontSize: '1.3em' });
globalStyle(`.${balloon} h3`, { fontSize: '1.2em' });
globalStyle(`.${balloon} h4, .${balloon} h5, .${balloon} h6`, {
  fontSize: '1.1em',
});

globalStyle(`.${balloon} p`, {
  margin: '0.5em 0',
});

globalStyle(`.${balloon} ul, .${balloon} ol`, {
  margin: '0.5em 0',
  paddingLeft: '1.5em',
});

globalStyle(`.${balloon} li`, {
  margin: '0.2em 0',
});

globalStyle(`.${balloon} ul li`, {
  listStyle: 'disc',
});

globalStyle(`.${balloon} ol li`, {
  listStyle: 'decimal',
});

globalStyle(`.${balloon} code`, {
  backgroundColor: 'rgba(0, 0, 0, 0.05)',
  padding: '0.2em 0.4em',
  borderRadius: '3px',
  fontFamily: 'monospace',
});

globalStyle(`.${balloon} pre`, {
  backgroundColor: 'rgba(0, 0, 0, 0.05)',
  padding: '0.8em',
  borderRadius: '6px',
  overflow: 'auto',
  margin: '0.8em 0',
});

globalStyle(`.${balloon} pre code`, {
  padding: 0,
  backgroundColor: 'transparent',
});

globalStyle(`.${balloon} a`, {
  color: '#0366d6',
  textDecoration: 'none',
});

globalStyle(`.${balloon} a:hover`, {
  textDecoration: 'underline',
});

globalStyle(`.${balloon} strong`, {
  fontWeight: 'bold',
});

globalStyle(`.${balloon} blockquote`, {
  borderLeft: '4px solid rgba(0, 0, 0, 0.1)',
  margin: '0.8em 0',
  padding: '0.2em 1em',
  color: 'rgba(0, 0, 0, 0.7)',
});

globalStyle(`.${balloon} hr`, {
  border: 'none',
  borderTop: '1px solid rgba(0, 0, 0, 0.1)',
  margin: '1em 0',
});

export const chatFoot = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: vars.color.background.white,
  paddingRight: '16px',
  color: vars.color.text.revert,
});

export const chatInput = style({
  flex: 1,
  maxHeight: 'calc(2.5lh + 16px)',
  padding: '16px',
  fontSize: '16px',
  color: vars.color.text.primary,
  resize: 'none',

  selectors: {
    // biome-ignore lint/complexity/useLiteralKeys: <explanation>
    ['&::placeholder']: {
      color: vars.color.text.sub,
    },
  },
});

export const sendButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '18px',
  height: '18px',
  cursor: 'pointer',
  color: vars.color.text.sub,
  transition: 'color 0.2s ease',

  ':hover': {
    color: vars.color.text.primary,
  },
});
