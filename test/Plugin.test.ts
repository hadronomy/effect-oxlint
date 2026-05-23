import { describe, expect, test } from '@effect/vitest';
import * as Effect from 'effect/Effect';
import * as R from 'effect/Record';

import * as Plugin from '../src/Plugin.ts';
import * as Rule from '../src/Rule.ts';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const dummyRule = (description: string) =>
	Rule.define({
		name: description,
		meta: Rule.meta({ type: 'suggestion', description }),
		create: function* () {
			yield* Effect.void;
			return {};
		}
	});

// ---------------------------------------------------------------------------
// Plugin.define
// ---------------------------------------------------------------------------

describe('Plugin.define', () => {
	test('creates a plugin with name and rules', () => {
		const plugin = Plugin.define({
			name: 'my-effect-rules',
			rules: {
				'no-throw': dummyRule('no-throw'),
				'prefer-fn': dummyRule('prefer-fn')
			}
		});
		expect(plugin.meta?.name).toBe('my-effect-rules');
		expect(plugin.rules?.['no-throw']).toBeDefined();
		expect(plugin.rules?.['prefer-fn']).toBeDefined();
	});

	test('creates a plugin with empty rules', () => {
		const plugin = Plugin.define({
			name: 'empty',
			rules: {}
		});
		expect(plugin.meta?.name).toBe('empty');
		expect(R.keys(plugin.rules ?? {})).toHaveLength(0);
	});

	test('generates an all-rules recommended config', () => {
		const plugin = Plugin.define({
			name: 'my-effect-rules',
			specifier: 'oxlint-plugin-my-effect-rules',
			rules: {
				'no-throw': dummyRule('no-throw'),
				'prefer-fn': dummyRule('prefer-fn')
			}
		});

		expect(plugin.configs.recommended.jsPlugins).toEqual([
			{
				name: 'my-effect-rules',
				specifier: 'oxlint-plugin-my-effect-rules'
			}
		]);
		expect(plugin.configs.recommended.rules).toEqual({
			'my-effect-rules/no-throw': 'error',
			'my-effect-rules/prefer-fn': 'error'
		});
	});

	test('generates a curated recommended config', () => {
		const plugin = Plugin.define({
			name: 'my-effect-rules',
			rules: {
				'no-throw': dummyRule('no-throw'),
				'prefer-fn': dummyRule('prefer-fn')
			},
			recommended: {
				severity: 'warn',
				rules: ['prefer-fn']
			}
		});

		expect(plugin.configs.recommended.jsPlugins).toEqual([
			'my-effect-rules'
		]);
		expect(plugin.configs.recommended.rules).toEqual({
			'my-effect-rules/prefer-fn': 'warn'
		});
		expect(plugin.configs.all.rules).toEqual({
			'my-effect-rules/no-throw': 'error',
			'my-effect-rules/prefer-fn': 'error'
		});
	});
});

// ---------------------------------------------------------------------------
// Plugin.merge
// ---------------------------------------------------------------------------

describe('Plugin.merge', () => {
	test('merges two plugins', () => {
		const p1 = Plugin.define({
			name: 'alpha',
			rules: { 'rule-a': dummyRule('a') }
		});
		const p2 = Plugin.define({
			name: 'beta',
			rules: { 'rule-b': dummyRule('b') }
		});
		const merged = Plugin.merge(p1, p2);
		expect(merged.meta?.name).toBe('alpha+beta');
		expect(merged.rules?.['rule-a']).toBeDefined();
		expect(merged.rules?.['rule-b']).toBeDefined();
	});

	test('later plugin wins on name collision', () => {
		const ruleV1 = dummyRule('v1');
		const ruleV2 = dummyRule('v2');
		const p1 = Plugin.define({
			name: 'a',
			rules: { 'shared-rule': ruleV1 }
		});
		const p2 = Plugin.define({
			name: 'b',
			rules: { 'shared-rule': ruleV2 }
		});
		const merged = Plugin.merge(p1, p2);
		// The later plugin's rule should win
		expect(merged.rules?.['shared-rule']).toBe(ruleV2);
	});

	test('merges three plugins', () => {
		const p1 = Plugin.define({
			name: 'a',
			rules: { r1: dummyRule('1') }
		});
		const p2 = Plugin.define({
			name: 'b',
			rules: { r2: dummyRule('2') }
		});
		const p3 = Plugin.define({
			name: 'c',
			rules: { r3: dummyRule('3') }
		});
		const merged = Plugin.merge(p1, p2, p3);
		expect(merged.meta?.name).toBe('a+b+c');
		expect(merged.rules?.['r1']).toBeDefined();
		expect(merged.rules?.['r2']).toBeDefined();
		expect(merged.rules?.['r3']).toBeDefined();
	});

	test('merges empty plugins', () => {
		const merged = Plugin.merge();
		expect(merged.meta?.name).toBe('');
		expect(R.keys(merged.rules ?? {})).toHaveLength(0);
	});
});
