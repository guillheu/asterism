-module(tiny_sup).
-behaviour(supervisor).
-export([start_link/0, init/1]).

start_link() -> supervisor:start_link({local, ?MODULE}, ?MODULE, []).

init([]) ->
    Flags = #{strategy => one_for_one, intensity => 5, period => 10},
    Children = [#{id => tiny_worker, start => {tiny_worker, start_link, []}}],
    {ok, {Flags, Children}}.