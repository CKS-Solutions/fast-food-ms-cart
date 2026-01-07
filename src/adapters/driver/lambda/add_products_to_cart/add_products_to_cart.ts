import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"

import { HTTPBadRequest, HTTPError, HTTPSuccessResponse } from "@utils/http"
import { getRegion, getStage } from "@utils/env"
import { AddProductsToCartContainerFactory } from "@di/add_products_to_cart"

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
	try {
		const cartId = event.pathParameters?.cart_id
		if (!cartId) {
			throw new HTTPBadRequest("cartId path parameter is required")
		}

		const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body ?? {}
		const products = body?.products
		if (!Array.isArray(products) || products.length === 0) {
			throw new HTTPBadRequest("products array is required in the request body")
		}

		const stage = getStage()
		const region = getRegion()

		const container = new AddProductsToCartContainerFactory(region, stage)

		await container.usecase.execute(cartId, products)

		return new HTTPSuccessResponse({
			message: "Products added to cart successfully"
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
