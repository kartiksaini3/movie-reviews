import "dotenv/config";
import express from "express";
import { Pool } from "pg";
import { createTables } from "./db.js";
import { commonErrorFnc } from "./utils/functions.js";

const app = express();
app.use(express.json());

// ENVs
const port = +process.env.PORT || 5000;
const dbConnectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: dbConnectionString,
});

// add a movie
app.post("/add-movie", async (req, res) => {
  try {
    const { title, director, release_year } = req.body;
    const result = await pool.query(
      "INSERT INTO movies (title, director, release_year) VALUES ($1, $2, $3) RETURNING *",
      [title, director, release_year]
    );
    res.status(201).json(result.rows[0]);
  } catch (er) {
    commonErrorFnc(er.code, res);
  }
});

// add a movie review
app.post("/movie/:id/add-review", async (req, res) => {
  try {
    const { reviewer, rating } = req.body;
    const movieId = req.params.id;
    const result = await pool.query(
      "INSERT INTO reviews (movie_id, reviewer, rating) VALUES ($1, $2, $3) RETURNING *",
      [movieId, reviewer, rating]
    );
    res.status(201).json(result.rows[0]);
  } catch (er) {
    commonErrorFnc(er.code, res);
  }
});

// fetch movie reviews
app.get("/reviews/:id", async (req, res) => {
  try {
    const movieId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    const movieResult = await pool.query("SELECT * FROM movies WHERE id = $1", [
      movieId,
    ]);

    if (movieResult.rowCount === 0) {
      return res.status(404).json({ error: "Movie not found" });
    }

    const reviewsResult = await pool.query(
      `
    SELECT r.* FROM reviews r
    INNER JOIN movies m ON r.movie_id = m.id
    WHERE m.id = $1
    ORDER BY r.id DESC
    LIMIT $2 OFFSET $3
  `,
      [movieId, limit, offset]
    );

    const totalResult = await pool.query(
      `
    SELECT COUNT(*) FROM reviews WHERE movie_id = $1
  `,
      [movieId]
    );
    const totalCount = +totalResult.rows[0].count;

    res.json({
      ...movieResult.rows[0],
      reviews: reviewsResult.rows,
      totalCount,
    });
  } catch (er) {
    commonErrorFnc(er.code, res);
  }
});

app.listen(port, async () => {
  await createTables(pool);
  console.log(`Server running on port ${port}`);
});
