import { CartRepository } from "@driven_dynamodb/cart_repository"
import { DynamoDBClientWrapper } from "@aws/dynamodb_client"
import { AwsRegion, AwsStage } from "@aws/utils"
import { LambdaClientWrapper } from "@aws/lambda_client"
import { LambdaAdapter } from "@driven_lambda/lambda"
import { CheckoutCartUseCase } from "@usecases/checkout_cart"

export class CheckoutCartContainerFactory {
	usecase: CheckoutCartUseCase

	constructor(region: AwsRegion, stage: AwsStage) {
		const dynamoClient = new DynamoDBClientWrapper(region, stage)
		const lambdaClient = new LambdaClientWrapper(region, stage)
		
		const cartRepo = new CartRepository(dynamoClient)
		const lambdaAdapter = new LambdaAdapter(lambdaClient)

		this.usecase = new CheckoutCartUseCase(cartRepo, lambdaAdapter)
	}
}