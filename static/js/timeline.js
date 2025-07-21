class Timeline {
    constructor() {
        this.obj = {
            document: { $: $(document) }
            , body: { $: $('body') }
            , timelineBody: { $: $('#timeline-body') }
            , timelineRowContainer: { selector: '.timeline-row-container' }
            , timelineRow: { selector: '.timeline-row' }
            , topicMenu: { $: $('#topic-menu') }
            , topicNameArea: { selector: '.topic-name-area' }
            , cardsContainer: { selector: '.cards-container' }
            , dateSlot: { selector: '.date-slot' }
            , newsCard: { selector: '.news-card' }
            , txt: {
                topicName: { selector: '.txt-topic-name' }
            }
            , btn: {
                topicMenu: { $: $('#btn-topic-menu') }
                , topicNew: { $: $('#btn-topic-new') }
                , topicNewSave: { selector: '#btn-topic-new-save' }
                , topicNewCancel: { selector: '#btn-topic-new-cancel' }
                , topicDelete: { $: $('#btn-topic-delete') }
                , topicDeleteSave: { selector: '.btn-topic-delete-save' }
            }
            , modal: {
                news: {
                    $: $('#news-modal-overlay')
                    , articleWrapper: { $: $('#news-modal-article-wrapper') }
                    , articleItem: { selector: '.article-item' }
                    , modalComment: { $: $('#modal-comment') }
                    , txt: {
                        topicName: { $: $('#txt-news-modal-topic-name') }
                        , title: { $: $('#txt-news-modal-title') }
                        , date: { $: $('#txt-news-modal-date') }
                        , memo: { $: $('#txt-news-modal-memo') }
                        , url: { $: $('#txt-news-modal-url') }
                    }
                    , hid: {
                        topicUid: { $: $('#hid-news-modal-topic-uid') }
                        , newsUid: { $: $('#hid-news-modal-news-uid') }
                        , articleUid: { selector: 'input[type="hidden"].article-uid' }
                        , url: { selector: 'input[type="hidden"].url' }
                        , publisher: { selector: 'input[type="hidden"].publisher' }
                        , title: { selector: 'input[type="hidden"].title' }
                        , imageUrl: { selector: 'input[type="hidden"].image-url' }
                        , description: { selector: 'input[type="hidden"].description' }
                    }
                    , rdo: {
                        importance: { $: $('input[name="rdo-news-modal-importance"]') }
                    }
                    , chk: { selector: '.chk-news-modal-article' }
                    , btn: {
                        save: { $: $('#btn-news-modal-save') }
                        , edit: { $: $('#btn-news-modal-edit') }
                        , delete: { $: $('#btn-news-modal-delete') }
                        , close: { $: $('#btn-news-modal-close') }
                        , addArticle: { $: $('#btn-news-modal-add-article') }
                        , deleteArticle: { $: $('#btn-news-modal-delete-article') }
                    }
                }
            }
        }
        this.eventHandlers = {
            selectTimelineList: this.fnSelectTimelineList
            , openTopicMenu: this.fnOpenTopicMenu
            , getTimelineTemplate: this.fnGetTimelineTemplate
            , showTopicDeleteSaveButton: this.fnShowTopicDeleteSaveButton
            , deleteTopic: this.fnDeleteTopic
            , syncDateWidth: this.fnSyncDateWidth
            , enableDragScrollX: this.fnEnableDragScrollX
            , openNewsModal: this.fnOpenNewsModal
            , closeNewsModal: this.fnCloseNewsModal
            , addArticle: this.fnAddArticle
            , deleteArticle: this.fnDeleteArticle
            , resetNewsModal: this.fnResetNewsModal
            , saveNews: this.fnSaveNews
            , deleteNews: this.fnDeleteNews
        }
        this.init();
    }

    init() {
        this.eventHandlers.selectTimelineList();
        this.addEventListeners();
    }

    addEventListeners() {
        this.obj.document.$.on('click', () => {
            this.obj.topicMenu.$.hide();
        })
        this.obj.btn.topicMenu.$.on('click', this.eventHandlers.openTopicMenu.bind(this));
        this.obj.btn.topicNew.$.on('click', this.eventHandlers.getTimelineTemplate.bind(this));
        this.obj.btn.topicDelete.$.on('click', this.eventHandlers.showTopicDeleteSaveButton.bind(this));

        this.obj.document.$.on('click', this.obj.btn.topicDeleteSave.selector, this.eventHandlers.deleteTopic);
        this.obj.document.$.on('click', this.obj.timelineRow.selector, (e) => this.eventHandlers.openNewsModal(e, MODE.INSERT));
        this.obj.document.$.on('click', this.obj.newsCard.selector, (e) => this.eventHandlers.openNewsModal(e, MODE.UPDATE));

        this.obj.modal.news.btn.close.$.on('click', this.eventHandlers.closeNewsModal.bind(this));
        this.obj.modal.news.btn.save.$.on('click', this.eventHandlers.saveNews.bind(this, MODE.INSERT));
        this.obj.modal.news.btn.edit.$.on('click', this.eventHandlers.saveNews.bind(this, MODE.UPDATE));
        this.obj.modal.news.btn.addArticle.$.on('click', this.eventHandlers.addArticle.bind(this));
        this.obj.modal.news.btn.deleteArticle.$.on('click', this.eventHandlers.deleteArticle.bind(this));
        this.obj.modal.news.btn.delete.$.on('click', this.eventHandlers.deleteNews.bind(this));
    }

    fnSelectTimelineList = () => {
        $.post("/timeline/list", (html) => {
            this.obj.timelineBody.$.empty();
            this.obj.timelineBody.$.prepend(html);
            this.eventHandlers.syncDateWidth();
            this.eventHandlers.enableDragScrollX();
        });
    }

    /* topic :: s */
    fnOpenTopicMenu = (e) => {
        e.stopPropagation();
        this.obj.topicMenu.$.toggle();
    }

    fnGetTimelineTemplate = async () => {
        if(!await IS_SIGNED()){
            alert('로그인이 필요한 기능입니다.');
            return
        }

        let isDisabled = this.obj.btn.topicNew.$.data('disabled');
        let isDeleteOpen = this.obj.btn.topicDelete.$.data('open');
        if (isDisabled) {
            alert('이미 토픽 생성 행이 존재합니다.');
        } else if (isDeleteOpen) {
            alert('토픽 삭제 중에 생성 기능이 제한됩니다.');
        } else {
            $.post("/timeline/template", (template) => {
                let $template = $(template);
                let $btnTopicNewSave = $template.find(this.obj.btn.topicNewSave.selector);
                let $btnTopicNewCancel = $template.find(this.obj.btn.topicNewCancel.selector);
                let $btnTopicDeleteSave = $template.find(this.obj.btn.topicDeleteSave.selector);
                let $txtTopicName = $template.find(this.obj.txt.topicName.selector);
                let $topicNameArea = $template.find(this.obj.topicNameArea.selector);
                let $timelineRow = $template.find(this.obj.timelineRow.selector);

                $btnTopicNewSave.on('click', () => {
                    let topicName = $txtTopicName.val();
                    if (!topicName.trim()) {
                        alert('토픽 이름을 입력하세요.');
                        return
                    }

                    $.ajax({
                        url: '/topic/save'
                        , method: 'POST'
                        , contentType: 'application/json'
                        , data: JSON.stringify({ topic_name: topicName })
                        , success: (response) => {
                            if (response.resultCode == 'success') {
                                let topicUid = response.data.topic_uid;

                                $topicNameArea.html(topicName);
                                $btnTopicDeleteSave.data('topic-uid', topicUid);
                                $timelineRow.data('topic-uid', topicUid);
                                $timelineRow.data('topic-name', topicName);

                                $btnTopicNewSave.remove();
                                $btnTopicNewCancel.remove();
                                $txtTopicName.hide();

                                this.obj.btn.topicNew.$.data('disabled', false);
                                this.eventHandlers.selectTimelineList();
                                this.eventHandlers.enableDragScrollX();
                            }
                        }
                    })
                })

                $btnTopicNewCancel.one('click', () => {
                    $btnTopicNewCancel.closest(this.obj.timelineRowContainer.selector).remove();
                    this.obj.btn.topicNew.$.data('disabled', false);
                })
                this.obj.btn.topicNew.$.data('disabled', true);
                this.obj.timelineBody.$.prepend($template);
            });
        }
    }

    fnShowTopicDeleteSaveButton = async () => {
        if(!await IS_SIGNED()){
            alert('로그인이 필요한 기능입니다.');
            return
        }

        let isDisabled = this.obj.btn.topicNew.$.data('disabled');
        if (isDisabled) {
            alert('토픽 생성 행이 존재하여 삭제 기능이 제한됩니다.');
            return
        }

        let isDeleteOpen = this.obj.btn.topicDelete.$.data('open');
        this.obj.btn.topicDelete.$.data('open', !isDeleteOpen);

        $(this.obj.btn.topicDeleteSave.selector).toggle();
        this.obj.btn.topicDelete.$.html(isDeleteOpen ? '삭제' : '삭제 종료');
    }

    fnDeleteTopic = (e) => {
        let $this = $(e.target);
        if (confirm('토픽과 연결된 뉴스도 전부 삭제됩니디.\n토픽을 삭제 하시겠습니까?')) {
            $.ajax({
                url: '/topic/delete'
                , method: 'POST'
                , contentType: 'application/json'
                , data: JSON.stringify({ topic_uid: $this.data('topic-uid') })
                , success: (response) => {
                    if (response.resultCode == 'success') {
                        alert(response.resultMessage);
                        $this.closest(this.obj.timelineRowContainer.selector).remove();
                        this.eventHandlers.selectTimelineList();
                    }
                }
            })
        }
    }
    /* topic :: e */

    /* timeline :: s */
    fnSyncDateWidth = () => {
        let dateArray = [];
        $(this.obj.dateSlot.selector).each(function () {
            dateArray.push($(this).data('date'));
        })
        dateArray = [...new Set(dateArray)];

        for (let date of dateArray) {
            let $dateSlot = $(this.obj.dateSlot.selector).filter('[data-date="' + date + '"]');

            let maxWidth = 0;
            $dateSlot.each(function () {
                let width = $(this).outerWidth();
                if (width > maxWidth) {
                    maxWidth = width;
                }
            })

            $dateSlot.each(function () {
                $(this).width(maxWidth);
            })
        }
    }

    fnEnableDragScrollX = () => {
        const $dragArea = $(this.obj.cardsContainer.selector);
        const $scrollTarget = this.obj.body.$;

        let isDown = false;
        let isDragging = false;
        let startX;
        let scrollLeft;

        $dragArea.off('mousedown').on('mousedown', function (e) {
            isDown = true;
            isDragging = false;
            startX = e.pageX;
            scrollLeft = $scrollTarget.scrollLeft();
            $dragArea.addClass('grab');
            e.preventDefault();
        });

        this.obj.document.$.off('mousemove').on('mousemove', function (e) {
            if (!isDown) return;

            const x = e.pageX;
            const walk = (x - startX) * 1.5;

            if (Math.abs(x - startX) > 5) {
                isDragging = true;
            }

            $scrollTarget.scrollLeft(scrollLeft - walk);
        });

        this.obj.document.$.off('mouseup').on('mouseup', function () {
            isDown = false;
            $dragArea.removeClass('grab');
        });

        $dragArea.off('click').on('click', function (e) {
            if (isDragging) {
                e.preventDefault();
                e.stopImmediatePropagation();
                return false;
            }
        });
    }

    fnOpenNewsModal = async (e, mode) => {
        let $this = $(e.currentTarget);
        if (mode == MODE.INSERT) {
            let topicUid = $this.data('topic-uid');
            let topicName = $this.data('topic-name');

            if (!topicUid.trim()) {
                return
            }

            this.obj.modal.news.hid.topicUid.$.val(topicUid);
            this.obj.modal.news.txt.topicName.$.val(topicName);

            this.obj.modal.news.btn.save.$.show();
            this.obj.modal.news.btn.edit.$.hide();
            this.obj.modal.news.btn.delete.$.hide();
            this.obj.modal.news.modalComment.$.hide();
            this.obj.modal.news.$.css('display', 'flex');

            if(!await IS_SIGNED()){
                alert('뉴스 등록은 로그인이 필요한 기능입니다.');
                this.eventHandlers.closeNewsModal();
                return
            }
        } else if (mode == MODE.UPDATE) {
            e.stopPropagation();

            this.obj.modal.news.btn.save.$.hide();
            this.obj.modal.news.btn.edit.$.show();
            this.obj.modal.news.btn.delete.$.show();
            this.obj.modal.news.modalComment.$.show();

            $.ajax({
                url: '/news/detail'
                , method: 'POST'
                , contentType: 'application/json'
                , data: JSON.stringify({ news_uid: $this.data('news-uid') })
                , success: (response) => {
                    if (response.resultCode == 'success') {
                        // 필드에 데이터 입력
                        let news = response.data;
                        this.obj.modal.news.hid.newsUid.$.val(news.news_uid);
                        this.obj.modal.news.txt.topicName.$.val(news.topic_name);
                        this.obj.modal.news.txt.title.$.val(news.title);
                        this.obj.modal.news.txt.date.$.val(news.date);
                        this.obj.modal.news.txt.memo.$.val(news.memo);
                        this.obj.modal.news.rdo.importance.$.filter(function () {
                            return $(this).val() === news.importance;
                        }).first().click();
                        this.obj.modal.news.articleWrapper.$.html(news.article_list_html);

                        // 모달 오픈
                        this.obj.modal.news.$.css('display', 'flex');
                    }
                }
            })
        }
    }

    fnCloseNewsModal = () => {
        this.obj.modal.news.$.css('display', 'none');
        this.eventHandlers.resetNewsModal();
    }

    fnResetNewsModal = () => {
        this.obj.modal.news.hid.topicUid.$.val('');
        this.obj.modal.news.hid.newsUid.$.val('');
        this.obj.modal.news.txt.topicName.$.val('');
        this.obj.modal.news.txt.title.$.val('');
        this.obj.modal.news.txt.date.$.val('');
        this.obj.modal.news.txt.memo.$.val('');
        this.obj.modal.news.rdo.importance.$.first().trigger('click');
        this.obj.modal.news.txt.url.$.val('');
        this.obj.modal.news.$.find(this.obj.modal.news.articleItem.selector).remove();
    }

    fnSaveNews = (mode) => {
        let topicUid = this.obj.modal.news.hid.topicUid.$.val();
        let newsUid = this.obj.modal.news.hid.newsUid.$.val();
        let title = this.obj.modal.news.txt.title.$.val();
        let date = this.obj.modal.news.txt.date.$.val();
        let memo = this.obj.modal.news.txt.memo.$.val();
        let importance = this.obj.modal.news.rdo.importance.$.filter(':checked').val();
        let $url = this.obj.modal.news.$.find(this.obj.modal.news.txt.url.selector);
        let articleArray = new Array();

        if (!title.trim()) {
            alert('제목을 입력하세요.'); return
        }
        if (!date.trim()) {
            alert('날짜를 선택하세요.'); return
        }

        let $articleItem = $(this.obj.modal.news.articleItem.selector);
        $articleItem.each((i, el) => {
            let data = {
                article_uid: $(el).find(this.obj.modal.news.hid.articleUid.selector).val()
                , url: $(el).find(this.obj.modal.news.hid.url.selector).val()
                , publisher: $(el).find(this.obj.modal.news.hid.publisher.selector).val()
                , title: $(el).find(this.obj.modal.news.hid.title.selector).val()
                , image_url: $(el).find(this.obj.modal.news.hid.imageUrl.selector).val()
                , description: $(el).find(this.obj.modal.news.hid.description.selector).val()
            }
            articleArray.push(data);
        })

        let params = {
            topic_uid: topicUid
            , news_uid: newsUid
            , title: title
            , date: date
            , memo: memo
            , importance: importance
            , article_array: articleArray
        }

        $.ajax({
            url: mode == MODE.INSERT ? '/news/save' : '/news/edit'
            , method: 'POST'
            , contentType: 'application/json'
            , data: JSON.stringify(params)
            , success: (response) => {
                if (response.resultCode == 'success') {
                    this.eventHandlers.selectTimelineList();
                    this.eventHandlers.closeNewsModal();
                }
            }
        })
    }

    /* 기사를 등록 한다 */
    fnAddArticle = () => {
        let url = this.obj.modal.news.txt.url.$.val();
        $.ajax({
            url: '/news/article'
            , method: 'POST'
            , contentType: 'application/json'
            , data: JSON.stringify({ url: url })
            , success: (response) => {
                if (response.code == 'success') {
                    let data = response.data;
                    this.obj.modal.news.articleWrapper.$.prepend(data);
                    this.obj.modal.news.txt.url.$.val('');
                }
            }
        })
    }

    /* 기사를 삭제 한다 */
    fnDeleteArticle = () => {
        let $chk = $(this.obj.modal.news.chk.selector).filter(':checked');
        $chk.each(function () {
            $(this).parent().remove();
        })
    }

    fnDeleteNews = () => {
        confirm('뉴스를 삭제하시겠습니까?');
    }
    /* timeline :: e */

}