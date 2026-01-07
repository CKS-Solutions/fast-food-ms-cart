import { APIGatewayProxyResult } from "aws-lambda"

import { HTTPError, HTTPSuccessResponse } from "@utils/http"
import { getRegion, getStage } from "@utils/env"
import { ExpireCartsContainerFactory } from "@di/expire_carts"

export async function handler(): Promise<APIGatewayProxyResult> {
	try {
		const stage = getStage()
		const region = getRegion()

		const container = new ExpireCartsContainerFactory(region, stage)

		await container.usecase.execute()

		return new HTTPSuccessResponse(null).toLambdaResponse()
	} catch (error) {
		if (error instanceof HTTPError) {
			return error.toLambdaResponse()
		}

		console.error("Unexpected error:", error)

		const genericError = new HTTPError("Internal Server Error", 500)
		return genericError.toLambdaResponse()
	}
}
