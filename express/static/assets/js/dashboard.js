$(function() {
    $(".join").on("click", function() {
        api.post(`/api/channel/${encodeURI($(this).attr("data-id"))}/join`, function(data) {
            if (data.ok) {
                $(".shard-id").text(data.shardId);
                $(".bot-active").slideDown(200);
                $(".bot-inactive").slideUp(200);
                $(".status-box").removeClass("outline-red").addClass("outline-green");
            } else {
                alert(data.error);
            }
        });
    });

    $(".part").on("click", function() {
        api.post(`/api/channel/${encodeURI($(this).attr("data-id"))}/part`, function(data) {
            if (data.ok) {
                $(".bot-inactive").slideDown(200);
                $(".bot-active").slideUp(200);
                $(".status-box").removeClass("outline-green").addClass("outline-red");
            } else {
                alert(data.error);
            }
        });
    });
});
