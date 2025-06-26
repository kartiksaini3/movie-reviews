const createTablesQueries = `
-- to generate UUID
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) UNIQUE NOT NULL,
  director VARCHAR(255),
  release_year INT
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  reviewer VARCHAR(255) UNIQUE NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5)
);
`;

export const createTables = async (pool) => {
  try {
    await pool.query(createTablesQueries);
    console.log("Tables created");
  } catch (err) {
    console.error("Error creating tables : ", err);
  }
};
