/**
 * Dynamic file context for Oxlint's `createOnce` lifecycle.
 *
 * The service is unavailable during static rule setup. Oxlint updates the
 * host context before each file, so the getters read the active file at use.
 *
 * @since 0.4.0
 */
import type {
	Context as OxlintContext,
	Diagnostic,
	LanguageOptions,
	Options,
	Settings,
	SourceCode
} from '@oxlint/plugins';
import * as Context from 'effect/Context';
import * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';

export class FileContextUnavailable extends Data.TaggedError(
	'FileContextUnavailable'
)<{}> {}

export class FileContextClosed extends Data.TaggedError(
	'FileContextClosed'
)<{}> {}

export interface FileContextService {
	readonly id: string;
	readonly filename: string;
	readonly physicalFilename: string;
	readonly cwd: string;
	readonly options: Readonly<Options>;
	readonly sourceCode: SourceCode;
	readonly languageOptions: Readonly<LanguageOptions>;
	readonly settings: Readonly<Settings>;
	readonly report: (diagnostic: Diagnostic) => Effect.Effect<void>;
}

const FileContextBase: Context.ServiceClass<
	FileContext,
	'effect-oxlint/FileContext',
	FileContextService
> = Context.Service<FileContext, FileContextService>()(
	'effect-oxlint/FileContext'
);

export class FileContext extends FileContextBase {}

export interface FileContextController {
	readonly service: FileContextService;
	readonly activate: () => void;
	readonly deactivate: () => void;
	readonly current: () => FileContextService;
}

export const make = (context: OxlintContext): FileContextController => {
	let active = false;

	const service: FileContextService = {
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
		report: (diagnostic) =>
			Effect.sync(() => {
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
