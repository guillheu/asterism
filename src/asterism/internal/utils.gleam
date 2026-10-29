import gleam/bit_array.{pad_to_bytes}
import gleam/crypto
import gleam/string

pub fn string_to_hex_color(to_hash input: String) -> String {
  let bits = bit_array.from_string(input)
  let assert Ok(hash) =
    crypto.hash(crypto.Sha224, bits)
    |> bit_array.slice(0, 2)
  let assert <<
    first:bits-size(3),
    second:bits-size(3),
    third:bits-size(3),
    _:bits,
  >> = hash
  "#"
  <> {
    [pad_to_bytes(first), pad_to_bytes(second), pad_to_bytes(third)]
    |> bit_array.concat
    |> bit_array.base16_encode
    |> string.lowercase
  }
}
