Feature: Checkout do Carrinho
  Como um cliente
  Eu quero fazer checkout do meu carrinho
  Para finalizar minha compra

  Scenario: Checkout bem-sucedido de um carrinho com produtos
    Given que existe um carrinho com id "cart-123"
    And o carrinho está com status "Open"
    And o carrinho possui os seguintes produtos:
      | product_id | quantity | price |
      | prod-1     | 2        | 10    |
      | prod-2     | 1        | 5     |
    And o carrinho pertence ao cliente "customer-1"
    When eu faço checkout do carrinho "cart-123"
    Then o carrinho deve ser atualizado com status "Closed"
    And deve ser invocado o lambda de criação de pedido com customer_id "customer-1"

  Scenario: Tentativa de checkout de carrinho inexistente
    Given que não existe um carrinho com id "cart-999"
    When eu faço checkout do carrinho "cart-999"
    Then deve retornar erro HTTPNotFound
    And a mensagem de erro deve ser "Cart with id cart-999 not found"

  Scenario: Tentativa de checkout de carrinho já finalizado
    Given que existe um carrinho com id "cart-123"
    And o carrinho está com status "Closed"
    When eu faço checkout do carrinho "cart-123"
    Then deve retornar erro HTTPPreconditionFailed
    And a mensagem de erro deve ser "Cart with id cart-123 is not open for checkout"

  Scenario: Tentativa de checkout de carrinho vazio
    Given que existe um carrinho com id "cart-123"
    And o carrinho está com status "Open"
    And o carrinho não possui produtos
    When eu faço checkout do carrinho "cart-123"
    Then deve retornar erro HTTPPreconditionFailed
    And a mensagem de erro deve ser "Cart with id cart-123 has no products to checkout"

