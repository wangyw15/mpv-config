var config = {
    "svp-ipc": "mpvpipe",
};
mp.options.read_options(config);

function getFilters() {
    var filters = [];
    mp.get_property_native("vf").forEach(function(filter) {
        if (filter.label != "svp") {
            filters.push(filter);
        }
    });
    return filters;
}

function removeFilters() {
    var filters = [];
    mp.get_property_native("vf").forEach(function(filter) {
        if (filter.label == "svp") {
            filters.push(filter);
        }
    });
    mp.set_property_native("vf", filters);
}

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
    // SVP will delete other video filters when IPC connected
    var vsFilterBackup = getFilters();
    removeFilters();

    if (mp.get_property("input-ipc-server") == config["svp-ipc"]) {
        mp.command("vf toggle @svp");
    }
    else {
        mp.set_property("input-ipc-server", config["svp-ipc"]);
        mp.command("vf clr ''");
    }

    var restoreFilter = setInterval(function() {
        if (checkSVPFilter()) {
            mp.set_property_native("vf", mp.get_property_native("vf").concat(vsFilterBackup))
            clearInterval(restoreFilter);
        }
    }, 100);
});
