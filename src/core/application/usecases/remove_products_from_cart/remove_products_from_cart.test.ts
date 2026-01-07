import { RemoveProductsFromCartUseCase } from './remove_products_from_cart';
import { CartStatus } from '@entities/cart.types';
import { ICartRepository } from '@ports/cart_repository';
import { HTTPNotFound, HTTPPreconditionFailed } from '@utils/http';

describe('RemoveProductsFromCartUseCase', () => {
  let cartRepository: jest.Mocked<ICartRepository>;
  let useCase: RemoveProductsFromCartUseCase;

  beforeEach(() => {
    cartRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    useCase = new RemoveProductsFromCartUseCase(cartRepository);
  });

  it('should remove products from cart when cart is open', async () => {
    const cart = {
      id: 'cart-123',
      status: CartStatus.Open,
      removeProducts: jest.fn(),
    };

    const productIds = ['prod-1', 'prod-2'];

    cartRepository.findById.mockResolvedValue(cart as any);

    await useCase.execute('cart-123', productIds);

    expect(cartRepository.findById).toHaveBeenCalledWith('cart-123');
    expect(cart.removeProducts).toHaveBeenCalledWith(productIds);
    expect(cartRepository.update).toHaveBeenCalledWith(cart);
  });

  it('should throw HTTPNotFound when cart does not exist', async () => {
    cartRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('cart-123', ['prod-1']),
    ).rejects.toBeInstanceOf(HTTPNotFound);

    await expect(
      useCase.execute('cart-123', ['prod-1']),
    ).rejects.toThrow('Cart with id cart-123 not found');
  });

  it('should throw HTTPPreconditionFailed when cart is not open', async () => {
    const cart = {
      id: 'cart-123',
      status: CartStatus.Closed,
    };

    cartRepository.findById.mockResolvedValue(cart as any);

    await expect(
      useCase.execute('cart-123', ['prod-1']),
    ).rejects.toBeInstanceOf(HTTPPreconditionFailed);

    await expect(
      useCase.execute('cart-123', ['prod-1']),
    ).rejects.toThrow('Cart with id cart-123 is not open for adding products');
  });

  it('should not update cart if cart is not open', async () => {
    const cart = {
      id: 'cart-123',
      status: CartStatus.Closed,
      removeProducts: jest.fn(),
    };

    cartRepository.findById.mockResolvedValue(cart as any);

    await expect(
      useCase.execute('cart-123', ['prod-1']),
    ).rejects.toBeInstanceOf(HTTPPreconditionFailed);

    expect(cart.removeProducts).not.toHaveBeenCalled();
    expect(cartRepository.update).not.toHaveBeenCalled();
  });
});
