const addRole = function() {
    const role = $(this);
    const user = $(this).closest(".object");

    const channelId = user.attr("data-channel-id");
    const roleId = role.attr("data-id");
    const userId = user.attr("data-id");
    
    api.post(`/api/channel/${channelId}/role/${roleId}/user/${userId}`, {}, function(data) {
        if (data.ok) {
            const roleEle = $('<a class="code role removable" data-id="'+data.data.role.id+'"></a>');
            roleEle.on("click", removeRole);
            roleEle.text(`${data.data.role.name} (${data.data.role.weight})`);
            role.closest(".role-select").before(roleEle);
            $(".role-select-open").removeClass("role-select-open");

            console.log(role.closest(".role-select"));
            console.log(role.closest(".role-select").find(".role"));
            if (role.closest(".role-select").find(".role").length - 1 < 1) {
                role.closest(".role-select").find(".roles").append('<small>No roles to add!</small>');
            }

            role.remove();
        } else {
            alert(data.error);
        }
    });

    return false;
}

const removeRole = function() {
    const role = $(this);
    const user = $(this).closest(".object");

    const channelId = user.attr("data-channel-id");
    const roleId = role.attr("data-id");
    const userId = user.attr("data-id");

    api.delete(`/api/channel/${channelId}/role/${roleId}/user/${userId}`, function(data) {
        if (data.ok) {
            const roles = role.closest(".object").find(".role-select .roles");
            const roleEle = $(`<a href="#" class="role" data-id="${roleId}"></a>`);
            roleEle.on("click", addRole);
            roleEle.text(role.text());
            roles.find("small").remove();
            roles.append(roleEle);
            role.remove();
        } else {
            alert(data.error);
        }
    });
}

$(function() {
    $(document).on("click", function(e) {
        if ($(e.target).closest("button").hasClass("add-role")) return;
        $(".role-select-open").removeClass("role-select-open");
    });

    $(".add-role").on("click", function() {
        $(this).parent().addClass("role-select-open");
    });

    $(".role-select .role").on("click", addRole);

    $(".removable").on("click", removeRole);
});