const httpStatusTitles = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  422: "Unprocessable Entity",
  500: "Internal Server Error",
};
const extensionsByProblem = new WeakMap();

export class ProblemDetail extends Error {
  constructor({ type, title, status, detail, instance, ...extensions } = {}) {
    super(detail ?? title ?? "Problem Detail");
    this.name = "ProblemDetail";

    if (
      typeof status !== "number" ||
      !Number.isInteger(status) ||
      status < 100 ||
      status > 599
    ) {
      throw new TypeError(
        "`status` must be a valid HTTP status code (100-599)"
      );
    }

    this.type = type ?? "about:blank";
    this.title = title ?? httpStatusTitles[status] ?? "Unknown Error";
    this.status = status;
    this.detail = detail;
    this.instance = instance;
    extensionsByProblem.set(this, extensions);

    for (const [key, value] of Object.entries(extensions)) {
      if (key in this) {
        continue;
      }

      Object.defineProperty(this, key, {
        configurable: true,
        enumerable: true,
        value,
        writable: true,
      });
    }
  }

  toJSON() {
    const json = {
      status: this.status,
      title: this.title,
      type: this.type,
    };

    if (this.detail !== undefined) {
      json.detail = this.detail;
    }

    if (this.instance !== undefined) {
      json.instance = this.instance;
    }

    for (const [key, value] of Object.entries(extensionsByProblem.get(this))) {
      Object.defineProperty(json, key, {
        configurable: true,
        enumerable: true,
        value,
        writable: true,
      });
    }

    return json;
  }
}

export function toResponse(problem) {
  const json = problem.toJSON();

  if (typeof json.toJSON === "function") {
    json.toJSON = undefined;
  }

  return {
    body: JSON.stringify(json),
    headers: {
      "content-type": "application/problem+json",
    },
    status: problem.status,
  };
}

export function isProblemDetail(value) {
  return value instanceof ProblemDetail;
}

function createFactory(status) {
  return (detail, extensions) =>
    new ProblemDetail({
      ...extensions,
      detail,
      instance: undefined,
      status,
      title: undefined,
      type: undefined,
    });
}

export const badRequest = createFactory(400);
export const unauthorized = createFactory(401);
export const forbidden = createFactory(403);
export const notFound = createFactory(404);
export const conflict = createFactory(409);
export const unprocessableEntity = createFactory(422);
export const internalServerError = createFactory(500);
