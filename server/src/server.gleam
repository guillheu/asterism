import gleam/erlang/process
import mist
import server/internal/server

pub fn main() -> Nil {
  let server = server.get_server()
  let assert Ok(_) = mist.start(server)
  process.sleep_forever()
}
