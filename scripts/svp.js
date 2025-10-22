var config = {
    "enabled": true,
    "restore-filter-wait-time": 3,
    "pause-when-first-toggle": true,
};
mp.options.read_options(config);

var SVP_IPC_SERVER = "mpvpipe";

function checkSVPFilter() {
    var result = false;
    mp.get_property_native("vf").forEach(function(filter) {
        if (filter.label === "svp") {
            result = true;
        }
    });
    return result;
}

mp.add_key_binding(null, "toggle", function() {
    if (mp.get_property("input-ipc-server") === SVP_IPC_SERVER && checkSVPFilter()) {
        mp.command("no-osd vf toggle @svp");
    }
    else {
        if (config["pause-when-first-toggle"] && !mp.get_property_native("pause")) {
            mp.set_property_native("pause", true);
        }
        // SVP will delete other video filters when IPC connected
        var backupFilters = mp.get_property_native("vf");

        mp.command("no-osd vf clr ''");
        mp.set_property("input-ipc-server", SVP_IPC_SERVER);

        var restoreFilter = setInterval(function() {
            if (checkSVPFilter()) {
                clearInterval(restoreFilter);
                mp.set_property_native("vf", mp.get_property_native("vf").concat(backupFilters));
                if (config["pause-when-first-toggle"] && mp.get_property_native("pause")) {
                    mp.set_property_native("pause", false);
                }
            }
        }, config["restore-filter-wait-time"] * 1000);
    }
});

// get SVP input-ipc-server
mp.get_property_native("profile-list").forEach(function(profile) {
    if (profile.name === "svp") {
        profile.options.forEach(function(option) {
            if (option.key === "input-ipc-server") {
                SVP_IPC_SERVER = option.value;
            }
        });
    }
});

if (config["enabled"]) {
    mp.command("apply-profile svp");
    mp.set_property("input-ipc-server", "");
}
