const { spec } = require('pactum');
const { BASE_URL } = require('../setup');

async function createCategory(name) {
  return await spec()
    .post(BASE_URL)
    .withGraphQLQuery(`
      mutation AddCategory($input: CategoryInput!) {
        addCategory(input: $input) { id }
      }
    `)
    .withGraphQLVariables({ input: { name } })
    .expectStatus(200)
    .returns('data.addCategory.id');
}

async function createProduct(name, price, categoryId) {
  return await spec()
    .post(BASE_URL)
    .withGraphQLQuery(`
      mutation AddProduct($input: ProductInput!) {
        addProduct(input: $input) { id }
      }
    `)
    .withGraphQLVariables({
      input: { name, price, category_id: categoryId },
    })
    .expectStatus(200)
    .returns('data.addProduct.id');
}

describe('Produtos - deleteProduct', () => {
  let categoryId;

  before(async () => {
    categoryId = await createCategory('Categoria Delete Produto');
  });

  it('Deve deletar um produto existente com sucesso', async () => {
    const productId = await createProduct('Produto Para Deletar 1', 50.0, categoryId);

    await spec()
      .post(BASE_URL)
      .withGraphQLQuery(`
        mutation DeleteProduct($id: ID!) {
          deleteProduct(id: $id)
        }
      `)
      .withGraphQLVariables({ id: productId })
      .expectStatus(200)
      .expectJsonLike({
        data: {
          deleteProduct: true,
        },
      });
  });

  it('Deve retornar schema correto ao deletar produto', async () => {
    const productId = await createProduct('Produto Delete Schema', 45.0, categoryId);

    await spec()
      .post(BASE_URL)
      .withGraphQLQuery(`
        mutation DeleteProduct($id: ID!) {
          deleteProduct(id: $id)
        }
      `)
      .withGraphQLVariables({ id: productId })
      .expectStatus(200)
      .expectJsonSchema({
        type: 'object',
        properties: {
          data: {
            type: 'object',
            required: ['deleteProduct'],
            properties: {
              deleteProduct: {
                type: 'boolean',
              },
            },
          },
        },
        required: ['data'],
      });
  });

  it('Deve retornar erro ao deletar produto com ID inválido', async () => {
    await spec()
      .post(BASE_URL)
      .withGraphQLQuery(`
        mutation DeleteProduct($id: ID!) {
          deleteProduct(id: $id)
        }
      `)
      .withGraphQLVariables({ id: '999999999' })
      .expectStatus(200)
      .expectJsonLike({
        errors: [{}],
      });
  });
});
