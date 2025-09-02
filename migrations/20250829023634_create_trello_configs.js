// migrations/xxxx_create_trello_configs.js
export async function up(knex) {
  return knex.schema.createTable("trello_configs", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("name").notNullable(); // Nome da configuração (Cell_1, Cell_2, etc.)
    table.string("key").notNullable(); // Chave da API do Trello
    table.string("token").notNullable(); // Token de acesso
    table.string("boardId").notNullable(); // ID do quadro
    table.string("listId").notNullable(); // ID da lista
    table.timestamp("createdAt").defaultTo(knex.fn.now()); // Data de criação
  });
}

export async function down(knex) {
  return knex.schema.dropTable("trello_configs");
}
