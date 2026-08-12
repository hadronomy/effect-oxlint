import { t as RuleContext } from "./RuleContext.js";
import * as Option from "effect/Option";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Comment, Context, CreateRule, Diagnostic, ESTree, Scope, Token, Variable } from "@oxlint/plugins";

//#region src/Testing.d.ts
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
declare const id: (name: string) => ESTree.IdentifierName;
/**
 * MemberExpression: `obj.prop` (non-computed)
 *
 * @since 0.2.0
 */
declare const memberExpr: (obj: string, prop: string) => ESTree.MemberExpression;
/**
 * MemberExpression: `obj[prop]` (computed)
 *
 * @since 0.2.0
 */
declare const computedMemberExpr: (obj: string, prop: string) => ESTree.MemberExpression;
/**
 * Chained MemberExpression: `a.b.c` (non-computed)
 *
 * @since 0.2.0
 */
declare const chainedMemberExpr: (...names: readonly [string, string, ...ReadonlyArray<string>]) => ESTree.MemberExpression;
/**
 * CallExpression with bare identifier callee: `name(args)`
 *
 * @since 0.2.0
 */
declare const callExpr: (name: string, args?: ReadonlyArray<unknown>) => ESTree.CallExpression;
/**
 * CallExpression with MemberExpression callee: `obj.prop(args)`
 *
 * @since 0.2.0
 */
declare const callOfMember: (obj: string, prop: string, args?: ReadonlyArray<unknown>) => ESTree.CallExpression;
/**
 * ImportDeclaration: `import ... from "source"`
 *
 * @since 0.2.0
 */
declare const importDecl: (source: string) => ESTree.ImportDeclaration;
/**
 * String literal: `{ type: "Literal", value }`
 *
 * @since 0.2.0
 */
declare const strLiteral: (value: string) => ESTree.StringLiteral;
/**
 * Numeric literal: `{ type: "Literal", value }`
 *
 * @since 0.2.0
 */
declare const numLiteral: (value: number) => ESTree.NumericLiteral;
/**
 * Boolean literal: `{ type: "Literal", value }`
 *
 * @since 0.2.0
 */
declare const boolLiteral: (value: boolean) => ESTree.BooleanLiteral;
/**
 * ObjectExpression with identifier-keyed properties.
 *
 * @since 0.2.0
 */
declare const objectExpr: (properties: ReadonlyArray<{
  readonly key: string;
  readonly value?: unknown;
}>) => ESTree.ObjectExpression;
/**
 * ObjectExpression with string literal keys.
 *
 * @since 0.2.0
 */
declare const objectExprLiteralKeys: (properties: ReadonlyArray<{
  readonly key: string;
  readonly value?: unknown;
}>) => ESTree.ObjectExpression;
/**
 * ObjectExpression with a SpreadElement.
 *
 * @since 0.2.0
 */
declare const objectExprWithSpread: (spreadArg: unknown) => ESTree.ObjectExpression;
/**
 * ThrowStatement.
 *
 * @since 0.2.0
 */
declare const throwStmt: () => ESTree.ThrowStatement;
/**
 * TryStatement.
 *
 * @since 0.2.0
 */
declare const tryStmt: () => ESTree.Node;
/**
 * ReturnStatement.
 *
 * @since 0.2.0
 */
declare const returnStmt: (argument?: unknown) => ESTree.ReturnStatement;
/**
 * BlockStatement.
 *
 * @since 0.2.0
 */
declare const blockStmt: (body?: ReadonlyArray<unknown>) => ESTree.BlockStatement;
/**
 * ArrowFunctionExpression.
 *
 * @since 0.2.0
 */
declare const arrowFn: (body?: unknown, params?: ReadonlyArray<unknown>) => ESTree.ArrowFunctionExpression;
/**
 * VariableDeclaration: `const/let/var name = init`
 *
 * @since 0.2.0
 */
declare const varDecl: (kind: "const" | "let" | "var", name: string, init?: unknown) => ESTree.VariableDeclaration;
/**
 * ExpressionStatement.
 *
 * @since 0.2.0
 */
declare const exprStmt: (expression: unknown) => ESTree.ExpressionStatement;
/**
 * Program node.
 *
 * @since 0.2.0
 */
declare const program: (body?: ReadonlyArray<unknown>, comments?: ReadonlyArray<unknown>) => ESTree.Program;
/**
 * IfStatement.
 *
 * All parameters are optional — `ifStmt()` produces a minimal
 * `{ type: 'IfStatement' }` node suitable for enter/exit tracking.
 *
 * @since 0.2.0
 */
declare const ifStmt: (test?: unknown, consequent?: unknown, alternate?: unknown) => ESTree.IfStatement;
/**
 * BinaryExpression.
 *
 * @since 0.2.0
 */
declare const binaryExpr: (operator: string, left: unknown, right: unknown) => ESTree.BinaryExpression;
/**
 * NewExpression: `new callee(args)`
 *
 * When `callee` is a string it is auto-wrapped in `id()`, so
 * `newExpr('Date')` is equivalent to `newExpr(id('Date'))`.
 *
 * @since 0.2.0
 */
declare const newExpr: {
  (callee: string, args?: ReadonlyArray<unknown>): ESTree.NewExpression;
  (callee: unknown, args?: ReadonlyArray<unknown>): ESTree.NewExpression;
};
/**
 * A generic AST node with type and optional parent pointer.
 *
 * @since 0.2.0
 */
declare const astNode: (type: string, parent?: {
  readonly type: string;
  readonly parent?: unknown;
}) => {
  readonly type: string;
  readonly parent?: unknown;
};
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
declare const withParentChain: (first: string, ...rest: ReadonlyArray<string>) => {
  readonly type: string;
  readonly parent?: unknown;
};
/**
 * Mock Token.
 *
 * @since 0.2.0
 */
declare const token: (type: Token["type"], value: string) => Token;
/**
 * Mock Comment.
 *
 * @since 0.2.0
 */
declare const comment: (type: Comment["type"], value: string) => Comment;
/**
 * Mock Scope with minimal surface.
 *
 * @since 0.2.0
 */
declare const scope: (opts?: {
  readonly type?: Scope["type"];
  readonly isStrict?: boolean;
  readonly variables?: ReadonlyArray<Variable>;
  readonly upper?: Scope | null;
}) => Scope;
/**
 * Mock Variable.
 *
 * @since 0.2.0
 */
declare const variable: (name: string, opts?: {
  readonly references?: ReadonlyArray<{
    readonly isRead: () => boolean;
    readonly isWrite: () => boolean;
    readonly isReadOnly: () => boolean;
    readonly isWriteOnly: () => boolean;
    readonly isReadWrite: () => boolean;
  }>;
}) => Variable;
/**
 * SwitchStatement.
 *
 * @since 0.2.0
 */
declare const switchStmt: () => ESTree.SwitchStatement;
/**
 * ForStatement.
 *
 * @since 0.2.0
 */
declare const forStmt: () => ESTree.ForStatement;
/**
 * ForInStatement.
 *
 * @since 0.2.0
 */
declare const forInStmt: () => ESTree.ForInStatement;
/**
 * ForOfStatement.
 *
 * @since 0.2.0
 */
declare const forOfStmt: () => ESTree.ForOfStatement;
/**
 * WhileStatement.
 *
 * @since 0.2.0
 */
declare const whileStmt: () => ESTree.WhileStatement;
/**
 * DoWhileStatement.
 *
 * @since 0.2.0
 */
declare const doWhileStmt: () => ESTree.DoWhileStatement;
/**
 * YieldExpression.
 *
 * @since 0.2.0
 */
declare const yieldExpr: (argument?: unknown, delegate?: boolean) => ESTree.YieldExpression;
/**
 * UnaryExpression: `operator argument`
 *
 * @since 0.2.0
 */
declare const unaryExpr: (operator: string, argument: unknown) => ESTree.UnaryExpression;
/**
 * VariableDeclarator (standalone, without wrapping VariableDeclaration).
 *
 * @since 0.2.0
 */
declare const varDeclarator: (name: string, init?: unknown) => ESTree.VariableDeclarator;
/**
 * ExportNamedDeclaration.
 *
 * @since 0.2.0
 */
declare const exportNamedDecl: (declaration?: unknown) => ESTree.ExportNamedDeclaration;
/**
 * ImportDeclaration with specifiers: `import { a, b } from "source"`
 *
 * @since 0.2.0
 */
declare const importDeclWithSpecifiers: (source: string, specifiers: ReadonlyArray<unknown>, importKind?: string) => ESTree.ImportDeclaration;
/**
 * ImportSpecifier: `{ imported as local }`
 *
 * @since 0.2.0
 */
declare const importSpecifier: (imported: string, local?: string, importKind?: string) => ESTree.ImportSpecifier;
/**
 * ImportNamespaceSpecifier: `* as local`
 *
 * @since 0.2.0
 */
declare const importNamespaceSpecifier: (local: string) => ESTree.ImportNamespaceSpecifier;
/**
 * TSAsExpression: `expr as Type`
 *
 * @since 0.2.0
 */
declare const tsAsExpr: (typeKind: string, parent?: {
  readonly type: string;
  readonly parent?: unknown;
}) => ESTree.TSAsExpression;
/**
 * TSUnionType: `A | B | C`
 *
 * @since 0.2.0
 */
declare const tsUnionType: (typeKinds: ReadonlyArray<string>) => ESTree.TSUnionType;
/**
 * TSTypeReference: `TypeName`
 *
 * @since 0.2.0
 */
declare const tsTypeRef: (name: string) => ESTree.TSTypeReference;
/**
 * TSTypeLiteral: `{ ... }` with N members.
 *
 * @since 0.2.0
 */
declare const tsTypeLiteral: (memberCount: number) => ESTree.TSTypeLiteral;
/**
 * TSInterfaceDeclaration: `interface Name { }`
 *
 * @since 0.2.0
 */
declare const interfaceDecl: (name: string) => ESTree.TSInterfaceDeclaration;
/**
 * TSTypeAliasDeclaration: `type Name = ...`
 *
 * @since 0.2.0
 */
declare const typeAliasDecl: (name: string) => ESTree.TSTypeAliasDeclaration;
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
declare const classDecl: (name: string, opts?: {
  readonly superClass?: unknown;
  readonly members?: ReadonlyArray<unknown>;
}) => ESTree.Class;
/**
 * PropertyDefinition: class field.
 *
 * @since 0.2.0
 */
declare const propertyDef: (name: string, isStatic?: boolean) => ESTree.PropertyDefinition;
/**
 * MethodDefinition: class method.
 *
 * @since 0.2.0
 */
declare const methodDef: (name: string, isStatic?: boolean) => ESTree.MethodDefinition;
/**
 * A collected diagnostic from the mock context's `report`.
 *
 * @since 0.2.0
 */
interface ReportedDiagnostic {
  readonly diagnostic: Diagnostic;
}
/**
 * Options for creating a mock oxlint Context.
 *
 * @since 0.2.0
 */
interface MockContextOptions {
  readonly filename?: string;
  readonly cwd?: string;
  readonly options?: ReadonlyArray<unknown>;
  readonly sourceText?: string;
  readonly comments?: ReadonlyArray<Comment>;
}
/**
 * A mock oxlint `Context` paired with its diagnostics collector.
 *
 * @since 0.3.1
 */
interface MockContext {
  /** Mock context passed to oxlint rule `create` functions. */
  readonly context: Context;
  /** Diagnostics reported while a rule runs against the mock context. */
  readonly diagnostics: Array<ReportedDiagnostic>;
}
/**
 * Create a mock oxlint `Context` and a diagnostics collector.
 *
 * The mock provides the minimal surface required by `RuleContext.fromOxlintContext`.
 *
 * @since 0.2.0
 */
declare const createMockContext: (opts?: MockContextOptions) => MockContext;
/**
 * Create a `Layer` that provides a mock `RuleContext` service.
 *
 * Use in `it.effect` tests that need to `yield*` visitor handlers
 * (which carry `RuleContext` in their context type).
 *
 * @since 0.2.0
 */
declare const mockRuleContextLayer: (opts?: MockContextOptions) => Layer.Layer<RuleContext>;
/**
 * Provide a mock `RuleContext` to an effect for testing.
 *
 * @since 0.2.0
 */
declare const withMockRuleContext: <A, E>(effect: Effect.Effect<A, E, RuleContext>, opts?: MockContextOptions) => Effect.Effect<A, E>;
/**
 * Run a rule with a single visitor event and collect diagnostics.
 *
 * @since 0.2.0
 */
declare const runRule: (rule: CreateRule, visitor: string, visitorNode: unknown, opts?: MockContextOptions) => ReadonlyArray<ReportedDiagnostic>;
/**
 * Run a rule with multiple visitor/node events sequentially.
 *
 * Same context is shared so `Ref` state persists across calls.
 *
 * @since 0.2.0
 */
declare const runRuleMulti: (rule: CreateRule, pairs: ReadonlyArray<readonly [visitor: string, node: unknown]>, opts?: MockContextOptions) => ReadonlyArray<ReportedDiagnostic>;
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
declare const messages: (result: ReadonlyArray<ReportedDiagnostic>) => ReadonlyArray<Option.Option<string>>;
/**
 * Extract the diagnostic messageIds from a result array.
 *
 * Returns `Option.none()` when a diagnostic uses `message` instead
 * of `messageId`, or when the messageId is `null`.
 *
 * @since 0.2.0
 */
declare const messageIds: (result: ReadonlyArray<ReportedDiagnostic>) => ReadonlyArray<Option.Option<string>>;
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
declare const expectDiagnostics: (result: ReadonlyArray<ReportedDiagnostic>, expected: ReadonlyArray<{
  readonly message?: string;
  readonly messageId?: string;
}>) => void;
/**
 * Assert that no diagnostics were reported.
 *
 * @since 0.2.0
 */
declare const expectNoDiagnostics: (result: ReadonlyArray<ReportedDiagnostic>) => void;
//#endregion
export { MockContext, MockContextOptions, ReportedDiagnostic, arrowFn, astNode, binaryExpr, blockStmt, boolLiteral, callExpr, callOfMember, chainedMemberExpr, classDecl, comment, computedMemberExpr, createMockContext, doWhileStmt, expectDiagnostics, expectNoDiagnostics, exportNamedDecl, exprStmt, forInStmt, forOfStmt, forStmt, id, ifStmt, importDecl, importDeclWithSpecifiers, importNamespaceSpecifier, importSpecifier, interfaceDecl, memberExpr, messageIds, messages, methodDef, mockRuleContextLayer, newExpr, numLiteral, objectExpr, objectExprLiteralKeys, objectExprWithSpread, program, propertyDef, returnStmt, runRule, runRuleMulti, scope, strLiteral, switchStmt, throwStmt, token, tryStmt, tsAsExpr, tsTypeLiteral, tsTypeRef, tsUnionType, typeAliasDecl, unaryExpr, varDecl, varDeclarator, variable, whileStmt, withMockRuleContext, withParentChain, yieldExpr };