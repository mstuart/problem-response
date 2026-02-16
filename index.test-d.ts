import {expectType, expectError} from 'tsd';
import {
	ProblemDetail,
	toResponse,
	isProblemDetail,
	badRequest,
	unauthorized,
	forbidden,
	notFound,
	conflict,
	unprocessableEntity,
	internalServerError,
	type ProblemDetailJson,
	type ProblemResponse,
} from './index.js';

// ProblemDetail constructor
const problem = new ProblemDetail({status: 404, detail: 'Not found'});
expectType<ProblemDetail>(problem);
expectType<string>(problem.type);
expectType<string>(problem.title);
expectType<number>(problem.status);
expectType<string | undefined>(problem.detail);
expectType<string | undefined>(problem.instance);

// ProblemDetail extends Error
const error: Error = problem;
expectType<Error>(error);

// ToJSON
expectType<ProblemDetailJson>(problem.toJSON());

// ToResponse
const response = toResponse(problem);
expectType<ProblemResponse>(response);
expectType<number>(response.status);
expectType<string>(response.body);

// IsProblemDetail type guard
const value: unknown = problem;
if (isProblemDetail(value)) {
	expectType<ProblemDetail>(value);
}

// Factory functions
expectType<ProblemDetail>(badRequest('Bad'));
expectType<ProblemDetail>(unauthorized('Unauth'));
expectType<ProblemDetail>(forbidden('Forbidden'));
expectType<ProblemDetail>(notFound('Not found'));
expectType<ProblemDetail>(conflict('Conflict'));
expectType<ProblemDetail>(unprocessableEntity('Invalid'));
expectType<ProblemDetail>(internalServerError('Error'));

// Factory with extensions
expectType<ProblemDetail>(badRequest('Bad', {traceId: '123'}));

// Constructor requires status
expectError(new ProblemDetail({}));
