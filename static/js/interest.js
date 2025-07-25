class Interest {
    constructor() {
        this.obj = {
            document            : {$ : $(document)}
            , interest          : []
            , checkedInterest   : []
            , topicMadeByMe     : []
            , btn : {
                interest : {$ : $('#interest')}
            }
            , modal : {
                $                       : $('#interest-modal-overlay')
                , message               : {$ : $('#interest-modal-message')}
                , interestListWrapper   : {$ : $('#interest-list-wrapper')}
                , txt  : {
                    search : {$ : $('#txt-interest-modal-search')} 
                }
                , btn : {
                    save      : {$ : $('#btn-interest-modal-save')}
                    , close   : {$ : $('#btn-interest-modal-close')}
                }
                , chk : {
                    all             : {$ : $('#chk-interest-modal-all')}
                    , showChecked   : {$ : $('#chk-interest-modal-show-checked')}
                    , topicMadeByMe : {$ : $('#chk-interest-modal-topic-made-by-me')}
                    , interest      : {selector : '.chk-interest-modal-interest'}
                }
            }
        }
        this.eventHandlers = {
            openInterestModal       : this.fnOpenInterestModal
            , closeInterestModal    : this.fnCloseInterestModal
            , showMessage           : this.fnShowMessage
            , clearMessage          : this.fnClearMessage
            , selectInterest        : this.fnSelectInterest
            , renderInterest        : this.fnRenderInterest
            , getKoreanInitial      : this.fnGetKoreanInitial
            , setCheckedInterest    : this.fnSetCheckedInterest
            , save                  : this.fnSave
            , reset                 : this.fnReset
            , checkAllInterest      : this.fnCheckAllInterest
            , uncheckExceptFor      : this.fnUncheckExceptFor
        }
        this.init()
    }

    async init(){
        this.addEventListeners();
        this.obj.interest = await this.eventHandlers.selectInterest();
        this.eventHandlers.renderInterest();
        if(await IS_SIGNED() && this.obj.checkedInterest.length === 0){
            this.eventHandlers.openInterestModal();
            this.eventHandlers.showMessage('관심 토픽을 1개 이상 선택하세요.', true);
        }
    }

    addEventListeners() {
        // 렌더링 공통 함수
        const fnTriggerRenderInterest = () => {
            let keyword         = this.obj.modal.txt.search.$.val().trim();
            let onlyChecked     = this.obj.modal.chk.showChecked.$.is(':checked');
            let onlyMadeByMe    = this.obj.modal.chk.topicMadeByMe.$.is(':checked');

            this.eventHandlers.renderInterest(keyword, onlyChecked, onlyMadeByMe);
        }

        /* modal open, close */
        this.obj.btn.interest.$.on('click', this.eventHandlers.openInterestModal.bind(this));
        this.obj.modal.btn.close.$.on('click', this.eventHandlers.closeInterestModal.bind(this));

        /* 검색, 저장 */
        this.obj.modal.txt.search.$.on('input', fnTriggerRenderInterest);
        this.obj.modal.btn.save.$.on('click', this.eventHandlers.save.bind(this));

        /* checkbox event collection :: s */
        // 전체선택
        this.obj.modal.chk.all.$.on('click', this.eventHandlers.checkAllInterest.bind(this));
        
        // 선택한 토픽만 보기
        this.obj.modal.chk.showChecked.$.on('change', (e) => {
            this.eventHandlers.uncheckExceptFor(e.currentTarget);
            fnTriggerRenderInterest();
        });

        // 내가 만든 토픽만 보기
        this.obj.modal.chk.topicMadeByMe.$.on('change', (e) => {
            this.eventHandlers.uncheckExceptFor(e.currentTarget);
            fnTriggerRenderInterest();
        });
        
        // 관심 토픽 체크박스 클릭
        this.obj.document.$.on('click', this.obj.modal.chk.interest.selector, () => {
            const showCheckedChecked    = this.obj.modal.chk.showChecked.$.is(':checked');
            const topicMadeByMeChecked  = this.obj.modal.chk.topicMadeByMe.$.is(':checked');

            if(!showCheckedChecked && !topicMadeByMeChecked){
                const anyUnchecked = $(this.obj.modal.chk.interest.selector).toArray().some(el => !$(el).is(':checked'));
                this.obj.modal.chk.all.$.prop('checked', !anyUnchecked);
                this.eventHandlers.setCheckedInterest();
            }
            if(topicMadeByMeChecked){
                const temp = $(this.obj.modal.chk.interest.selector).map(function () {
                    return {topic_uid : $(this).val(), is_checked : $(this).is(':checked')}
                }).get();

                // 1. 체크 해제된 항목은 checkedInterest 배열에서 제거
                temp.forEach(checkedNow => {
                    if (!checkedNow.is_checked) {
                        this.obj.checkedInterest = this.obj.checkedInterest.filter(uid => uid !== checkedNow.topic_uid);
                    }
                });

                // 2. 새로 체크된 항목은 checkedInterest 배열에 추가
                temp.forEach(checkedNow => {
                    if (checkedNow.is_checked && !this.obj.checkedInterest.includes(checkedNow.topic_uid)) {
                        this.obj.checkedInterest.push(checkedNow.topic_uid);
                    }
                });
            }
        });
        /* checkbox event collection :: e */
    }

    fnOpenInterestModal = async () => {
        this.obj.interest = await this.eventHandlers.selectInterest();
        this.eventHandlers.renderInterest();
        this.obj.modal.$.css('display', 'flex');
    }

    fnCloseInterestModal = () => {
        this.obj.modal.$.css('display', 'none');
        this.eventHandlers.reset();
    }

    fnShowMessage = (message, isGreen) => {
        if(isGreen){
            this.obj.modal.message.$.addClass('green');    
        }else{
            this.obj.modal.message.$.removeClass('green');
        }
        this.obj.modal.message.$.text(message).addClass('visible');
    }

    fnClearMessage = () => {
        this.obj.modal.message.$.text('').addClass('visible');
    }

    fnSelectInterest = async () => {
        let topicResponse = await $.ajax({
            url: '/interest/topic'
            , method: 'POST'
            , contentType: 'application/json'
        })
        this.obj.checkedInterest = topicResponse.data.filter(interest => interest.is_interested === 1)
                                                        .map(interest => interest.topic_uid);
        this.obj.topicMadeByMe = topicResponse.data.filter(interest => interest.is_mine === 1)
                                                        .map(interest => interest.topic_uid);

        return topicResponse.data
    }

    fnRenderInterest = (keyword, onlyChecked, onlyTopicMadeByMe) => {
        let $interestListWrapper    = this.obj.modal.interestListWrapper.$;
        $interestListWrapper.empty();
        
        let interestsCopy = [...this.obj.interest];
        
        // 내가 선택한 토픽만 보기
        if(onlyChecked){
            interestsCopy = interestsCopy.filter(interest => this.obj.checkedInterest.includes(interest.topic_uid));
        }

        if(onlyTopicMadeByMe){
            interestsCopy = interestsCopy.filter(interest => this.obj.topicMadeByMe.includes(interest.topic_uid));
        }

        // 검색어 필터
        if(keyword){
            const keywordInitial = this.eventHandlers.getKoreanInitial(keyword);
            const isPureKorean = /^[가-힣]+$/.test(keyword);  // 입력이 완성형 한글인지 확인

            interestsCopy = interestsCopy.filter(interest => {
                const name = interest.topic_name;
                const nameInitial = this.eventHandlers.getKoreanInitial(name);
                if(isPureKorean){
                    return name.includes(keyword);  // 입력이 '공연', '과학' 같은 완성형 단어일 때는 정확 검색만
                }else{
                    return name.includes(keyword) || nameInitial.includes(keywordInitial);  // 초성 포함 입력일 경우 초성 비교도 허용
                }
            });
        }

        // 결과값 집어 넣기
        interestsCopy.forEach(interest => {
            const id        = `${interest.topic_uid}`;
            const isChecked = this.obj.checkedInterest.includes(interest.topic_uid);
            const $label = $(`
                <label class="interest-item" for="${id}">
                <input type="checkbox" id="${id}" class="chk-interest-modal-interest" value="${id}" ${isChecked ? 'checked' : ''}/>
                    ${interest.topic_name}
                </label>
            `);
            $interestListWrapper.append($label);
        });

        // 데이터 없으면 노출
        if(interestsCopy.length == 0){
            $interestListWrapper.html('<div class="no-results">검색 결과 없음</div>');
        }
    }

    fnGetKoreanInitial = (value) => {
        const KOREAN_INITIALS = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
                                "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
        let result = '';
        for(let ch of value) {
            const code = ch.charCodeAt(0);
            if(code >= 0xAC00 && code <= 0xD7A3) {
                const initialIndex = Math.floor((code - 0xAC00) / (21 * 28));
                result += KOREAN_INITIALS[initialIndex];
            }else{
                result += ch;
            }
        }
        return result;
    }

    fnSetCheckedInterest = () => {
        const checkedInterest = $(this.obj.modal.chk.interest.selector).filter(':checked').map(function () {
                return $(this).val();
            }).get();
        this.obj.checkedInterest = checkedInterest;
    }

    fnSave = () => {
        $.ajax({
            url: '/interest/save'
            , method: 'POST'
            , contentType: 'application/json'
            , data: JSON.stringify({topic_uid_array : this.obj.checkedInterest})
            , success: (response) => {
                if(response.resultCode == 'success') {
                    alert(response.resultMessage);
                    timeline.eventHandlers.selectTimelineList();    // const timeline  = new Timeline();
                    this.eventHandlers.closeInterestModal();
                }else{
                    this.eventHandlers.showMessage();
                }
            }
        })
    }

    fnReset = () => {
        this.obj.modal.txt.search.$.val('');
        this.obj.modal.chk.all.$.prop('checked', false);
        this.obj.modal.chk.showChecked.$.prop('checked', false);
        this.obj.modal.chk.topicMadeByMe.$.prop('checked', false);
        this.obj.checkedInterest = this.obj.interest.filter(interest => interest.is_interested === 1)
                                                        .map(interest => interest.topic_uid);
        this.eventHandlers.renderInterest();
        this.eventHandlers.clearMessage();
    }

    fnCheckAllInterest = () => {
        let $chkAll = this.obj.modal.chk.all.$;
        
        this.eventHandlers.uncheckExceptFor($chkAll);
        this.eventHandlers.renderInterest();

        if($chkAll.is(':checked')){
            $(this.obj.modal.chk.interest.selector).prop('checked', true);
        }else{
            $(this.obj.modal.chk.interest.selector).prop('checked', false);
        }
        this.eventHandlers.setCheckedInterest();
    }

    fnUncheckExceptFor = ($) => {
        let checkboxArray = [];
        checkboxArray.push(this.obj.modal.chk.all.$);
        checkboxArray.push(this.obj.modal.chk.showChecked.$);
        checkboxArray.push(this.obj.modal.chk.topicMadeByMe.$);
        checkboxArray.forEach($checkbox => {
            if(!$checkbox.is($)){
                $checkbox.prop('checked', false);
            }
        })
    }
}
