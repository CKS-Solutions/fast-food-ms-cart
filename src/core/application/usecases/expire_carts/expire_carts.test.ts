import { ExpireCartsUseCase } from './expire_carts';
import { ICartRepository } from '@ports/cart_repository';

describe('ExpireCartsUseCase', () => {
  let cartRepository: jest.Mocked<ICartRepository>;
  let useCase: ExpireCartsUseCase;

  beforeEach(() => {
    cartRepository = {
      findAllExpired: jest.fn(),
      remove: jest.fn(),
    } as any;

    useCase = new ExpireCartsUseCase(cartRepository);
  });

  it('should remove all expired carts', async () => {
    const expiredCarts = [
      { id: 'cart-1' },
      { id: 'cart-2' },
      { id: 'cart-3' },
    ];

    cartRepository.findAllExpired.mockResolvedValue(expiredCarts as any);

    await useCase.execute();

    expect(cartRepository.findAllExpired).toHaveBeenCalledTimes(1);
    expect(cartRepository.findAllExpired).toHaveBeenCalledWith(expect.any(Number));

    expect(cartRepository.remove).toHaveBeenCalledTimes(expiredCarts.length);
    expect(cartRepository.remove).toHaveBeenCalledWith('cart-1');
    expect(cartRepository.remove).toHaveBeenCalledWith('cart-2');
    expect(cartRepository.remove).toHaveBeenCalledWith('cart-3');
  });

  it('should do nothing when there are no expired carts', async () => {
    cartRepository.findAllExpired.mockResolvedValue([]);

    await useCase.execute();

    expect(cartRepository.findAllExpired).toHaveBeenCalledTimes(1);
    expect(cartRepository.remove).not.toHaveBeenCalled();
  });

  it('should pass current timestamp to findAllExpired', async () => {
    const spy = jest.spyOn(Date, 'now').mockReturnValue(1700000000000);

    cartRepository.findAllExpired.mockResolvedValue([]);

    await useCase.execute();

    expect(cartRepository.findAllExpired).toHaveBeenCalledWith(1700000000000);

    spy.mockRestore();
  });

  it('should remove carts sequentially', async () => {
    const expiredCarts = [
      { id: 'cart-1' },
      { id: 'cart-2' },
    ];

    cartRepository.findAllExpired.mockResolvedValue(expiredCarts as any);

    const callOrder: string[] = [];
    cartRepository.remove.mockImplementation(async (id: string) => {
      callOrder.push(id);
    });

    await useCase.execute();

    expect(callOrder).toEqual(['cart-1', 'cart-2']);
  });
});
