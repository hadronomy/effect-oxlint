/**
 * Core rule builder for Effect-first oxlint rules.
 *
 * `Rule.define` is the primary entry point. It produces a standard
 * `CreateRule` that oxlint can consume, while letting rule authors
 * write fully effectful create generators and visitor handlers.
 *
 * @since 0.1.0
 */
import type {
	CreateOnceRule,
	CreateRule,
	ESTree,
	RuleDocs,
	RuleMeta,
	Visitor as OxlintVisitor
} from '@oxlint/plugins';
import * as Arr from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import * as P from 'effect/Predicate';
import * as R from 'effect/Record';
import * as Schema from 'effect/Schema';
import * as Layer from 'effect/Layer';

import { pipe } from 'effect/Function';

import * as AST from './AST.ts';
import { make as makeDiagnostic } from './Diagnostic.ts';
import * as FileContext from './FileContext.ts';
import { fromOxlintContext, RuleContext } from './RuleContext.ts';
import type {
	EffectVisitor,
	SyncVisitor,
	TypedEffectVisitor
} from './Visitor.ts';
import {
	compileSync,
	merge as mergeVisitors,
	toOxlintVisitor
} from './Visitor.ts';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Convert a PascalCase / camelCase / acronym string to kebab-case for use
 * in generated rule names. Idempotent on already-kebab strings.
 *
 * @example
 * ```
 * kebab('ThrowStatement')  // 'throw-statement'
 * kebab('ForInStatement')  // 'for-in-statement'
 * kebab('JSON')            // 'json'
 * kebab('ban-fetch')       // 'ban-fetch'
 * ```
 *
 * @internal
 */
const kebab = (s: string): string =>
	s
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
		.toLowerCase();

/**
 * Render a list of identifier segments as a kebab-case rule-name tail.
 *
 * @internal
 */
const kebabList = (parts: ReadonlyArray<string>): string =>
	Arr.join(Arr.map(parts, kebab), '-');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Configuration object for `Rule.define`.
 *
 * @since 0.1.0
 */
export interface RuleConfig<Options = undefined> {
	/** Rule name (used for tracing spans). */
	readonly name: string;
	/** Oxlint rule metadata. */
	readonly meta: RuleMeta;
	/**
	 * Optional Schema for rule options.
	 *
	 * When provided, the first element of the raw JSON options array
	 * is decoded at `create` time against this schema.
	 */
	readonly options?: Schema.Decoder<Options> | undefined;
	/**
	 * The create generator.
	 *
	 * Receives decoded options and returns an `EffectVisitor`.
	 * Runs inside an Effect context where `RuleContext` is available.
	 *
	 * May `yield* Ref.make(...)` for state, `yield* RuleContext` for
	 * context access, and return a visitor built with `Visitor.*` helpers.
	 */
	readonly create: (
		options: Options
	) => Effect.gen.Return<TypedEffectVisitor, never, RuleContext>;
}

/** Program returned by an Effect-first `createOnce` setup. */
export interface OnceRuleProgram {
	readonly before?: Effect.Effect<
		boolean | void,
		never,
		FileContext.FileContext
	>;
	readonly after?: Effect.Effect<void, never, FileContext.FileContext>;
	readonly visitors?: EffectVisitor<FileContext.FileContext>;
	readonly syncVisitors?: SyncVisitor;
}

/** Configuration for the Oxlint `createOnce` lifecycle. */
export interface OnceRuleConfig<Options = undefined, Services = never> {
	readonly name: string;
	readonly meta: RuleMeta;
	readonly options?: Schema.Decoder<Options> | undefined;
	readonly layer?: Layer.Layer<Services, never, never>;
	readonly create: (
		options: Options
	) => Effect.Effect<OnceRuleProgram, never, Services>;
}

/** A declarative rule definition waiting for the Oxlint compiler. */
export interface OnceRulePlan<Options = undefined, Services = never> {
	readonly _tag: 'OnceRulePlan';
	readonly config: OnceRuleConfig<Options, Services>;
}

/** Describe a `createOnce` rule before lowering it to Oxlint callbacks. */
export const plan = <Options = undefined, Services = never>(
	config: OnceRuleConfig<Options, Services>
): OnceRulePlan<Options, Services> => ({
	_tag: 'OnceRulePlan',
	config
});

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

/**
 * Define an Effect-first oxlint lint rule.
 *
 * The `create` generator runs once per file via `Effect.runSync`.
 * Each visitor handler is also executed via `Effect.runSync` per node.
 * `Ref`-based state created in `create` persists across handler calls
 * via closure.
 *
 * `Effect.runSync` is used here at the runtime boundary — the bridge
 * between oxlint's synchronous plugin API and our Effect world.
 *
 * ## Error channel
 *
 * Both the `create` generator and individual visitor handlers have a
 * fixed error channel of `never`. Rules cannot fail via `Effect.fail` —
 * any failure must be handled inside the handler (typically by
 * reporting a diagnostic through `RuleContext.report`). See
 * `EffectHandler` in `./Visitor.ts` for the full contract and the
 * recommended `Effect.catch` pattern for fallible sub-effects.
 *
 * @since 0.1.0
 */
export const define = <Options = undefined>(
	config: RuleConfig<Options>
): CreateRule => ({
	meta: config.meta,
	create(oxlintContext) {
		const ruleCtx = fromOxlintContext(oxlintContext);

		// Runtime boundary: execute effects with RuleContext provided.
		// This is the FFI bridge between oxlint's sync API and Effect.
		const run = <A>(effect: Effect.Effect<A, never, RuleContext>): A =>
			Effect.runSync(Effect.provideService(effect, RuleContext, ruleCtx));

		// Decode options from the raw JSON array.
		// When no schema is configured, `Options` defaults to `undefined`.
		const decodeOptions = (): Options => {
			const schema = config.options;
			if (schema === undefined) return undefined as Options;
			return Schema.decodeUnknownSync(schema)(oxlintContext.options[0]);
		};
		const options = run(Effect.sync(decodeOptions));

		// Run the create generator to set up Refs and get the visitor map.
		// TypedEffectVisitor → EffectVisitor: the typed keys provide
		// narrowed nodes to callers, but at runtime all handlers receive
		// the same ESTree.Node values. The variance mismatch is safe
		// because oxlint guarantees the node type matches the key.
		const effectVisitor = run(
			Effect.gen(() => config.create(options))
		) as EffectVisitor;

		// Wrap each handler: Effect<void> → plain () => void
		return toOxlintVisitor(effectVisitor, run);
	}
});

// ---------------------------------------------------------------------------
// `createOnce` builder
// ---------------------------------------------------------------------------

const toFileOxlintVisitor = (
	effectVisitor: EffectVisitor<FileContext.FileContext>,
	runHandler: (
		effect: Effect.Effect<void, never, FileContext.FileContext>
	) => void
): OxlintVisitor =>
	R.map(
		effectVisitor,
		(handler) => (node: ESTree.Node) => runHandler(handler(node))
	);

const combineOxlintVisitors = (
	left: OxlintVisitor,
	right: OxlintVisitor
): OxlintVisitor => {
	const result = {
		...(left as Record<string, (node: ESTree.Node) => void>)
	} as Record<string, (node: ESTree.Node) => void>;

	R.toEntries(right as Record<string, (node: ESTree.Node) => void>).forEach(
		([key, handler]) => {
			const existing = result[key];
			result[key] = existing
				? (node) => {
						existing(node);
						handler(node);
					}
				: handler;
		}
	);

	return result;
};

/**
 * Define an Effect-first rule for Oxlint's `createOnce` lifecycle.
 *
 * Static setup runs once. File hooks and effectful handlers receive the
 * dynamic `FileContext` service. Synchronous handlers compile to direct
 * Oxlint callbacks and do not enter the Effect runtime per AST node.
 *
 * @since 0.4.0
 */
export const defineOnce = <Options = undefined, Services = never>(
	config: OnceRuleConfig<Options, Services>
): CreateOnceRule => ({
	meta: config.meta,
	createOnce(oxlintContext) {
		const controller = FileContext.make(oxlintContext);
		const decodeOptions = (): Options => {
			const schema = config.options;
			if (schema === undefined) return undefined as Options;
			return Schema.decodeUnknownSync(schema)(oxlintContext.options[0]);
		};
		const options = decodeOptions();
		const setup = config.layer
			? Effect.provide(config.create(options), config.layer)
			: config.create(options);
		const program = Effect.runSync(
			setup as Effect.Effect<OnceRuleProgram, never, never>
		);
		const fileContext = Context.make(
			FileContext.FileContext,
			controller.service
		);
		const runFile = Effect.runSyncWith(fileContext);

		const runHook = <A>(
			effect: Effect.Effect<A, never, FileContext.FileContext> | undefined
		): A | undefined =>
			effect === undefined ? undefined : runFile(effect);

		const effectVisitor = program.visitors
			? toFileOxlintVisitor(program.visitors, (effect) => {
					runFile(effect);
				})
			: {};
		const syncVisitor = program.syncVisitors
			? compileSync(program.syncVisitors, controller.current)
			: {};

		return {
			...combineOxlintVisitors(effectVisitor, syncVisitor),
			before() {
				controller.activate();
				try {
					return runHook(program.before) !== false;
				} catch (error) {
					controller.deactivate();
					throw error;
				}
			},
			after() {
				try {
					runHook(program.after);
				} finally {
					controller.deactivate();
				}
			}
		};
	}
});

/** Compile a declarative rule plan at the Oxlint host boundary. */
export const compile = <Options = undefined, Services = never>(
	rulePlan: OnceRulePlan<Options, Services>
): CreateOnceRule => defineOnce(rulePlan.config);

// ---------------------------------------------------------------------------
// Metadata helper
// ---------------------------------------------------------------------------

/**
 * Build `RuleMeta` with sensible defaults.
 *
 * @since 0.1.0
 */
export const meta = (opts: {
	readonly type: 'problem' | 'suggestion' | 'layout';
	readonly description: string;
	readonly fixable?: 'code' | 'whitespace' | undefined;
	readonly hasSuggestions?: boolean | undefined;
	readonly messages?: Record<string, string> | undefined;
	readonly docs?: RuleDocs | undefined;
}): RuleMeta => ({
	type: opts.type,
	...(opts.fixable !== undefined ? { fixable: opts.fixable } : {}),
	...(opts.hasSuggestions !== undefined
		? { hasSuggestions: opts.hasSuggestions }
		: {}),
	...(opts.messages !== undefined ? { messages: opts.messages } : {}),
	docs: {
		description: opts.description,
		...opts.docs
	}
});

// ---------------------------------------------------------------------------
// Convenience rule factories (common patterns)
// ---------------------------------------------------------------------------

/**
 * Create a rule that bans `obj.prop` member expression access.
 *
 * Replaces the common `memberExprRule` utility pattern.
 *
 * @since 0.1.0
 */
export const banMember = (
	obj: string,
	prop: string | ReadonlyArray<string>,
	opts: {
		readonly message: string;
		readonly meta?:
			| { readonly type?: 'problem' | 'suggestion' }
			| undefined;
	}
): CreateRule =>
	define({
		name: `ban-${kebabList([obj, ...(P.isString(prop) ? [prop] : prop)])}`,
		meta: meta({
			type: opts.meta?.type ?? 'suggestion',
			description: opts.message
		}),
		create: function* () {
			const ctx = yield* RuleContext;
			return {
				MemberExpression: (node: ESTree.Node) =>
					pipe(
						AST.narrow(node, 'MemberExpression'),
						Option.flatMap(AST.matchMember(obj, prop)),
						Option.match({
							onNone: () => Effect.void,
							onSome: (matched) =>
								ctx.report(
									makeDiagnostic({
										node: matched,
										message: opts.message
									})
								)
						})
					)
			};
		}
	});

/**
 * Create a rule that bans imports matching a source string or predicate.
 *
 * Replaces the common `importRule` utility pattern.
 *
 * @since 0.1.0
 */
export const banImport = (
	source: string | ((source: string) => boolean),
	opts: {
		readonly message: string;
		readonly meta?:
			| { readonly type?: 'problem' | 'suggestion' }
			| undefined;
	}
): CreateRule =>
	define({
		name: 'ban-import',
		meta: meta({
			type: opts.meta?.type ?? 'suggestion',
			description: opts.message
		}),
		create: function* () {
			const ctx = yield* RuleContext;
			return {
				ImportDeclaration: (node: ESTree.Node) =>
					pipe(
						AST.narrow(node, 'ImportDeclaration'),
						Option.flatMap(AST.matchImport(source)),
						Option.match({
							onNone: () => Effect.void,
							onSome: (matched) =>
								ctx.report(
									makeDiagnostic({
										node: matched,
										message: opts.message
									})
								)
						})
					)
			};
		}
	});

/**
 * Create a rule that bans bare identifier call expressions.
 *
 * Matches `CallExpression` nodes whose callee is an identifier in
 * the given list (e.g. `fetch()`, `useState()`, `readFileSync()`).
 *
 * @example
 * ```ts
 * // Ban a single call
 * Rule.banCallOf('fetch', { message: 'Use Effect HTTP client' })
 *
 * // Ban multiple calls
 * Rule.banCallOf(['useState', 'useEffect'], { message: 'Use Effect' })
 * ```
 *
 * @since 0.2.0
 */
export const banCallOf = (
	name: string | ReadonlyArray<string>,
	opts: {
		readonly message: string;
		readonly meta?:
			| { readonly type?: 'problem' | 'suggestion' }
			| undefined;
	}
): CreateRule => {
	const names = P.isString(name) ? [name] : name;
	return define({
		name: `ban-call-${kebabList(names)}`,
		meta: meta({
			type: opts.meta?.type ?? 'suggestion',
			description: opts.message
		}),
		create: function* () {
			const ctx = yield* RuleContext;
			return {
				CallExpression: (node: ESTree.Node) =>
					pipe(
						AST.narrow(node, 'CallExpression'),
						Option.flatMap(AST.calleeName),
						Option.filter((n) => Arr.contains(names, n)),
						Option.match({
							onNone: () => Effect.void,
							onSome: () =>
								ctx.report(
									makeDiagnostic({
										node,
										message: opts.message
									})
								)
						})
					)
			};
		}
	});
};

/**
 * Create a rule that bans `obj.prop(...)` method-call patterns.
 *
 * Matches `CallExpression` nodes whose callee is a static member expression
 * `obj.prop` where `obj` is an identifier with the given name and `prop`
 * matches one of the given property names.
 *
 * This is the "call of member" counterpart to `banMember` (which bans
 * the bare member access `obj.prop` regardless of whether it's called)
 * and `banCallOf` (which bans bare identifier calls).
 *
 * @example
 * ```ts
 * // Ban `Effect.runSync(...)`
 * Rule.banCallOfMember('Effect', 'runSync', { message: 'Keep effects composable' })
 *
 * // Ban `console.log(...)` and `console.error(...)`
 * Rule.banCallOfMember('console', ['log', 'error'], { message: 'Use Effect.log' })
 * ```
 *
 * @since 0.2.0
 */
export const banCallOfMember = (
	obj: string,
	prop: string | ReadonlyArray<string>,
	opts: {
		readonly message: string;
		readonly meta?:
			| { readonly type?: 'problem' | 'suggestion' }
			| undefined;
	}
): CreateRule =>
	define({
		name: `ban-call-${kebabList([obj, ...(P.isString(prop) ? [prop] : prop)])}`,
		meta: meta({
			type: opts.meta?.type ?? 'suggestion',
			description: opts.message
		}),
		create: function* () {
			const ctx = yield* RuleContext;
			return {
				CallExpression: (node: ESTree.Node) =>
					pipe(
						AST.narrow(node, 'CallExpression'),
						Option.flatMap(AST.matchCallOf(obj, prop)),
						Option.match({
							onNone: () => Effect.void,
							onSome: (matched) =>
								ctx.report(
									makeDiagnostic({
										node: matched,
										message: opts.message
									})
								)
						})
					)
			};
		}
	});

/**
 * Create a rule that bans `new` expressions with the given callee name.
 *
 * Matches `NewExpression` nodes whose callee is an identifier in
 * the given list (e.g. `new Date()`, `new Error()`).
 *
 * @example
 * ```ts
 * // Ban a single constructor
 * Rule.banNewExpr('Date', { message: 'Use Clock service' })
 *
 * // Ban multiple constructors
 * Rule.banNewExpr(['Error', 'TypeError'], { message: 'Use tagged errors' })
 * ```
 *
 * @since 0.2.0
 */
export const banNewExpr = (
	name: string | ReadonlyArray<string>,
	opts: {
		readonly message: string;
		readonly meta?:
			| { readonly type?: 'problem' | 'suggestion' }
			| undefined;
	}
): CreateRule => {
	const names = P.isString(name) ? [name] : name;
	return define({
		name: `ban-new-${kebabList(names)}`,
		meta: meta({
			type: opts.meta?.type ?? 'suggestion',
			description: opts.message
		}),
		create: function* () {
			const ctx = yield* RuleContext;
			return {
				NewExpression: (node: ESTree.Node) =>
					pipe(
						AST.narrow(node, 'NewExpression'),
						Option.flatMap(AST.calleeIdentifier),
						Option.filter((n) => Arr.contains(names, n)),
						Option.match({
							onNone: () => Effect.void,
							onSome: () =>
								ctx.report(
									makeDiagnostic({
										node,
										message: opts.message
									})
								)
						})
					)
			};
		}
	});
};

/**
 * Create a rule that bans a specific statement type.
 *
 * @since 0.1.0
 */
export const banStatement = (
	nodeType: string,
	opts: {
		readonly message: string;
		readonly meta?:
			| { readonly type?: 'problem' | 'suggestion' }
			| undefined;
	}
): CreateRule =>
	define({
		name: `ban-${kebab(nodeType)}`,
		meta: meta({
			type: opts.meta?.type ?? 'suggestion',
			description: opts.message
		}),
		create: function* () {
			const ctx = yield* RuleContext;
			return {
				[nodeType]: (node: ESTree.Node) =>
					ctx.report(makeDiagnostic({ node, message: opts.message }))
			};
		}
	});

// ---------------------------------------------------------------------------
// Multi-ban combinator
// ---------------------------------------------------------------------------

/**
 * Specification for `banMultiple`: which patterns to ban under one rule.
 *
 * @since 0.2.0
 */
export interface BanMultipleSpec {
	/** Bare identifier calls to ban (e.g. `'fetch'` or `['useState', 'useEffect']`). */
	readonly calls?: string | ReadonlyArray<string> | undefined;
	/** `new` expressions to ban (e.g. `'Date'` or `['Error', 'TypeError']`). */
	readonly newExprs?: string | ReadonlyArray<string> | undefined;
	/** Member expressions to ban: `[object, property | properties]` tuples. */
	readonly members?:
		| ReadonlyArray<
				readonly [obj: string, prop: string | ReadonlyArray<string>]
		  >
		| undefined;
	/** Member call expressions to ban: `[object, property | properties]` tuples. */
	readonly memberCalls?:
		| ReadonlyArray<
				readonly [obj: string, prop: string | ReadonlyArray<string>]
		  >
		| undefined;
	/** Import sources to ban (string or predicate). */
	readonly imports?:
		| ReadonlyArray<string | ((source: string) => boolean)>
		| undefined;
	/** Statement node types to ban (e.g. `'ThrowStatement'`). */
	readonly statements?: ReadonlyArray<string> | undefined;
}

/**
 * Create a rule that bans multiple patterns with a shared message.
 *
 * Combines call bans, `new` expression bans, member bans, import bans,
 * and statement bans into a single rule with merged visitors.
 *
 * @example
 * ```ts
 * // Ban 5 loop statement types
 * Rule.banMultiple(
 *   {
 *     statements: [
 *       'ForStatement', 'ForInStatement', 'ForOfStatement',
 *       'WhileStatement', 'DoWhileStatement'
 *     ]
 *   },
 *   { message: 'Use Arr.map / Effect.forEach instead' }
 * )
 *
 * // Combine import + member bans
 * Rule.banMultiple(
 *   {
 *     imports: ['node:fs'],
 *     members: [['fs', ['readFileSync', 'writeFileSync']]]
 *   },
 *   { message: 'Use Effect FileSystem service' }
 * )
 *
 * // Combine new expression + member bans
 * Rule.banMultiple(
 *   {
 *     newExprs: 'Date',
 *     members: [['Date', 'now']]
 *   },
 *   { message: 'Use Clock service' }
 * )
 * ```
 *
 * @since 0.2.0
 */
export const banMultiple = (
	spec: BanMultipleSpec,
	opts: {
		readonly name?: string | undefined;
		readonly message: string;
		readonly meta?:
			| { readonly type?: 'problem' | 'suggestion' }
			| undefined;
	}
): CreateRule =>
	define({
		name: opts.name ?? 'ban-multiple',
		meta: meta({
			type: opts.meta?.type ?? 'suggestion',
			description: opts.message
		}),
		create: function* () {
			const ctx = yield* RuleContext;
			const report = (node: ESTree.Node) =>
				ctx.report(makeDiagnostic({ node, message: opts.message }));

			// Statement bans
			const stmtVisitors: ReadonlyArray<EffectVisitor> =
				spec.statements !== undefined
					? Arr.map(
							spec.statements,
							(nodeType): EffectVisitor => ({
								[nodeType]: report
							})
						)
					: [];

			// Call bans
			const callVisitors: ReadonlyArray<EffectVisitor> =
				spec.calls !== undefined
					? ((names: ReadonlyArray<string>) => [
							{
								CallExpression: (node: ESTree.Node) =>
									pipe(
										AST.narrow(node, 'CallExpression'),
										Option.flatMap(AST.calleeName),
										Option.filter((n) =>
											Arr.contains(names, n)
										),
										Option.match({
											onNone: () => Effect.void,
											onSome: () => report(node)
										})
									)
							} satisfies EffectVisitor
						])(P.isString(spec.calls) ? [spec.calls] : spec.calls)
					: [];

			// NewExpression bans
			const newExprVisitors: ReadonlyArray<EffectVisitor> =
				spec.newExprs !== undefined
					? ((names: ReadonlyArray<string>) => [
							{
								NewExpression: (node: ESTree.Node) =>
									pipe(
										AST.narrow(node, 'NewExpression'),
										Option.flatMap(AST.calleeIdentifier),
										Option.filter((n) =>
											Arr.contains(names, n)
										),
										Option.match({
											onNone: () => Effect.void,
											onSome: () => report(node)
										})
									)
							} satisfies EffectVisitor
						])(
							P.isString(spec.newExprs)
								? [spec.newExprs]
								: spec.newExprs
						)
					: [];

			// Member bans
			const memberVisitors: ReadonlyArray<EffectVisitor> =
				spec.members !== undefined
					? Arr.map(
							spec.members,
							([obj, prop]): EffectVisitor => ({
								MemberExpression: (node: ESTree.Node) =>
									pipe(
										AST.narrow(node, 'MemberExpression'),
										Option.flatMap(
											AST.matchMember(obj, prop)
										),
										Option.match({
											onNone: () => Effect.void,
											onSome: (matched) => report(matched)
										})
									)
							})
						)
					: [];

			// Member-call bans
			const memberCallVisitors: ReadonlyArray<EffectVisitor> =
				spec.memberCalls !== undefined
					? Arr.map(
							spec.memberCalls,
							([obj, prop]): EffectVisitor => ({
								CallExpression: (node: ESTree.Node) =>
									pipe(
										AST.narrow(node, 'CallExpression'),
										Option.flatMap(
											AST.matchCallOf(obj, prop)
										),
										Option.match({
											onNone: () => Effect.void,
											onSome: (matched) => report(matched)
										})
									)
							})
						)
					: [];

			// Import bans
			const importVisitors: ReadonlyArray<EffectVisitor> =
				spec.imports !== undefined
					? Arr.map(
							spec.imports,
							(source): EffectVisitor => ({
								ImportDeclaration: (node: ESTree.Node) =>
									pipe(
										AST.narrow(node, 'ImportDeclaration'),
										Option.flatMap(AST.matchImport(source)),
										Option.match({
											onNone: () => Effect.void,
											onSome: (matched) => report(matched)
										})
									)
							})
						)
					: [];

			return mergeVisitors(
				...stmtVisitors,
				...callVisitors,
				...newExprVisitors,
				...memberVisitors,
				...memberCallVisitors,
				...importVisitors
			);
		}
	});
