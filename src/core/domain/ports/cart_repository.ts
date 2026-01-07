import { Cart } from "@entities/cart"

export interface ICartRepository {
	create(cart: Cart): Promise<void>
	findByCustomerId(customerId: string): Promise<Cart | null>
}
