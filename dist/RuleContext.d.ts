import * as Context$1 from "effect/Context";
import * as Effect from "effect/Effect";
import { Context, Diagnostic, ESTree, LanguageOptions, Options, Settings, SourceCode } from "@oxlint/plugins";

//#region src/RuleContext.d.ts
/**
 * Service shape provided by `RuleContext`.
 *
 * @since 0.3.1
 */
interface RuleContextService {
  /** Report a lint diagnostic for the current file. */
  readonly report: (diagnostic: Diagnostic) => Effect.Effect<void>;
  /** Rule ID in `plugin/rule` form. */
  readonly id: string;
  /** Absolute path of the file being linted. */
  readonly filename: string;
  /** Canonical path of the file being linted. */
  readonly physicalFilename: string;
  /** Current working directory. */
  readonly cwd: string;
  /** Raw rule options (JSON values). */
  readonly options: Readonly<Options>;
  /** Source code access (tokens, comments, text, scope, etc.). */
  readonly sourceCode: SourceCode;
  /** Language / parser options for this file. */
  readonly languageOptions: Readonly<LanguageOptions>;
  /** Shared settings from the oxlint config. */
  readonly settings: Readonly<Settings>;
}
declare const RuleContextBase: Context$1.ServiceClass<RuleContext, 'effect-oxlint/RuleContext', RuleContextService>;
/**
 * The lint rule context, provided as an Effect service.
 *
 * Available inside `Rule.define`'s `create` generator and every
 * visitor handler via `yield* RuleContext`.
 *
 * @since 0.1.0
 */
declare class RuleContext extends RuleContextBase {}
//#endregion
export { RuleContext as t };