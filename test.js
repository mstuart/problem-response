import test from 'ava';
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
} from './index.js';

// ProblemDetail creation

test('creates ProblemDetail with all fields', t => {
	const problem = new ProblemDetail({
		type: 'https://example.com/not-found',
		title: 'Not Found',
		status: 404,
		detail: 'The user was not found.',
		instance: '/users/42',
	});

	t.is(problem.type, 'https://example.com/not-found');
	t.is(problem.title, 'Not Found');
	t.is(problem.status, 404);
	t.is(problem.detail, 'The user was not found.');
	t.is(problem.instance, '/users/42');
});

test('default type is about:blank', t => {
	const problem = new ProblemDetail({status: 400});
	t.is(problem.type, 'about:blank');
});

test('default title is derived from status code', t => {
	t.is(new ProblemDetail({status: 400}).title, 'Bad Request');
	t.is(new ProblemDetail({status: 401}).title, 'Unauthorized');
	t.is(new ProblemDetail({status: 403}).title, 'Forbidden');
	t.is(new ProblemDetail({status: 404}).title, 'Not Found');
	t.is(new ProblemDetail({status: 409}).title, 'Conflict');
	t.is(new ProblemDetail({status: 422}).title, 'Unprocessable Entity');
	t.is(new ProblemDetail({status: 500}).title, 'Internal Server Error');
});

test('defaults title to Unknown Error for unrecognized status', t => {
	const problem = new ProblemDetail({status: 418});
	t.is(problem.title, 'Unknown Error');
});

test('inherits from Error', t => {
	const problem = new ProblemDetail({status: 500, detail: 'Something broke'});
	t.true(problem instanceof Error);
	t.is(problem.name, 'ProblemDetail');
	t.is(problem.message, 'Something broke');
});

test('message falls back to title when detail is missing', t => {
	const problem = new ProblemDetail({status: 404, title: 'Resource Missing'});
	t.is(problem.message, 'Resource Missing');
});

test('message falls back to default when neither detail nor title', t => {
	const problem = new ProblemDetail({status: 500});
	t.is(problem.message, 'Problem Detail');
});

test('throws TypeError for invalid status', t => {
	t.throws(() => new ProblemDetail({status: 'bad'}), {instanceOf: TypeError});
	t.throws(() => new ProblemDetail({status: 99}), {instanceOf: TypeError});
	t.throws(() => new ProblemDetail({status: 600}), {instanceOf: TypeError});
	t.throws(() => new ProblemDetail({status: 200.5}), {instanceOf: TypeError});
	t.throws(() => new ProblemDetail({}), {instanceOf: TypeError});
});

test('supports extension members', t => {
	const problem = new ProblemDetail({
		status: 400,
		traceId: 'abc-123',
		errors: [{field: 'email', message: 'invalid'}],
	});

	t.is(problem.traceId, 'abc-123');
	t.deepEqual(problem.errors, [{field: 'email', message: 'invalid'}]);
});

// ToJSON

test('toJSON returns RFC 9457 compliant object', t => {
	const problem = new ProblemDetail({
		type: 'https://example.com/error',
		title: 'Bad Request',
		status: 400,
		detail: 'Invalid input',
		instance: '/request/123',
	});

	const json = problem.toJSON();

	t.deepEqual(json, {
		type: 'https://example.com/error',
		title: 'Bad Request',
		status: 400,
		detail: 'Invalid input',
		instance: '/request/123',
	});
});

test('toJSON omits undefined detail and instance', t => {
	const problem = new ProblemDetail({status: 500});
	const json = problem.toJSON();

	t.is(json.type, 'about:blank');
	t.is(json.title, 'Internal Server Error');
	t.is(json.status, 500);
	t.false('detail' in json);
	t.false('instance' in json);
});

test('toJSON includes extensions', t => {
	const problem = new ProblemDetail({
		status: 422,
		detail: 'Validation failed',
		errors: [{field: 'name', message: 'required'}],
		traceId: 'trace-456',
	});

	const json = problem.toJSON();

	t.deepEqual(json.errors, [{field: 'name', message: 'required'}]);
	t.is(json.traceId, 'trace-456');
});

test('toJSON produces valid JSON when stringified', t => {
	const problem = new ProblemDetail({
		status: 404,
		detail: 'Not found',
		instance: '/items/99',
	});

	const jsonString = JSON.stringify(problem);
	const parsed = JSON.parse(jsonString);

	t.is(parsed.type, 'about:blank');
	t.is(parsed.title, 'Not Found');
	t.is(parsed.status, 404);
	t.is(parsed.detail, 'Not found');
	t.is(parsed.instance, '/items/99');
});

// ToResponse

test('toResponse returns correct status', t => {
	const problem = new ProblemDetail({status: 403});
	const response = toResponse(problem);

	t.is(response.status, 403);
});

test('toResponse sets content-type header', t => {
	const problem = new ProblemDetail({status: 400});
	const response = toResponse(problem);

	t.is(response.headers['content-type'], 'application/problem+json');
});

test('toResponse body is valid JSON string', t => {
	const problem = new ProblemDetail({status: 404, detail: 'Gone'});
	const response = toResponse(problem);

	const parsed = JSON.parse(response.body);
	t.is(parsed.status, 404);
	t.is(parsed.detail, 'Gone');
});

// IsProblemDetail

test('isProblemDetail returns true for ProblemDetail instances', t => {
	t.true(isProblemDetail(new ProblemDetail({status: 400})));
});

test('isProblemDetail returns false for plain errors', t => {
	t.false(isProblemDetail(new Error('nope')));
});

test('isProblemDetail returns false for non-objects', t => {
	t.false(isProblemDetail(null));
	t.false(isProblemDetail(undefined));
	t.false(isProblemDetail(42));
	t.false(isProblemDetail('string'));
});

test('isProblemDetail returns false for plain objects', t => {
	t.false(isProblemDetail({status: 400, type: 'about:blank'}));
});

// Factory functions

test('badRequest creates 400 problem', t => {
	const problem = badRequest('Invalid email');
	t.is(problem.status, 400);
	t.is(problem.title, 'Bad Request');
	t.is(problem.detail, 'Invalid email');
	t.true(problem instanceof ProblemDetail);
});

test('unauthorized creates 401 problem', t => {
	const problem = unauthorized('Token expired');
	t.is(problem.status, 401);
	t.is(problem.title, 'Unauthorized');
	t.is(problem.detail, 'Token expired');
});

test('forbidden creates 403 problem', t => {
	const problem = forbidden('Insufficient permissions');
	t.is(problem.status, 403);
	t.is(problem.title, 'Forbidden');
	t.is(problem.detail, 'Insufficient permissions');
});

test('notFound creates 404 problem', t => {
	const problem = notFound('User not found');
	t.is(problem.status, 404);
	t.is(problem.title, 'Not Found');
	t.is(problem.detail, 'User not found');
});

test('conflict creates 409 problem', t => {
	const problem = conflict('Username taken');
	t.is(problem.status, 409);
	t.is(problem.title, 'Conflict');
	t.is(problem.detail, 'Username taken');
});

test('unprocessableEntity creates 422 problem', t => {
	const problem = unprocessableEntity('Validation failed');
	t.is(problem.status, 422);
	t.is(problem.title, 'Unprocessable Entity');
	t.is(problem.detail, 'Validation failed');
});

test('internalServerError creates 500 problem', t => {
	const problem = internalServerError('Something broke');
	t.is(problem.status, 500);
	t.is(problem.title, 'Internal Server Error');
	t.is(problem.detail, 'Something broke');
});

test('factory functions work without arguments', t => {
	const problem = notFound();
	t.is(problem.status, 404);
	t.is(problem.title, 'Not Found');
	t.is(problem.detail, undefined);
});

test('factory functions accept extensions', t => {
	const problem = badRequest('Invalid', {traceId: '123', code: 'VALIDATION'});
	t.is(problem.traceId, '123');
	t.is(problem.code, 'VALIDATION');

	const json = problem.toJSON();
	t.is(json.traceId, '123');
	t.is(json.code, 'VALIDATION');
});

// Edge cases

test('extension keys do not override core properties in toJSON', t => {
	const problem = new ProblemDetail({
		status: 400,
		detail: 'Original detail',
		customField: 'custom',
	});

	const json = problem.toJSON();
	t.is(json.status, 400);
	t.is(json.detail, 'Original detail');
	t.is(json.customField, 'custom');
});

test('toResponse with extensions preserves them in body', t => {
	const problem = new ProblemDetail({
		status: 422,
		detail: 'Validation',
		errors: ['field required'],
	});

	const response = toResponse(problem);
	const parsed = JSON.parse(response.body);
	t.deepEqual(parsed.errors, ['field required']);
});

test('custom type URI is preserved', t => {
	const problem = new ProblemDetail({
		type: 'https://api.example.com/problems/out-of-credit',
		title: 'You do not have enough credit.',
		status: 403,
		detail: 'Your current balance is 30, but that costs 50.',
		instance: '/account/12345/msgs/abc',
	});

	const json = problem.toJSON();
	t.is(json.type, 'https://api.example.com/problems/out-of-credit');
	t.is(json.instance, '/account/12345/msgs/abc');
});
