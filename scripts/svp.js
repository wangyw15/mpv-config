var config = {
    "svp-ipc": "mpvpipe",
    "restore-filter-wait-time": 3,
};
mp.options.read_options(config);

function checkSVPFilter() {
    var result = false;
    mp.get_property_native("vf").forEach(function(filter) {
        if (filter.label == "svp") {
            result = true;
        }
    });
    return result;
}

mp.add_key_binding(null, "toggle", function() {
    if (mp.get_property("input-ipc-server") === config["svp-ipc"] && checkSVPFilter()) {
        mp.command("no-osd vf toggle @svp");
    }
    else {
        // SVP will delete other video filters when IPC connected
        var backupFilters = mp.get_property_native("vf");

        mp.command("no-osd vf clr ''");
        mp.set_property("input-ipc-server", config["svp-ipc"]);

        var restoreFilter = setInterval(function() {
            if (checkSVPFilter()) {
                mp.set_property_native("vf", mp.get_property_native("vf").concat(backupFilters));
                clearInterval(restoreFilter);
            }
        }, config["restore-filter-wait-time"] * 1000);
    }
});
