# problem-response

> RFC 9457 Problem Details for HTTP APIs — framework-agnostic, TypeScript-first error responses

## Install

```sh
npm install problem-response
```

## Usage

```js
import {ProblemDetail, toResponse, notFound, badRequest} from 'problem-response';

// Using factory functions
const problem = notFound('The requested user was not found.');
console.log(problem.toJSON());
// => {type: 'about:blank', title: 'Not Found', status: 404, detail: 'The requested user was not found.'}

// Using the constructor directly
const detailed = new ProblemDetail({
	type: 'https://api.example.com/problems/out-of-credit',
	title: 'You do not have enough credit.',
	status: 403,
	detail: 'Your current balance is 30, but that costs 50.',
	instance: '/account/12345/msgs/abc',
	balance: 30,
	accounts: ['/account/12345', '/account/67890'],
});

// Convert to HTTP response
const response = toResponse(detailed);
// => {status: 403, headers: {'content-type': 'application/problem+json'}, body: '...'}
```

## API

### `new ProblemDetail(options)`

Creates a new `ProblemDetail` instance that extends `Error`.

#### options

Type: `object`

##### type

Type: `string`\
Default: `'about:blank'`

A URI reference that identifies the problem type.

##### title

Type: `string`

A short, human-readable summary of the problem type. Defaults to the standard title for the given status code.

##### status

Type: `number` *(required)*

The HTTP status code for this problem.

##### detail

Type: `string`

A human-readable explanation specific to this occurrence of the problem.

##### instance

Type: `string`

A URI reference that identifies the specific occurrence of the problem.

##### Extension members

Any additional properties are treated as extension members per RFC 9457.

### `.toJSON()`

Returns an RFC 9457 compliant plain object.

### `toResponse(problem)`

Returns an HTTP response object with `status`, `headers`, and `body`.

### `isProblemDetail(value)`

Type guard that returns `true` if the value is a `ProblemDetail` instance.

### Factory functions

- `badRequest(detail?, extensions?)` — status 400
- `unauthorized(detail?, extensions?)` — status 401
- `forbidden(detail?, extensions?)` — status 403
- `notFound(detail?, extensions?)` — status 404
- `conflict(detail?, extensions?)` — status 409
- `unprocessableEntity(detail?, extensions?)` — status 422
- `internalServerError(detail?, extensions?)` — status 500

## Related

- [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457) — Problem Details for HTTP APIs

## License

MIT
