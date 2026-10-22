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
  // let html =
  //   html([attribute.lang("en")], [
  //     html.head([], [
  //       html.meta([attribute.charset("utf-8")]),
  //       html.meta([
  //         attribute.name("viewport"),
  //         attribute.content("width=device-width, initial-scale=1"),
  //       ]),
  //       html.title([], "Asterism"),
  //       html.link([
  //         attribute.rel("stylesheet"),
  //         attribute.type_("text/css"),
  //         attribute.href("index.css"),
  //       ]),
  //       html.script(
  //         [attribute.type_("module"), attribute.src("/lustre/runtime.mjs")],
  //         "",
  //       ),
  //     ]),
  //     html.body([], [
  //       server_component.element([server_component.route("/ws")], []),
  //     ]),
  //   ])
  //   |> element.to_document_string_tree
  //   |> bytes_tree.from_string_tree

  // response.new(200)
  // |> response.set_body(mist.Bytes(html))
  // |> response.set_header("content-type", "text/html")
}
