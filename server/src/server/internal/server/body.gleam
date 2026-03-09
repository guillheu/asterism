import gleam/bytes_tree
import gleam/http/response.{type Response}
import gleam/option.{None}
import mist.{type ResponseData}

pub fn serve_html() -> Response(ResponseData) {
  let file_path = "priv/static/index.html"
  case mist.send_file(file_path, offset: 0, limit: None) {
    Ok(file) ->
      response.new(200)
      |> response.prepend_header("content-type", "text/html")
      |> response.set_body(file)

    Error(_) ->
      response.new(404)
      |> response.set_body(mist.Bytes(bytes_tree.new()))
  }
}
