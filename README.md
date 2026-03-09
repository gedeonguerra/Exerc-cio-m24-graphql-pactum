# Módulo 24 - Automação de API: Conhecendo GraphQL e PactumJS

Projeto de automação de testes de API utilizando **PactumJS**, **Mocha** e **Mochawesome** para a aplicação [Loja EBAC](https://lojaebac.ebaconline.art.br/).

## 🛠️ Tecnologias

- [PactumJS](https://pactumjs.github.io/) — Automação de testes de API e testes de contrato
- [Mocha](https://mochajs.org/) — Test runner
- [Mochawesome](https://github.com/adamgruber/mochawesome) — Geração de relatórios HTML

## 📁 Estrutura do Projeto

```
m24-graphql-pactum/
├── test/
│   ├── setup.js                          # Configurações globais
│   ├── categories/
│   │   ├── addCategory.test.js           # Testes de criação de categorias
│   │   ├── editCategory.test.js          # Testes de edição de categorias
│   │   └── deleteCategory.test.js        # Testes de exclusão de categorias
│   ├── products/
│   │   ├── addProduct.test.js            # Testes de criação de produtos
│   │   ├── editProduct.test.js           # Testes de edição de produtos
│   │   └── deleteProduct.test.js         # Testes de exclusão de produtos
│   └── contracts/
│       ├── category.contract.test.js     # Testes de contrato - categorias
│       └── product.contract.test.js      # Testes de contrato - produtos
├── .mocharc.js                           # Configuração do Mocha + Mochawesome
├── package.json
└── README.md
```

## ▶️ Como executar

### Pré-requisitos

- Node.js >= 16
- npm >= 8

### Instalação

```bash
npm install
```

### Executar todos os testes

```bash
npm test
```

### Executar por suíte

```bash
# Apenas categorias
npm run test:categories

# Apenas produtos
npm run test:products

# Apenas contratos
npm run test:contracts
```

### Relatório

Após a execução, o relatório HTML é gerado automaticamente em:

```
reports/test-report.html
```

Abra o arquivo no navegador para visualizar os resultados.

## 📋 Cobertura de Testes

### Categorias
| Método | Cenários |
|---|---|
| `addCategory` | ✅ Criação com sucesso, ✅ Validação de schema, ✅ Erro sem nome |
| `editCategory` | ✅ Edição com sucesso, ✅ Validação de schema, ✅ Erro com ID inválido |
| `deleteCategory` | ✅ Deleção com sucesso, ✅ Validação de schema, ✅ Erro com ID inválido |

### Produtos
| Método | Cenários |
|---|---|
| `addProduct` | ✅ Criação com sucesso, ✅ Validação de schema, ✅ Erro sem nome, ✅ Erro com categoria inválida |
| `editProduct` | ✅ Edição com sucesso, ✅ Validação de schema, ✅ Erro com ID inválido |
| `deleteProduct` | ✅ Deleção com sucesso, ✅ Validação de schema, ✅ Erro com ID inválido |

### Testes de Contrato
| Serviço | Métodos cobertos |
|---|---|
| Categorias | `addCategory`, `editCategory`, `deleteCategory` |
| Produtos | `addProduct`, `editProduct`, `deleteProduct` |

## 🔗 API

**Endpoint GraphQL:** `https://lojaebac.ebaconline.art.br/graphql`

**Branch:** `main`
