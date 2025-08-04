class Notification {
    constructor() {
        this.obj = {
            btn : {
                notification : {$ : $('#notification')}
            }
            , panel : {
                $               : $('#notification-panel')
                , backdrop      : {$ : $('#notification-backdrop')}
                , listWrapper   : {$ : $('#notification-panel-list-wrapper')}
                , btn : {
                    close : {$ : $('#btn-notification-panel-close')}
                }
            }
        }
        this.eventHandlers = {
            openNotificationPanel       : this.fnOpenNotificationPanel
            , closeNotificationPanel    : this.fnCloseNotificationPanel
            , renderNotification        : this.fnRenderNotification
        }
        this.init()
    }

    init(){
        this.addEventListeners();
    }

    addEventListeners() {
        this.obj.btn.notification.$.on('click', this.eventHandlers.openNotificationPanel.bind(this));
        this.obj.panel.btn.close.$.on('click', this.eventHandlers.closeNotificationPanel.bind(this));
        this.obj.panel.backdrop.$.on('click', this.eventHandlers.closeNotificationPanel.bind(this));
    }

    fnOpenNotificationPanel = () => {
        this.eventHandlers.renderNotification();
        this.obj.panel.$.addClass('open').attr('aria-hidden', 'false'); 
        this.obj.panel.backdrop.$.addClass('active'); 
    }

    fnCloseNotificationPanel = () => {
        this.obj.panel.$.removeClass('open').attr('aria-hidden', 'true'); 
        this.obj.panel.backdrop.$.removeClass('active'); 
    }

    fnRenderNotification = () => {
        this.obj.panel.listWrapper.$.empty();
        $.ajax({
            url: '/notification/list'
            , method: 'POST'
            , contentType: 'application/json'
            , success: (response) => {
                if(response.resultCode == 'success') {
                    console.log(response)
                }
            }
        })
    }
}