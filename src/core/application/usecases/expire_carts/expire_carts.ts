import { ICartRepository } from "@ports/cart_repository";

export class ExpireCartsUseCase {
  private readonly cartRepository: ICartRepository;

  constructor(cartRepository: ICartRepository) {
    this.cartRepository = cartRepository;
  }

  async execute(): Promise<void> {
    const now = Date.now();
    const expiredCarts = await this.cartRepository.findAllExpired(now);

    for (const cart of expiredCarts) {
      await this.cartRepository.remove(cart.id);
    }
  }
}