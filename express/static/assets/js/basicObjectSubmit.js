$(function() {
    $(".new-container").on("submit", function() {
        const form = $(this);

        const objType = form.attr("data-type")
        const channelId = form.attr("data-channel-id");

        api.post(`/api/channel/${channelId}/${objType}`, arrayToTable(form.serializeArray()), function(data) {
            if (data.ok) {
                window.location.href = window.location.href;
            } else {
                alert(data.error)
            }
        });

        return false;
    });

    $(".basic-object-submit").on("submit", function() {
        const form = $(this);
        const obj = form.closest(".object");

        const objType = obj.attr("data-type");
        const objId = obj.attr("data-id");
        const channelId = obj.attr("data-channel-id");
        
        api.patch(`/api/channel/${channelId}/${objType}/${objId}`, arrayToTable(form.serializeArray()), function(data) {
            if (data.ok) {
                for (const prop in data.data) {
                    obj.find(`input[type=${prop}]`).val(data.data[prop]);
                    obj.find(`.${prop}`).text(data.data[prop]);
                }
            } else {
                alert(data.error);
            }
        });

        return false;
    });

    $(".basic-object-submit button.delete").on("click", function() {
        const button = $(this);
        const obj = button.closest(".object");

        const objType = obj.attr("data-type");
        const objId = obj.attr("data-id");
        const channelId = obj.attr("data-channel-id");

        api.delete(`/api/channel/${channelId}/${objType}/${objId}`, function(data) {
            if (data.ok) {
                obj.slideUp(200);
                setTimeout(function() {
                    obj.remove();
                }, 200);
            } else {
                alert(data.error);
            }
        });

        return false;
    });

    $(".new").on("click", function() {
        $(".new-container").slideToggle(200);
    });
});