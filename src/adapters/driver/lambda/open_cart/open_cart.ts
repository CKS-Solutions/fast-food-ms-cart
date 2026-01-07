import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"

import { OpenCartContainerFactory } from "@di/open_cart"
import { HTTPError, HTTPSuccessResponse } from "@utils/http"
import { getRegion, getStage } from "@utils/env"
import { OpenCartInputDTO } from "@dto/open_cart"

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
	try {
		const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body ?? {}

		const stage = getStage()
		const region = getRegion()

		const container = new OpenCartContainerFactory(region, stage)

		const res = await container.usecase.execute(body as OpenCartInputDTO)

		return new HTTPSuccessResponse(res).toLambdaResponse()
	} catch (error) {
		if (error instanceof HTTPError) {
			return error.toLambdaResponse()
		}

		console.error("Unexpected error:", error)

		const genericError = new HTTPError("Internal Server Error", 500)
		return genericError.toLambdaResponse()
	}
}
