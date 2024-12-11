import { globalStyle } from '@vanilla-extract/css';

globalStyle(':root', {
	fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
	lineHeight: 1.5,
	fontSize: '16px',
	fontWeight: 400,
	colorScheme: 'light dark',
	color: 'rgba(255, 255, 255, 0.87)',
	backgroundColor: '#242424',
	fontSynthesis: 'none',
	textRendering: 'optimizeLegibility',
	WebkitFontSmoothing: 'antialiased',
	MozOsxFontSmoothing: 'grayscale',
});

globalStyle('body', {
	margin: 0,
	display: 'flex',
	justifyContent: 'center',
	placeItems: 'center',
	minWidth: '100vw',
	minHeight: '100vh',
});
