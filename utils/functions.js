export const commonErrorFnc = (erCode, res) => {
  if (erCode === "23505") {
    res.status(400).json({ error: true, message: "Duplicate key not allowed" });
    return;
  }
  res.status(500).json({ error: true, message: "Internal Server Error" });
};
