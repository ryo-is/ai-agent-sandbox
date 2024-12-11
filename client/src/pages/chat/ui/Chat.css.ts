import { style } from '@vanilla-extract/css';
import { vars } from '../../../vars.css';

export const chatWrapper = style({
	backgroundColor: '#242424',
	borderRadius: '10px',
	boxShadow:
		'0px 3px 3px -2px rgba(0, 0, 0, 0.2), 0px 3px 4px 0px rgba(0, 0, 0, 0.14), 0px 1px 8px 0px rgba(0, 0, 0, 0.12);',
	display: 'flex',
	flexDirection: 'column',
	height: '90vh',
	minWidth: '1080px',
	padding: '24px',
	width: '70vw',
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
	width: '75%',
	wordBreak: 'break-all',

	selectors: {
		// biome-ignore lint/complexity/useLiteralKeys: <explanation>
		[`&[data-chatrole="user"]`]: {
			color: vars.color.text.user,
			backgroundColor: vars.color.background.user,
			borderRadius: '12px 12px 0 12px',
		},

		// biome-ignore lint/complexity/useLiteralKeys: <explanation>
		[`&[data-chatrole="assistant"]`]: {
			color: vars.color.text.assistant,
			backgroundColor: vars.color.background.assistant,
			borderRadius: '12px 12px 12px 0',
		},
	},
});

export const chatFoot = style({
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',

	paddingRight: '16px',
	color: vars.color.text.revert,
	gap: '8px',
	borderRadius: '4px',
});

export const chatInput = style({
	flex: 1,
	padding: '16px',
	fontSize: '16px',
	color: vars.color.text.revert,

	selectors: {
		// biome-ignore lint/complexity/useLiteralKeys: <explanation>
		['&::placeholder']: {
			color: vars.color.text.sub,
		},
	},
});

export const sendButton = style({
	backgroundColor: 'inherit',
	border: 0,
	width: '18px',
	height: '18px',
	cursor: 'pointer',
	transition: 'opacity 0.2s ease',

	':hover': {
		opacity: 0.8,
	},
});
