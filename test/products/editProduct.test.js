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
        addProduct(input: $input) { id name price }
      }
    `)
    .withGraphQLVariables({
      input: { name, price, category_id: categoryId },
    })
    .expectStatus(200)
    .returns('data.addProduct.id');
}

describe('Produtos - editProduct', () => {
  let productId;
  let categoryId;

  before(async () => {
    categoryId = await createCategory('Categoria Edit Produto');
    productId = await createProduct('Produto Para Editar', 75.0, categoryId);
  });

  it('Deve editar um produto existente com sucesso', async () => {
    await spec()
      .post(BASE_URL)
      .withGraphQLQuery(`
        mutation EditProduct($id: ID!, $input: ProductInput!) {
          editProduct(id: $id, input: $input) {
            id
            name
            price
          }
        }
      `)
      .withGraphQLVariables({
        id: productId,
        input: {
          name: 'Produto Editado',
          price: 120.0,
          category_id: categoryId,
        },
      })
      .expectStatus(200)
      .expectJsonLike({
        data: {
          editProduct: {
            id: productId,
            name: 'Produto Editado',
            price: 120.0,
          },
        },
      });
  });

  it('Deve retornar schema correto ao editar produto', async () => {
    const newProductId = await createProduct('Produto Schema Edit', 60.0, categoryId);

    await spec()
      .post(BASE_URL)
      .withGraphQLQuery(`
        mutation EditProduct($id: ID!, $input: ProductInput!) {
          editProduct(id: $id, input: $input) {
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
        id: newProductId,
        input: {
          name: 'Produto Schema Editado',
          price: 80.0,
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
              editProduct: {
                type: 'object',
                required: ['id', 'name', 'price', 'category'],
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  price: { type: 'number' },
                  category: {
                    type: 'object',
                    required: ['id', 'name'],
                  },
                },
              },
            },
          },
        },
      });
  });

  it('Deve retornar erro ao editar produto com ID inválido', async () => {
    await spec()
      .post(BASE_URL)
      .withGraphQLQuery(`
        mutation EditProduct($id: ID!, $input: ProductInput!) {
          editProduct(id: $id, input: $input) {
            id
            name
          }
        }
      `)
      .withGraphQLVariables({
        id: '999999999',
        input: {
          name: 'Produto Inválido',
          price: 10.0,
          category_id: categoryId,
        },
      })
      .expectStatus(200)
      .expectJsonLike({
        errors: [{}],
      });
  });
});
