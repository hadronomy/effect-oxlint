import { n as fromOxlintContext, t as RuleContext } from "./RuleContext.js";
import * as Arr from "effect/Array";
import * as Option from "effect/Option";
import * as P from "effect/Predicate";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
//#region src/Testing.ts
/**
* Minimal AST node builders for tests.
*
* These produce mock objects satisfying the type shapes that AST/Visitor/Rule
* modules expect. They use boundary casts at the seam between test mock
* data and oxlint's strict branded types.
*
* @since 0.2.0
*/
/**
* Identifier: `{ type: "Identifier", name }`
*
* @since 0.2.0
*/
const id = (name) => ({
	type: "Identifier",
	name
});
/**
* MemberExpression: `obj.prop` (non-computed)
*
* @since 0.2.0
*/
const memberExpr = (obj, prop) => ({
	type: "MemberExpression",
	object: id(obj),
	property: id(prop),
	computed: false,
	optional: false
});
/**
* MemberExpression: `obj[prop]` (computed)
*
* @since 0.2.0
*/
const computedMemberExpr = (obj, prop) => ({
	type: "MemberExpression",
	object: id(obj),
	property: id(prop),
	computed: true,
	optional: false
});
/**
* Chained MemberExpression: `a.b.c` (non-computed)
*
* @since 0.2.0
*/
const chainedMemberExpr = (...names) => {
	const [first, second, ...rest] = names;
	const initial = memberExpr(first, second);
	return Arr.reduce(rest, initial, (acc, name) => ({
		type: "MemberExpression",
		object: acc,
		property: id(name),
		computed: false,
		optional: false
	}));
};
/**
* CallExpression with bare identifier callee: `name(args)`
*
* @since 0.2.0
*/
const callExpr = (name, args = []) => ({
	type: "CallExpression",
	callee: id(name),
	arguments: args
});
/**
* CallExpression with MemberExpression callee: `obj.prop(args)`
*
* @since 0.2.0
*/
const callOfMember = (obj, prop, args = []) => ({
	type: "CallExpression",
	callee: memberExpr(obj, prop),
	arguments: args
});
/**
* ImportDeclaration: `import ... from "source"`
*
* @since 0.2.0
*/
const importDecl = (source) => ({
	type: "ImportDeclaration",
	source: {
		type: "Literal",
		value: source
	},
	specifiers: []
});
/**
* String literal: `{ type: "Literal", value }`
*
* @since 0.2.0
*/
const strLiteral = (value) => ({
	type: "Literal",
	value
});
/**
* Numeric literal: `{ type: "Literal", value }`
*
* @since 0.2.0
*/
const numLiteral = (value) => ({
	type: "Literal",
	value
});
/**
* Boolean literal: `{ type: "Literal", value }`
*
* @since 0.2.0
*/
const boolLiteral = (value) => ({
	type: "Literal",
	value
});
/**
* ObjectExpression with identifier-keyed properties.
*
* @since 0.2.0
*/
const objectExpr = (properties) => ({
	type: "ObjectExpression",
	properties: Arr.map(properties, (p) => ({
		type: "Property",
		key: id(p.key),
		value: p.value ?? strLiteral("")
	}))
});
/**
* ObjectExpression with string literal keys.
*
* @since 0.2.0
*/
const objectExprLiteralKeys = (properties) => ({
	type: "ObjectExpression",
	properties: Arr.map(properties, (p) => ({
		type: "Property",
		key: strLiteral(p.key),
		value: p.value ?? strLiteral("")
	}))
});
/**
* ObjectExpression with a SpreadElement.
*
* @since 0.2.0
*/
const objectExprWithSpread = (spreadArg) => ({
	type: "ObjectExpression",
	properties: [{
		type: "SpreadElement",
		argument: spreadArg
	}]
});
/**
* ThrowStatement.
*
* @since 0.2.0
*/
const throwStmt = () => ({ type: "ThrowStatement" });
/**
* TryStatement.
*
* @since 0.2.0
*/
const tryStmt = () => ({ type: "TryStatement" });
/**
* ReturnStatement.
*
* @since 0.2.0
*/
const returnStmt = (argument) => ({
	type: "ReturnStatement",
	argument: argument ?? null
});
/**
* BlockStatement.
*
* @since 0.2.0
*/
const blockStmt = (body = []) => ({
	type: "BlockStatement",
	body: Array.from(body)
});
/**
* ArrowFunctionExpression.
*
* @since 0.2.0
*/
const arrowFn = (body, params = []) => ({
	type: "ArrowFunctionExpression",
	params: Array.from(params),
	body: body ?? blockStmt(),
	expression: false,
	async: false
});
/**
* VariableDeclaration: `const/let/var name = init`
*
* @since 0.2.0
*/
const varDecl = (kind, name, init) => ({
	type: "VariableDeclaration",
	kind,
	declarations: [{
		type: "VariableDeclarator",
		id: id(name),
		init: init ?? null
	}]
});
/**
* ExpressionStatement.
*
* @since 0.2.0
*/
const exprStmt = (expression) => ({
	type: "ExpressionStatement",
	expression
});
/**
* Program node.
*
* @since 0.2.0
*/
const program = (body = [], comments = []) => ({
	type: "Program",
	body: Array.from(body),
	comments: Array.from(comments),
	sourceType: "module"
});
/**
* IfStatement.
*
* All parameters are optional — `ifStmt()` produces a minimal
* `{ type: 'IfStatement' }` node suitable for enter/exit tracking.
*
* @since 0.2.0
*/
const ifStmt = (test, consequent, alternate) => ({
	type: "IfStatement",
	test: test ?? null,
	consequent: consequent ?? null,
	alternate: alternate ?? null
});
/**
* BinaryExpression.
*
* @since 0.2.0
*/
const binaryExpr = (operator, left, right) => ({
	type: "BinaryExpression",
	operator,
	left,
	right
});
/**
* NewExpression: `new callee(args)`
*
* When `callee` is a string it is auto-wrapped in `id()`, so
* `newExpr('Date')` is equivalent to `newExpr(id('Date'))`.
*
* @since 0.2.0
*/
const newExpr = (callee, args = []) => ({
	type: "NewExpression",
	callee: P.isString(callee) ? id(callee) : callee,
	arguments: Array.from(args)
});
/**
* A generic AST node with type and optional parent pointer.
*
* @since 0.2.0
*/
const astNode = (type, parent) => ({
	type,
	parent
});
/**
* Build a parent chain from outermost → innermost.
*
* Returns the innermost node with `.parent` links to each ancestor.
*
* @example
* ```ts
* // Creates: FunctionDeclaration → BlockStatement → ThrowStatement
* withParentChain('FunctionDeclaration', 'BlockStatement', 'ThrowStatement')
* ```
*
* @since 0.2.0
*/
const withParentChain = (first, ...rest) => Arr.reduce(rest, astNode(first), (parent, type) => astNode(type, parent));
/**
* Mock Token.
*
* @since 0.2.0
*/
const token = (type, value) => ({
	type,
	value,
	start: 0,
	end: value.length,
	range: [0, value.length],
	loc: {
		start: {
			line: 1,
			column: 0
		},
		end: {
			line: 1,
			column: value.length
		}
	},
	regex: void 0
});
/**
* Mock Comment.
*
* @since 0.2.0
*/
const comment = (type, value) => ({
	type,
	value,
	start: 0,
	end: value.length + 4,
	range: [0, value.length + 4],
	loc: {
		start: {
			line: 1,
			column: 0
		},
		end: {
			line: 1,
			column: value.length + 4
		}
	}
});
/**
* Mock Scope with minimal surface.
*
* @since 0.2.0
*/
const scope = (opts = {}) => {
	const vars = Array.from(opts.variables ?? []);
	const set = new Map(vars.map((v) => [v.name, v]));
	return {
		type: opts.type ?? "function",
		isStrict: opts.isStrict ?? false,
		upper: opts.upper ?? null,
		childScopes: [],
		variableScope: null,
		block: {},
		variables: vars,
		set,
		references: [],
		through: [],
		functionExpressionScope: false
	};
};
/**
* Mock Variable.
*
* @since 0.2.0
*/
const variable = (name, opts = {}) => ({
	name,
	scope: {},
	identifiers: [id(name)],
	references: Array.from(opts.references ?? []),
	defs: []
});
/**
* SwitchStatement.
*
* @since 0.2.0
*/
const switchStmt = () => ({
	type: "SwitchStatement",
	discriminant: null,
	cases: []
});
/**
* ForStatement.
*
* @since 0.2.0
*/
const forStmt = () => ({
	type: "ForStatement",
	init: null,
	test: null,
	update: null,
	body: blockStmt()
});
/**
* ForInStatement.
*
* @since 0.2.0
*/
const forInStmt = () => ({
	type: "ForInStatement",
	left: id("_"),
	right: id("_"),
	body: blockStmt()
});
/**
* ForOfStatement.
*
* @since 0.2.0
*/
const forOfStmt = () => ({
	type: "ForOfStatement",
	await: false,
	left: id("_"),
	right: id("_"),
	body: blockStmt()
});
/**
* WhileStatement.
*
* @since 0.2.0
*/
const whileStmt = () => ({
	type: "WhileStatement",
	test: boolLiteral(true),
	body: blockStmt()
});
/**
* DoWhileStatement.
*
* @since 0.2.0
*/
const doWhileStmt = () => ({
	type: "DoWhileStatement",
	test: boolLiteral(true),
	body: blockStmt()
});
/**
* YieldExpression.
*
* @since 0.2.0
*/
const yieldExpr = (argument, delegate = false) => ({
	type: "YieldExpression",
	argument: argument ?? null,
	delegate
});
/**
* UnaryExpression: `operator argument`
*
* @since 0.2.0
*/
const unaryExpr = (operator, argument) => ({
	type: "UnaryExpression",
	operator,
	prefix: true,
	argument
});
/**
* VariableDeclarator (standalone, without wrapping VariableDeclaration).
*
* @since 0.2.0
*/
const varDeclarator = (name, init) => ({
	type: "VariableDeclarator",
	id: id(name),
	init: init ?? null
});
/**
* ExportNamedDeclaration.
*
* @since 0.2.0
*/
const exportNamedDecl = (declaration) => ({
	type: "ExportNamedDeclaration",
	declaration: declaration ?? null,
	specifiers: [],
	source: null
});
/**
* ImportDeclaration with specifiers: `import { a, b } from "source"`
*
* @since 0.2.0
*/
const importDeclWithSpecifiers = (source, specifiers, importKind = "value") => ({
	type: "ImportDeclaration",
	source: {
		type: "Literal",
		value: source
	},
	specifiers: Array.from(specifiers),
	importKind
});
/**
* ImportSpecifier: `{ imported as local }`
*
* @since 0.2.0
*/
const importSpecifier = (imported, local, importKind = "value") => ({
	type: "ImportSpecifier",
	imported: id(imported),
	local: id(local ?? imported),
	importKind
});
/**
* ImportNamespaceSpecifier: `* as local`
*
* @since 0.2.0
*/
const importNamespaceSpecifier = (local) => ({
	type: "ImportNamespaceSpecifier",
	local: id(local)
});
/**
* TSAsExpression: `expr as Type`
*
* @since 0.2.0
*/
const tsAsExpr = (typeKind, parent) => ({
	type: "TSAsExpression",
	expression: id("_"),
	typeAnnotation: { type: typeKind },
	parent
});
/**
* TSUnionType: `A | B | C`
*
* @since 0.2.0
*/
const tsUnionType = (typeKinds) => ({
	type: "TSUnionType",
	types: Arr.map(typeKinds, (t) => ({ type: t }))
});
/**
* TSTypeReference: `TypeName`
*
* @since 0.2.0
*/
const tsTypeRef = (name) => ({
	type: "TSTypeReference",
	typeName: id(name),
	typeArguments: null
});
/**
* TSTypeLiteral: `{ ... }` with N members.
*
* @since 0.2.0
*/
const tsTypeLiteral = (memberCount) => ({
	type: "TSTypeLiteral",
	members: Array.from({ length: memberCount }, () => ({ type: "TSPropertySignature" }))
});
/**
* TSInterfaceDeclaration: `interface Name { }`
*
* @since 0.2.0
*/
const interfaceDecl = (name) => ({
	type: "TSInterfaceDeclaration",
	id: {
		type: "BindingIdentifier",
		name
	},
	body: {
		type: "TSInterfaceBody",
		body: []
	}
});
/**
* TSTypeAliasDeclaration: `type Name = ...`
*
* @since 0.2.0
*/
const typeAliasDecl = (name) => ({
	type: "TSTypeAliasDeclaration",
	id: {
		type: "BindingIdentifier",
		name
	},
	typeAnnotation: null
});
/**
* ClassDeclaration with optional superClass and body members.
*
* @example
* ```ts
* // Simple: class Foo {}
* classDecl('Foo')
*
* // With super: class Foo extends Bar {}
* classDecl('Foo', { superClass: Testing.id('Bar') })
*
* // With members: class Foo { x; static y() {} }
* classDecl('Foo', {
*     members: [Testing.propertyDef('x'), Testing.methodDef('y', true)]
* })
* ```
*
* @since 0.2.0
*/
const classDecl = (name, opts = {}) => ({
	type: "ClassDeclaration",
	id: {
		type: "BindingIdentifier",
		name
	},
	superClass: opts.superClass ?? null,
	body: {
		type: "ClassBody",
		body: Array.from(opts.members ?? [])
	},
	decorators: []
});
/**
* PropertyDefinition: class field.
*
* @since 0.2.0
*/
const propertyDef = (name, isStatic = false) => ({
	type: "PropertyDefinition",
	key: id(name),
	value: null,
	computed: false,
	static: isStatic,
	decorators: []
});
/**
* MethodDefinition: class method.
*
* @since 0.2.0
*/
const methodDef = (name, isStatic = false) => ({
	type: "MethodDefinition",
	key: id(name),
	kind: "method",
	value: arrowFn(),
	computed: false,
	static: isStatic,
	decorators: []
});
/**
* Create a mock oxlint `Context` and a diagnostics collector.
*
* The mock provides the minimal surface required by `RuleContext.fromOxlintContext`.
*
* @since 0.2.0
*/
const createMockContext = (opts = {}) => {
	const diagnostics = [];
	const filename = opts.filename ?? "/test/file.ts";
	const cwd = opts.cwd ?? "/test";
	const text = opts.sourceText ?? "";
	const comments = Array.from(opts.comments ?? []);
	const sourceCode = {
		text,
		ast: {
			type: "Program",
			body: [],
			comments
		},
		getText() {
			return text;
		},
		getAllComments() {
			return comments;
		},
		getLocFromIndex(index) {
			return {
				line: 1,
				column: index
			};
		},
		getIndexFromLoc(loc) {
			return loc.column;
		},
		getAncestors() {
			return [];
		},
		getScope() {
			return scope();
		},
		getDeclaredVariables() {
			return [];
		},
		isGlobalReference() {
			return false;
		},
		markVariableAsUsed() {
			return false;
		},
		getFirstToken() {
			return null;
		},
		getLastToken() {
			return null;
		},
		getTokens() {
			return [];
		},
		getTokenBefore() {
			return null;
		},
		getTokenAfter() {
			return null;
		},
		getTokensBetween() {
			return [];
		},
		getFirstTokenBetween() {
			return null;
		},
		getTokenByRangeStart() {
			return null;
		},
		getCommentsBefore() {
			return [];
		},
		getCommentsAfter() {
			return [];
		},
		getCommentsInside() {
			return [];
		},
		commentsExistBetween() {
			return false;
		},
		getJSDocComment() {
			return null;
		},
		getNodeByRangeIndex() {
			return null;
		},
		getRange() {
			return [0, 0];
		},
		getLoc() {
			return {
				start: {
					line: 1,
					column: 0
				},
				end: {
					line: 1,
					column: 0
				}
			};
		},
		getLines() {
			return text.split("\n");
		},
		isSpaceBetween() {
			return false;
		}
	};
	return {
		context: {
			id: "effect/test-rule",
			filename,
			physicalFilename: filename,
			cwd,
			options: opts.options ?? [],
			report(diagnostic) {
				diagnostics.push({ diagnostic });
			},
			getFilename: () => filename,
			getCwd: () => cwd,
			sourceCode,
			languageOptions: {
				sourceType: "module",
				ecmaVersion: 2024
			},
			settings: {},
			getSourceCode: () => sourceCode,
			getPhysicalFilename: () => filename,
			parserOptions: {},
			parserPath: void 0
		},
		diagnostics
	};
};
/**
* Create a `Layer` that provides a mock `RuleContext` service.
*
* Use in `it.effect` tests that need to `yield*` visitor handlers
* (which carry `RuleContext` in their context type).
*
* @since 0.2.0
*/
const mockRuleContextLayer = (opts) => {
	const { context } = createMockContext(opts);
	return Layer.succeed(RuleContext, fromOxlintContext(context));
};
/**
* Provide a mock `RuleContext` to an effect for testing.
*
* @since 0.2.0
*/
const withMockRuleContext = (effect, opts) => Effect.provide(effect, mockRuleContextLayer(opts));
/** @internal Call a visitor handler on a mock AST node. */
const callHandler = (visitors, key, visitorNode) => {
	const handler = visitors[key];
	if (handler) handler(visitorNode);
};
/**
* Run a rule with a single visitor event and collect diagnostics.
*
* @since 0.2.0
*/
const runRule = (rule, visitor, visitorNode, opts) => {
	const { context, diagnostics } = createMockContext(opts);
	callHandler(rule.create(context), visitor, visitorNode);
	return diagnostics;
};
/**
* Run a rule with multiple visitor/node events sequentially.
*
* Same context is shared so `Ref` state persists across calls.
*
* @since 0.2.0
*/
const runRuleMulti = (rule, pairs, opts) => {
	const { context, diagnostics } = createMockContext(opts);
	const visitors = rule.create(context);
	Arr.forEach(pairs, ([visitor, visitorNode]) => {
		callHandler(visitors, visitor, visitorNode);
	});
	return diagnostics;
};
/**
* Extract the diagnostic messages from a result array.
*
* Returns `Option.none()` when a diagnostic uses `messageId` instead
* of `message`, or when the message is `null`.
*
* @example
* ```ts
* import * as Option from 'effect/Option'
*
* const result = Testing.runRule(rule, 'ThrowStatement', Testing.throwStmt())
* expect(Testing.messages(result)).toEqual([Option.some('Use Effect.fail instead')])
* ```
*
* @since 0.2.0
*/
const messages = (result) => Arr.map(result, (r) => Option.fromNullishOr(r.diagnostic.message));
/**
* Extract the diagnostic messageIds from a result array.
*
* Returns `Option.none()` when a diagnostic uses `message` instead
* of `messageId`, or when the messageId is `null`.
*
* @since 0.2.0
*/
const messageIds = (result) => Arr.map(result, (r) => Option.fromNullishOr(r.diagnostic.messageId));
/**
* Assert that diagnostics match expected patterns.
*
* Each matcher is partially checked — only provided fields are compared.
* This allows flexible matching without specifying every field.
*
* @example
* ```ts
* Testing.expectDiagnostics(result, [
*   { message: 'No throw in Effect.gen' },
*   { messageId: 'noTryCatch' }
* ])
* ```
*
* @since 0.2.0
*/
const expectDiagnostics = (result, expected) => {
	if (result.length !== expected.length) throw new Error(`Expected ${expected.length} diagnostics, got ${result.length}:\n` + Arr.join(Arr.map(result, (r) => `  - ${r.diagnostic.message ?? r.diagnostic.messageId ?? "(unknown)"}`), "\n"));
	Arr.forEach(expected, (exp, i) => {
		const actual = result[i];
		if (actual === void 0) throw new Error(`Missing diagnostic at index ${i}`);
		if (exp.message !== void 0 && actual.diagnostic.message !== exp.message) throw new Error(`Diagnostic ${i}: expected message "${exp.message}", got "${actual.diagnostic.message}"`);
		if (exp.messageId !== void 0 && actual.diagnostic.messageId !== exp.messageId) throw new Error(`Diagnostic ${i}: expected messageId "${exp.messageId}", got "${actual.diagnostic.messageId}"`);
	});
};
/**
* Assert that no diagnostics were reported.
*
* @since 0.2.0
*/
const expectNoDiagnostics = (result) => Arr.match(result, {
	onEmpty: () => {},
	onNonEmpty: (items) => {
		throw new Error(`Expected no diagnostics, got ${items.length}:\n` + Arr.join(Arr.map(items, (r) => `  - ${r.diagnostic.message ?? r.diagnostic.messageId ?? "(unknown)"}`), "\n"));
	}
});
//#endregion
export { arrowFn, astNode, binaryExpr, blockStmt, boolLiteral, callExpr, callOfMember, chainedMemberExpr, classDecl, comment, computedMemberExpr, createMockContext, doWhileStmt, expectDiagnostics, expectNoDiagnostics, exportNamedDecl, exprStmt, forInStmt, forOfStmt, forStmt, id, ifStmt, importDecl, importDeclWithSpecifiers, importNamespaceSpecifier, importSpecifier, interfaceDecl, memberExpr, messageIds, messages, methodDef, mockRuleContextLayer, newExpr, numLiteral, objectExpr, objectExprLiteralKeys, objectExprWithSpread, program, propertyDef, returnStmt, runRule, runRuleMulti, scope, strLiteral, switchStmt, throwStmt, token, tryStmt, tsAsExpr, tsTypeLiteral, tsTypeRef, tsUnionType, typeAliasDecl, unaryExpr, varDecl, varDeclarator, variable, whileStmt, withMockRuleContext, withParentChain, yieldExpr };
