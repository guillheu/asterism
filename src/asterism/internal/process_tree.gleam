import aonyx/graph
import aonyx/graph/edge
import gleam/dict.{type Dict}
import gleam/erlang/atom.{type Atom}
import gleam/erlang/process.{type Pid}
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/string

pub opaque type Process {
  Process(pid: Pid, application: Option(String))
  NamedProcess(pid: Pid, application: Option(String), name: String)
}

pub type Link {
  Link(pid_1: Pid, pid_2: Pid)
}

pub fn process_to_string(proc: Process) -> String {
  case proc {
    Process(pid, _application) ->
      string.inspect(pid) |> string.drop_start(6) |> string.drop_end(1)
    NamedProcess(_pid, _application, name:) -> name
  }
}

pub fn get_process_application(proc: Process) -> Option(String) {
  proc.application
}

pub fn get_process_forest() -> graph.Graph(String, Process, Nil) {
  recurse_walk_process_graph(graph.new(), dict.new(), [
    get_init_process(),
  ])
}

pub fn get_applications() -> List(String) {
  list.map(get_loaded_applications(), fn(app) {
    let #(name_atom, _description, _vsn) = app
    atom.to_string(name_atom)
  })
}

fn recurse_walk_process_graph(
  current_graph: graph.Graph(String, Process, Nil),
  current_seen_processes: Dict(Pid, Nil),
  current_pids: List(Pid),
) -> graph.Graph(String, Process, Nil) {
  case current_pids {
    [current_pid, ..current_remaining_pids] -> {
      let linked_to =
        get_linked_processes(current_pid)
        |> list.filter(fn(linked_process) {
          !dict.has_key(current_seen_processes, linked_process)
        })

      let current_process_id_string =
        process_from_pid(current_pid) |> process_to_string

      let next_seen_processes =
        list.map(linked_to, fn(pid_to) { #(pid_to, Nil) })
        |> dict.from_list
        |> dict.combine(current_seen_processes, fn(_, _) {
          panic as "Process should have been filtered (this is a bad error message)"
        })

      let next_graph =
        list.fold(linked_to, current_graph, fn(graph, pid) {
          let process = process_from_pid(pid)
          let process_string_id = process_to_string(process)
          graph.insert_edge(
            graph,
            edge.new(current_process_id_string, process_string_id),
            process,
          )
        })

      // let known_links =
      //   list.append(known_links, list.map(linked_to, PlainLink(_, first)))

      // let rest = list.append(rest, linked_to)
      // let already_seen_processes =
      //   list.map(linked_to, fn(proc) { #(proc, process_from_pid(proc)) })
      //   |> dict.from_list
      //   |> dict.combine(already_seen_processes, fn(_, _) {
      //     panic as "Process should have been filtered (this is a bad error message)"
      //   })
      let next_pids = list.append(current_remaining_pids, linked_to)
      recurse_walk_process_graph(next_graph, next_seen_processes, next_pids)
    }
    [] -> current_graph
  }
}

fn process_from_pid(pid: Pid) -> Process {
  let application =
    pid
    |> get_pid_application
    |> option.from_result
    |> option.map(atom.to_string)
  case get_process_name(pid) {
    Some(name) -> NamedProcess(pid, application, name |> atom.to_string)
    None -> Process(pid, application)
  }
}

@external(erlang, "asterism_ffi", "get_init_process")
fn get_init_process() -> Pid

@external(erlang, "asterism_ffi", "get_linked_processes")
fn get_linked_processes(from: Pid) -> List(Pid)

@external(erlang, "asterism_ffi", "get_process_name")
fn get_process_name(proc: Pid) -> Option(Atom)

@external(erlang, "asterism_ffi", "get_process_application")
fn get_pid_application(proc: Pid) -> Result(Atom, Nil)

@external(erlang, "asterism_ffi", "get_loaded_applications")
fn get_loaded_applications() -> List(#(Atom, String, String))
