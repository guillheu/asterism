import gleam/int
import gleam/io
import gleam/list
import gleam/option.{None, Some}
import gleam/string

import asterism.{type Id, type Process, Process}

const root_process = Process(
  0,
  [Process(1, [Process(2, []), Process(3, [Process(4, [])])]), Process(5, [])],
)

pub fn main() -> Nil {
  asterism.display(root_process, display_string)
  |> list.intersperse("\n")
  |> string.concat
  |> io.println
  //   print_tree(processes)
  //   |> io.println
}

fn display_string(id: Id, depth: Int) -> String {
  string.repeat("─", depth) <> int.to_string(id)
}
