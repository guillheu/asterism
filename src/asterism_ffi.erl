-module(asterism_ffi).
-export([get_root_process/0, get_children/1, get_linked_pids/1, get_process_name/1]).

get_root_process() ->
    whereis(init).

get_children(SupRef) ->
    supervisor:which_children(SupRef).

get_linked_pids(Pid) ->
    case process_info(Pid, links) of
        {links, LinkedPids} ->
            LinkedPids;
        undefined ->
            error(badarg)
    end.

get_process_name(Pid) ->
    case process_info(Pid, registered_name) of
        []                      -> none;
        {registered_name, Name} -> {some, Name}
    end.