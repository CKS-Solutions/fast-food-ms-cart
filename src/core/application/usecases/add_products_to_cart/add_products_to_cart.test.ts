import { AddProductsToCartUseCase } from './add_products_to_cart';
import { CartStatus, CartProduct } from '@entities/cart.types';
import { ICartRepository } from '@ports/cart_repository';
import {
  HTTPBadRequest,
  HTTPNotFound,
  HTTPPreconditionFailed,
} from '@utils/http';

describe('AddProductsToCartUseCase', () => {
  let cartRepository: jest.Mocked<ICartRepository>;
  let useCase: AddProductsToCartUseCase;

  beforeEach(() => {
    cartRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    useCase = new AddProductsToCartUseCase(cartRepository);
  });

  it('should add products to cart when cart is open and products are valid', async () => {
    const cart = {
      id: 'cart-123',
      status: CartStatus.Open,
      addProducts: jest.fn(),
    };

    const products: CartProduct[] = [
      {
        product_id: 'prod-1',
        quantity: 2,
        price: 10,
      },
      {
        product_id: 'prod-2',
        quantity: 1,
        price: 5,
      },
    ];

    cartRepository.findById.mockResolvedValue(cart as any);

    await useCase.execute('cart-123', products);

    expect(cartRepository.findById).toHaveBeenCalledWith('cart-123');
    expect(cart.addProducts).toHaveBeenCalledWith(products);
    expect(cartRepository.update).toHaveBeenCalledWith(cart);
  });

  it('should throw HTTPNotFound when cart does not exist', async () => {
    cartRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('cart-123', []),
    ).rejects.toBeInstanceOf(HTTPNotFound);

    await expect(
      useCase.execute('cart-123', []),
    ).rejects.toThrow('Cart with id cart-123 not found');
  });

  it('should throw HTTPPreconditionFailed when cart is not open', async () => {
    const cart = {
      id: 'cart-123',
      status: CartStatus.Closed,
    };

    cartRepository.findById.mockResolvedValue(cart as any);

    await expect(
      useCase.execute('cart-123', []),
    ).rejects.toBeInstanceOf(HTTPPreconditionFailed);

    await expect(
      useCase.execute('cart-123', []),
    ).rejects.toThrow('Cart with id cart-123 is not open for adding products');
  });

  it('should throw HTTPBadRequest when product quantity is zero or negative', async () => {
    const cart = {
      id: 'cart-123',
      status: CartStatus.Open,
    };

    const products: CartProduct[] = [
      {
        product_id: 'prod-1',
        quantity: 0,
        price: 10,
      },
    ];

    cartRepository.findById.mockResolvedValue(cart as any);

    await expect(
      useCase.execute('cart-123', products),
    ).rejects.toBeInstanceOf(HTTPBadRequest);

    await expect(
      useCase.execute('cart-123', products),
    ).rejects.toThrow(
      'Product quantity must be greater than zero for product id prod-1',
    );
  });

  it('should throw HTTPBadRequest when product price is negative', async () => {
    const cart = {
      id: 'cart-123',
      status: CartStatus.Open,
    };

    const products: CartProduct[] = [
      {
        product_id: 'prod-1',
        quantity: 1,
        price: -1,
      },
    ];

    cartRepository.findById.mockResolvedValue(cart as any);

    await expect(
      useCase.execute('cart-123', products),
    ).rejects.toBeInstanceOf(HTTPBadRequest);

    await expect(
      useCase.execute('cart-123', products),
    ).rejects.toThrow(
      'Product price cannot be negative for product id prod-1',
    );
  });

  it('should throw HTTPBadRequest when product id is missing', async () => {
    const cart = {
      id: 'cart-123',
      status: CartStatus.Open,
    };

    const products: CartProduct[] = [
      {
        product_id: '',
        quantity: 1,
        price: 10,
      },
    ];

    cartRepository.findById.mockResolvedValue(cart as any);

    await expect(
      useCase.execute('cart-123', products),
    ).rejects.toBeInstanceOf(HTTPBadRequest);

    await expect(
      useCase.execute('cart-123', products),
    ).rejects.toThrow('Product id is required');
  });

  it('should not update cart if validation fails', async () => {
    const cart = {
      id: 'cart-123',
      status: CartStatus.Open,
      addProducts: jest.fn(),
    };

    const products: CartProduct[] = [
      {
        product_id: 'prod-1',
        quantity: -1,
        price: 10,
      },
    ];

    cartRepository.findById.mockResolvedValue(cart as any);

    await expect(
      useCase.execute('cart-123', products),
    ).rejects.toBeInstanceOf(HTTPBadRequest);

    expect(cart.addProducts).not.toHaveBeenCalled();
    expect(cartRepository.update).not.toHaveBeenCalled();
  });
});
