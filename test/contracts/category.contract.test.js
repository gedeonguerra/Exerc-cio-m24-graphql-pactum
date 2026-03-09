const { spec } = require('pactum');
const { BASE_URL } = require('../setup');

// ============================================================
// Schemas de Contrato para Categorias
// ============================================================

const addCategorySchema = {
  type: 'object',
  required: ['data'],
  properties: {
    data: {
      type: 'object',
      required: ['addCategory'],
      properties: {
        addCategory: {
          type: 'object',
          required: ['id', 'name'],
          properties: {
            id: {
              type: 'string',
              description: 'ID único da categoria',
            },
            name: {
              type: 'string',
              minLength: 1,
              description: 'Nome da categoria',
            },
          },
          additionalProperties: false,
        },
      },
    },
  },
};

const editCategorySchema = {
  type: 'object',
  required: ['data'],
  properties: {
    data: {
      type: 'object',
      required: ['editCategory'],
      properties: {
        editCategory: {
          type: 'object',
          required: ['id', 'name'],
          properties: {
            id: {
              type: 'string',
            },
            name: {
              type: 'string',
              minLength: 1,
            },
          },
          additionalProperties: false,
        },
      },
    },
  },
};

const deleteCategorySchema = {
  type: 'object',
  required: ['data'],
  properties: {
    data: {
      type: 'object',
      required: ['deleteCategory'],
      properties: {
        deleteCategory: {
          type: 'boolean',
        },
      },
    },
  },
};

// Helper
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

// ============================================================
// Testes de Contrato
// ============================================================

describe('Contratos - Categorias', () => {
  describe('Contrato: addCategory', () => {
    it('Deve validar o contrato da resposta de addCategory', async () => {
      await spec()
        .post(BASE_URL)
        .withGraphQLQuery(`
          mutation AddCategory($input: CategoryInput!) {
            addCategory(input: $input) {
              id
              name
            }
          }
        `)
        .withGraphQLVariables({
          input: { name: 'Categoria Contrato Test' },
        })
        .expectStatus(200)
        .expectJsonSchema(addCategorySchema);
    });

    it('O campo id deve ser uma string não vazia', async () => {
      await spec()
        .post(BASE_URL)
        .withGraphQLQuery(`
          mutation AddCategory($input: CategoryInput!) {
            addCategory(input: $input) {
              id
              name
            }
          }
        `)
        .withGraphQLVariables({
          input: { name: 'Categoria ID Contrato' },
        })
        .expectStatus(200)
        .expect((ctx) => {
          const id = ctx.res.body.data.addCategory.id;
          if (!id || id.trim() === '') {
            throw new Error('O campo id não pode ser vazio');
          }
        });
    });
  });

  describe('Contrato: editCategory', () => {
    it('Deve validar o contrato da resposta de editCategory', async () => {
      const categoryId = await createCategory('Categoria Edit Contrato');

      await spec()
        .post(BASE_URL)
        .withGraphQLQuery(`
          mutation EditCategory($id: ID!, $input: CategoryInput!) {
            editCategory(id: $id, input: $input) {
              id
              name
            }
          }
        `)
        .withGraphQLVariables({
          id: categoryId,
          input: { name: 'Categoria Editada Contrato' },
        })
        .expectStatus(200)
        .expectJsonSchema(editCategorySchema);
    });
  });

  describe('Contrato: deleteCategory', () => {
    it('Deve validar o contrato da resposta de deleteCategory', async () => {
      const categoryId = await createCategory('Categoria Delete Contrato');

      await spec()
        .post(BASE_URL)
        .withGraphQLQuery(`
          mutation DeleteCategory($id: ID!) {
            deleteCategory(id: $id)
          }
        `)
        .withGraphQLVariables({ id: categoryId })
        .expectStatus(200)
        .expectJsonSchema(deleteCategorySchema);
    });
  });
});
