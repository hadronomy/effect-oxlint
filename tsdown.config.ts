import { defineConfig } from 'tsdown';

export default defineConfig({
	entry: {
		index: './src/index.ts',
		testing: './src/Testing.ts'
	},
	format: ['esm'],
	dts: true,
	clean: true,
	fixedExtension: false,
	hash: false,
	deps: {
		neverBundle: ['@oxlint/plugins', 'effect']
	}
});
