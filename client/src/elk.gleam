import gleam/javascript/array.{type Array}
import gleam/javascript/promise.{type Promise}
import shared/layout

@external(javascript, "./client_ffi.mjs", "get_elk_layout")
pub fn do_get_elk_layout(
  nodes: Array(layout.NodeLayout),
  edges: Array(layout.EdgeLayout),
) -> Promise(Array(layout.NodeLayout))
