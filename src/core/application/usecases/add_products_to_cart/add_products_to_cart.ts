import { CartProduct, CartStatus } from "@entities/cart.types";
import { ICartRepository } from "@ports/cart_repository";
import { HTTPBadRequest, HTTPNotFound, HTTPPreconditionFailed } from "@utils/http";

export class AddProductsToCartUseCase {
  private readonly cartRepository: ICartRepository;

  constructor(cartRepository: ICartRepository) {
    this.cartRepository = cartRepository;
  }

  async execute(cartId: string, products: CartProduct[]): Promise<void> {
    const cart = await this.cartRepository.findById(cartId);
    if (!cart) {
      throw new HTTPNotFound(`Cart with id ${cartId} not found`);
    }

    if (cart.status !== CartStatus.Open) {
      throw new HTTPPreconditionFailed(`Cart with id ${cartId} is not open for adding products`);
    }

    for (const product of products) {
      if (product.quantity <= 0) {
        throw new HTTPBadRequest(`Product quantity must be greater than zero for product id ${product.product_id}`);
      }

      if (product.price < 0) {
        throw new HTTPBadRequest(`Product price cannot be negative for product id ${product.product_id}`);
      }

      if (!product.product_id) {
        throw new HTTPBadRequest(`Product id is required`);
      }
    }

    cart.addProducts(products);

    await this.cartRepository.update(cart);
  }
}