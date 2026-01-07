import { CartStatus } from "@entities/cart.types";
import { ICartRepository } from "@ports/cart_repository";
import { HTTPNotFound, HTTPPreconditionFailed } from "@utils/http";

export class RemoveProductsFromCartUseCase {
  private readonly cartRepository: ICartRepository;

  constructor(cartRepository: ICartRepository) {
    this.cartRepository = cartRepository;
  }

  async execute(cartId: string, productIds: string[]): Promise<void> {
    const cart = await this.cartRepository.findById(cartId);
    if (!cart) {
      throw new HTTPNotFound(`Cart with id ${cartId} not found`);
    }

    if (cart.status !== CartStatus.Open) {
      throw new HTTPPreconditionFailed(`Cart with id ${cartId} is not open for adding products`);
    }

    cart.removeProducts(productIds);

    await this.cartRepository.update(cart);
  }
}