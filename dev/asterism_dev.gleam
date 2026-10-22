import asterism/internal/lustre/view
import gleam/io
import gleam/list
import gleam/string

pub fn main() {
  {
    "@source inline(\"{"
    <> list.map(view.application_color_palette, fn(color) {
      "bg-[" <> color <> "],"
    })
    |> string.concat
    |> string.drop_end(1)
    <> "}\");"
  }
  |> io.println
}
