import { OpenCartUseCase } from './open_cart';
import { ICartRepository } from '@ports/cart_repository';
import { ILambdaAdapter } from '@ports/lambda';
import { HTTPConflict } from '@utils/http';
import { Cart } from '@entities/cart';

jest.mock('@entities/cart', () => ({
  Cart: {
    create: jest.fn(),
  },
}));

jest.mock('@utils/env', () => ({
  getStage: jest.fn().mockReturnValue('test'),
}));

describe('OpenCartUseCase', () => {
  let cartRepository: jest.Mocked<ICartRepository>;
  let lambdaAdapter: jest.Mocked<ILambdaAdapter>;
  let useCase: OpenCartUseCase;

  beforeEach(() => {
    cartRepository = {
      findByCustomerId: jest.fn(),
      create: jest.fn(),
    } as any;

    lambdaAdapter = {
      invoke: jest.fn(),
      invokeEvent: jest.fn(),
    } as any;

    useCase = new OpenCartUseCase(cartRepository, lambdaAdapter);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should open cart without customer identification', async () => {
    const cart = { id: 'cart-123' };
    (Cart.create as jest.Mock).mockReturnValue(cart);

    const result = await useCase.execute({});

    expect(Cart.create).toHaveBeenCalledWith(undefined);
    expect(cartRepository.create).toHaveBeenCalledWith(cart);
    expect(result).toEqual({ id: 'cart-123' });
  });

  it('should open cart using name when cpf is not provided', async () => {
    const cart = { id: 'cart-123' };
    (Cart.create as jest.Mock).mockReturnValue(cart);

    cartRepository.findByCustomerId.mockResolvedValue(null);

    const result = await useCase.execute({ name: 'John Doe' });

    expect(cartRepository.findByCustomerId).toHaveBeenCalledWith('John Doe');
    expect(Cart.create).toHaveBeenCalledWith('John Doe');
    expect(cartRepository.create).toHaveBeenCalledWith(cart);
    expect(result).toEqual({ id: 'cart-123' });
  });

  it('should open cart using cpf when customer exists', async () => {
    const cart = { id: 'cart-123' };
    (Cart.create as jest.Mock).mockReturnValue(cart);

    lambdaAdapter.invoke.mockResolvedValue({ id: 'customer-1' });
    cartRepository.findByCustomerId.mockResolvedValue(null);

    const result = await useCase.execute({ cpf: '12345678900', name: 'John' });

    expect(lambdaAdapter.invoke).toHaveBeenCalledWith(
      'ms-register-v2-test-findCustomerByCpf',
      { cpf: '12345678900' }
    );

    expect(Cart.create).toHaveBeenCalledWith('12345678900');
    expect(cartRepository.create).toHaveBeenCalledWith(cart);
    expect(result).toEqual({ id: 'cart-123' });
  });

  it('should create customer when cpf does not exist', async () => {
    const cart = { id: 'cart-123' };
    (Cart.create as jest.Mock).mockReturnValue(cart);

    lambdaAdapter.invoke.mockResolvedValue(null);
    cartRepository.findByCustomerId.mockResolvedValue(null);

    await useCase.execute({ cpf: '12345678900', name: 'John' });

    expect(lambdaAdapter.invokeEvent).toHaveBeenCalledWith(
      'ms-register-v2-test-createCustomer',
      {
        cpf: '12345678900',
        name: 'John',
      }
    );
  });

  it('should throw HTTPConflict when customer already has an open cart', async () => {
    lambdaAdapter.invoke.mockResolvedValue({ id: 'customer-1' });

    cartRepository.findByCustomerId.mockResolvedValue({ id: 'existing-cart' } as any);

    await expect(
      useCase.execute({ cpf: '12345678900', name: 'John' }),
    ).rejects.toBeInstanceOf(HTTPConflict);

    await expect(
      useCase.execute({ cpf: '12345678900', name: 'John' }),
    ).rejects.toThrow('Customer with id 12345678900 already has an open cart');
  });

  it('should not create cart when conflict occurs', async () => {
    lambdaAdapter.invoke.mockResolvedValue({ id: 'customer-1' });
    cartRepository.findByCustomerId.mockResolvedValue({ id: 'existing-cart' } as any);

    await expect(
      useCase.execute({ cpf: '12345678900', name: 'John' }),
    ).rejects.toBeInstanceOf(HTTPConflict);

    expect(cartRepository.create).not.toHaveBeenCalled();
  });
});
