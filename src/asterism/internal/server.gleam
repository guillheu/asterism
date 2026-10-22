import asterism/internal/server/body
import asterism/internal/server/runtime
import asterism/internal/server/static
import asterism/internal/server/ws
import gleam/bytes_tree
import gleam/http/request.{type Request}
import gleam/http/response.{type Response}
import mist.{type Connection, type ResponseData}

pub fn get_server() -> mist.Builder(Connection, ResponseData) {
  fn(request: Request(Connection)) -> Response(ResponseData) {
    case request.path_segments(request) {
      [] -> body.serve_html()
      ["lustre", "runtime.mjs"] -> runtime.serve_runtime()
      ["ws"] -> ws.serve_websocket(request)
      ["index.css"] -> static.serve("index.css", "text/css")
      ["index.html"] -> static.serve("index.css", "text/html")
      ["front.js"] -> static.serve("front.js", "application/javascript")
      _ -> response.set_body(response.new(404), mist.Bytes(bytes_tree.new()))
    }
  }
  |> mist.new
  |> mist.bind("localhost")
  |> mist.port(1234)
}
