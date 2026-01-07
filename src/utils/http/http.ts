import { APIGatewayProxyResult } from "aws-lambda"

export enum HTTPStatus {
	OK = 200,
	Created = 201,
	BadRequest = 400,
	NotFound = 404,
	Conflict = 409,
	PreconditionFailed = 412,
	InternalServerError = 500,
}

function lambdaResponse(
	status: number,
	body: string,
): APIGatewayProxyResult {
	return {
		statusCode: status,
		headers: {
			"Content-Type": "application/json",
		},
		body,
	}
}

export class HTTPError extends Error {
	private readonly statusCode: number

	constructor(message: string, statusCode: number) {
		super(message)
		this.statusCode = statusCode
	}

	toLambdaResponse(): APIGatewayProxyResult {
		const res: HTTPErrorResponse = {
			message: this.message,
		}

		const body = JSON.stringify(res)

		return lambdaResponse(this.statusCode, body)
	}
}

type HTTPErrorResponse = {
	message: string
}

export class HTTPSuccessResponse<T> {
	data: T

	constructor(data: T) {
		this.data = data
	}

	toLambdaResponse(): APIGatewayProxyResult {
		const body = JSON.stringify(this)
		return lambdaResponse(HTTPStatus.OK, body)
	}
}

export class HTTPBadRequest extends HTTPError {
	constructor(message: string) {
		super(message, HTTPStatus.BadRequest)
	}
}

export class HTTPNotFound extends HTTPError {
	constructor(message: string) {
		super(message, HTTPStatus.NotFound)
	}
}

export class HTTPConflict extends HTTPError {
	constructor(message: string) {
		super(message, HTTPStatus.Conflict)
	}
}

export class HTTPPreconditionFailed extends HTTPError {
	constructor(message: string) {
		super(message, HTTPStatus.PreconditionFailed)
	}
}

export class HTTPInternalServerError extends HTTPError {
	constructor(message: string) {
		super(message, HTTPStatus.InternalServerError)
	}
}
