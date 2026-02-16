export type ProblemDetailOptions = {
	/**
	Extension members to include in the problem detail.
	*/
	readonly [key: string]: unknown;

	/**
	A URI reference that identifies the problem type.
	@default 'about:blank'
	*/
	readonly type?: string;

	/**
	A short, human-readable summary of the problem type.
	*/
	readonly title?: string;

	/**
	The HTTP status code for this problem.
	*/
	readonly status: number;

	/**
	A human-readable explanation specific to this occurrence of the problem.
	*/
	readonly detail?: string;

	/**
	A URI reference that identifies the specific occurrence of the problem.
	*/
	readonly instance?: string;
};

export type ProblemDetailJson = {
	readonly [key: string]: unknown;
	readonly type: string;
	readonly title: string;
	readonly status: number;
	readonly detail?: string;
	readonly instance?: string;
};

export type ProblemResponse = {
	readonly status: number;
	readonly headers: {
		readonly 'content-type': 'application/problem+json';
	};
	readonly body: string;
};

/**
RFC 9457 Problem Details for HTTP APIs.

@example
```
import {ProblemDetail} from 'problem-response';

const problem = new ProblemDetail({
	status: 404,
	title: 'Not Found',
	detail: 'The requested user was not found.',
	instance: '/users/42',
});

console.log(problem.toJSON());
```
*/
export class ProblemDetail extends Error {
	readonly type: string;
	readonly title: string;
	readonly status: number;
	readonly detail: string | undefined;
	readonly instance: string | undefined;

	constructor(options: ProblemDetailOptions);

	/**
	Returns an RFC 9457 compliant plain object.

	@returns The problem detail as a plain object.

	@example
	```
	import {ProblemDetail} from 'problem-response';

	const problem = new ProblemDetail({status: 404, detail: 'Not found'});
	console.log(problem.toJSON());
	// => {type: 'about:blank', title: 'Not Found', status: 404, detail: 'Not found'}
	```
	*/
	toJSON(): ProblemDetailJson;
}

/**
Convert a ProblemDetail to an HTTP response object.

@param problem - The ProblemDetail instance to convert.
@returns An object with status, headers, and body suitable for HTTP responses.

@example
```
import {notFound, toResponse} from 'problem-response';

const response = toResponse(notFound('User not found'));
console.log(response.headers['content-type']);
// => 'application/problem+json'
```
*/
export function toResponse(problem: ProblemDetail): ProblemResponse;

/**
Type guard to check if a value is a ProblemDetail instance.

@param value - The value to check.
@returns `true` if the value is a ProblemDetail instance.

@example
```
import {isProblemDetail, notFound} from 'problem-response';

isProblemDetail(notFound('Missing'));
// => true
```
*/
export function isProblemDetail(value: unknown): value is ProblemDetail;

/**
Create a 400 Bad Request problem detail.

@param detail - A human-readable explanation.
@param extensions - Additional extension members.
@returns A ProblemDetail with status 400.

@example
```
import {badRequest} from 'problem-response';

const problem = badRequest('Invalid email format');
```
*/
export function badRequest(detail?: string, extensions?: Record<string, unknown>): ProblemDetail;

/**
Create a 401 Unauthorized problem detail.

@param detail - A human-readable explanation.
@param extensions - Additional extension members.
@returns A ProblemDetail with status 401.

@example
```
import {unauthorized} from 'problem-response';

const problem = unauthorized('Token expired');
```
*/
export function unauthorized(detail?: string, extensions?: Record<string, unknown>): ProblemDetail;

/**
Create a 403 Forbidden problem detail.

@param detail - A human-readable explanation.
@param extensions - Additional extension members.
@returns A ProblemDetail with status 403.

@example
```
import {forbidden} from 'problem-response';

const problem = forbidden('Insufficient permissions');
```
*/
export function forbidden(detail?: string, extensions?: Record<string, unknown>): ProblemDetail;

/**
Create a 404 Not Found problem detail.

@param detail - A human-readable explanation.
@param extensions - Additional extension members.
@returns A ProblemDetail with status 404.

@example
```
import {notFound} from 'problem-response';

const problem = notFound('User not found');
```
*/
export function notFound(detail?: string, extensions?: Record<string, unknown>): ProblemDetail;

/**
Create a 409 Conflict problem detail.

@param detail - A human-readable explanation.
@param extensions - Additional extension members.
@returns A ProblemDetail with status 409.

@example
```
import {conflict} from 'problem-response';

const problem = conflict('Username already taken');
```
*/
export function conflict(detail?: string, extensions?: Record<string, unknown>): ProblemDetail;

/**
Create a 422 Unprocessable Entity problem detail.

@param detail - A human-readable explanation.
@param extensions - Additional extension members.
@returns A ProblemDetail with status 422.

@example
```
import {unprocessableEntity} from 'problem-response';

const problem = unprocessableEntity('Validation failed');
```
*/
export function unprocessableEntity(detail?: string, extensions?: Record<string, unknown>): ProblemDetail;

/**
Create a 500 Internal Server Error problem detail.

@param detail - A human-readable explanation.
@param extensions - Additional extension members.
@returns A ProblemDetail with status 500.

@example
```
import {internalServerError} from 'problem-response';

const problem = internalServerError('Unexpected failure');
```
*/
export function internalServerError(detail?: string, extensions?: Record<string, unknown>): ProblemDetail;
