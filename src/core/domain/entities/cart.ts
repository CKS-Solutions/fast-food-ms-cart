import { randomUUID } from "node:crypto"
import { CartProduct, CartStatus } from "./cart.types"

export class Cart {
	id: string
	status: CartStatus
	customer_id?: string
	products: Array<CartProduct>
	created_at: number
	updated_at: number

	constructor({
		id,
		status,
		customerId,
		products = [],
		createdAt,
		updatedAt,
	}: {
		id: string
		status: CartStatus
		customerId?: string
		products?: Array<CartProduct>
		createdAt: number
		updatedAt: number
	}) {
		this.id = id
		this.status = status
		this.customer_id = customerId
		this.products = products
		this.created_at = createdAt
		this.updated_at = updatedAt
	}

	static create(customerId?: string): Cart {
		return new Cart({
			id: randomUUID(),
			status: CartStatus.Open,
			customerId,
			products: [],
			createdAt: Date.now(),
			updatedAt: Date.now(),
		})
	}
}
