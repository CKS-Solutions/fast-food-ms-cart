import { CheckoutCartUseCase } from './checkout_cart';
import { CartStatus } from '@entities/cart.types';
import { ICartRepository } from '@ports/cart_repository';
import { ILambdaAdapter } from '@ports/lambda';
import { HTTPNotFound, HTTPPreconditionFailed } from '@utils/http';

jest.mock('@utils/env', () => ({
  getStage: jest.fn().mockReturnValue('test'),
}));

describe('CheckoutCartUseCase', () => {
  let cartRepository: jest.Mocked<ICartRepository>;
  let lambdaAdapter: jest.Mocked<ILambdaAdapter>;
  let useCase: CheckoutCartUseCase;

  beforeEach(() => {
    cartRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    lambdaAdapter = {
      invokeEvent: jest.fn(),
    } as any;

    useCase = new CheckoutCartUseCase(cartRepository, lambdaAdapter);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should checkout cart and invoke order creation lambda when cart is valid', async () => {
    const cart = {
      id: 'cart-123',
      status: CartStatus.Open,
      products: [
        {
          product_id: 'prod-1',
          quantity: 2,
          price: 10,
        },
      ],
      customer_id: 'customer-1',
      checkout: jest.fn(),
    };

    cartRepository.findById.mockResolvedValue(cart as any);

    await useCase.execute('cart-123');

    expect(cartRepository.findById).toHaveBeenCalledWith('cart-123');
    expect(cart.checkout).toHaveBeenCalled();
    expect(cartRepository.update).toHaveBeenCalledWith(cart);

    expect(lambdaAdapter.invokeEvent).toHaveBeenCalledWith(
      'ms-order-test-createOrderProcessor',
      {
        customer_id: 'customer-1',
        products: cart.products,
      }
    );
  });

  it('should throw HTTPNotFound when cart does not exist', async () => {
    cartRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('cart-123'),
    ).rejects.toBeInstanceOf(HTTPNotFound);

    await expect(
      useCase.execute('cart-123'),
    ).rejects.toThrow('Cart with id cart-123 not found');
  });

  it('should throw HTTPPreconditionFailed when cart is not open', async () => {
    const cart = {
      id: 'cart-123',
      status: CartStatus.Closed,
      products: [],
    };

    cartRepository.findById.mockResolvedValue(cart as any);

    await expect(
      useCase.execute('cart-123'),
    ).rejects.toBeInstanceOf(HTTPPreconditionFailed);

    await expect(
      useCase.execute('cart-123'),
    ).rejects.toThrow('Cart with id cart-123 is not open for checkout');
  });

  it('should throw HTTPPreconditionFailed when cart has no products', async () => {
    const cart = {
      id: 'cart-123',
      status: CartStatus.Open,
      products: [],
    };

    cartRepository.findById.mockResolvedValue(cart as any);

    await expect(
      useCase.execute('cart-123'),
    ).rejects.toBeInstanceOf(HTTPPreconditionFailed);

    await expect(
      useCase.execute('cart-123'),
    ).rejects.toThrow('Cart with id cart-123 has no products to checkout');
  });

  it('should not update cart nor invoke lambda if validation fails', async () => {
    const cart = {
      id: 'cart-123',
      status: CartStatus.Closed,
      products: [],
      checkout: jest.fn(),
    };

    cartRepository.findById.mockResolvedValue(cart as any);

    await expect(
      useCase.execute('cart-123'),
    ).rejects.toBeInstanceOf(HTTPPreconditionFailed);

    expect(cart.checkout).not.toHaveBeenCalled();
    expect(cartRepository.update).not.toHaveBeenCalled();
    expect(lambdaAdapter.invokeEvent).not.toHaveBeenCalled();
  });
});
