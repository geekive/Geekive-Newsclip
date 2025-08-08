class Notification {
    constructor() {
        this.obj = {
            badge : {$ : $('#notification-badge')}
            , btn : {
                notification : {$ : $('#notification')}
            }
            , panel : {
                $               : $('#notification-panel')
                , backdrop      : {$ : $('#notification-backdrop')}
                , listWrapper   : {$ : $('#notification-panel-list-wrapper')}
                , item          : {selector : '.notification-panel-item'}
                , btn : {
                    close       : {$ : $('#btn-notification-panel-close')}
                    , checkAll  : {$ : $('#btn-notification-panel-check-all')}
                    , read      : {$ : $('#btn-notification-panel-read')}
                    , delete    : {$ : $('#btn-notification-panel-delete')}
                }
                , chk : {
                    item : {selector : '.chk-notification-panel-item'}
                }
            }
        }
        this.eventHandlers = {
            openNotificationPanel       : this.fnOpenNotificationPanel
            , closeNotificationPanel    : this.fnCloseNotificationPanel
            , renderNotification        : this.fnRenderNotification
            , checkAll                  : this.fnCheckAll
            , updateRead                : this.fnUpdateRead
            , upadteReadCheckbox        : this.fnUpdateReadCheckbox
            , deleteNotification        : this.fnDeleteNotification
            , updateUnreadCount         : this.fnUpdateUnreadCount
        }
        this.init()
    }

    init(){
        this.addEventListeners();
        this.eventHandlers.renderNotification();
    }

    addEventListeners() {
        this.obj.btn.notification.$.on('click', this.eventHandlers.openNotificationPanel.bind(this));
        this.obj.panel.btn.close.$.on('click', this.eventHandlers.closeNotificationPanel.bind(this));
        this.obj.panel.backdrop.$.on('click', this.eventHandlers.closeNotificationPanel.bind(this));
        this.obj.panel.btn.checkAll.$.on('click', this.eventHandlers.checkAll.bind(this));
        this.obj.panel.btn.read.$.on('click', this.eventHandlers.upadteReadCheckbox.bind(this));
        this.obj.panel.btn.delete.$.on('click', this.eventHandlers.deleteNotification.bind(this));
    }

    fnOpenNotificationPanel = () => {
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
            $.each(notificationListResponse.data, (idx, it) => {
                const $item = $('<div>')
                    .addClass('notification-panel-item')
                    .toggleClass('unread', it.flag_read == 'N' ? true : false)
                    .attr('tabindex', '0')
                    .attr('data-index', idx)
                    .html(`
                        <input type="checkbox" class="chk-notification-panel-item" value="${it.notification_uid}" aria-label="선택" />
                        <div class="content">
                            <div class="message">${it.message}</div>
                            <div class="meta">${it.registration_date}</div>
                        </div>
                    `);
                this.obj.panel.listWrapper.$.append($item);

                $item.on('click', async (e) => {
                    if($item.hasClass('unread')){
                        if(await this.eventHandlers.updateRead([it.notification_uid])){
                            $(e.currentTarget).removeClass('unread');
                        }
                    }

                    if(it.type == 'TOPIC'){
                        await interest.eventHandlers.openInterestModal(it.topic_name);
                    }else if(it.type == 'NEWS'){
                        await timeline.eventHandlers.openNewsModal(null, MODE.UPDATE, it.target_uid);
                    }else if(it.type == 'COMMENT'){
                        await timeline.eventHandlers.openNewsModal(null, MODE.UPDATE, it.target_uid);
                    }
                })

                // 체크박스 클릭할 때 부모 이벤트 막기
                $item.find(this.obj.panel.chk.item.selector).on('click', function(e){
                    e.stopPropagation();
                })
            });

            this.eventHandlers.updateUnreadCount();
        }
    }

    fnCheckAll = () => {
        let $chkItem = $(this.obj.panel.chk.item.selector);
        let allChecked = $chkItem.length > 0 && $chkItem.filter(':checked').length === $chkItem.length;
        $chkItem.prop('checked', !allChecked);
    }

    fnUpdateRead = async (notificationUidArray) => {
        let readResponse = await $.ajax({
            url: '/notification/read'
            , method: 'POST'
            , contentType: 'application/json'
            , data: JSON.stringify({notification_uid_array : notificationUidArray})
        })
        if(readResponse.resultCode == 'success'){
            setTimeout(() => {
                this.eventHandlers.updateUnreadCount();
            }, 500)
            return true
        }
    }

    fnUpdateReadCheckbox = () => {
        let notificationUidArray = new Array();
        $(this.obj.panel.chk.item.selector).filter(':checked').each(function(){
            notificationUidArray.push($(this).val());
            $(this).parent().removeClass('unread');
            $(this).prop('checked', false);
        })
        this.eventHandlers.updateRead(notificationUidArray);
    }

    fnDeleteNotification = () => {
        let notificationUidArray = new Array();
        $(this.obj.panel.chk.item.selector).filter(':checked').each(function(){
            notificationUidArray.push($(this).val());
            $(this).parent().remove();
        })
        $.ajax({
            url: '/notification/delete'
            , method: 'POST'
            , contentType: 'application/json'
            , data: JSON.stringify({notification_uid_array : notificationUidArray})
            , success: (response) => {
                if(response.resultCode == 'success'){
                    this.eventHandlers.updateUnreadCount();
                }
            }
        })
    }

    fnUpdateUnreadCount = () => {
        let $unread     = $(this.obj.panel.item.selector).filter('.unread');
        let unreadCount = $unread.length;
        console.log(unreadCount);
        if(unreadCount > 0){
            this.obj.badge.$.css('opacity', '1');
            this.obj.badge.$.text(unreadCount);    
        }else{
            this.obj.badge.$.css('opacity', '0');
        }
    }
}