import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"

import { HTTPBadRequest, HTTPError, HTTPSuccessResponse } from "@utils/http"
import { getRegion, getStage } from "@utils/env"
import { CheckoutCartContainerFactory } from "@di/checkout_cart"

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
	try {
		const cartId = event.pathParameters?.cart_id
		if (!cartId) {
			throw new HTTPBadRequest("cartId path parameter is required")
		}

		const stage = getStage()
		const region = getRegion()

		const container = new CheckoutCartContainerFactory(region, stage)

		await container.usecase.execute(cartId)

		return new HTTPSuccessResponse({
			message: "Cart checked out successfully"
		}).toLambdaResponse()
	} catch (error) {
		if (error instanceof HTTPError) {
			return error.toLambdaResponse()
		}

		console.error("Unexpected error:", error)

		const genericError = new HTTPError("Internal Server Error", 500)
		return genericError.toLambdaResponse()
	}
}
