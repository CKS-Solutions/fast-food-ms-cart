import { Cart } from "@entities/cart"

export interface ICartRepository {
	create(cart: Cart): Promise<void>
	findById(cartId: string): Promise<Cart | null>
	findByCustomerId(customerId: string): Promise<Cart | null>
	findAllExpired(beforeTimestamp: number): Promise<Cart[]>
	update(cart: Cart): Promise<void>
	remove(cartId: string): Promise<void>
}
