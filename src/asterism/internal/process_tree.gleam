import gleam/dict.{type Dict}
import gleam/erlang/atom.{type Atom}
import gleam/erlang/process.{type Pid}
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/string

pub type Process {
  PlainProcess(pid: Pid, name: Option(String))
}

pub type Link {
  PlainLink(pid_1: Pid, pid_2: Pid)
}

pub fn process_to_string(proc: Process) -> String {
  case proc.name {
    Some(name) -> name
    None ->
      string.inspect(proc.pid) |> string.drop_start(6) |> string.drop_end(1)
  }
}

pub fn get_process_tree() -> #(List(Process), List(Link)) {
  let root_pid = get_init_process()
  let #(processes, links) =
    dict.from_list([])
    |> recurse_walk_process_graph([], [root_pid])

  let processes = dict.values(processes)
  #(processes, links)
}

fn recurse_walk_process_graph(
  already_seen_processes: Dict(Pid, Process),
  known_links: List(Link),
  next: List(Pid),
) -> #(Dict(Pid, Process), List(Link)) {
  case next {
    [first, ..rest] -> {
      let linked_to =
        get_linked_processes(first)
        |> list.filter(fn(linked_process) {
          !dict.has_key(already_seen_processes, linked_process)
        })

      let known_links =
        list.append(known_links, list.map(linked_to, PlainLink(_, first)))

      let rest = list.append(rest, linked_to)
      let already_seen_processes =
        list.map(linked_to, fn(proc) { #(proc, process_from_pid(proc)) })
        |> dict.from_list
        |> dict.combine(already_seen_processes, fn(_, _) {
          panic as "Process should have been filtered (this is a bad error message)"
        })
      recurse_walk_process_graph(already_seen_processes, known_links, rest)
    }
    [] -> #(already_seen_processes, known_links)
  }
}

fn process_from_pid(pid: Pid) -> Process {
  PlainProcess(
    pid: pid,
    name: get_process_name(pid) |> option.map(atom.to_string),
  )
}

@external(erlang, "asterism_ffi", "get_init_process")
fn get_init_process() -> Pid

@external(erlang, "asterism_ffi", "get_linked_processes")
fn get_linked_processes(from: Pid) -> List(Pid)

@external(erlang, "asterism_ffi", "get_process_name")
fn get_process_name(proc: Pid) -> Option(Atom)
