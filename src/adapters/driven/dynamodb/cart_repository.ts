import { DeleteCommand, GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb"

import { ICartRepository } from "@ports/cart_repository"
import { DynamoDBClientWrapper } from "@aws/dynamodb_client"
import { Cart } from "@entities/cart"
import { CartStatus } from "@entities/cart.types"

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

	async findById(cartId: string): Promise<Cart | null> {
		const command =  new GetCommand({
			TableName: TABLE_NAME,
			Key: {
				id: cartId,
			},
		});

		const result = await this.client.send(command);

		if (result.Item) {
			const item = result.Item as Cart;

			return new Cart({
				id: item.id,
				status: item.status,
				products: item.products,
				customerId: item.customer_id,
				createdAt: item.created_at,
				updatedAt: item.updated_at,
				expiresAt: item.expires_at,
			});
		}

		return null;
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
			const items = result.Items as Cart[];
			const filtered = items.filter(item => item.status === CartStatus.Open)[0] || null;

			if (filtered) {
				return new Cart({
					id: filtered.id,
					status: filtered.status,
					products: filtered.products,
					customerId: filtered.customer_id,
					createdAt: filtered.created_at,
					updatedAt: filtered.updated_at,
					expiresAt: filtered.expires_at,
				});
			}
		}

		return null;
	}

	async findAllExpired(beforeTimestamp: number): Promise<Cart[]> {
		const command = new QueryCommand({
			TableName: TABLE_NAME,
			IndexName: "expires_at_index",
			KeyConditionExpression: "expires_at <= :beforeTimestamp AND #status = :status",
			ExpressionAttributeValues: {
				":beforeTimestamp": beforeTimestamp,
				":status": CartStatus.Open,
			},
			ExpressionAttributeNames: {
				"#status": "status"
			}
		});

		const result = await this.client.send(command);

		if (result.Items && result.Items.length > 0) {
			const items = result.Items as Cart[];
			return items.map(item => new Cart({
				id: item.id,
				status: item.status,
				products: item.products,
				customerId: item.customer_id,
				createdAt: item.created_at,
				updatedAt: item.updated_at,
				expiresAt: item.expires_at,
			}));
		}

		return [];
	}

	async update(cart: Cart): Promise<void> {
		const command = new PutCommand({
			TableName: TABLE_NAME,
			Item: cart,
		})

		await this.client.send(command)
	}

	async remove(cartId: string): Promise<void> {
		const command = new DeleteCommand({
			TableName: TABLE_NAME,
			Key: {
				id: cartId,
			},
		})

		await this.client.send(command)
	}
}