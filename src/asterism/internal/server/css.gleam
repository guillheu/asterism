import gleam/bytes_tree
import gleam/http/response
import gleam/option.{None}
import mist

pub fn serve_css() -> response.Response(mist.ResponseData) {
  let file_path = "priv/static/index.css"

  case mist.send_file(file_path, offset: 0, limit: None) {
    Ok(file) ->
      response.new(200)
      |> response.prepend_header("content-type", "text/css")
      |> response.set_body(file)

    Error(_) ->
      response.new(404)
      |> response.set_body(mist.Bytes(bytes_tree.new()))
  }
}
