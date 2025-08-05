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
                , item          : {selector : $('.notification-panel-item')}
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

    fnRenderNotification = async () => {
        this.obj.panel.listWrapper.$.empty();
        let notificationListResponse = await $.ajax({
            url: '/notification/list'
            , method: 'POST'
            , contentType: 'application/json'
        })

        if(notificationListResponse.resultCode == 'success'){
            console.log(notificationListResponse.data);
            $.each(notificationListResponse.data, (idx, it) => {
                const $item = $('<div>')
                    .addClass('notification-panel-item')
                    .toggleClass('unread', it.flag_read == 'N' ? true : false)
                    .attr('tabindex', '0')
                    .attr('data-index', idx)
                    .html(`
                        <input type="checkbox" class="select-checkbox" aria-label="선택" />
                        <div class="content">
                            <div class="message">${it.message}</div>
                            <div class="meta">${it.registration_date}</div>
                        </div>
                    `);
                this.obj.panel.listWrapper.$.append($item);

                $item.on('click', function(){
                    $(this).removeClass('unread');
                    $.ajax({
                        url: '/notification/read'
                        , method: 'POST'
                        , contentType: 'application/json'
                        , data: JSON.stringify({notification_uid : it.notification_uid})
                        , success: (response) => {
                            if(response.resultCode == 'success'){

                            }
                        }
                    })
                })
            });
        }
    }
}