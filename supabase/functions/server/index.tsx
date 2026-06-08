import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-45c8de4c/health", (c) => {
  return c.json({ status: "ok" });
});

// Get all books (including deleted IDs)
app.get("/make-server-45c8de4c/books", async (c) => {
  try {
    const books = await kv.getByPrefix("book:");
    const deletedIds = await kv.get("deleted_book_ids") || [];
    return c.json({ books, deletedIds });
  } catch (error) {
    console.log("Error fetching books:", error);
    return c.json({ error: `Failed to fetch books: ${error.message}` }, 500);
  }
});

// Add a new book
app.post("/make-server-45c8de4c/books", async (c) => {
  try {
    const body = await c.req.json();
    const { book } = body;

    if (!book || !book.id) {
      return c.json({ error: "Book data with id is required" }, 400);
    }

    await kv.set(`book:${book.id}`, book);
    return c.json({ success: true, book });
  } catch (error) {
    console.log("Error adding book:", error);
    return c.json({ error: `Failed to add book: ${error.message}` }, 500);
  }
});

// Update a book
app.put("/make-server-45c8de4c/books/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const { book } = body;

    if (!book) {
      return c.json({ error: "Book data is required" }, 400);
    }

    await kv.set(`book:${id}`, { ...book, id: parseInt(id) });
    return c.json({ success: true, book: { ...book, id: parseInt(id) } });
  } catch (error) {
    console.log("Error updating book:", error);
    return c.json({ error: `Failed to update book: ${error.message}` }, 500);
  }
});

// Delete a book
app.delete("/make-server-45c8de4c/books/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));

    // Get current deleted IDs list
    const deletedIds = await kv.get("deleted_book_ids") || [];

    // Add this ID to deleted list if not already there
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      await kv.set("deleted_book_ids", deletedIds);
    }

    // Also remove from database if it exists
    await kv.del(`book:${id}`);

    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting book:", error);
    return c.json({ error: `Failed to delete book: ${error.message}` }, 500);
  }
});

Deno.serve(app.fetch);