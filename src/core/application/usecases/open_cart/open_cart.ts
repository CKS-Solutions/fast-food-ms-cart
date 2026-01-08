import { OpenCartInputDTO } from "@dto/open_cart"
import { Cart } from "@entities/cart"
import { ICartRepository } from "@ports/cart_repository"
import { ILambdaAdapter } from "@ports/lambda"
import { getStage } from "@utils/env"
import { HTTPConflict } from "@utils/http"

export class OpenCartUseCase {
	private readonly cartRepository: ICartRepository
	private readonly lambdaAdapter: ILambdaAdapter;

	constructor(cartRepository: ICartRepository, lambdaAdapter: ILambdaAdapter) {
		this.cartRepository = cartRepository
		this.lambdaAdapter = lambdaAdapter
	}

	async execute(params: OpenCartInputDTO): Promise<{ id: string }> {
		let customerId: string | undefined;

		if (params.cpf) {
			const stage = getStage();

			const customer = await this.lambdaAdapter.invoke(
				`ms-register-v2-${stage}-findCustomerByCpf`,
				{ cpf: params.cpf }
			);

			if (!customer) {
				await this.lambdaAdapter.invokeEvent(
					`ms-register-v2-${stage}-createCustomer`,
					{
						cpf: params.cpf,
						name: params.name,
					}
				)
			}

			customerId = params.cpf;
		}

		if (params.name && !customerId) {
			customerId = params.name;
		}

		if (customerId) {
			const existingCart = await this.cartRepository.findByCustomerId(customerId);
			if (existingCart) {
				throw new HTTPConflict(`Customer with id ${customerId} already has an open cart`);
			}
		}

		const cart = Cart.create(customerId)

		await this.cartRepository.create(cart)

		return { id: cart.id }
	}
}