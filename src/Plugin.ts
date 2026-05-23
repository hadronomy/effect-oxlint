/**
 * Plugin definition and composition for Effect-first oxlint plugins.
 *
 * @since 0.1.0
 */
import type {
	Plugin as OxlintPlugin,
	Rule as OxlintRule
} from '@oxlint/plugins';
import * as Arr from 'effect/Array';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import * as R from 'effect/Record';

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

/**
 * The raw oxlint plugin type.
 *
 * @since 0.1.0
 */
export type { OxlintPlugin as Plugin };

// ---------------------------------------------------------------------------
// Config types
// ---------------------------------------------------------------------------

/**
 * Oxlint severity accepted in generated rule configs.
 *
 * @since 0.3.0
 */
export type RuleSeverity = 'off' | 'allow' | 'warn' | 'error' | 'deny';

/**
 * A JS plugin reference accepted by oxlint's `jsPlugins` config field.
 *
 * @since 0.3.0
 */
export type JsPluginReference =
	| string
	| {
			name: string;
			specifier: string;
	  };

/**
 * Minimal oxlint config shape emitted by `Plugin.define`.
 *
 * These config objects are intended for `oxlint.config.ts`:
 *
 * @example
 * ```ts
 * import { defineConfig } from 'oxlint'
 * import plugin from 'my-oxlint-plugin'
 *
 * export default defineConfig({
 *   extends: [plugin.configs.recommended]
 * })
 * ```
 *
 * @since 0.3.0
 */
export interface OxlintConfig {
	/** JS plugins to load for this config. */
	jsPlugins: Array<JsPluginReference>;
	/** Fully-qualified rule IDs mapped to severities. */
	rules: Record<string, RuleSeverity>;
}

/**
 * Options for the generated recommended config.
 *
 * By default, every rule is included at `error` severity. Pass `false` to
 * publish only `configs.all`, or pass `rules` to make `recommended` a curated
 * subset.
 *
 * @since 0.3.0
 */
export interface RecommendedOptions<RuleName extends string = string> {
	/** Severity assigned to recommended rules. Defaults to `error`. */
	readonly severity?: RuleSeverity;
	/** Rule names to include. Defaults to every rule. */
	readonly rules?: ReadonlyArray<RuleName>;
}

/**
 * String rule names from a plugin rule map.
 *
 * @since 0.3.0
 */
export type RuleName<Rules extends Record<string, OxlintRule>> = Extract<
	keyof Rules,
	string
>;

/** @internal */
type NoInferRuleName<RuleName extends string> = [
	RuleName
][RuleName extends unknown ? 0 : never];

/**
 * Options for `Plugin.define`.
 *
 * The curated `recommended.rules` list is checked against the keys of `rules`,
 * so misspelled rule names fail at compile time.
 *
 * @since 0.3.0
 */
export interface DefineOptions<
	Rules extends Record<string, OxlintRule> = Record<string, OxlintRule>
> {
	/** Plugin rule namespace used by oxlint diagnostics and rule IDs. */
	readonly name: string;
	/** Package specifier oxlint should import from `jsPlugins`. */
	readonly specifier?: string;
	/** Rule implementations keyed by unqualified rule name. */
	readonly rules: Rules;
	/** Generated recommended config options, or `false` for an empty config. */
	readonly recommended?:
		| RecommendedOptions<NoInferRuleName<RuleName<Rules>>>
		| false;
}

/**
 * An oxlint plugin plus generated shareable configs.
 *
 * @since 0.3.0
 */
export interface DefinedPlugin<
	Rules extends Record<string, OxlintRule> = Record<string, OxlintRule>
> extends OxlintPlugin {
	readonly meta: {
		readonly name: string;
	};
	readonly rules: Rules;
	readonly configs: {
		readonly recommended: OxlintConfig;
		readonly all: OxlintConfig;
	};
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** @internal */
const pluginReference = (
	name: string,
	specifier: Option.Option<string>
): JsPluginReference =>
	pipe(
		specifier,
		Option.filter((value) => value !== name),
		Option.match({
			onNone: () => name,
			onSome: (value): JsPluginReference => ({ name, specifier: value })
		})
	);

/** @internal */
const recommendedSeverity = (
	recommended: Option.Option<RecommendedOptions | false>
): RuleSeverity =>
	pipe(
		recommended,
		Option.flatMap((value) =>
			value === false
				? Option.none()
				: Option.fromNullishOr(value.severity)
		),
		Option.getOrElse(() => 'error' as const)
	);

/** @internal */
const isRecommendedRule = (
	ruleName: string,
	recommended: Option.Option<RecommendedOptions | false>
): boolean =>
	pipe(
		recommended,
		Option.match({
			onNone: () => true,
			onSome: (value) => {
				if (value === false) return false;
				return pipe(
					Option.fromNullishOr(value.rules),
					Option.match({
						onNone: () => true,
						onSome: (ruleNames) => Arr.contains(ruleNames, ruleName)
					})
				);
			}
		})
	);

/** @internal */
const qualifiedRuleName = (pluginName: string, ruleName: string): string =>
	`${pluginName}/${ruleName}`;

/** @internal */
const makeRulesConfig = (
	pluginName: string,
	rules: Record<string, OxlintRule>,
	severity: RuleSeverity,
	include: (ruleName: string) => boolean
): Record<string, RuleSeverity> =>
	R.fromEntries(
		pipe(
			R.keys(rules),
			Arr.filter(include),
			Arr.map((ruleName): readonly [string, RuleSeverity] => [
				qualifiedRuleName(pluginName, ruleName),
				severity
			])
		)
	);

// ---------------------------------------------------------------------------
// Constructor
// ---------------------------------------------------------------------------

/**
 * Define a typed oxlint plugin from a name and rule map.
 *
 * `define` returns a standard oxlint JS plugin and also generates shareable
 * `configs.recommended` / `configs.all` objects. The generated configs use
 * oxlint's real JS plugin mechanism (`jsPlugins` + explicit `rules`) instead
 * of ESLint-only `docs.recommended` metadata, so users can enable a plugin with
 * a single `extends` entry in `oxlint.config.ts`. If you curate
 * `recommended.rules`, the list is type-checked against the supplied rule keys.
 *
 * @example
 * ```ts
 * import { Plugin, Rule } from 'effect-oxlint'
 *
 * export default Plugin.define({
 *   name: 'my-effect-rules',
 *   specifier: 'oxlint-plugin-my-effect-rules',
 *   rules: {
 *     'no-throw-in-gen': myThrowRule,
 *     'prefer-effect-fn': myFnRule,
 *   }
 * })
 * ```
 *
 * @since 0.1.0
 */
export const define = <const Rules extends Record<string, OxlintRule>>(
	config: DefineOptions<Rules>
): DefinedPlugin<Rules> => {
	const recommended = Option.fromNullishOr(config.recommended);
	const reference = pluginReference(
		config.name,
		Option.fromNullishOr(config.specifier)
	);
	const includeRecommended = (ruleName: string) =>
		isRecommendedRule(ruleName, recommended);
	const severity = recommendedSeverity(recommended);

	return {
		meta: { name: config.name },
		rules: config.rules,
		configs: {
			recommended: {
				jsPlugins: [reference],
				rules: makeRulesConfig(
					config.name,
					config.rules,
					severity,
					includeRecommended
				)
			},
			all: {
				jsPlugins: [reference],
				rules: makeRulesConfig(
					config.name,
					config.rules,
					'error',
					() => true
				)
			}
		}
	};
};

/**
 * Merge multiple plugins into one.
 *
 * If two plugins define a rule with the same name, the later one wins.
 *
 * @since 0.1.0
 */
export const merge = (
	...plugins: ReadonlyArray<OxlintPlugin>
): OxlintPlugin => ({
	meta: {
		name: Arr.join(
			Arr.map(plugins, (p) => p.meta?.name ?? 'unknown'),
			'+'
		)
	},
	rules: Arr.reduce<OxlintPlugin, Record<string, OxlintRule>>(
		plugins,
		{},
		(acc, p) => R.union(acc, p.rules, (_, right) => right)
	)
});
