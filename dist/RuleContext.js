import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
//#region src/RuleContext.ts
const RuleContextBase = Context.Service()("effect-oxlint/RuleContext");
/**
* The lint rule context, provided as an Effect service.
*
* Available inside `Rule.define`'s `create` generator and every
* visitor handler via `yield* RuleContext`.
*
* @since 0.1.0
*/
var RuleContext = class extends RuleContextBase {};
/**
* Build a `RuleContext` value from the raw oxlint `Context`.
*
* @internal
*/
const fromOxlintContext = (ctx) => RuleContext.of({
	report: (diagnostic) => Effect.sync(() => ctx.report(diagnostic)),
	id: ctx.id,
	filename: ctx.filename,
	physicalFilename: ctx.physicalFilename,
	cwd: ctx.cwd,
	options: ctx.options,
	sourceCode: ctx.sourceCode,
	languageOptions: ctx.languageOptions,
	settings: ctx.settings
});
Effect.service(RuleContext).pipe(Effect.map((ctx) => ctx.id));
Effect.service(RuleContext).pipe(Effect.map((ctx) => ctx.filename));
Effect.service(RuleContext).pipe(Effect.map((ctx) => ctx.physicalFilename));
Effect.service(RuleContext).pipe(Effect.map((ctx) => ctx.cwd));
Effect.service(RuleContext).pipe(Effect.map((ctx) => ctx.sourceCode));
Effect.service(RuleContext).pipe(Effect.map((ctx) => ctx.sourceCode.text));
Effect.service(RuleContext).pipe(Effect.map((ctx) => ctx.sourceCode.ast));
//#endregion
export { fromOxlintContext as n, RuleContext as t };
