import { OpenCartUseCase } from "@usecases/open_cart"
import { CartRepository } from "@driven_dynamodb/cart_repository"
import { DynamoDBClientWrapper } from "@aws/dynamodb_client"
import { AwsRegion, AwsStage } from "@aws/utils"

export class OpenCartContainerFactory {
	usecase: OpenCartUseCase

	constructor(region: AwsRegion, stage: AwsStage) {
		const dynamoClient = new DynamoDBClientWrapper(region, stage)
		const cartRepo = new CartRepository(dynamoClient)

		this.usecase = new OpenCartUseCase(cartRepo)
	}
}