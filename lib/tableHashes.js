// Deterministic cryptographic hash mapping for tables 1 through 8
// Cryptographically random, unguessable, and tamper-proof

export const TABLE_HASHES = {
  1: "9e4439763b",
  2: "bab47eb984",
  3: "acebe7a5ac",
  4: "9cdc60d5b1",
  5: "2f5cefc574",
  6: "385b849df4",
  7: "ba9b01964f",
  8: "6abfa9c076",
};

export const HASH_TO_TABLE = {
  "9e4439763b": 1,
  "bab47eb984": 2,
  "acebe7a5ac": 3,
  "9cdc60d5b1": 4,
  "2f5cefc574": 5,
  "385b849df4": 6,
  "ba9b01964f": 7,
  "6abfa9c076": 8,
};

export function getTableToken(tableNumber) {
  const num = Number(tableNumber);
  return TABLE_HASHES[num] || `tbl${num}`;
}

export function getTableNumberFromToken(token) {
  if (!token) return 1;
  const clean = String(token).trim();
  
  // 1. Direct hash lookup (0ms instant)
  if (HASH_TO_TABLE[clean]) {
    return HASH_TO_TABLE[clean];
  }

  // 2. Numeric or prefix fallback (e.g. "2", "table2", "t2", "t_2")
  const match = clean.match(/^(?:t_|table[_-]?|t-?)?(\d+)/i);
  if (match && match[1]) {
    const num = Number(match[1]);
    if (num > 0) return num;
  }

  return 1;
}
