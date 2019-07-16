(function () {

    Menu = {};
    Menu.LEFTPANELSHOW = false;
    Menu.RIGHTPANELSHOW = true;

    Menu.toggleLeftPanel  = function () {
        Menu.LEFTPANELSHOW = !Menu.LEFTPANELSHOW;
        if (Menu.LEFTPANELSHOW) {
            if (Menu.RIGHTPANELSHOW) {
                $("#sidePanel").css("width", "20%");
                $("#viewPanel").css("width", "60%");
            } else {
                $("#sidePanel").css("width", "20%");
                $("#viewPanel").css("width", "80%");
            }
        } else {
            if (Menu.RIGHTPANELSHOW) {
                $("#sidePanel").css("width", "25px");
                $("#viewPanel").css("width", "80%");
            } else {
                $("#sidePanel").css("width", "25px");
                $("#viewPanel").css("width", "100%");
            }
        }
    }


}())