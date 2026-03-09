const { spec } = require('pactum');
const { BASE_URL } = require('../setup');

async function createCategory(name = 'Categoria para Produto') {
  return await spec()
    .post(BASE_URL)
    .withGraphQLQuery(`
      mutation AddCategory($input: CategoryInput!) {
        addCategory(input: $input) {
          id
        }
      }
    `)
    .withGraphQLVariables({ input: { name } })
    .expectStatus(200)
    .returns('data.addCategory.id');
}

describe('Produtos - addProduct', () => {
  let categoryId;

  before(async () => {
    categoryId = await createCategory('Categoria Produto Teste');
  });

  it('Deve criar um produto com sucesso', async () => {
    await spec()
      .post(BASE_URL)
      .withGraphQLQuery(`
        mutation AddProduct($input: ProductInput!) {
          addProduct(input: $input) {
            id
            name
            price
            category {
              id
              name
            }
          }
        }
      `)
      .withGraphQLVariables({
        input: {
          name: 'Produto Teste Automatizado',
          price: 99.99,
          category_id: categoryId,
        },
      })
      .expectStatus(200)
      .expectJsonLike({
        data: {
          addProduct: {
            name: 'Produto Teste Automatizado',
            price: 99.99,
          },
        },
      });
  });

  it('Deve retornar id, name, price e category ao criar produto', async () => {
    await spec()
      .post(BASE_URL)
      .withGraphQLQuery(`
        mutation AddProduct($input: ProductInput!) {
          addProduct(input: $input) {
            id
            name
            price
            category {
              id
              name
            }
          }
        }
      `)
      .withGraphQLVariables({
        input: {
          name: 'Produto Schema Teste',
          price: 149.9,
          category_id: categoryId,
        },
      })
      .expectStatus(200)
      .expectJsonSchema({
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              addProduct: {
                type: 'object',
                required: ['id', 'name', 'price', 'category'],
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  price: { type: 'number' },
                  category: {
                    type: 'object',
                    required: ['id', 'name'],
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      });
  });

  it('Deve retornar erro ao criar produto sem nome', async () => {
    await spec()
      .post(BASE_URL)
      .withGraphQLQuery(`
        mutation AddProduct($input: ProductInput!) {
          addProduct(input: $input) {
            id
            name
          }
        }
      `)
      .withGraphQLVariables({
        input: {
          name: '',
          price: 50.0,
          category_id: categoryId,
        },
      })
      .expectStatus(200)
      .expectJsonLike({
        errors: [{}],
      });
  });

  it('Deve retornar erro ao criar produto com categoria inexistente', async () => {
    await spec()
      .post(BASE_URL)
      .withGraphQLQuery(`
        mutation AddProduct($input: ProductInput!) {
          addProduct(input: $input) {
            id
            name
          }
        }
      `)
      .withGraphQLVariables({
        input: {
          name: 'Produto Categoria Inválida',
          price: 50.0,
          category_id: '999999999',
        },
      })
      .expectStatus(200)
      .expectJsonLike({
        errors: [{}],
      });
  });
});
