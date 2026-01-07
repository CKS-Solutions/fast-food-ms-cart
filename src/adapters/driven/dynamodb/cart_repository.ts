import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb"

import { ICartRepository } from "@ports/cart_repository"
import { DynamoDBClientWrapper } from "@aws/dynamodb_client"
import { Cart } from "@entities/cart"

const TABLE_NAME = "CKS.Carts"

export class CartRepository implements ICartRepository {
	client: DynamoDBClientWrapper

	constructor(client: DynamoDBClientWrapper) {
		this.client = client
	}

	async create(cart: Cart): Promise<void> {
		const command = new PutCommand({
			TableName: TABLE_NAME,
			Item: cart,
		})

		await this.client.send(command)
	}

	async findByCustomerId(customerId: string): Promise<Cart | null> {
		const command =  new QueryCommand({
			TableName: TABLE_NAME,
			IndexName: "customer_id_index",
			KeyConditionExpression: "customer_id = :customerId",
			ExpressionAttributeValues: {
				":customerId": customerId,
			},
			Limit: 1,
		});

		const result = await this.client.send(command);

		if (result.Items && result.Items.length > 0) {
			return result.Items[0] as Cart;
		}

		return null;
	}
}