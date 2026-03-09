import gleam/bytes_tree
import gleam/http/request.{type Request}
import gleam/http/response.{type Response}
import mist.{type Connection, type ResponseData}
import server/internal/server/body

// import server/internal/server/runtime
import server/internal/server/static
import server/internal/server/ws

pub fn get_server() -> mist.Builder(Connection, ResponseData) {
  fn(request: Request(Connection)) -> Response(ResponseData) {
    case request.path_segments(request) {
      [] -> body.serve_html()
      // ["lustre", "runtime.mjs"] -> runtime.serve_runtime()
      ["ws"] -> ws.serve_websocket(request)
      ["client.css"] -> static.serve("client.css", "text/css")
      ["index.html"] -> static.serve("index.css", "text/html")
      ["client.js"] -> static.serve("client.js", "application/javascript")
      _ -> response.set_body(response.new(404), mist.Bytes(bytes_tree.new()))
    }
  }
  |> mist.new
  |> mist.bind("localhost")
  |> mist.port(1234)
}
