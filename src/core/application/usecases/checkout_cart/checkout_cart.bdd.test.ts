import { defineFeature, loadFeature } from 'jest-cucumber';
import { CheckoutCartUseCase } from './checkout_cart';
import { CartStatus, CartProduct } from '@entities/cart.types';
import { ICartRepository } from '@ports/cart_repository';
import { ILambdaAdapter } from '@ports/lambda';
import { HTTPNotFound, HTTPPreconditionFailed } from '@utils/http';

jest.mock('@utils/env', () => ({
  getStage: jest.fn().mockReturnValue('test'),
}));

const feature = loadFeature(
  './src/core/application/usecases/checkout_cart/checkout_cart.feature'
);

defineFeature(feature, (test) => {
  let cartRepository: jest.Mocked<ICartRepository>;
  let lambdaAdapter: jest.Mocked<ILambdaAdapter>;
  let useCase: CheckoutCartUseCase;
  let error: Error | null;
  let cart: any;

  beforeEach(() => {
    cartRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    lambdaAdapter = {
      invokeEvent: jest.fn(),
    } as any;

    useCase = new CheckoutCartUseCase(cartRepository, lambdaAdapter);
    error = null;
    cart = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test('Checkout bem-sucedido de um carrinho com produtos', ({
    given,
    when,
    then,
    and,
  }) => {
    given(/^que existe um carrinho com id "(.*)"$/, (cartId: string) => {
      cart = {
        id: cartId,
        status: CartStatus.Open,
        products: [],
        customer_id: undefined,
        checkout: jest.fn().mockImplementation(() => {
          cart.status = CartStatus.Closed;
        }),
      };
    });

    and(/^o carrinho está com status "(.*)"$/, (status: string) => {
      cart.status = status === 'Open' ? CartStatus.Open : CartStatus.Closed;
    });

    and(/^o carrinho possui os seguintes produtos:$/, (productsTable: any[]) => {
      cart.products = productsTable.map((row: any) => ({
        product_id: row.product_id,
        quantity: parseInt(row.quantity, 10),
        price: parseFloat(row.price),
      }));
    });

    and(/^o carrinho pertence ao cliente "(.*)"$/, (customerId: string) => {
      cart.customer_id = customerId;
    });

    when(/^eu faço checkout do carrinho "(.*)"$/, async (cartId: string) => {
      cartRepository.findById.mockResolvedValue(cart);
      await useCase.execute(cartId);
    });

    then(/^o carrinho deve ser atualizado com status "(.*)"$/, (status: string) => {
      expect(cart.checkout).toHaveBeenCalled();
      expect(cartRepository.update).toHaveBeenCalledWith(cart);
      expect(cart.status).toBe(
        status === 'Closed' ? CartStatus.Closed : CartStatus.Open
      );
    });

    and(
      /^deve ser invocado o lambda de criação de pedido com customer_id "(.*)"$/,
      (customerId: string) => {
        expect(lambdaAdapter.invokeEvent).toHaveBeenCalledWith(
          'ms-order-test-createOrderProcessor',
          expect.objectContaining({
            customer_id: customerId,
            products: cart.products,
          })
        );
      }
    );
  });

  test('Tentativa de checkout de carrinho inexistente', ({
    given,
    when,
    then,
    and,
  }) => {
    given(/^que não existe um carrinho com id "(.*)"$/, (cartId: string) => {
      cartRepository.findById.mockResolvedValue(null);
    });

    when(/^eu faço checkout do carrinho "(.*)"$/, async (cartId: string) => {
      try {
        await useCase.execute(cartId);
      } catch (e) {
        error = e as Error;
      }
    });

    then(/^deve retornar erro HTTPNotFound$/, () => {
      expect(error).toBeInstanceOf(HTTPNotFound);
    });

    and(/^a mensagem de erro deve ser "(.*)"$/, (expectedMessage: string) => {
      expect(error?.message).toBe(expectedMessage);
    });
  });

  test('Tentativa de checkout de carrinho já finalizado', ({
    given,
    when,
    then,
    and,
  }) => {
    given(/^que existe um carrinho com id "(.*)"$/, (cartId: string) => {
      cart = {
        id: cartId,
        status: CartStatus.Closed,
        products: [
          {
            product_id: 'prod-1',
            quantity: 1,
            price: 10,
          },
        ],
        checkout: jest.fn().mockImplementation(() => {
          cart.status = CartStatus.Closed;
        }),
      };
    });

    and(/^o carrinho está com status "(.*)"$/, (status: string) => {
      cart.status = status === 'Open' ? CartStatus.Open : CartStatus.Closed;
    });

    when(/^eu faço checkout do carrinho "(.*)"$/, async (cartId: string) => {
      cartRepository.findById.mockResolvedValue(cart);
      try {
        await useCase.execute(cartId);
      } catch (e) {
        error = e as Error;
      }
    });

    then(/^deve retornar erro HTTPPreconditionFailed$/, () => {
      expect(error).toBeInstanceOf(HTTPPreconditionFailed);
    });

    and(/^a mensagem de erro deve ser "(.*)"$/, (expectedMessage: string) => {
      expect(error?.message).toBe(expectedMessage);
    });
  });

  test('Tentativa de checkout de carrinho vazio', ({
    given,
    when,
    then,
    and,
  }) => {
    given(/^que existe um carrinho com id "(.*)"$/, (cartId: string) => {
      cart = {
        id: cartId,
        status: CartStatus.Open,
        products: [],
        checkout: jest.fn().mockImplementation(() => {
          cart.status = CartStatus.Closed;
        }),
      };
    });

    and(/^o carrinho está com status "(.*)"$/, (status: string) => {
      cart.status = status === 'Open' ? CartStatus.Open : CartStatus.Closed;
    });

    and(/^o carrinho não possui produtos$/, () => {
      cart.products = [];
    });

    when(/^eu faço checkout do carrinho "(.*)"$/, async (cartId: string) => {
      cartRepository.findById.mockResolvedValue(cart);
      try {
        await useCase.execute(cartId);
      } catch (e) {
        error = e as Error;
      }
    });

    then(/^deve retornar erro HTTPPreconditionFailed$/, () => {
      expect(error).toBeInstanceOf(HTTPPreconditionFailed);
    });

    and(/^a mensagem de erro deve ser "(.*)"$/, (expectedMessage: string) => {
      expect(error?.message).toBe(expectedMessage);
    });
  });
});

