import asterism/internal/lustre/model.{type Model}
import asterism/internal/lustre/update.{type Msg}
import asterism/internal/process_tree.{type Process}
import gleam/erlang/process.{type Pid}
import gleam/int
import gleam/option.{type Option, None, Some}
import gleam/string
import lustre/attribute.{attribute}
import lustre/element.{type Element}
import lustre/element/html
import lustre/element/svg

const arrow_height_per_row = 100

const right_turn_vertical_offset = 40

pub fn view(model: Model) -> Element(Msg) {
  let nodes_display = process_tree.display(model.root, display_node)
  html.div(
    [
      attribute.class("grid grid-cols-3 grid-rows-3 gap-2 w-fit m-auto p-2"),
    ],
    nodes_display,
  )
}

fn display_node(
  process: Process,
  depth: Int,
  index: Int,
  parent_index: Int,
) -> Element(Msg) {
  let process_name = case process.name {
    Some(name) -> name
    None ->
      string.inspect(process.pid)
      |> string.drop_start(6)
      |> string.drop_end(1)
  }
  let depth_string = int.to_string(depth + 1)
  let index_string = int.to_string(index + 1)
  html.div(
    [
      attribute.style("grid-column", depth_string),
      attribute.style("grid-row", index_string),
      attribute.class(
        "border rounded w-50 h-[100px] text-wrap flex items-center justify-center relative",
      ),
    ],
    [
      html.div([attribute.class("object-cover")], [
        process_name
        |> html.text,
      ]),
      draw_arrow(index - parent_index),
    ],
  )
}

fn draw_arrow(height_index: Int) -> Element(Msg) {
  let height =
    { height_index * arrow_height_per_row } - right_turn_vertical_offset
  let height_minus_one = height - arrow_height_per_row
  let height_string = int.to_string(height)
  let arrow_height_1 = int.to_string(96 + height_minus_one)
  let arrow_height_2 = int.to_string(104 + height_minus_one)
  let arrow_height_3 = int.to_string(100 + height_minus_one)
  let vertical_offset =
    10 + height - arrow_height_per_row + right_turn_vertical_offset
  let vertical_offset_string = int.to_string(vertical_offset)
  //   let 
  svg.svg(
    [
      attribute(
        "style",
        "position: absolute; top: -"
          <> vertical_offset_string
          <> "px; left: -110px;",
      ),
      attribute("height", height_string),
      attribute("width", "110"),
      //   attribute.class("-left-40 -top-2"),
    ],
    [
      svg.path([
        attribute("stroke-width", "2"),
        attribute("stroke", "black"),
        attribute("fill", "none"),
        attribute("d", "M 0,0 V " <> height_string <> " H 160"),
      ]),
      svg.polygon([
        attribute("fill", "black"),
        attribute(
          "points",
          "102,"
            <> arrow_height_1
            <> " 102,"
            <> arrow_height_2
            <> " 110,"
            <> arrow_height_3,
        ),
      ]),
    ],
  )
}
