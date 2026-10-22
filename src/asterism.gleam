import asterism/internal/server
import gleam/erlang/process
import mist

pub fn main() -> Nil {
  let server = server.get_server()
  let assert Ok(_) = mist.start(server)
  process.sleep_forever()
}
