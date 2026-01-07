import { randomUUID } from "node:crypto"
import { CartProduct, CartStatus } from "./cart.types"

const EXPIRATION_TIME_MS = 1 * 60 * 60 * 1000

export class Cart {
	id: string
	status: CartStatus
	customer_id?: string
	products: Array<CartProduct>
	expires_at?: number
	created_at: number
	updated_at: number

	constructor({
		id,
		status,
		customerId,
		products = [],
		expiresAt,
		createdAt,
		updatedAt,
	}: {
		id: string
		status: CartStatus
		customerId?: string
		products?: Array<CartProduct>
		expiresAt?: number
		createdAt: number
		updatedAt: number
	}) {
		this.id = id
		this.status = status
		this.customer_id = customerId
		this.products = products
		this.expires_at = expiresAt
		this.created_at = createdAt
		this.updated_at = updatedAt
	}

	static create(customerId?: string): Cart {
		return new Cart({
			id: randomUUID(),
			status: CartStatus.Open,
			customerId,
			expiresAt: Date.now() + EXPIRATION_TIME_MS,
			createdAt: Date.now(),
			updatedAt: Date.now(),
		})
	}

	addProducts(products: CartProduct[]) {
		for (const product of products) {
			const existingProductIndex = this.products.findIndex(
				(p) => p.product_id === product.product_id
			)

			if (existingProductIndex >= 0) {
				this.products[existingProductIndex].quantity += product.quantity
				this.products[existingProductIndex].price = product.price
			} else {
				this.products.push(product)
			}
		}

		this.updated_at = Date.now()
		this.expires_at = Date.now() + EXPIRATION_TIME_MS
	}

	removeProducts(productIds: string[]) {
		this.products = this.products.filter(
			(product) => !productIds.includes(product.product_id)
		)
		this.updated_at = Date.now()
		this.expires_at = Date.now() + EXPIRATION_TIME_MS
	}

	checkout() {
		this.status = CartStatus.Closed
		this.updated_at = Date.now()
		delete this.expires_at
	}
}
