let channelSelectOpen = false;
let channelSelectMoving = false;

function openObject(obj, editContainer) {
    editContainer.slideDown(200);
    obj.addClass("object-open");
    obj.find("input").first().focus();
}

function closeObject(obj, editContainer) {
    editContainer.slideUp(200);
    obj.removeClass("object-open");
}

function toggleObjectOpen() {
    const obj = $(this).parent();
    const editContainer = obj.find(".edit-container");

    if (obj.hasClass("object-open")) {
        closeObject(obj, editContainer);
    } else {
        openObject(obj, editContainer);
    }
}

function arrayToTable(array) {
    let table = {};
    array.forEach(function(obj) {
        if (!obj.name || !obj.value) return;
        table[obj.name] = obj.value;
    });
    return table;
}

$(function() {
    $("#menu-toggle").on("click", function() {
        $("body").toggleClass("menu-closed");
        return false;
    });

    $("#active-channel").on("click", function() {
        if (channelSelectMoving) return;

        if (channelSelectOpen) {
            channelSelectMoving = true;
            $("#select-channel").removeClass("open");
            setTimeout(() => {
                $("#select-channel").hide();
                channelSelectMoving = false;
            }, 200);
        } else {
            $("#select-channel").show();
            $("#select-channel").addClass("open");
        }
        channelSelectOpen = !channelSelectOpen;
        return false;
    });

    $("body").on("click", function(e) {
        if ($(e.target).closest("#select-channel").length === 0 && !channelSelectMoving && channelSelectOpen) {
            channelSelectMoving = true;
            channelSelectOpen = false;
            $("#select-channel").removeClass("open");
            setTimeout(() => {
                $("#select-channel").hide();
                channelSelectMoving = false;
            }, 200);
        }
    });
    
    $(".group-header a").on("click", function() {
        const group = $(this).parent().parent();
        const div = group.find("div");

        if (group.hasClass("collapse")) {
            div.slideDown(200);
        } else {
            div.slideUp(200);
        }
        group.toggleClass("collapse");
        return false;
    });

    $(".object.click .object-container").on("click", toggleObjectOpen);

    $("form.remove-inactive").on("submit", function() {
        const form = $(this);
        form.find("input").each(function() {
            const input = $(this);
            if (!input.val()) {
                input.remove();
            }
        });
        form.find("select").each(function() {
            const select = $(this);
            if (select.val() === "all") {
                select.remove();
            }
        });
    });
});

const api = {
    get: function(uri, callback) {
        $.ajax({
            url: uri,
            type: "GET",
            success: callback,
            error: function(e) {
                callback(e.responseJSON);
            },
        });
    },
    post: function(uri, body, callback) {
        if (!body) body = {};
        $.ajax({
            url: uri,
            contentType: 'application/json',
            data: JSON.stringify(body),
            type: "POST",
            success: callback,
            error: function(e) {
                callback(e.responseJSON);
            },
        });
    },
    patch: function(uri, body, callback) {
        $.ajax({
            url: uri,
            contentType: 'application/json',
            data: JSON.stringify(body),
            type: "PATCH",
            success: callback,
            error: function(e) {
                callback(e.responseJSON);
            },
        });
    },
    "delete": function(uri, callback) {
        $.ajax({
            url: uri,
            type: "DELETE",
            success: callback,
            error: function(e) {
                callback(e.responseJSON);
            },
        });
    }
}
