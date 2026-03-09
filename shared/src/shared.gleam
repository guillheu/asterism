import gleam/io
import gleam/option
import lustre/element
import shared/layout
import shared/view
import simplifile

pub fn main() -> Nil {
  let l =
    layout.GraphLayout(
      [layout.NodeLayout("test", option.Some("Test"), 0.0, 0.0)],
      [],
    )
    |> view.view
    |> element.to_document_string

  let assert Ok(_) = simplifile.write("out.html", l)

  io.println("Hello from shared!")
}
