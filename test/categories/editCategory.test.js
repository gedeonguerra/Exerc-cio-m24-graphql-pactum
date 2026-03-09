const { spec } = require('pactum');
const { BASE_URL } = require('../setup');

// Helper para criar uma categoria e retornar o ID
async function createCategory(name = 'Categoria Para Editar') {
  const id = await spec()
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

  return id;
}

describe('Categorias - editCategory', () => {
  let categoryId;

  before(async () => {
    categoryId = await createCategory('Categoria Original');
  });

  it('Deve editar uma categoria existente com sucesso', async () => {
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
        input: {
          name: 'Categoria Editada',
        },
      })
      .expectStatus(200)
      .expectJsonLike({
        data: {
          editCategory: {
            id: categoryId,
            name: 'Categoria Editada',
          },
        },
      });
  });

  it('Deve retornar o schema correto ao editar categoria', async () => {
    const newId = await createCategory('Categoria Schema Edit');

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
        id: newId,
        input: { name: 'Categoria Schema Editada' },
      })
      .expectStatus(200)
      .expectJsonSchema({
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              editCategory: {
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
      });
  });

  it('Deve retornar erro ao editar categoria com ID inexistente', async () => {
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
        id: '999999999',
        input: { name: 'Nome Inválido' },
      })
      .expectStatus(200)
      .expectJsonLike({
        errors: [{}],
      });
  });
});
