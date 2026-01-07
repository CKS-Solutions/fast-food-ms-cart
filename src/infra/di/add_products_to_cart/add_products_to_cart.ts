import { CartRepository } from "@driven_dynamodb/cart_repository"
import { DynamoDBClientWrapper } from "@aws/dynamodb_client"
import { AwsRegion, AwsStage } from "@aws/utils"
import { AddProductsToCartUseCase } from "@usecases/add_products_to_cart"

export class AddProductsToCartContainerFactory {
	usecase: AddProductsToCartUseCase

	constructor(region: AwsRegion, stage: AwsStage) {
		const dynamoClient = new DynamoDBClientWrapper(region, stage)
		const cartRepo = new CartRepository(dynamoClient)

		this.usecase = new AddProductsToCartUseCase(cartRepo)
	}
}