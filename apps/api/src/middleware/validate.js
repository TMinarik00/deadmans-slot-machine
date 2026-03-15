// Validation middleware using Zod.
// Zod lets us define a schema for the request body and validate it.
// If validation fails, we return a 400 with clear error messages
// instead of letting bad data reach our business logic.

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return res.status(400).json({ error: "Validation failed", details: errors });
    }

    req.body = result.data; // use the parsed/cleaned data
    next();
  };
}
