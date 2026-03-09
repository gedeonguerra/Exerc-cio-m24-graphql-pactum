const { spec } = require('pactum');
const { BASE_URL } = require('../setup');

async function createCategory(name = 'Categoria Para Deletar') {
  return await spec()
    .post(BASE_URL)
    .withGraphQLQuery(`
      mutation AddCategory($input: CategoryInput!) {
        addCategory(input: $input) {
          id
          name
        }
      }
    `)
    .withGraphQLVariables({ input: { name } })
    .expectStatus(200)
    .returns('data.addCategory.id');
}

describe('Categorias - deleteCategory', () => {
  it('Deve deletar uma categoria existente com sucesso', async () => {
    const categoryId = await createCategory('Categoria Para Deletar 1');

    await spec()
      .post(BASE_URL)
      .withGraphQLQuery(`
        mutation DeleteCategory($id: ID!) {
          deleteCategory(id: $id)
        }
      `)
      .withGraphQLVariables({ id: categoryId })
      .expectStatus(200)
      .expectJsonLike({
        data: {
          deleteCategory: true,
        },
      });
  });

  it('Deve retornar schema correto ao deletar categoria', async () => {
    const categoryId = await createCategory('Categoria Para Deletar Schema');

    await spec()
      .post(BASE_URL)
      .withGraphQLQuery(`
        mutation DeleteCategory($id: ID!) {
          deleteCategory(id: $id)
        }
      `)
      .withGraphQLVariables({ id: categoryId })
      .expectStatus(200)
      .expectJsonSchema({
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              deleteCategory: {
                type: 'boolean',
              },
            },
            required: ['deleteCategory'],
          },
        },
        required: ['data'],
      });
  });

  it('Deve retornar erro ao deletar categoria com ID inválido', async () => {
    await spec()
      .post(BASE_URL)
      .withGraphQLQuery(`
        mutation DeleteCategory($id: ID!) {
          deleteCategory(id: $id)
        }
      `)
      .withGraphQLVariables({ id: '999999999' })
      .expectStatus(200)
      .expectJsonLike({
        errors: [{}],
      });
  });
});
