import { CartStatus } from "@entities/cart.types";
import { ICartRepository } from "@ports/cart_repository";
import { ILambdaAdapter } from "@ports/lambda";
import { getStage } from "@utils/env";
import { HTTPNotFound, HTTPPreconditionFailed } from "@utils/http";

export class CheckoutCartUseCase {
  private readonly cartRepository: ICartRepository;
  private readonly lambdaAdapter: ILambdaAdapter;

  constructor(cartRepository: ICartRepository, lambdaAdapter: ILambdaAdapter) {
    this.cartRepository = cartRepository;
    this.lambdaAdapter = lambdaAdapter;
  }

  async execute(cartId: string): Promise<void> {
    const cart = await this.cartRepository.findById(cartId);
    if (!cart) {
      throw new HTTPNotFound(`Cart with id ${cartId} not found`);
    }

    if (cart.status !== CartStatus.Open) {
      throw new HTTPPreconditionFailed(`Cart with id ${cartId} is not open for checkout`);
    }

    if (cart.products.length === 0) {
      throw new HTTPPreconditionFailed(`Cart with id ${cartId} has no products to checkout`);
    }

    cart.checkout();

    await this.cartRepository.update(cart);

    const stage = getStage();

    interface CreateOrder {
      customer_id?: string;
      products: { product_id: string; quantity: number; price: number }[];
    }

    await this.lambdaAdapter.invokeEvent<CreateOrder>(
      `ms-order-${stage}-createOrderProcessor`,
      {
        customer_id: cart.customer_id,
        products: cart.products,
      }
    );
  }
}