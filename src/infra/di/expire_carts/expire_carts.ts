import { CartRepository } from "@driven_dynamodb/cart_repository"
import { DynamoDBClientWrapper } from "@aws/dynamodb_client"
import { AwsRegion, AwsStage } from "@aws/utils"
import { ExpireCartsUseCase } from "@usecases/expire_carts"

export class ExpireCartsContainerFactory {
	usecase: ExpireCartsUseCase

	constructor(region: AwsRegion, stage: AwsStage) {
		const dynamoClient = new DynamoDBClientWrapper(region, stage)
		const cartRepo = new CartRepository(dynamoClient)

		this.usecase = new ExpireCartsUseCase(cartRepo)
	}
}