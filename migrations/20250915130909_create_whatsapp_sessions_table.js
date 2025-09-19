export async function up(knex) {
  return knex.schema.createTable("whatsapp_sessions", (table) => {
    table.string("sessionId").primary();
    table.string("trelloConfigName").notNullable();
    table.string("status").notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

export async function down(knex) {
  return knex.schema.dropTable("whatsapp_sessions");
};