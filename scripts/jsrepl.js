var firstOpen = true;

mp.add_key_binding("/", "console", function() {
    mp.input.get({
        "prompt": "> ",
        "keep_open": true,
        "opened": function() {
            if (firstOpen) {
                mp.input.set_log(["JavaScript REPL"]);
                firstOpen = false;
            }
        },
        "submit": function(text) {
            mp.input.log("> " + text);
            try {
                mp.input.log(eval(text).toString());
            }
            catch (error) {
                mp.input.log_error(error.name);
                mp.input.log_error(error.message);
            }
        }
    });
});
