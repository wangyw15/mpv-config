var config = {
    "update-on-window-resize": false,
};
mp.options.read_options(config);

var nvidiaFilters = [];
var anime4kcppFilters = [];
var otherFilters = [];

function removeUpscaleFilters(backup) {
    mp.get_property_native("vf").forEach(function(filter) {
        if (filter.name === "d3d11vpp" && filter.params["scaling-mode"] === "nvidia") {
            if (backup) {
                nvidiaFilters.push(filter);
            }
        }
        else if (filter.name === "vapoursynth" && filter.params.file.indexOf("anime4kcpp.py") !== -1) {
            if (backup) {
                anime4kcppFilters.push(filter);
            }
        }
        else {
            otherFilters.push(filter);
        }
    });
    mp.set_property_native("vf", otherFilters);
}
removeUpscaleFilters(true);

function updateUpscaleFilters() {
    var video_params = mp.get_property_native("video-params");
    var viewport_width = mp.get_property_native("display-width");
    var viewport_height = mp.get_property_native("display-height");
    if (config["update-on-window-resize"]) {
        var width = mp.get_property_native("osd-width");
        var height = mp.get_property_native("osd-height");
        if (width !== undefined && width > 0) {
            viewport_width = width;
        }
        if (height !== undefined && height > 0) {
            viewport_height = height;
        }
    }
    if (viewport_width === undefined || viewport_height === undefined) {
        return;
    }

    var widthRatio = viewport_width / video_params.w;
    var heightRatio = viewport_height / video_params.h;
    widthRatio = Math.ceil(widthRatio);
    heightRatio = Math.ceil(heightRatio);
    var ratio = video_params.aspect > 1 ? widthRatio : heightRatio;

    nvidiaFilters.forEach(function(filter) {
        filter.params.scale = ratio.toString();
    });
    anime4kcppFilters.forEach(function(filter) {
        var modelName = filter.params["user-data"].split(";")[0];
        filter.params["user-data"] = modelName + ";" + ratio.toString();
    });

    // restore enable status
    mp.get_property_native("vf").forEach(function(original_filter) {
        nvidiaFilters.forEach(function(filter) {
            if (original_filter.label === filter.label) {
                filter.enabled = original_filter.enabled;
            }
        });
        anime4kcppFilters.forEach(function(filter) {
            if (original_filter.label === filter.label) {
                filter.enabled = original_filter.enabled;
            }
        });
    });

    removeUpscaleFilters(false);
    mp.set_property_native("vf", 
        mp.get_property_native("vf")
            .concat(nvidiaFilters)
            .concat(anime4kcppFilters)
        );
}

mp.register_event("file-loaded", updateUpscaleFilters);
if (config["update-on-window-resize"]) {
    mp.observe_property("osd-width", "number", updateUpscaleFilters);
    mp.observe_property("osd-height", "number", updateUpscaleFilters);
}
