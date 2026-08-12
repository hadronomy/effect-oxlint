import { t as RuleContext } from "./RuleContext.js";
import * as Arr from "effect/Array";
import * as Option from "effect/Option";
import * as Context$2 from "effect/Context";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import * as Layer from "effect/Layer";
import * as Ref from "effect/Ref";
import { Comment, Comment as OxlintComment, Context, Context as Context$1, CreateOnceRule, CreateOnceRule as CreateOnceRule$1, CreateRule, CreateRule as CreateRule$1, Definition, DefinitionType, Diagnostic, Diagnostic as OxlintDiagnostic, DiagnosticData, ESTree, ESTree as ESTree$1, Fix, FixFn, FixFn as FixFn$1, Fixer, LanguageOptions, LineColumn, LineColumn as LineColumn$1, Location, Options, Plugin as OxlintPlugin, Plugin as OxlintPlugin$1, Range, Range as Range$1, Ranged, Ranged as Ranged$1, Reference, Reference as Reference$1, Rule, Rule as OxlintRule, RuleDocs, RuleDocs as RuleDocs$1, RuleMeta, RuleMeta as RuleMeta$1, Scope, Scope as OxlintScope, ScopeManager, ScopeType, Settings, Settings as Settings$1, SourceCode, SourceCode as OxlintSourceCode, Span, Suggestion, Suggestion as Suggestion$1, Token, Token as OxlintToken, Variable, Variable as Variable$1, Visitor, Visitor as OxlintVisitor } from "@oxlint/plugins";

//#region src/AST.d.ts
declare namespace AST_d_exports {
  export { calleeIdentifier, calleeName, findAncestor, hasAncestor, importSource, isCallOf, isImport, isMember, matchCallOf, matchImport, matchMember, memberNames, memberPath, narrow, objectGetValue, objectHasKey, objectKeys };
}
/**
 * Match a `MemberExpression` of the form `obj.prop` where `obj` is an
 * identifier with the given name and `prop` matches one of the given
 * property names.
 *
 * @example
 * ```ts
 * // Match JSON.parse or JSON.stringify
 * AST.matchMember(node, 'JSON', ['parse', 'stringify'])
 * ```
 *
 * @since 0.1.0
 */
declare const matchMember: {
  (obj: string, prop: string | ReadonlyArray<string>): (node: ESTree$1.MemberExpression) => Option.Option<ESTree$1.StaticMemberExpression>;
  (node: ESTree$1.MemberExpression, obj: string, prop: string | ReadonlyArray<string>): Option.Option<ESTree$1.StaticMemberExpression>;
};
/**
 * Check whether a `MemberExpression` is `obj.prop`.
 *
 * Pure boolean predicate — use `matchMember` when you need the narrowed node.
 *
 * @since 0.1.0
 */
declare const isMember: {
  (obj: string, prop: string | ReadonlyArray<string>): (node: ESTree$1.MemberExpression) => boolean;
  (node: ESTree$1.MemberExpression, obj: string, prop: string | ReadonlyArray<string>): boolean;
};
/**
 * Match a `CallExpression` whose callee is `obj.prop(...)`.
 *
 * Returns the call expression narrowed to confirm its callee is a
 * static member expression.
 *
 * @example
 * ```ts
 * AST.matchCallOf(node, 'Effect', 'gen')
 * AST.matchCallOf(node, 'Effect', ['fn', 'fnUntraced'])
 * ```
 *
 * @since 0.1.0
 */
declare const matchCallOf: {
  (obj: string, prop: string | ReadonlyArray<string>): (node: ESTree$1.CallExpression) => Option.Option<ESTree$1.CallExpression>;
  (node: ESTree$1.CallExpression, obj: string, prop: string | ReadonlyArray<string>): Option.Option<ESTree$1.CallExpression>;
};
/**
 * Boolean predicate: is this `CallExpression` a call of `obj.prop(...)`?
 *
 * @since 0.1.0
 */
declare const isCallOf: {
  (obj: string, prop: string | ReadonlyArray<string>): (node: ESTree$1.CallExpression) => boolean;
  (node: ESTree$1.CallExpression, obj: string, prop: string | ReadonlyArray<string>): boolean;
};
/**
 * Match an `ImportDeclaration` whose source matches a string or predicate.
 *
 * @example
 * ```ts
 * AST.matchImport(node, 'node:fs')
 * AST.matchImport(node, (src) => src.startsWith('node:'))
 * ```
 *
 * @since 0.1.0
 */
declare const matchImport: {
  (source: string | ((source: string) => boolean)): (node: ESTree$1.ImportDeclaration) => Option.Option<ESTree$1.ImportDeclaration>;
  (node: ESTree$1.ImportDeclaration, source: string | ((source: string) => boolean)): Option.Option<ESTree$1.ImportDeclaration>;
};
/**
 * Boolean predicate: does this `ImportDeclaration` import from the given source?
 *
 * @since 0.1.0
 */
declare const isImport: {
  (source: string | ((source: string) => boolean)): (node: ESTree$1.ImportDeclaration) => boolean;
  (node: ESTree$1.ImportDeclaration, source: string | ((source: string) => boolean)): boolean;
};
/**
 * Extract the callee name from a `CallExpression` when the callee is a
 * bare identifier (e.g. `fetch(...)`).
 *
 * @since 0.1.0
 */
declare const calleeName: (node: ESTree$1.CallExpression) => Option.Option<string>;
/**
 * Extract the callee identifier name from a `CallExpression` or `NewExpression`
 * when the callee is a bare identifier (e.g. `fetch(...)`, `new Date()`).
 *
 * Unifies the callee-name extraction across both node shapes, which have
 * the same `.callee` field structure at runtime.
 *
 * @example
 * ```ts
 * // CallExpression — `fetch(...)` → Some('fetch')
 * AST.calleeIdentifier(callNode)
 * // NewExpression — `new Date()` → Some('Date')
 * AST.calleeIdentifier(newNode)
 * ```
 *
 * @since 0.2.0
 */
declare const calleeIdentifier: (node: ESTree$1.CallExpression | ESTree$1.NewExpression) => Option.Option<string>;
/**
 * Extract the object and property names from a static `MemberExpression`.
 *
 * Returns `Option<readonly [objectName, propertyName]>`.
 *
 * @since 0.1.0
 */
declare const memberNames: (node: ESTree$1.MemberExpression) => Option.Option<readonly [obj: string, prop: string]>;
/**
 * Extract the import source string from an `ImportDeclaration`.
 *
 * @since 0.1.0
 */
declare const importSource: (node: ESTree$1.ImportDeclaration) => string;
/**
 * Collect the statically-known key names from an `ObjectExpression`.
 *
 * Spread elements and computed properties are ignored.
 *
 * @since 0.1.0
 */
declare const objectKeys: (node: ESTree$1.ObjectExpression) => ReadonlyArray<string>;
/**
 * Check whether an `ObjectExpression` has a property with the given key.
 *
 * @since 0.1.0
 */
declare const objectHasKey: {
  (key: string): (node: ESTree$1.ObjectExpression) => boolean;
  (node: ESTree$1.ObjectExpression, key: string): boolean;
};
/**
 * Get the value expression for a given key in an `ObjectExpression`.
 *
 * @since 0.1.0
 */
declare const objectGetValue: {
  (key: string): (node: ESTree$1.ObjectExpression) => Option.Option<ESTree$1.Expression>;
  (node: ESTree$1.ObjectExpression, key: string): Option.Option<ESTree$1.Expression>;
};
declare const narrow: {
  <T extends string>(type: T): (node: ESTree$1.Node) => Option.Option<ESTree$1.Node & {
    readonly type: T;
  }>;
  <T extends string>(node: ESTree$1.Node, type: T): Option.Option<ESTree$1.Node & {
    readonly type: T;
  }>;
};
/**
 * Extract the full member path from a (possibly chained) `MemberExpression`.
 *
 * Walks `a.b.c` → `['a', 'b', 'c']`. Returns `Option.none()` if any
 * segment is computed or non-identifier.
 *
 * @example
 * ```ts
 * // node is `Effect.gen` → Some(['Effect', 'gen'])
 * AST.memberPath(node)
 * // node is `a.b.c.d` → Some(['a', 'b', 'c', 'd'])
 * AST.memberPath(node)
 * // node is `a[b].c` → None (computed segment)
 * AST.memberPath(node)
 * ```
 *
 * @since 0.2.0
 */
declare const memberPath: (node: ESTree$1.MemberExpression) => Option.Option<Arr.NonEmptyReadonlyArray<string>>;
/**
 * Walk the `.parent` chain and return the first ancestor whose `type`
 * matches the given string literal.
 *
 * The generic `T` narrows the returned node's `type` field to the same
 * literal, mirroring `AST.narrow`. For example,
 * `findAncestor(node, 'FunctionDeclaration')` returns
 * `Option<{ readonly type: 'FunctionDeclaration'; readonly parent?: unknown }>`.
 *
 * @example
 * ```ts
 * const fn = AST.findAncestor(node, 'FunctionDeclaration')
 * // Option<{ readonly type: 'FunctionDeclaration'; readonly parent?: unknown }>
 * ```
 *
 * @since 0.1.0
 */
declare const findAncestor: {
  <T extends string>(type: T): (node: {
    readonly parent?: unknown;
  }) => Option.Option<{
    readonly type: T;
    readonly parent?: unknown;
  }>;
  <T extends string>(node: {
    readonly parent?: unknown;
  }, type: T): Option.Option<{
    readonly type: T;
    readonly parent?: unknown;
  }>;
};
/**
 * Check whether any ancestor of the node has the given `type`.
 *
 * @since 0.1.0
 */
declare const hasAncestor: {
  <T extends string>(type: T): (node: {
    readonly parent?: unknown;
  }) => boolean;
  <T extends string>(node: {
    readonly parent?: unknown;
  }, type: T): boolean;
};
declare namespace Comment_d_exports {
  export { isBlock, isDisableDirective, isEnableDirective, isJSDoc, isLine, isShebang, text };
}
/**
 * Check whether a comment is a line comment (`// ...`).
 *
 * @since 0.2.0
 */
declare const isLine: (comment: Comment) => boolean;
/**
 * Check whether a comment is a block comment (`/* ... *​/`).
 *
 * @since 0.2.0
 */
declare const isBlock: (comment: Comment) => boolean;
/**
 * Check whether a comment is a shebang (`#!/usr/bin/env node`).
 *
 * @since 0.2.0
 */
declare const isShebang: (comment: Comment) => boolean;
/**
 * Get the text content of a comment (without delimiters).
 *
 * @since 0.2.0
 */
declare const text: (comment: Comment) => string;
/**
 * Check whether a comment is a JSDoc comment (`/** ... *​/`).
 *
 * A JSDoc comment is a block comment whose value starts with `*`.
 *
 * @since 0.2.0
 */
declare const isJSDoc: (comment: Comment) => boolean;
/**
 * Check whether a comment is an eslint/oxlint disable directive.
 *
 * Matches line comments like `// eslint-disable-next-line ...`
 * and block comments like `/* eslint-disable ... *​/`.
 *
 * @since 0.2.0
 */
declare const isDisableDirective: (comment: Comment) => boolean;
/**
 * Check whether a comment is an eslint/oxlint enable directive.
 *
 * @since 0.2.0
 */
declare const isEnableDirective: (comment: Comment) => boolean;
declare namespace Diagnostic_d_exports {
  export { OxlintDiagnostic as Diagnostic, composeFixes, fromId, insertAfter, insertBefore, make$1 as make, removeFix, replaceText, withFix, withSuggestions };
}
/**
 * Create a diagnostic with a message and node location.
 *
 * @since 0.1.0
 */
declare const make$1: (opts: {
  readonly node: Ranged$1;
  readonly message: string;
  readonly data?: DiagnosticData;
}) => OxlintDiagnostic;
/**
 * Create a diagnostic using a `messageId` from `meta.messages`.
 *
 * @since 0.1.0
 */
declare const fromId: (opts: {
  readonly node: Ranged$1;
  readonly messageId: string;
  readonly data?: DiagnosticData;
}) => OxlintDiagnostic;
/**
 * Attach an autofix function to a diagnostic.
 *
 * @since 0.1.0
 */
declare const withFix: {
  (fix: FixFn$1): (diagnostic: OxlintDiagnostic) => OxlintDiagnostic;
  (diagnostic: OxlintDiagnostic, fix: FixFn$1): OxlintDiagnostic;
};
/**
 * Attach suggestion fixes to a diagnostic.
 *
 * @since 0.1.0
 */
declare const withSuggestions: {
  (suggestions: ReadonlyArray<Suggestion$1>): (diagnostic: OxlintDiagnostic) => OxlintDiagnostic;
  (diagnostic: OxlintDiagnostic, suggestions: ReadonlyArray<Suggestion$1>): OxlintDiagnostic;
};
/**
 * Composable fix operations.
 *
 * Each function returns a `FixFn` that can be passed to `withFix`
 * or composed via `composeFixes`.
 *
 * @since 0.1.0
 */
/**
 * Replace the text of a node or token.
 *
 * @since 0.1.0
 */
declare const replaceText: (nodeOrToken: Ranged$1, text: string) => FixFn$1;
/**
 * Insert text before a node or token.
 *
 * @since 0.1.0
 */
declare const insertBefore: (nodeOrToken: Ranged$1, text: string) => FixFn$1;
/**
 * Insert text after a node or token.
 *
 * @since 0.1.0
 */
declare const insertAfter: (nodeOrToken: Ranged$1, text: string) => FixFn$1;
/**
 * Remove a node or token.
 *
 * @since 0.1.0
 */
declare const removeFix: (nodeOrToken: Ranged$1) => FixFn$1;
/**
 * Compose multiple fix functions into one.
 *
 * All individual fixes are collected into a single array result.
 *
 * @since 0.1.0
 */
declare const composeFixes: (...fixes: ReadonlyArray<FixFn$1>) => FixFn$1;
declare namespace FileContext_d_exports {
  export { FileContext, FileContextClosed, FileContextController, FileContextService, FileContextUnavailable, make };
}
declare const FileContextUnavailable_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P] }>) => import("effect/Cause").YieldableError & {
  readonly _tag: "FileContextUnavailable";
} & Readonly<A>;
declare class FileContextUnavailable extends FileContextUnavailable_base<{}> {}
declare const FileContextClosed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P] }>) => import("effect/Cause").YieldableError & {
  readonly _tag: "FileContextClosed";
} & Readonly<A>;
declare class FileContextClosed extends FileContextClosed_base<{}> {}
interface FileContextService {
  readonly id: string;
  readonly filename: string;
  readonly physicalFilename: string;
  readonly cwd: string;
  readonly options: Readonly<Options>;
  readonly sourceCode: SourceCode;
  readonly languageOptions: Readonly<LanguageOptions>;
  readonly settings: Readonly<Settings$1>;
  /** Report a diagnostic from a synchronous visitor without entering Effect. */
  readonly report: (diagnostic: Diagnostic) => void;
  /** Report a diagnostic from an Effect handler. */
  readonly reportEffect: (diagnostic: Diagnostic) => Effect.Effect<void>;
}
declare const FileContextBase: Context$2.ServiceClass<FileContext, 'effect-oxlint/FileContext', FileContextService>;
declare class FileContext extends FileContextBase {}
interface FileContextController {
  readonly service: FileContextService;
  readonly activate: () => void;
  readonly deactivate: () => void;
  readonly current: () => FileContextService;
}
declare const make: (context: Context$1) => FileContextController;
declare namespace Plugin_d_exports {
  export { DefineOptions, DefinedPlugin, JsPluginReference, OxlintConfig, OxlintPlugin$1 as Plugin, RecommendedOptions, RuleName, RuleSeverity, define$1 as define, merge$1 as merge };
}
/**
 * Oxlint severity accepted in generated rule configs.
 *
 * @since 0.3.0
 */
type RuleSeverity = 'off' | 'allow' | 'warn' | 'error' | 'deny';
/**
 * A JS plugin reference accepted by oxlint's `jsPlugins` config field.
 *
 * @since 0.3.0
 */
type JsPluginReference = string | {
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
interface OxlintConfig {
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
interface RecommendedOptions<RuleName extends string = string> {
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
type RuleName<Rules extends Record<string, Rule>> = Extract<keyof Rules, string>;
/** @internal */
type NoInferRuleName<RuleName extends string> = [RuleName][RuleName extends unknown ? 0 : never];
/**
 * Options for `Plugin.define`.
 *
 * The curated `recommended.rules` list is checked against the keys of `rules`,
 * so misspelled rule names fail at compile time.
 *
 * @since 0.3.0
 */
interface DefineOptions<Rules extends Record<string, Rule> = Record<string, Rule>> {
  /** Plugin rule namespace used by oxlint diagnostics and rule IDs. */
  readonly name: string;
  /** Package specifier oxlint should import from `jsPlugins`. */
  readonly specifier?: string;
  /** Rule implementations keyed by unqualified rule name. */
  readonly rules: Rules;
  /** Generated recommended config options, or `false` for an empty config. */
  readonly recommended?: RecommendedOptions<NoInferRuleName<RuleName<Rules>>> | false;
}
/**
 * An oxlint plugin plus generated shareable configs.
 *
 * @since 0.3.0
 */
interface DefinedPlugin<Rules extends Record<string, Rule> = Record<string, Rule>> extends OxlintPlugin$1 {
  readonly meta: {
    readonly name: string;
  };
  readonly rules: Rules;
  readonly configs: {
    readonly recommended: OxlintConfig;
    readonly all: OxlintConfig;
  };
}
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
declare const define$1: <const Rules extends Record<string, Rule>>(config: DefineOptions<Rules>) => DefinedPlugin<Rules>;
/**
 * Merge multiple plugins into one.
 *
 * If two plugins define a rule with the same name, the later one wins.
 *
 * @since 0.1.0
 */
declare const merge$1: (...plugins: ReadonlyArray<OxlintPlugin$1>) => OxlintPlugin$1;
declare namespace Visitor_d_exports {
  export { EffectHandler, EffectVisitor, SyncVisitor, SyncVisitorHandler, SyncVisitorKey, SyncVisitorNode, TypedEffectVisitor, VisitorNodeType, accumulate, compileSync, filter, merge, mergeSync, on, onEffect, onExit, onExitSync, onSync, toOxlintVisitor, tracked };
}
/**
 * An effectful visitor handler.
 *
 * Receives an AST node and returns an `Effect<void>` that may read/write
 * `Ref` state and report diagnostics via `RuleContext`.
 *
 * ## Error channel
 *
 * The error channel is **fixed to `never`** — handlers cannot fail via
 * `Effect.fail` because oxlint's plugin API is synchronous and has no
 * notion of a typed rule failure. Every handler runs through
 * `Effect.runSync` at the FFI boundary in `Rule.define`, and any defect
 * would crash the linter for the whole file.
 *
 * If a handler needs to call an effect that *can* fail, catch the error
 * in the handler and surface it as a diagnostic (or suppress it). For
 * example:
 *
 * ```ts
 * Visitor.on('CallExpression', (node) =>
 *   someFallibleEffect(node).pipe(
 *     Effect.catch((error) =>
 *       RuleContext.report({ node, message: `rule failure: ${error._tag}` })
 *     )
 *   )
 * )
 * ```
 *
 * Defects (thrown exceptions, `Effect.die`) are not caught here and will
 * propagate out of the linter. Reserve them for genuine invariant
 * violations.
 *
 * @since 0.1.0
 */
type EffectHandler<N = ESTree$1.Node, R = RuleContext> = (node: N) => Effect.Effect<void, never, R>;
/**
 * A map from AST node type names (and `"NodeType:exit"` variants) to
 * effectful handlers.
 *
 * This is the internal representation — handlers accept `ESTree.Node`.
 *
 * @since 0.1.0
 */
type EffectVisitor<R = RuleContext> = {
  readonly [key: string]: EffectHandler<ESTree$1.Node, R>;
};
/** @internal Extract the node parameter type from an oxlint visitor handler. */
type ExtractNode<H> = H extends ((node: infer N) => unknown) | {
  bivarianceHack(node: infer N): void;
} ? N : ESTree$1.Node;
/**
 * Resolve a visitor key to its narrowed node type.
 *
 * For known keys (e.g. `'CallExpression'`), returns the specific
 * ESTree node type. For unknown keys, falls back to `ESTree.Node`.
 *
 * @since 0.2.0
 */
type VisitorNodeType<K extends string> = K extends keyof Visitor ? ExtractNode<Exclude<Visitor[K], undefined>> : ESTree$1.Node;
/**
 * Typed visitor map where known oxlint visitor keys provide the
 * correctly narrowed node type to handlers (e.g. `MemberExpression`
 * handlers receive `ESTree.MemberExpression`).
 *
 * Return this from `Rule.define`'s `create` generator. Callers get
 * typed nodes in their handlers without manual narrowing.
 *
 * @since 0.2.0
 */
type TypedEffectVisitor = { readonly [K in keyof Visitor]?: EffectHandler<ExtractNode<Exclude<Visitor[K], undefined>>> };
/** Visitor keys accepted by the direct synchronous compiler. */
type SyncVisitorKey = ESTree$1.Node['type'] | `${ESTree$1.Node['type']}:exit`;
type SyncBaseKey<K extends SyncVisitorKey> = K extends `${infer Base}:exit` ? Base : K;
/** Node type selected by a synchronous visitor key. */
type SyncVisitorNode<K extends SyncVisitorKey> = Extract<ESTree$1.Node, {
  readonly type: SyncBaseKey<K>;
}>;
type SyncVisitorHandler<K extends SyncVisitorKey> = (node: SyncVisitorNode<K>, file: FileContextService) => void;
interface SyncVisitorEntry<K extends SyncVisitorKey = SyncVisitorKey> {
  readonly key: K;
  readonly handler: SyncVisitorHandler<K>;
}
interface SyncVisitor {
  readonly _tag: 'SyncVisitor';
  readonly entries: ReadonlyArray<SyncVisitorEntry>;
}
/** Create a synchronous visitor clause. */
declare const onSync: <K extends SyncVisitorKey>(key: K, handler: SyncVisitorHandler<K>) => SyncVisitor;
/** Create a synchronous visitor clause for an exit event. */
declare const onExitSync: <K extends ESTree$1.Node["type"]>(key: K, handler: SyncVisitorHandler<`${K}:exit`>) => SyncVisitor;
/**
 * Create a single-entry visitor that handles one node type.
 *
 * The handler is a generator function that can `yield*` Effects.
 *
 * @example
 * ```ts
 * Visitor.on('ThrowStatement', function*(node) {
 *   const depth = yield* Ref.get(myDepthRef)
 *   if (depth > 0) {
 *     yield* RuleContext.report({ node, message: '...' })
 *   }
 * })
 * ```
 *
 * @since 0.1.0
 */
declare const on: <K extends string>(nodeType: K, handler: EffectHandler<VisitorNodeType<K>>) => EffectVisitor;
/** Create an effectful visitor clause for a `Rule.defineOnce` file context. */
declare const onEffect: <K extends SyncVisitorKey>(nodeType: K, handler: EffectHandler<SyncVisitorNode<K>, FileContext>) => EffectVisitor<FileContext>;
/**
 * Create a single-entry visitor for the exit phase of a node type.
 *
 * @since 0.1.0
 */
declare const onExit: <K extends string>(nodeType: K, handler: EffectHandler<VisitorNodeType<K>>) => EffectVisitor;
/**
 * Merge synchronous visitors into one flat clause list.
 *
 * Synchronous visitors retain declaration order. The compiler combines
 * handlers for one host key into one callback at the runtime boundary.
 *
 * @since 0.4.0
 */
declare const mergeSync: (...visitors: ReadonlyArray<SyncVisitor>) => SyncVisitor;
/** Merge effectful or synchronous visitors with a typed overload. */
declare function merge(...visitors: ReadonlyArray<EffectVisitor>): EffectVisitor;
declare function merge(...visitors: ReadonlyArray<SyncVisitor>): SyncVisitor;
/**
 * Create an enter/exit visitor pair that increments a `Ref<number>` on
 * enter and decrements on exit, but only when the predicate matches.
 *
 * This replaces the common `let depth = 0` mutable counter pattern.
 *
 * The predicate receives the narrowed node type for the given key
 * (e.g. `ESTree.CallExpression` for `'CallExpression'`).
 *
 * @example
 * ```ts
 * const effectGenDepth = yield* Ref.make(0)
 *
 * Visitor.tracked('CallExpression',
 *   (node) => AST.isCallOf(node, 'Effect', 'gen'),
 *   effectGenDepth
 * )
 * ```
 *
 * @since 0.1.0
 */
declare const tracked: <K extends string>(nodeType: K, predicate: (node: VisitorNodeType<K>) => boolean, ref: Ref.Ref<number>) => EffectVisitor;
/**
 * Conditionally apply a visitor based on a predicate evaluated once
 * at create time.
 *
 * Useful for restricting a visitor to specific files (e.g. skip test files).
 *
 * @example
 * ```ts
 * Visitor.filter(
 *   (filename) => !filename.endsWith('.test.ts'),
 *   mainVisitor
 * )
 * ```
 *
 * @since 0.2.0
 */
declare const filter: {
  (predicate: (filename: string) => boolean): (visitor: EffectVisitor) => Effect.Effect<EffectVisitor, never, RuleContext>;
  (predicate: (filename: string) => boolean, visitor: EffectVisitor): Effect.Effect<EffectVisitor, never, RuleContext>;
};
/**
 * Accumulate values during traversal and analyze them at `Program:exit`.
 *
 * The `extract` function is called for each node of `nodeType`. If it
 * returns `Option.some(value)`, that value is accumulated. At
 * `Program:exit`, the `analyze` generator receives all collected items.
 *
 * @example
 * ```ts
 * Visitor.accumulate(
 *   'ExportNamedDeclaration',
 *   (node) => AST.narrow(node, 'ExportNamedDeclaration').pipe(
 *     Option.map(n => n.declaration)
 *   ),
 *   function*(accumulated) {
 *     // Analyze all collected declarations at end of file
 *   }
 * )
 * ```
 *
 * @since 0.2.0
 */
declare const accumulate: <A>(nodeType: string, extract: (node: ESTree$1.Node) => Option.Option<A>, analyze: (items: ReadonlyArray<A>) => Effect.Effect<void, never, RuleContext>) => Effect.Effect<EffectVisitor, never, RuleContext>;
/**
 * Convert an `EffectVisitor` to a plain oxlint `Visitor` by wrapping
 * each handler with the provided runner function.
 *
 * This is the runtime boundary where Effects are executed. Called once
 * per file inside `Rule.define`'s `create`.
 *
 * @internal
 */
declare const toOxlintVisitor: (effectVisitor: EffectVisitor, runHandler: (effect: Effect.Effect<void, never, RuleContext>) => void) => Visitor;
/**
 * Compile synchronous visitor clauses into direct oxlint callbacks.
 *
 * The returned callbacks read one active file service and call the handlers
 * directly. They do not construct or run an Effect.
 *
 * @internal
 */
declare const compileSync: (visitor: SyncVisitor, currentFile: () => FileContextService) => Visitor;
declare namespace Rule_d_exports {
  export { BanMultipleSpec, OnceRuleConfig, OnceRulePlan, OnceRuleProgram, RuleConfig, banCallOf, banCallOfMember, banImport, banMember, banMultiple, banNewExpr, banStatement, compile, define, defineOnce, meta, plan };
}
/**
 * Configuration object for `Rule.define`.
 *
 * @since 0.1.0
 */
interface RuleConfig<Options = undefined> {
  /** Rule name (used for tracing spans). */
  readonly name: string;
  /** Oxlint rule metadata. */
  readonly meta: RuleMeta$1;
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
  readonly create: (options: Options) => Effect.gen.Return<TypedEffectVisitor, never, RuleContext>;
}
/** Program returned by an Effect-first `createOnce` setup. */
interface OnceRuleProgram {
  readonly before?: Effect.Effect<boolean | void, never, FileContext>;
  readonly after?: Effect.Effect<void, never, FileContext>;
  readonly visitors?: EffectVisitor<FileContext>;
  readonly syncVisitors?: SyncVisitor;
}
/** Configuration for the Oxlint `createOnce` lifecycle. */
interface OnceRuleConfig<Options = undefined, Services = never> {
  readonly name: string;
  readonly meta: RuleMeta$1;
  readonly options?: Schema.Decoder<Options> | undefined;
  readonly layer?: Layer.Layer<Services, never, never>;
  readonly create: (options: Options) => Effect.Effect<OnceRuleProgram, never, Services>;
}
/** A declarative rule definition waiting for the Oxlint compiler. */
interface OnceRulePlan<Options = undefined, Services = never> {
  readonly _tag: 'OnceRulePlan';
  readonly config: OnceRuleConfig<Options, Services>;
}
/** Describe a `createOnce` rule before lowering it to Oxlint callbacks. */
declare const plan: <Options = undefined, Services = never>(config: OnceRuleConfig<Options, Services>) => OnceRulePlan<Options, Services>;
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
declare const define: <Options = undefined>(config: RuleConfig<Options>) => CreateRule$1;
/**
 * Define an Effect-first rule for Oxlint's `createOnce` lifecycle.
 *
 * Static setup runs once. File hooks and effectful handlers receive the
 * dynamic `FileContext` service. Synchronous handlers compile to direct
 * Oxlint callbacks and do not enter the Effect runtime per AST node.
 *
 * @since 0.4.0
 */
declare const defineOnce: <Options = undefined, Services = never>(config: OnceRuleConfig<Options, Services>) => CreateOnceRule$1;
/** Compile a declarative rule plan at the Oxlint host boundary. */
declare const compile: <Options = undefined, Services = never>(rulePlan: OnceRulePlan<Options, Services>) => CreateOnceRule$1;
/**
 * Build `RuleMeta` with sensible defaults.
 *
 * @since 0.1.0
 */
declare const meta: (opts: {
  readonly type: "problem" | "suggestion" | "layout";
  readonly description: string;
  readonly fixable?: "code" | "whitespace" | undefined;
  readonly hasSuggestions?: boolean | undefined;
  readonly messages?: Record<string, string> | undefined;
  readonly docs?: RuleDocs$1 | undefined;
}) => RuleMeta$1;
/**
 * Create a rule that bans `obj.prop` member expression access.
 *
 * Replaces the common `memberExprRule` utility pattern.
 *
 * @since 0.1.0
 */
declare const banMember: (obj: string, prop: string | ReadonlyArray<string>, opts: {
  readonly message: string;
  readonly meta?: {
    readonly type?: "problem" | "suggestion";
  } | undefined;
}) => CreateRule$1;
/**
 * Create a rule that bans imports matching a source string or predicate.
 *
 * Replaces the common `importRule` utility pattern.
 *
 * @since 0.1.0
 */
declare const banImport: (source: string | ((source: string) => boolean), opts: {
  readonly message: string;
  readonly meta?: {
    readonly type?: "problem" | "suggestion";
  } | undefined;
}) => CreateRule$1;
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
declare const banCallOf: (name: string | ReadonlyArray<string>, opts: {
  readonly message: string;
  readonly meta?: {
    readonly type?: "problem" | "suggestion";
  } | undefined;
}) => CreateRule$1;
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
declare const banCallOfMember: (obj: string, prop: string | ReadonlyArray<string>, opts: {
  readonly message: string;
  readonly meta?: {
    readonly type?: "problem" | "suggestion";
  } | undefined;
}) => CreateRule$1;
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
declare const banNewExpr: (name: string | ReadonlyArray<string>, opts: {
  readonly message: string;
  readonly meta?: {
    readonly type?: "problem" | "suggestion";
  } | undefined;
}) => CreateRule$1;
/**
 * Create a rule that bans a specific statement type.
 *
 * @since 0.1.0
 */
declare const banStatement: (nodeType: string, opts: {
  readonly message: string;
  readonly meta?: {
    readonly type?: "problem" | "suggestion";
  } | undefined;
}) => CreateRule$1;
/**
 * Specification for `banMultiple`: which patterns to ban under one rule.
 *
 * @since 0.2.0
 */
interface BanMultipleSpec {
  /** Bare identifier calls to ban (e.g. `'fetch'` or `['useState', 'useEffect']`). */
  readonly calls?: string | ReadonlyArray<string> | undefined;
  /** `new` expressions to ban (e.g. `'Date'` or `['Error', 'TypeError']`). */
  readonly newExprs?: string | ReadonlyArray<string> | undefined;
  /** Member expressions to ban: `[object, property | properties]` tuples. */
  readonly members?: ReadonlyArray<readonly [obj: string, prop: string | ReadonlyArray<string>]> | undefined;
  /** Member call expressions to ban: `[object, property | properties]` tuples. */
  readonly memberCalls?: ReadonlyArray<readonly [obj: string, prop: string | ReadonlyArray<string>]> | undefined;
  /** Import sources to ban (string or predicate). */
  readonly imports?: ReadonlyArray<string | ((source: string) => boolean)> | undefined;
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
declare const banMultiple: (spec: BanMultipleSpec, opts: {
  readonly name?: string | undefined;
  readonly message: string;
  readonly meta?: {
    readonly type?: "problem" | "suggestion";
  } | undefined;
}) => CreateRule$1;
declare namespace Scope_d_exports {
  export { childScopes, findVariable, findVariableUp, getReadReferences, getReferences, getWriteReferences, isReadOnly, isStrict, isUsed, isWritten, throughReferences, upper, variables };
}
/**
 * Find a variable by name in a scope.
 *
 * Searches the scope's `set` (a `Map<string, Variable>`).
 *
 * @since 0.2.0
 */
declare const findVariable: {
  (name: string): (scope: Scope) => Option.Option<Variable$1>;
  (scope: Scope, name: string): Option.Option<Variable$1>;
};
/**
 * Find a variable by name, walking up the scope chain.
 *
 * Starts at the given scope and checks each `upper` scope until found
 * or the global scope is exhausted.
 *
 * @since 0.2.0
 */
declare const findVariableUp: {
  (name: string): (scope: Scope) => Option.Option<Variable$1>;
  (scope: Scope, name: string): Option.Option<Variable$1>;
};
/**
 * Check whether a variable has any read references.
 *
 * A variable is considered "used" if at least one reference reads it.
 *
 * @since 0.2.0
 */
declare const isUsed: (variable: Variable$1) => boolean;
/**
 * Check whether a variable has any write references.
 *
 * @since 0.2.0
 */
declare const isWritten: (variable: Variable$1) => boolean;
/**
 * Check whether a variable is only read (no writes).
 *
 * @since 0.2.0
 */
declare const isReadOnly: (variable: Variable$1) => boolean;
/**
 * Get all references for a variable.
 *
 * @since 0.2.0
 */
declare const getReferences: (variable: Variable$1) => ReadonlyArray<Reference$1>;
/**
 * Get the read references for a variable.
 *
 * @since 0.2.0
 */
declare const getReadReferences: (variable: Variable$1) => ReadonlyArray<Reference$1>;
/**
 * Get the write references for a variable.
 *
 * @since 0.2.0
 */
declare const getWriteReferences: (variable: Variable$1) => ReadonlyArray<Reference$1>;
/**
 * Get the parent (upper) scope.
 *
 * @since 0.2.0
 */
declare const upper: (scope: Scope) => Option.Option<Scope>;
/**
 * Get the child scopes.
 *
 * @since 0.2.0
 */
declare const childScopes: (scope: Scope) => ReadonlyArray<Scope>;
/**
 * Get all variables in a scope.
 *
 * @since 0.2.0
 */
declare const variables: (scope: Scope) => ReadonlyArray<Variable$1>;
/**
 * Get "through" references (unresolved in this scope).
 *
 * @since 0.2.0
 */
declare const throughReferences: (scope: Scope) => ReadonlyArray<Reference$1>;
/**
 * Check whether a scope is strict mode.
 *
 * @since 0.2.0
 */
declare const isStrict: (scope: Scope) => boolean;
declare namespace SourceCode_d_exports {
  export { commentsExistBetween, getAllComments, getAncestors, getCommentsAfter, getCommentsBefore, getCommentsInside, getDeclaredVariables, getFirstToken, getFirstTokenBetween, getIndexFromLoc, getJSDocComment, getLastToken, getLines, getLocFromIndex, getNodeByRangeIndex, getNodeText, getRange, getScope, getText, getTokenAfter, getTokenBefore, getTokenByRangeStart, getTokens, getTokensBetween, isGlobalReference, isSpaceBetween, markVariableAsUsed };
}
/**
 * Get the full source text of the file being linted.
 *
 * @example
 * ```ts
 * const text = yield* SourceCode.getText()
 * ```
 *
 * @since 0.2.0
 */
declare const getText: () => Effect.Effect<string, never, RuleContext>;
/**
 * Get the source text covering a specific node, optionally including
 * `beforeCount` characters before and `afterCount` characters after.
 *
 * @example
 * ```ts
 * const text = yield* SourceCode.getNodeText(node)
 * const withCtx = yield* SourceCode.getNodeText(node, 10, 10)
 * ```
 *
 * @since 0.2.0
 */
declare const getNodeText: (node: ESTree$1.Node, beforeCount?: number, afterCount?: number) => Effect.Effect<string, never, RuleContext>;
/**
 * Get the ancestor nodes of the given node, from innermost to outermost.
 *
 * Note: oxlint types `getAncestors` as returning `Node[]` where `Node`
 * is the base `Span` interface. At runtime these are full `ESTree.Node`
 * values — the cast bridges this upstream type gap at the FFI boundary.
 *
 * @since 0.2.0
 */
declare const getAncestors: (node: ESTree$1.Node) => Effect.Effect<ReadonlyArray<ESTree$1.Node>, never, RuleContext>;
/**
 * Get the AST node that contains the given source offset.
 *
 * Returns `Option.none()` when no node spans that offset.
 *
 * @since 0.2.0
 */
declare const getNodeByRangeIndex: (offset: number) => Effect.Effect<Option.Option<ESTree$1.Node>, never, RuleContext>;
/**
 * Convert a source offset (0-based) to a `{ line, column }` location.
 *
 * @since 0.2.0
 */
declare const getLocFromIndex: (offset: number) => Effect.Effect<LineColumn$1, never, RuleContext>;
/**
 * Convert a `{ line, column }` location to a source offset (0-based).
 *
 * @since 0.2.0
 */
declare const getIndexFromLoc: (loc: LineColumn$1) => Effect.Effect<number, never, RuleContext>;
/**
 * Get the range `[start, end]` for a node or token.
 *
 * @since 0.2.0
 */
declare const getRange: (nodeOrToken: ESTree$1.Node | Token | Comment) => Effect.Effect<Range$1, never, RuleContext>;
/**
 * Get the first token of a node.
 *
 * @since 0.2.0
 */
declare const getFirstToken: (node: ESTree$1.Node) => Effect.Effect<Option.Option<Token>, never, RuleContext>;
/**
 * Get the last token of a node.
 *
 * @since 0.2.0
 */
declare const getLastToken: (node: ESTree$1.Node) => Effect.Effect<Option.Option<Token>, never, RuleContext>;
/**
 * Get all tokens for a node.
 *
 * @since 0.2.0
 */
declare const getTokens: (node: ESTree$1.Node) => Effect.Effect<ReadonlyArray<Token>, never, RuleContext>;
/**
 * Get the token before a node or token.
 *
 * @since 0.2.0
 */
declare const getTokenBefore: (nodeOrToken: ESTree$1.Node | Token | Comment) => Effect.Effect<Option.Option<Token>, never, RuleContext>;
/**
 * Get the token after a node or token.
 *
 * @since 0.2.0
 */
declare const getTokenAfter: (nodeOrToken: ESTree$1.Node | Token | Comment) => Effect.Effect<Option.Option<Token>, never, RuleContext>;
/**
 * Get all tokens between two nodes/tokens.
 *
 * @since 0.2.0
 */
declare const getTokensBetween: (left: ESTree$1.Node | Token | Comment, right: ESTree$1.Node | Token | Comment) => Effect.Effect<ReadonlyArray<Token>, never, RuleContext>;
/**
 * Get the first token between two nodes/tokens.
 *
 * @since 0.2.0
 */
declare const getFirstTokenBetween: (left: ESTree$1.Node | Token | Comment, right: ESTree$1.Node | Token | Comment) => Effect.Effect<Option.Option<Token>, never, RuleContext>;
/**
 * Find a token by its range start offset.
 *
 * @since 0.2.0
 */
declare const getTokenByRangeStart: (offset: number) => Effect.Effect<Option.Option<Token>, never, RuleContext>;
/**
 * Get all comments in the file.
 *
 * @since 0.2.0
 */
declare const getAllComments: () => Effect.Effect<ReadonlyArray<Comment>, never, RuleContext>;
/**
 * Get comments before a node or token.
 *
 * @since 0.2.0
 */
declare const getCommentsBefore: (nodeOrToken: ESTree$1.Node | Token | Comment) => Effect.Effect<ReadonlyArray<Comment>, never, RuleContext>;
/**
 * Get comments after a node or token.
 *
 * @since 0.2.0
 */
declare const getCommentsAfter: (nodeOrToken: ESTree$1.Node | Token | Comment) => Effect.Effect<ReadonlyArray<Comment>, never, RuleContext>;
/**
 * Get comments inside a node.
 *
 * @since 0.2.0
 */
declare const getCommentsInside: (node: ESTree$1.Node) => Effect.Effect<ReadonlyArray<Comment>, never, RuleContext>;
/**
 * Check whether comments exist between two nodes/tokens.
 *
 * @since 0.2.0
 */
declare const commentsExistBetween: (left: ESTree$1.Node | Token | Comment, right: ESTree$1.Node | Token | Comment) => Effect.Effect<boolean, never, RuleContext>;
/**
 * Get the JSDoc comment for a node.
 *
 * @deprecated Upstream deprecation. Use `getCommentsBefore` instead.
 * @since 0.2.0
 */
declare const getJSDocComment: (node: ESTree$1.Node) => Effect.Effect<Option.Option<Comment>, never, RuleContext>;
/**
 * Get the scope for a node.
 *
 * @since 0.2.0
 */
declare const getScope: (node: ESTree$1.Node) => Effect.Effect<Scope, never, RuleContext>;
/**
 * Get declared variables for a node.
 *
 * @since 0.2.0
 */
declare const getDeclaredVariables: (node: ESTree$1.Node) => Effect.Effect<ReadonlyArray<Variable$1>, never, RuleContext>;
/**
 * Check whether a node is a global reference.
 *
 * @since 0.2.0
 */
declare const isGlobalReference: (node: ESTree$1.Node) => Effect.Effect<boolean, never, RuleContext>;
/**
 * Mark a variable as used in the scope of the given node.
 *
 * @since 0.2.0
 */
declare const markVariableAsUsed: (name: string, refNode?: ESTree$1.Node) => Effect.Effect<boolean, never, RuleContext>;
/**
 * Check whether there is a space between two nodes/tokens.
 *
 * @since 0.2.0
 */
declare const isSpaceBetween: (first: ESTree$1.Node | Token | Comment, second: ESTree$1.Node | Token | Comment) => Effect.Effect<boolean, never, RuleContext>;
/**
 * Get all source lines.
 *
 * @since 0.2.0
 */
declare const getLines: () => Effect.Effect<ReadonlyArray<string>, never, RuleContext>;
declare namespace Token_d_exports {
  export { isBoolean, isIdentifier, isKeyword, isNull, isNumeric, isPrivateIdentifier, isPunctuator, isRegularExpression, isString, isTemplate, type, value };
}
/**
 * Check whether a token is a keyword with the given value.
 *
 * @example
 * ```ts
 * Token.isKeyword(token, 'const')  // true if keyword "const"
 * Token.isKeyword(token, 'return') // true if keyword "return"
 * ```
 *
 * @since 0.2.0
 */
declare const isKeyword: {
  (keyword: string): (token: Token) => boolean;
  (token: Token, keyword: string): boolean;
};
/**
 * Check whether a token is a punctuator with the given value.
 *
 * @example
 * ```ts
 * Token.isPunctuator(token, '{')  // true if punctuator "{"
 * Token.isPunctuator(token, ';')  // true if punctuator ";"
 * ```
 *
 * @since 0.2.0
 */
declare const isPunctuator: {
  (value: string): (token: Token) => boolean;
  (token: Token, value: string): boolean;
};
/**
 * Check whether a token is an identifier.
 *
 * @since 0.2.0
 */
declare const isIdentifier: (token: Token) => boolean;
/**
 * Check whether a token is a string literal.
 *
 * @since 0.2.0
 */
declare const isString: (token: Token) => boolean;
/**
 * Check whether a token is a numeric literal.
 *
 * @since 0.2.0
 */
declare const isNumeric: (token: Token) => boolean;
/**
 * Check whether a token is a boolean literal.
 *
 * @since 0.2.0
 */
declare const isBoolean: (token: Token) => boolean;
/**
 * Check whether a token is a null literal.
 *
 * @since 0.2.0
 */
declare const isNull: (token: Token) => boolean;
/**
 * Check whether a token is a template literal part.
 *
 * @since 0.2.0
 */
declare const isTemplate: (token: Token) => boolean;
/**
 * Check whether a token is a regular expression literal.
 *
 * @since 0.2.0
 */
declare const isRegularExpression: (token: Token) => boolean;
/**
 * Check whether a token is a private identifier (e.g. `#foo`).
 *
 * @since 0.2.0
 */
declare const isPrivateIdentifier: (token: Token) => boolean;
/**
 * Get the string value of a token.
 *
 * @since 0.2.0
 */
declare const value: (token: Token) => string;
/**
 * Get the type discriminant of a token.
 *
 * @since 0.2.0
 */
declare const type: (token: Token) => string;
//#endregion
export { AST_d_exports as AST, Comment_d_exports as Comment, type Context, type CreateOnceRule, type CreateRule, type Definition, type DefinitionType, Diagnostic_d_exports as Diagnostic, type ESTree, FileContext_d_exports as FileContext, type Fix, type FixFn, type Fixer, type LineColumn, type Location, type OxlintComment, type OxlintPlugin, type OxlintRule, type OxlintScope, type OxlintSourceCode, type OxlintToken, type OxlintVisitor, Plugin_d_exports as Plugin, type Range, type Ranged, type Reference, Rule_d_exports as Rule, RuleContext, type RuleDocs, type RuleMeta, Scope_d_exports as Scope, type ScopeManager, type ScopeType, type Settings, SourceCode_d_exports as SourceCode, type Span, type Suggestion, Token_d_exports as Token, type Variable, Visitor_d_exports as Visitor };