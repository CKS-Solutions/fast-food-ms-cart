import { CartRepository } from "@driven_dynamodb/cart_repository"
import { DynamoDBClientWrapper } from "@aws/dynamodb_client"
import { AwsRegion, AwsStage } from "@aws/utils"
import { RemoveProductsFromCartUseCase } from "@usecases/remove_products_from_cart"

export class RemoveProductsFromCartContainerFactory {
	usecase: RemoveProductsFromCartUseCase

	constructor(region: AwsRegion, stage: AwsStage) {
		const dynamoClient = new DynamoDBClientWrapper(region, stage)
		const cartRepo = new CartRepository(dynamoClient)

		this.usecase = new RemoveProductsFromCartUseCase(cartRepo)
	}
}