import gleam/bytes_tree
import gleam/erlang/application
import gleam/http/response
import gleam/option.{None}
import mist

fn serve_runtime() -> response.Response(mist.ResponseData) {
  // `application` module from the `gleam_erlang` package
  let assert Ok(lustre_priv) = application.priv_directory("lustre")
  let file_path = lustre_priv <> "/static/lustre-server-component.mjs"

  case mist.send_file(file_path, offset: 0, limit: None) {
    Ok(file) ->
      response.new(200)
      |> response.prepend_header("content-type", "application/javascript")
      |> response.set_body(file)

    Error(_) ->
      response.new(404)
      |> response.set_body(mist.Bytes(bytes_tree.new()))
  }
}
