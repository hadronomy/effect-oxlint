import { describe, expect, it } from '@effect/vitest';
import * as Effect from 'effect/Effect';

import * as FileContext from '../src/FileContext.ts';
import * as Testing from '../src/Testing.ts';

describe('FileContext', () => {
	it.effect('provides the active physical filename', () =>
		Effect.gen(function* () {
			const { context } = Testing.createMockContext({
				filename: '/logical/file.ts'
			});
			const controller = FileContext.make(context);
			controller.activate();

			const file = yield* Effect.service(FileContext.FileContext).pipe(
				Effect.provideService(
					FileContext.FileContext,
					controller.service
				)
			);

			expect(file.physicalFilename).toBe('/logical/file.ts');
			controller.deactivate();
		})
	);

	it.effect('rejects access outside the file lifecycle', () =>
		Effect.gen(function* () {
			const { context } = Testing.createMockContext();
			const controller = FileContext.make(context);

			expect(() => controller.current()).toThrow(
				FileContext.FileContextClosed
			);
			expect(() => controller.service.filename).toThrow(
				FileContext.FileContextUnavailable
			);
			yield* Effect.void;
		})
	);
});
