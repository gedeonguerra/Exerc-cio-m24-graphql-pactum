const { spec, stash } = require('pactum');
const { BASE_URL } = require('../setup');

describe('Categorias - addCategory', () => {
  it('Deve criar uma categoria com sucesso', async () => {
    const response = await spec()
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
        input: {
          name: 'Categoria Teste Automatizado',
        },
      })
      .expectStatus(200)
      .expectJsonLike({
        data: {
          addCategory: {
            name: 'Categoria Teste Automatizado',
          },
        },
      })
      .returns('data.addCategory.id');

    stash.addDataStore('categoryId', response);
  });

  it('Deve retornar id e name ao criar categoria', async () => {
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
        input: {
          name: 'Categoria Para Deletar',
        },
      })
      .expectStatus(200)
      .expectJsonSchema({
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              addCategory: {
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

  it('Deve retornar erro ao criar categoria sem nome', async () => {
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
        input: {
          name: '',
        },
      })
      .expectStatus(200)
      .expectJsonLike({
        errors: [{}],
      });
  });
});
