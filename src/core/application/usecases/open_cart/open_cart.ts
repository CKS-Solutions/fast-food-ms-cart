import { OpenCartInputDTO } from "@dto/open_cart"
import { Cart } from "@entities/cart"
import { ICartRepository } from "@ports/cart_repository"
import { HTTPConflict } from "@utils/http"

export class OpenCartUseCase {
	private readonly cartRepository: ICartRepository

	constructor(cartRepository: ICartRepository) {
		this.cartRepository = cartRepository
	}

	async execute(params: OpenCartInputDTO): Promise<{ id: string }> {
		// TODO: validate customer on ms-register

		if (params.customerId) {
			const existingCart = await this.cartRepository.findByCustomerId(params.customerId)
			if (existingCart) {
				throw new HTTPConflict("Cart already exists for this customer")
			}
		}

		const cart = Cart.create(params.customerId)

		await this.cartRepository.create(cart)

		return { id: cart.id }
	}
}