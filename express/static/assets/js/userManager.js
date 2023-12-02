const addRoleNewUser = function() {
    const role = $(this);
    const roleId = role.attr("data-id");

    const roleEle = $(`<a href="#" class="remove-role" data-id="${roleId}"><input type="hidden" name="role[]" value="${roleId}"><div class="code role removable"></div></div>`);
    roleEle.find(".role").text(role.text());
    roleEle.on("click", removeRoleNewUser);
    role.closest(".role-select").before(roleEle);

    if (role.closest(".role-select").find(".role").length - 1 < 1) {
        role.closest(".role-select").find(".roles").append('<small>No roles to add!</small>');
    }

    role.remove();

    return false;
}

const removeRoleNewUser = function() {
    const role = $(this);
    const roleId = role.attr("data-id");

    const roles = role.closest(".new-container").find(".role-select .roles");
    const roleEle = $(`<a href="#" class="role" data-id="${roleId}"></a>`);
    roleEle.on("click", addRoleNewUser);
    roleEle.text(role.text());
    roles.find("small").remove();
    roles.append(roleEle);
    role.remove();

    return false;
}

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

    $(".new").on("click", function() {
        $(".new-container").slideToggle(200);
    });

    $(".new-container .role-select .role").on("click", addRoleNewUser);

    $(".new-container").on("submit", function() {
        const form = $(this);
        const array = form.serializeArray();

        const channelId = form.attr("data-channel-id");

        const user = array.find(x => x.name === "user")?.value;
        const roles = array.filter(x => x.name === "role[]");

        if (roles.length < 1) {
            alert("You must have at least 1 role selected to add a user.");
            return false;
        }

        let index = 0;
        function nextRole() {
            if (roles.length === index) {
                window.location.href = window.location.href;
                return;
            }

            api.post(`/api/channel/${channelId}/role/${roles[index++].value}/username/${user}`, {}, function(data) {
                if (data.ok) {
                    nextRole();
                } else {
                    alert(data.error);
                }
            });
        }
        nextRole();

        return false;
    });

    $(".add-role").on("click", function() {
        $(this).parent().addClass("role-select-open");
    });

    $(".object .role-select .role").on("click", addRole);

    $(".removable").on("click", removeRole);
});