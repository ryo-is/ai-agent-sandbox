import { createGlobalTheme } from '@vanilla-extract/css';

export const vars = createGlobalTheme('#root', {
	color: {
		service: {
			primary: '#0083C1',
		},
		text: {
			primary: '#333333',
			sub: '#73797C',
			revert: '#e2e8f0',
			user: '#020617',
			assistant: '#e2e8f0',
		},
		background: {
			primary: '#eef4f7',
			revert: '#0083C1',
			white: '#ffffff',
			user: '#cbd5e1',
			assistant: '#475569',
		},
	},
});
