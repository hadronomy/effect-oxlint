import { t as __exportAll } from "./chunk.js";
import { n as fromOxlintContext, t as RuleContext } from "./RuleContext.js";
import * as Arr from "effect/Array";
import { dual, pipe } from "effect/Function";
import * as Option from "effect/Option";
import * as P from "effect/Predicate";
import * as Result from "effect/Result";
import * as Str from "effect/String";
import * as Context from "effect/Context";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as R from "effect/Record";
import * as Schema from "effect/Schema";
import "effect/Layer";
import * as Ref from "effect/Ref";
//#region src/AST.ts
var AST_exports = /* @__PURE__ */ __exportAll({
	calleeIdentifier: () => calleeIdentifier,
	calleeName: () => calleeName,
	findAncestor: () => findAncestor,
	hasAncestor: () => hasAncestor,
	importSource: () => importSource,
	isCallOf: () => isCallOf,
	isImport: () => isImport,
	isMember: () => isMember,
	matchCallOf: () => matchCallOf,
	matchImport: () => matchImport,
	matchMember: () => matchMember,
	memberNames: () => memberNames,
	memberPath: () => memberPath,
	narrow: () => narrow,
	objectGetValue: () => objectGetValue,
	objectHasKey: () => objectHasKey,
	objectKeys: () => objectKeys
});
/** @internal */
const isIdentifier$1 = (node) => P.isObject(node) && "type" in node && node.type === "Identifier" && "name" in node && P.isString(node.name);
/** @internal */
const identifierName = (node) => isIdentifier$1(node) ? Option.some(node.name) : Option.none();
/** @internal */
const isStaticMember = (node) => !node.computed && node.property.type !== "PrivateIdentifier";
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
const matchMember = dual(3, (node, obj, prop) => {
	if (!isStaticMember(node)) return Option.none();
	const props = P.isString(prop) ? [prop] : prop;
	return pipe(identifierName(node.object), Option.filter((name) => name === obj), Option.flatMap(() => identifierName(node.property)), Option.filter((name) => Arr.contains(props, name)), Option.map(() => node));
});
/**
* Check whether a `MemberExpression` is `obj.prop`.
*
* Pure boolean predicate — use `matchMember` when you need the narrowed node.
*
* @since 0.1.0
*/
const isMember = dual(3, (node, obj, prop) => Option.isSome(matchMember(node, obj, prop)));
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
const matchCallOf = dual(3, (node, obj, prop) => node.callee.type === "MemberExpression" ? pipe(matchMember(node.callee, obj, prop), Option.map(() => node)) : Option.none());
/**
* Boolean predicate: is this `CallExpression` a call of `obj.prop(...)`?
*
* @since 0.1.0
*/
const isCallOf = dual(3, (node, obj, prop) => Option.isSome(matchCallOf(node, obj, prop)));
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
const matchImport = dual(2, (node, source) => {
	const src = node.source.value;
	return (P.isString(source) ? src === source : source(src)) ? Option.some(node) : Option.none();
});
/**
* Boolean predicate: does this `ImportDeclaration` import from the given source?
*
* @since 0.1.0
*/
const isImport = dual(2, (node, source) => Option.isSome(matchImport(node, source)));
/**
* Extract the callee name from a `CallExpression` when the callee is a
* bare identifier (e.g. `fetch(...)`).
*
* @since 0.1.0
*/
const calleeName = (node) => identifierName(node.callee);
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
const calleeIdentifier = (node) => identifierName(node.callee);
/**
* Extract the object and property names from a static `MemberExpression`.
*
* Returns `Option<readonly [objectName, propertyName]>`.
*
* @since 0.1.0
*/
const memberNames = (node) => node.computed ? Option.none() : pipe(identifierName(node.object), Option.flatMap((obj) => pipe(identifierName(node.property), Option.map((prop) => [obj, prop]))));
/**
* Extract the import source string from an `ImportDeclaration`.
*
* @since 0.1.0
*/
const importSource = (node) => node.source.value;
/**
* Collect the statically-known key names from an `ObjectExpression`.
*
* Spread elements and computed properties are ignored.
*
* @since 0.1.0
*/
const objectKeys = (node) => pipe(node.properties, Arr.filterMap((p) => {
	if (p.type !== "Property") return Result.fail(void 0);
	return pipe(identifierName(p.key), Option.orElse(() => p.key.type === "Literal" && P.isString(p.key.value) ? Option.some(p.key.value) : Option.none()), Result.fromOption(() => void 0));
}));
/**
* Check whether an `ObjectExpression` has a property with the given key.
*
* @since 0.1.0
*/
const objectHasKey = dual(2, (node, key) => Arr.contains(objectKeys(node), key));
/**
* Get the value expression for a given key in an `ObjectExpression`.
*
* @since 0.1.0
*/
const objectGetValue = dual(2, (node, key) => pipe(node.properties, Arr.findFirst((p) => p.type === "Property" && (identifierName(p.key).pipe(Option.map((n) => n === key), Option.getOrElse(() => false)) || p.key.type === "Literal" && p.key.value === key)), Option.map((p) => p.value)));
/**
* Narrow an AST node to a specific `type` string, returning `Option<Node>`.
*
* This is a safe alternative to casting — returns `Option.none()` if the
* node's `type` doesn't match.
*
* @example
* ```ts
* AST.narrow(node, 'Identifier')       // Option<Node & { type: "Identifier" }>
* AST.narrow(node, 'CallExpression')    // Option<Node & { type: "CallExpression" }>
* ```
*
* @since 0.2.0
*/
/** @internal Type guard: does the node's `type` match the literal? */
const hasType = (node, type) => node.type === type;
const narrow = dual(2, (node, type) => hasType(node, type) ? Option.some(node) : Option.none());
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
const memberPath = (node) => {
	/** @internal Collect property names from right to left. */
	const collect = (current, acc) => {
		if (!P.isObject(current) || !("type" in current) || current.type !== "MemberExpression") return pipe(identifierName(current), Option.map((rootName) => [rootName, ...acc]));
		if (current.computed) return Option.none();
		return pipe(identifierName(current.property), Option.flatMap((propName) => collect(current.object, [propName, ...acc])));
	};
	return collect(node, []);
};
/** @internal Type guard for objects with a string `type` and optional `parent`. */
const isASTShape = (value) => P.isObject(value) && "type" in value && P.isString(value.type);
/** @internal Narrow an AST-shape value to a specific `type` literal. */
const hasAncestorType = (value, type) => value.type === type;
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
const findAncestor = dual(2, (node, type) => {
	const walk = (current) => {
		if (!isASTShape(current)) return Option.none();
		if (hasAncestorType(current, type)) return Option.some(current);
		return walk(current.parent);
	};
	return walk(node.parent);
});
/**
* Check whether any ancestor of the node has the given `type`.
*
* @since 0.1.0
*/
const hasAncestor = dual(2, (node, type) => Option.isSome(findAncestor(node, type)));
//#endregion
//#region src/Comment.ts
var Comment_exports = /* @__PURE__ */ __exportAll({
	isBlock: () => isBlock,
	isDisableDirective: () => isDisableDirective,
	isEnableDirective: () => isEnableDirective,
	isJSDoc: () => isJSDoc,
	isLine: () => isLine,
	isShebang: () => isShebang,
	text: () => text
});
/**
* Check whether a comment is a line comment (`// ...`).
*
* @since 0.2.0
*/
const isLine = (comment) => comment.type === "Line";
/**
* Check whether a comment is a block comment (`/* ... *​/`).
*
* @since 0.2.0
*/
const isBlock = (comment) => comment.type === "Block";
/**
* Check whether a comment is a shebang (`#!/usr/bin/env node`).
*
* @since 0.2.0
*/
const isShebang = (comment) => comment.type === "Shebang";
/**
* Get the text content of a comment (without delimiters).
*
* @since 0.2.0
*/
const text = (comment) => comment.value;
/**
* Check whether a comment is a JSDoc comment (`/** ... *​/`).
*
* A JSDoc comment is a block comment whose value starts with `*`.
*
* @since 0.2.0
*/
const isJSDoc = (comment) => comment.type === "Block" && Str.startsWith("*")(comment.value);
/**
* Check whether a comment is an eslint/oxlint disable directive.
*
* Matches line comments like `// eslint-disable-next-line ...`
* and block comments like `/* eslint-disable ... *​/`.
*
* @since 0.2.0
*/
const isDisableDirective = (comment) => {
	const trimmed = Str.trim(comment.value);
	return Str.startsWith("eslint-disable")(trimmed) || Str.startsWith("oxlint-disable")(trimmed);
};
/**
* Check whether a comment is an eslint/oxlint enable directive.
*
* @since 0.2.0
*/
const isEnableDirective = (comment) => {
	const trimmed = Str.trim(comment.value);
	return Str.startsWith("eslint-enable")(trimmed) || Str.startsWith("oxlint-enable")(trimmed);
};
//#endregion
//#region src/Diagnostic.ts
var Diagnostic_exports = /* @__PURE__ */ __exportAll({
	composeFixes: () => composeFixes,
	fromId: () => fromId,
	insertAfter: () => insertAfter,
	insertBefore: () => insertBefore,
	make: () => make$1,
	removeFix: () => removeFix,
	replaceText: () => replaceText,
	withFix: () => withFix,
	withSuggestions: () => withSuggestions
});
/**
* Create a diagnostic with a message and node location.
*
* @since 0.1.0
*/
const make$1 = (opts) => ({
	node: opts.node,
	message: opts.message,
	data: opts.data
});
/**
* Create a diagnostic using a `messageId` from `meta.messages`.
*
* @since 0.1.0
*/
const fromId = (opts) => ({
	node: opts.node,
	messageId: opts.messageId,
	data: opts.data
});
/**
* Attach an autofix function to a diagnostic.
*
* @since 0.1.0
*/
const withFix = dual(2, (diagnostic, fix) => ({
	...diagnostic,
	fix
}));
/**
* Attach suggestion fixes to a diagnostic.
*
* @since 0.1.0
*/
const withSuggestions = dual(2, (diagnostic, suggestions) => ({
	...diagnostic,
	suggest: Array.from(suggestions)
}));
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
const replaceText = (nodeOrToken, text) => (fixer) => fixer.replaceText(nodeOrToken, text);
/**
* Insert text before a node or token.
*
* @since 0.1.0
*/
const insertBefore = (nodeOrToken, text) => (fixer) => fixer.insertTextBefore(nodeOrToken, text);
/**
* Insert text after a node or token.
*
* @since 0.1.0
*/
const insertAfter = (nodeOrToken, text) => (fixer) => fixer.insertTextAfter(nodeOrToken, text);
/**
* Remove a node or token.
*
* @since 0.1.0
*/
const removeFix = (nodeOrToken) => (fixer) => fixer.remove(nodeOrToken);
/** @internal Type guard for an oxlint Fix value (has `range` and `text`). */
const isFix = (value) => P.isObject(value) && "range" in value && "text" in value;
/**
* Extract fixes from a single `FixFn` result.
*
* The parameter is typed as `unknown` because oxlint's `FixFn` returns
* a nullable union (`Fix | Array<Fix | null> | IterableIterator<…> | null`).
* We guard at the boundary instead of mirroring the nullable upstream type.
*
* @internal
*/
const extractFixes = (result) => {
	if (result === null || result === void 0) return [];
	if (isFix(result)) return [result];
	if (!P.isIterable(result)) return [];
	return Arr.filterMap(Array.from(result), (item) => Option.fromNullishOr(item).pipe(Option.filter(isFix), Result.fromOption(() => void 0)));
};
/**
* Compose multiple fix functions into one.
*
* All individual fixes are collected into a single array result.
*
* @since 0.1.0
*/
const composeFixes = (...fixes) => (fixer) => Arr.flatMap(fixes, (fn) => Array.from(extractFixes(fn(fixer))));
//#endregion
//#region src/FileContext.ts
var FileContext_exports = /* @__PURE__ */ __exportAll({
	FileContext: () => FileContext,
	FileContextClosed: () => FileContextClosed,
	FileContextUnavailable: () => FileContextUnavailable,
	make: () => make
});
var FileContextUnavailable = class extends Data.TaggedError("FileContextUnavailable") {};
var FileContextClosed = class extends Data.TaggedError("FileContextClosed") {};
const FileContextBase = Context.Service()("effect-oxlint/FileContext");
var FileContext = class extends FileContextBase {};
const make = (context) => {
	let active = false;
	const service = {
		get id() {
			if (!active) throw new FileContextUnavailable();
			return context.id;
		},
		get filename() {
			if (!active) throw new FileContextUnavailable();
			return context.filename;
		},
		get physicalFilename() {
			if (!active) throw new FileContextUnavailable();
			return context.physicalFilename;
		},
		get cwd() {
			if (!active) throw new FileContextUnavailable();
			return context.cwd;
		},
		get options() {
			if (!active) throw new FileContextUnavailable();
			return context.options;
		},
		get sourceCode() {
			if (!active) throw new FileContextUnavailable();
			return context.sourceCode;
		},
		get languageOptions() {
			if (!active) throw new FileContextUnavailable();
			return context.languageOptions;
		},
		get settings() {
			if (!active) throw new FileContextUnavailable();
			return context.settings;
		},
		report: (diagnostic) => {
			if (!active) throw new FileContextClosed();
			context.report(diagnostic);
		},
		reportEffect: (diagnostic) => Effect.sync(() => {
			if (!active) throw new FileContextClosed();
			context.report(diagnostic);
		})
	};
	return {
		service,
		activate: () => {
			active = true;
		},
		deactivate: () => {
			active = false;
		},
		current: () => {
			if (!active) throw new FileContextClosed();
			return service;
		}
	};
};
//#endregion
//#region src/Plugin.ts
var Plugin_exports = /* @__PURE__ */ __exportAll({
	define: () => define$1,
	merge: () => merge$1
});
/** @internal */
const pluginReference = (name, specifier) => pipe(specifier, Option.filter((value) => value !== name), Option.match({
	onNone: () => name,
	onSome: (value) => ({
		name,
		specifier: value
	})
}));
/** @internal */
const recommendedSeverity = (recommended) => pipe(recommended, Option.flatMap((value) => value === false ? Option.none() : Option.fromNullishOr(value.severity)), Option.getOrElse(() => "error"));
/** @internal */
const isRecommendedRule = (ruleName, recommended) => pipe(recommended, Option.match({
	onNone: () => true,
	onSome: (value) => {
		if (value === false) return false;
		return pipe(Option.fromNullishOr(value.rules), Option.match({
			onNone: () => true,
			onSome: (ruleNames) => Arr.contains(ruleNames, ruleName)
		}));
	}
}));
/** @internal */
const qualifiedRuleName = (pluginName, ruleName) => `${pluginName}/${ruleName}`;
/** @internal */
const makeRulesConfig = (pluginName, rules, severity, include) => R.fromEntries(pipe(R.keys(rules), Arr.filter(include), Arr.map((ruleName) => [qualifiedRuleName(pluginName, ruleName), severity])));
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
const define$1 = (config) => {
	const recommended = Option.fromNullishOr(config.recommended);
	const reference = pluginReference(config.name, Option.fromNullishOr(config.specifier));
	const includeRecommended = (ruleName) => isRecommendedRule(ruleName, recommended);
	const severity = recommendedSeverity(recommended);
	return {
		meta: { name: config.name },
		rules: config.rules,
		configs: {
			recommended: {
				jsPlugins: [reference],
				rules: makeRulesConfig(config.name, config.rules, severity, includeRecommended)
			},
			all: {
				jsPlugins: [reference],
				rules: makeRulesConfig(config.name, config.rules, "error", () => true)
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
const merge$1 = (...plugins) => ({
	meta: { name: Arr.join(Arr.map(plugins, (p) => p.meta?.name ?? "unknown"), "+") },
	rules: Arr.reduce(plugins, {}, (acc, p) => R.union(acc, p.rules, (_, right) => right))
});
//#endregion
//#region src/Visitor.ts
var Visitor_exports = /* @__PURE__ */ __exportAll({
	accumulate: () => accumulate,
	compileSync: () => compileSync,
	filter: () => filter,
	merge: () => merge,
	mergeSync: () => mergeSync,
	on: () => on,
	onEffect: () => onEffect,
	onExit: () => onExit,
	onExitSync: () => onExitSync,
	onSync: () => onSync,
	toOxlintVisitor: () => toOxlintVisitor,
	tracked: () => tracked
});
/** Create a synchronous visitor clause. */
const onSync = (key, handler) => ({
	_tag: "SyncVisitor",
	entries: [{
		key,
		handler
	}]
});
/** Create a synchronous visitor clause for an exit event. */
const onExitSync = (key, handler) => onSync(`${key}:exit`, handler);
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
const on = (nodeType, handler) => ({ [nodeType]: handler });
/** Create an effectful visitor clause for a `Rule.defineOnce` file context. */
const onEffect = (nodeType, handler) => ({ [nodeType]: handler });
/**
* Create a single-entry visitor for the exit phase of a node type.
*
* @since 0.1.0
*/
const onExit = (nodeType, handler) => ({ [`${nodeType}:exit`]: handler });
/** @internal Empty visitor seed for reduce operations. */
const emptyVisitor = {};
/** @internal Combine two handlers for the same node type into one sequential handler. */
const sequenceHandlers = (left, right) => (node) => Effect.andThen(left(node), right(node));
/**
* Merge multiple effectful visitors into one.
*
* When two visitors handle the same node type, both handlers run
* sequentially (left to right).
*
* @since 0.1.0
*/
const mergeEffectVisitors = (...visitors) => Arr.reduce(visitors, emptyVisitor, (acc, visitor) => R.union(acc, visitor, (left, right) => sequenceHandlers(left, right)));
/**
* Merge synchronous visitors into one flat clause list.
*
* Synchronous visitors retain declaration order. The compiler combines
* handlers for one host key into one callback at the runtime boundary.
*
* @since 0.4.0
*/
const mergeSync = (...visitors) => {
	const entries = [];
	for (const visitor of visitors) for (const entry of visitor.entries) entries.push(entry);
	return {
		_tag: "SyncVisitor",
		entries
	};
};
function merge(...visitors) {
	if (visitors.length > 0 && visitors.every((visitor) => "_tag" in visitor && visitor._tag === "SyncVisitor")) return mergeSync(...visitors);
	return mergeEffectVisitors(...visitors);
}
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
const tracked = (nodeType, predicate, ref) => ({
	[nodeType]: (node) => predicate(node) ? Ref.update(ref, (n) => n + 1) : Effect.void,
	[`${nodeType}:exit`]: (node) => predicate(node) ? Ref.update(ref, (n) => n - 1) : Effect.void
});
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
const filter = dual(2, (predicate, visitor) => Effect.service(RuleContext).pipe(Effect.map((ctx) => predicate(ctx.filename) ? visitor : {})));
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
const accumulate = (nodeType, extract, analyze) => Effect.gen(function* () {
	const ref = yield* Ref.make([]);
	return merge(on(nodeType, (node) => pipe(extract(node), Option.match({
		onNone: () => Effect.void,
		onSome: (value) => Ref.update(ref, (items) => [...items, value])
	}))), on("Program:exit", () => Effect.flatMap(Ref.get(ref), (items) => analyze(items))));
});
/**
* Convert an `EffectVisitor` to a plain oxlint `Visitor` by wrapping
* each handler with the provided runner function.
*
* This is the runtime boundary where Effects are executed. Called once
* per file inside `Rule.define`'s `create`.
*
* @internal
*/
const toOxlintVisitor = (effectVisitor, runHandler) => R.map(effectVisitor, (handler) => (node) => runHandler(handler(node)));
/**
* Compile synchronous visitor clauses into direct oxlint callbacks.
*
* The returned callbacks read one active file service and call the handlers
* directly. They do not construct or run an Effect.
*
* @internal
*/
const compileSync = (visitor, currentFile) => {
	const handlers = /* @__PURE__ */ new Map();
	visitor.entries.forEach((entry) => {
		const existing = handlers.get(entry.key);
		const handler = entry.handler;
		if (existing === void 0) handlers.set(entry.key, [handler]);
		else existing.push(handler);
	});
	const result = {};
	handlers.forEach((eventHandlers, key) => {
		if (eventHandlers.length === 1) {
			const handler = eventHandlers[0];
			if (handler === void 0) return;
			result[key] = (node) => handler(node, currentFile());
			return;
		}
		result[key] = (node) => {
			const file = currentFile();
			for (let index = 0; index < eventHandlers.length; index += 1) {
				const handler = eventHandlers[index];
				if (handler !== void 0) handler(node, file);
			}
		};
	});
	return result;
};
//#endregion
//#region src/Rule.ts
var Rule_exports = /* @__PURE__ */ __exportAll({
	banCallOf: () => banCallOf,
	banCallOfMember: () => banCallOfMember,
	banImport: () => banImport,
	banMember: () => banMember,
	banMultiple: () => banMultiple,
	banNewExpr: () => banNewExpr,
	banStatement: () => banStatement,
	define: () => define,
	defineOnce: () => defineOnce,
	meta: () => meta
});
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
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2").toLowerCase();
/**
* Render a list of identifier segments as a kebab-case rule-name tail.
*
* @internal
*/
const kebabList = (parts) => Arr.join(Arr.map(parts, kebab), "-");
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
const define = (config) => ({
	meta: config.meta,
	create(oxlintContext) {
		const ruleCtx = fromOxlintContext(oxlintContext);
		const run = (effect) => Effect.runSync(Effect.provideService(effect, RuleContext, ruleCtx));
		const decodeOptions = () => {
			const schema = config.options;
			if (schema === void 0) return void 0;
			return Schema.decodeUnknownSync(schema)(oxlintContext.options[0]);
		};
		const options = run(Effect.sync(decodeOptions));
		return toOxlintVisitor(run(Effect.gen(() => config.create(options))), run);
	}
});
const toFileOxlintVisitor = (effectVisitor, runHandler) => R.map(effectVisitor, (handler) => (node) => runHandler(handler(node)));
const combineOxlintVisitors = (left, right) => {
	const result = { ...left };
	R.toEntries(right).forEach(([key, handler]) => {
		const existing = result[key];
		result[key] = existing ? (node) => {
			existing(node);
			handler(node);
		} : handler;
	});
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
const defineOnce = (config) => ({
	meta: config.meta,
	createOnce(oxlintContext) {
		const controller = make(oxlintContext);
		const decodeOptions = () => {
			const schema = config.options;
			if (schema === void 0) return void 0;
			return Schema.decodeUnknownSync(schema)(oxlintContext.options[0]);
		};
		const options = decodeOptions();
		const setup = config.layer ? Effect.provide(config.create(options), config.layer) : config.create(options);
		const program = Effect.runSync(setup);
		const fileContext = Context.make(FileContext, controller.service);
		const runFile = Effect.runSyncWith(fileContext);
		const runHook = (effect) => effect === void 0 ? void 0 : runFile(effect);
		return {
			...combineOxlintVisitors(program.visitors ? toFileOxlintVisitor(program.visitors, (effect) => {
				runFile(effect);
			}) : {}, program.syncVisitors ? compileSync(program.syncVisitors, controller.current) : {}),
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
/**
* Build `RuleMeta` with sensible defaults.
*
* @since 0.1.0
*/
const meta = (opts) => ({
	type: opts.type,
	...opts.fixable !== void 0 ? { fixable: opts.fixable } : {},
	...opts.hasSuggestions !== void 0 ? { hasSuggestions: opts.hasSuggestions } : {},
	...opts.messages !== void 0 ? { messages: opts.messages } : {},
	docs: {
		description: opts.description,
		...opts.docs
	}
});
/**
* Create a rule that bans `obj.prop` member expression access.
*
* Replaces the common `memberExprRule` utility pattern.
*
* @since 0.1.0
*/
const banMember = (obj, prop, opts) => define({
	name: `ban-${kebabList([obj, ...P.isString(prop) ? [prop] : prop])}`,
	meta: meta({
		type: opts.meta?.type ?? "suggestion",
		description: opts.message
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return { MemberExpression: (node) => pipe(narrow(node, "MemberExpression"), Option.flatMap(matchMember(obj, prop)), Option.match({
			onNone: () => Effect.void,
			onSome: (matched) => ctx.report(make$1({
				node: matched,
				message: opts.message
			}))
		})) };
	}
});
/**
* Create a rule that bans imports matching a source string or predicate.
*
* Replaces the common `importRule` utility pattern.
*
* @since 0.1.0
*/
const banImport = (source, opts) => define({
	name: "ban-import",
	meta: meta({
		type: opts.meta?.type ?? "suggestion",
		description: opts.message
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return { ImportDeclaration: (node) => pipe(narrow(node, "ImportDeclaration"), Option.flatMap(matchImport(source)), Option.match({
			onNone: () => Effect.void,
			onSome: (matched) => ctx.report(make$1({
				node: matched,
				message: opts.message
			}))
		})) };
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
const banCallOf = (name, opts) => {
	const names = P.isString(name) ? [name] : name;
	return define({
		name: `ban-call-${kebabList(names)}`,
		meta: meta({
			type: opts.meta?.type ?? "suggestion",
			description: opts.message
		}),
		create: function* () {
			const ctx = yield* RuleContext;
			return { CallExpression: (node) => pipe(narrow(node, "CallExpression"), Option.flatMap(calleeName), Option.filter((n) => Arr.contains(names, n)), Option.match({
				onNone: () => Effect.void,
				onSome: () => ctx.report(make$1({
					node,
					message: opts.message
				}))
			})) };
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
const banCallOfMember = (obj, prop, opts) => define({
	name: `ban-call-${kebabList([obj, ...P.isString(prop) ? [prop] : prop])}`,
	meta: meta({
		type: opts.meta?.type ?? "suggestion",
		description: opts.message
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return { CallExpression: (node) => pipe(narrow(node, "CallExpression"), Option.flatMap(matchCallOf(obj, prop)), Option.match({
			onNone: () => Effect.void,
			onSome: (matched) => ctx.report(make$1({
				node: matched,
				message: opts.message
			}))
		})) };
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
const banNewExpr = (name, opts) => {
	const names = P.isString(name) ? [name] : name;
	return define({
		name: `ban-new-${kebabList(names)}`,
		meta: meta({
			type: opts.meta?.type ?? "suggestion",
			description: opts.message
		}),
		create: function* () {
			const ctx = yield* RuleContext;
			return { NewExpression: (node) => pipe(narrow(node, "NewExpression"), Option.flatMap(calleeIdentifier), Option.filter((n) => Arr.contains(names, n)), Option.match({
				onNone: () => Effect.void,
				onSome: () => ctx.report(make$1({
					node,
					message: opts.message
				}))
			})) };
		}
	});
};
/**
* Create a rule that bans a specific statement type.
*
* @since 0.1.0
*/
const banStatement = (nodeType, opts) => define({
	name: `ban-${kebab(nodeType)}`,
	meta: meta({
		type: opts.meta?.type ?? "suggestion",
		description: opts.message
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		return { [nodeType]: (node) => ctx.report(make$1({
			node,
			message: opts.message
		})) };
	}
});
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
const banMultiple = (spec, opts) => define({
	name: opts.name ?? "ban-multiple",
	meta: meta({
		type: opts.meta?.type ?? "suggestion",
		description: opts.message
	}),
	create: function* () {
		const ctx = yield* RuleContext;
		const report = (node) => ctx.report(make$1({
			node,
			message: opts.message
		}));
		const stmtVisitors = spec.statements !== void 0 ? Arr.map(spec.statements, (nodeType) => ({ [nodeType]: report })) : [];
		const callVisitors = spec.calls !== void 0 ? ((names) => [{ CallExpression: (node) => pipe(narrow(node, "CallExpression"), Option.flatMap(calleeName), Option.filter((n) => Arr.contains(names, n)), Option.match({
			onNone: () => Effect.void,
			onSome: () => report(node)
		})) }])(P.isString(spec.calls) ? [spec.calls] : spec.calls) : [];
		const newExprVisitors = spec.newExprs !== void 0 ? ((names) => [{ NewExpression: (node) => pipe(narrow(node, "NewExpression"), Option.flatMap(calleeIdentifier), Option.filter((n) => Arr.contains(names, n)), Option.match({
			onNone: () => Effect.void,
			onSome: () => report(node)
		})) }])(P.isString(spec.newExprs) ? [spec.newExprs] : spec.newExprs) : [];
		const memberVisitors = spec.members !== void 0 ? Arr.map(spec.members, ([obj, prop]) => ({ MemberExpression: (node) => pipe(narrow(node, "MemberExpression"), Option.flatMap(matchMember(obj, prop)), Option.match({
			onNone: () => Effect.void,
			onSome: (matched) => report(matched)
		})) })) : [];
		const memberCallVisitors = spec.memberCalls !== void 0 ? Arr.map(spec.memberCalls, ([obj, prop]) => ({ CallExpression: (node) => pipe(narrow(node, "CallExpression"), Option.flatMap(matchCallOf(obj, prop)), Option.match({
			onNone: () => Effect.void,
			onSome: (matched) => report(matched)
		})) })) : [];
		const importVisitors = spec.imports !== void 0 ? Arr.map(spec.imports, (source) => ({ ImportDeclaration: (node) => pipe(narrow(node, "ImportDeclaration"), Option.flatMap(matchImport(source)), Option.match({
			onNone: () => Effect.void,
			onSome: (matched) => report(matched)
		})) })) : [];
		return merge(...stmtVisitors, ...callVisitors, ...newExprVisitors, ...memberVisitors, ...memberCallVisitors, ...importVisitors);
	}
});
//#endregion
//#region src/Scope.ts
var Scope_exports = /* @__PURE__ */ __exportAll({
	childScopes: () => childScopes,
	findVariable: () => findVariable,
	findVariableUp: () => findVariableUp,
	getReadReferences: () => getReadReferences,
	getReferences: () => getReferences,
	getWriteReferences: () => getWriteReferences,
	isReadOnly: () => isReadOnly,
	isStrict: () => isStrict,
	isUsed: () => isUsed,
	isWritten: () => isWritten,
	throughReferences: () => throughReferences,
	upper: () => upper,
	variables: () => variables
});
/**
* Find a variable by name in a scope.
*
* Searches the scope's `set` (a `Map<string, Variable>`).
*
* @since 0.2.0
*/
const findVariable = dual(2, (scope, name) => Option.fromNullishOr(scope.set.get(name)));
/**
* Find a variable by name, walking up the scope chain.
*
* Starts at the given scope and checks each `upper` scope until found
* or the global scope is exhausted.
*
* @since 0.2.0
*/
const findVariableUp = dual(2, (scope, name) => {
	const walk = (current) => pipe(Option.fromNullishOr(current.set.get(name)), Option.orElse(() => pipe(Option.fromNullishOr(current.upper), Option.flatMap((parent) => walk(parent)))));
	return walk(scope);
});
/**
* Check whether a variable has any read references.
*
* A variable is considered "used" if at least one reference reads it.
*
* @since 0.2.0
*/
const isUsed = (variable) => Arr.some(variable.references, (ref) => ref.isRead());
/**
* Check whether a variable has any write references.
*
* @since 0.2.0
*/
const isWritten = (variable) => Arr.some(variable.references, (ref) => ref.isWrite());
/**
* Check whether a variable is only read (no writes).
*
* @since 0.2.0
*/
const isReadOnly = (variable) => Arr.some(variable.references, (ref) => ref.isReadOnly());
/**
* Get all references for a variable.
*
* @since 0.2.0
*/
const getReferences = (variable) => variable.references;
/**
* Get the read references for a variable.
*
* @since 0.2.0
*/
const getReadReferences = (variable) => pipe(variable.references, Arr.filter((ref) => ref.isRead()));
/**
* Get the write references for a variable.
*
* @since 0.2.0
*/
const getWriteReferences = (variable) => pipe(variable.references, Arr.filter((ref) => ref.isWrite()));
/**
* Get the parent (upper) scope.
*
* @since 0.2.0
*/
const upper = (scope) => Option.fromNullishOr(scope.upper);
/**
* Get the child scopes.
*
* @since 0.2.0
*/
const childScopes = (scope) => scope.childScopes;
/**
* Get all variables in a scope.
*
* @since 0.2.0
*/
const variables = (scope) => scope.variables;
/**
* Get "through" references (unresolved in this scope).
*
* @since 0.2.0
*/
const throughReferences = (scope) => scope.through;
/**
* Check whether a scope is strict mode.
*
* @since 0.2.0
*/
const isStrict = (scope) => scope.isStrict;
//#endregion
//#region src/SourceCode.ts
var SourceCode_exports = /* @__PURE__ */ __exportAll({
	commentsExistBetween: () => commentsExistBetween,
	getAllComments: () => getAllComments,
	getAncestors: () => getAncestors,
	getCommentsAfter: () => getCommentsAfter,
	getCommentsBefore: () => getCommentsBefore,
	getCommentsInside: () => getCommentsInside,
	getDeclaredVariables: () => getDeclaredVariables,
	getFirstToken: () => getFirstToken,
	getFirstTokenBetween: () => getFirstTokenBetween,
	getIndexFromLoc: () => getIndexFromLoc,
	getJSDocComment: () => getJSDocComment,
	getLastToken: () => getLastToken,
	getLines: () => getLines,
	getLocFromIndex: () => getLocFromIndex,
	getNodeByRangeIndex: () => getNodeByRangeIndex,
	getNodeText: () => getNodeText,
	getRange: () => getRange,
	getScope: () => getScope,
	getText: () => getText,
	getTokenAfter: () => getTokenAfter,
	getTokenBefore: () => getTokenBefore,
	getTokenByRangeStart: () => getTokenByRangeStart,
	getTokens: () => getTokens,
	getTokensBetween: () => getTokensBetween,
	isGlobalReference: () => isGlobalReference,
	isSpaceBetween: () => isSpaceBetween,
	markVariableAsUsed: () => markVariableAsUsed
});
/** @internal */
const withSourceCode = (fn) => Effect.service(RuleContext).pipe(Effect.map((ctx) => fn(ctx.sourceCode)));
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
const getText = () => withSourceCode((sc) => sc.getText(null));
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
const getNodeText = (node, beforeCount, afterCount) => withSourceCode((sc) => sc.getText(node, beforeCount, afterCount));
/**
* Get the ancestor nodes of the given node, from innermost to outermost.
*
* Note: oxlint types `getAncestors` as returning `Node[]` where `Node`
* is the base `Span` interface. At runtime these are full `ESTree.Node`
* values — the cast bridges this upstream type gap at the FFI boundary.
*
* @since 0.2.0
*/
const getAncestors = (node) => withSourceCode((sc) => sc.getAncestors(node));
/**
* Get the AST node that contains the given source offset.
*
* Returns `Option.none()` when no node spans that offset.
*
* @since 0.2.0
*/
const getNodeByRangeIndex = (offset) => withSourceCode((sc) => Option.fromNullishOr(sc.getNodeByRangeIndex(offset)));
/**
* Convert a source offset (0-based) to a `{ line, column }` location.
*
* @since 0.2.0
*/
const getLocFromIndex = (offset) => withSourceCode((sc) => sc.getLocFromIndex(offset));
/**
* Convert a `{ line, column }` location to a source offset (0-based).
*
* @since 0.2.0
*/
const getIndexFromLoc = (loc) => withSourceCode((sc) => sc.getIndexFromLoc(loc));
/**
* Get the range `[start, end]` for a node or token.
*
* @since 0.2.0
*/
const getRange = (nodeOrToken) => withSourceCode((sc) => sc.getRange(nodeOrToken));
/**
* Get the first token of a node.
*
* @since 0.2.0
*/
const getFirstToken = (node) => withSourceCode((sc) => Option.fromNullishOr(sc.getFirstToken(node)));
/**
* Get the last token of a node.
*
* @since 0.2.0
*/
const getLastToken = (node) => withSourceCode((sc) => Option.fromNullishOr(sc.getLastToken(node)));
/**
* Get all tokens for a node.
*
* @since 0.2.0
*/
const getTokens = (node) => withSourceCode((sc) => sc.getTokens(node));
/**
* Get the token before a node or token.
*
* @since 0.2.0
*/
const getTokenBefore = (nodeOrToken) => withSourceCode((sc) => Option.fromNullishOr(sc.getTokenBefore(nodeOrToken)));
/**
* Get the token after a node or token.
*
* @since 0.2.0
*/
const getTokenAfter = (nodeOrToken) => withSourceCode((sc) => Option.fromNullishOr(sc.getTokenAfter(nodeOrToken)));
/**
* Get all tokens between two nodes/tokens.
*
* @since 0.2.0
*/
const getTokensBetween = (left, right) => withSourceCode((sc) => sc.getTokensBetween(left, right));
/**
* Get the first token between two nodes/tokens.
*
* @since 0.2.0
*/
const getFirstTokenBetween = (left, right) => withSourceCode((sc) => Option.fromNullishOr(sc.getFirstTokenBetween(left, right)));
/**
* Find a token by its range start offset.
*
* @since 0.2.0
*/
const getTokenByRangeStart = (offset) => withSourceCode((sc) => Option.fromNullishOr(sc.getTokenByRangeStart(offset)));
/**
* Get all comments in the file.
*
* @since 0.2.0
*/
const getAllComments = () => withSourceCode((sc) => sc.getAllComments());
/**
* Get comments before a node or token.
*
* @since 0.2.0
*/
const getCommentsBefore = (nodeOrToken) => withSourceCode((sc) => sc.getCommentsBefore(nodeOrToken));
/**
* Get comments after a node or token.
*
* @since 0.2.0
*/
const getCommentsAfter = (nodeOrToken) => withSourceCode((sc) => sc.getCommentsAfter(nodeOrToken));
/**
* Get comments inside a node.
*
* @since 0.2.0
*/
const getCommentsInside = (node) => withSourceCode((sc) => sc.getCommentsInside(node));
/**
* Check whether comments exist between two nodes/tokens.
*
* @since 0.2.0
*/
const commentsExistBetween = (left, right) => withSourceCode((sc) => sc.commentsExistBetween(left, right));
/**
* Get the JSDoc comment for a node.
*
* @deprecated Upstream deprecation. Use `getCommentsBefore` instead.
* @since 0.2.0
*/
const getJSDocComment = (node) => withSourceCode((sc) => Option.fromNullishOr(sc.getJSDocComment(node)));
/**
* Get the scope for a node.
*
* @since 0.2.0
*/
const getScope = (node) => withSourceCode((sc) => sc.getScope(node));
/**
* Get declared variables for a node.
*
* @since 0.2.0
*/
const getDeclaredVariables = (node) => withSourceCode((sc) => sc.getDeclaredVariables(node));
/**
* Check whether a node is a global reference.
*
* @since 0.2.0
*/
const isGlobalReference = (node) => withSourceCode((sc) => sc.isGlobalReference(node));
/**
* Mark a variable as used in the scope of the given node.
*
* @since 0.2.0
*/
const markVariableAsUsed = (name, refNode) => withSourceCode((sc) => sc.markVariableAsUsed(name, refNode));
/**
* Check whether there is a space between two nodes/tokens.
*
* @since 0.2.0
*/
const isSpaceBetween = (first, second) => withSourceCode((sc) => sc.isSpaceBetween(first, second));
/**
* Get all source lines.
*
* @since 0.2.0
*/
const getLines = () => withSourceCode((sc) => sc.getLines());
//#endregion
//#region src/Token.ts
var Token_exports = /* @__PURE__ */ __exportAll({
	isBoolean: () => isBoolean,
	isIdentifier: () => isIdentifier,
	isKeyword: () => isKeyword,
	isNull: () => isNull,
	isNumeric: () => isNumeric,
	isPrivateIdentifier: () => isPrivateIdentifier,
	isPunctuator: () => isPunctuator,
	isRegularExpression: () => isRegularExpression,
	isString: () => isString,
	isTemplate: () => isTemplate,
	type: () => type,
	value: () => value
});
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
const isKeyword = dual(2, (token, keyword) => token.type === "Keyword" && token.value === keyword);
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
const isPunctuator = dual(2, (token, value) => token.type === "Punctuator" && token.value === value);
/**
* Check whether a token is an identifier.
*
* @since 0.2.0
*/
const isIdentifier = (token) => token.type === "Identifier";
/**
* Check whether a token is a string literal.
*
* @since 0.2.0
*/
const isString = (token) => token.type === "String";
/**
* Check whether a token is a numeric literal.
*
* @since 0.2.0
*/
const isNumeric = (token) => token.type === "Numeric";
/**
* Check whether a token is a boolean literal.
*
* @since 0.2.0
*/
const isBoolean = (token) => token.type === "Boolean";
/**
* Check whether a token is a null literal.
*
* @since 0.2.0
*/
const isNull = (token) => token.type === "Null";
/**
* Check whether a token is a template literal part.
*
* @since 0.2.0
*/
const isTemplate = (token) => token.type === "Template";
/**
* Check whether a token is a regular expression literal.
*
* @since 0.2.0
*/
const isRegularExpression = (token) => token.type === "RegularExpression";
/**
* Check whether a token is a private identifier (e.g. `#foo`).
*
* @since 0.2.0
*/
const isPrivateIdentifier = (token) => token.type === "PrivateIdentifier";
/**
* Get the string value of a token.
*
* @since 0.2.0
*/
const value = (token) => token.value;
/**
* Get the type discriminant of a token.
*
* @since 0.2.0
*/
const type = (token) => token.type;
//#endregion
export { AST_exports as AST, Comment_exports as Comment, Diagnostic_exports as Diagnostic, FileContext_exports as FileContext, Plugin_exports as Plugin, Rule_exports as Rule, RuleContext, Scope_exports as Scope, SourceCode_exports as SourceCode, Token_exports as Token, Visitor_exports as Visitor };
