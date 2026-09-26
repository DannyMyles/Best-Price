import { Router } from "express";
import { parse } from "../errors.js";
import { bulkProductsSchema, idParam, listQuerySchema, productCreateSchema, productUpdateSchema } from "../schemas.js";
import {
  bulkUpsertProducts,
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct,
} from "../services/products.js";

export function adminProductsRouter(ctx) {
  const r = Router();

  r.get("/products", async (req, res) => {
    res.json(await listProducts(ctx, parse(listQuerySchema, req.query), { publicOnly: false }));
  });

  r.get("/products/:id", async (req, res) => {
    const { id } = parse(idParam, req.params);
    res.json(await getProductById(ctx, id));
  });

  r.post("/products", async (req, res) => {
    const product = await createProduct(ctx, parse(productCreateSchema, req.body));
    res.status(201).location(`/api/admin/products/${product.id}`).json(product);
  });

  // Bulk create-or-update by SKU (used by CSV import): { items: [ {sku,name,category,...}, ... ] }
  r.post("/products/bulk", async (req, res) => {
    const { items } = parse(bulkProductsSchema, req.body);
    res.json(await bulkUpsertProducts(ctx, items));
  });

  // Partial update — this is also how prices are changed: PATCH { "price": 79999 }.
  r.patch("/products/:id", async (req, res) => {
    const { id } = parse(idParam, req.params);
    res.json(await updateProduct(ctx, id, parse(productUpdateSchema, req.body)));
  });

  r.delete("/products/:id", async (req, res) => {
    const { id } = parse(idParam, req.params);
    await deleteProduct(ctx, id);
    res.status(204).end();
  });

  return r;
}
