const { spec } = require('pactum');
const { BASE_URL } = require('../setup');

// ============================================================
// Schemas de Contrato para Produtos
// ============================================================

const categoryRefSchema = {
  type: 'object',
  required: ['id', 'name'],
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
  },
};

const addProductSchema = {
  type: 'object',
  required: ['data'],
  properties: {
    data: {
      type: 'object',
      required: ['addProduct'],
      properties: {
        addProduct: {
          type: 'object',
          required: ['id', 'name', 'price', 'category'],
          properties: {
            id: {
              type: 'string',
              description: 'ID único do produto',
            },
            name: {
              type: 'string',
              minLength: 1,
              description: 'Nome do produto',
            },
            price: {
              type: 'number',
              minimum: 0,
              description: 'Preço do produto',
            },
            category: categoryRefSchema,
          },
        },
      },
    },
  },
};

const editProductSchema = {
  type: 'object',
  required: ['data'],
  properties: {
    data: {
      type: 'object',
      required: ['editProduct'],
      properties: {
        editProduct: {
          type: 'object',
          required: ['id', 'name', 'price', 'category'],
          properties: {
            id: { type: 'string' },
            name: { type: 'string', minLength: 1 },
            price: { type: 'number', minimum: 0 },
            category: categoryRefSchema,
          },
        },
      },
    },
  },
};

const deleteProductSchema = {
  type: 'object',
  required: ['data'],
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
};

// Helpers
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
    .withGraphQLVariables({ input: { name, price, category_id: categoryId } })
    .expectStatus(200)
    .returns('data.addProduct.id');
}

// ============================================================
// Testes de Contrato
// ============================================================

describe('Contratos - Produtos', () => {
  let categoryId;

  before(async () => {
    categoryId = await createCategory('Categoria Contrato Produtos');
  });

  describe('Contrato: addProduct', () => {
    it('Deve validar o contrato da resposta de addProduct', async () => {
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
            name: 'Produto Contrato Test',
            price: 199.99,
            category_id: categoryId,
          },
        })
        .expectStatus(200)
        .expectJsonSchema(addProductSchema);
    });

    it('O campo price deve ser um número positivo', async () => {
      await spec()
        .post(BASE_URL)
        .withGraphQLQuery(`
          mutation AddProduct($input: ProductInput!) {
            addProduct(input: $input) {
              id
              name
              price
              category { id name }
            }
          }
        `)
        .withGraphQLVariables({
          input: {
            name: 'Produto Price Contrato',
            price: 299.5,
            category_id: categoryId,
          },
        })
        .expectStatus(200)
        .expect((ctx) => {
          const price = ctx.res.body.data.addProduct.price;
          if (typeof price !== 'number' || price < 0) {
            throw new Error('O campo price deve ser um número não negativo');
          }
        });
    });
  });

  describe('Contrato: editProduct', () => {
    it('Deve validar o contrato da resposta de editProduct', async () => {
      const productId = await createProduct('Produto Edit Contrato', 55.0, categoryId);

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
          id: productId,
          input: {
            name: 'Produto Editado Contrato',
            price: 88.0,
            category_id: categoryId,
          },
        })
        .expectStatus(200)
        .expectJsonSchema(editProductSchema);
    });
  });

  describe('Contrato: deleteProduct', () => {
    it('Deve validar o contrato da resposta de deleteProduct', async () => {
      const productId = await createProduct('Produto Delete Contrato', 33.0, categoryId);

      await spec()
        .post(BASE_URL)
        .withGraphQLQuery(`
          mutation DeleteProduct($id: ID!) {
            deleteProduct(id: $id)
          }
        `)
        .withGraphQLVariables({ id: productId })
        .expectStatus(200)
        .expectJsonSchema(deleteProductSchema);
    });
  });
});
