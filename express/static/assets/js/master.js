let channelSelectOpen = false;
let channelSelectMoving = false;

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
});
