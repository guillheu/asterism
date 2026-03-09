import gleam/erlang/atom.{type Atom}
import gleam/erlang/process.{type Pid}
import gleam/int
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/string
import gleaph

pub type Process {
  PlainProcess(pid: Pid, name: Option(String))
}

pub fn process_to_string(proc: Process) -> String {
  case proc.name {
    Some(name) -> name
    None ->
      string.inspect(proc.pid) |> string.drop_start(6) |> string.drop_end(1)
  }
}

pub fn get_process_tree() -> gleaph.Graph(Pid, Nil) {
  let graph =
    get_all_processes()
    |> list.fold(gleaph.new_graph(), fn(graph, pid) {
      let new_node =
        pid_to_node_id(pid) |> gleaph.new_node |> gleaph.with_value(pid)
      gleaph.add_node(graph, new_node)
    })

  gleaph.fold_values(graph, graph, fn(graph, opt) {
    let assert Some(pid) = opt as "All nodes should have a PID set"
    get_linked_processes(pid)
    |> list.fold(graph, fn(graph, neighbor_pid) {
      let edge =
        pid
        |> pid_to_node_id
        |> gleaph.new_edge(neighbor_pid |> pid_to_node_id)
        |> gleaph.with_relation(Nil)
      gleaph.add_edge(graph, edge)
    })
  })
}

pub fn pid_to_node_id(pid: Pid) -> Int {
  let assert Ok(id) =
    case
      string.inspect(pid)
      |> string.split(".")
    {
      [_, id, _] -> id
      other ->
        panic as { "Invalid PID parsing, found " <> string.inspect(other) }
    }
    |> int.parse

  id
}

// fn recurse_walk_process_graph(
//   already_seen_processes: Dict(Pid, Process),
//   known_links: List(Link),
//   next: List(Pid),
// ) -> #(Dict(Pid, Process), List(Link)) {
//   case next {
//     [first, ..rest] -> {
//       let linked_to =
//         get_linked_processes(first)
//         |> list.filter(fn(linked_process) {
//           !dict.has_key(already_seen_processes, linked_process)
//         })

//       let known_links =
//         list.append(known_links, list.map(linked_to, PlainLink(_, first)))

//       let rest = list.append(rest, linked_to)
//       let already_seen_processes =
//         list.map(linked_to, fn(proc) { #(proc, process_from_pid(proc)) })
//         |> dict.from_list
//         |> dict.combine(already_seen_processes, fn(_, _) {
//           panic as "Process should have been filtered (this is a bad error message)"
//         })
//       recurse_walk_process_graph(already_seen_processes, known_links, rest)
//     }
//     [] -> #(already_seen_processes, known_links)
//   }
// }

// fn process_from_pid(pid: Pid) -> Process {
//   PlainProcess(
//     pid: pid,
//     name: get_process_name(pid) |> option.map(atom.to_string),
//   )
// }

// @external(erlang, "asterism_ffi", "get_init_process")
// fn get_init_process() -> Pid

@external(erlang, "asterism_ffi", "get_linked_processes")
fn get_linked_processes(from: Pid) -> List(Pid)

@external(erlang, "asterism_ffi", "get_process_name")
fn get_process_name(proc: Pid) -> Option(Atom)

@external(erlang, "asterism_ffi", "get_all_processes")
fn get_all_processes() -> List(Pid)
