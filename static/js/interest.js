class Interest {
    constructor() {
        this.obj = {
            interest : []
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
                    , close     : {$ : $('#btn-interest-modal-close')}
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
        }
        this.init()
    }

    async init(){
        this.addEventListeners();
        this.obj.interest = await this.eventHandlers.selectInterest();
    }

    addEventListeners() {
        this.obj.btn.interest.$.on('click', this.eventHandlers.openInterestModal.bind(this));
        this.obj.modal.btn.close.$.on('click', this.eventHandlers.closeInterestModal.bind(this));
        this.obj.modal.txt.search.$.on('input', () => {
            this.eventHandlers.renderInterest(this.obj.modal.txt.search.$.val().trim());
        })
    }

    fnOpenInterestModal = () => {
        this.eventHandlers.renderInterest();
        this.obj.modal.$.css('display', 'flex');
    }

    fnCloseInterestModal = () => {
        this.obj.modal.$.css('display', 'none');
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
        console.log(topicResponse.data);
        return topicResponse.data
    }

    fnRenderInterest = (keyword) => {
        let $interestListWrapper = this.obj.modal.interestListWrapper.$;
        $interestListWrapper.empty();

        let interestsCopy = [...this.obj.interest];
        if(keyword){
            let keywordInitial = this.eventHandlers.getKoreanInitial(keyword);
            interestsCopy = interestsCopy.filter(interest => {
                return interest.topic_name.includes(keyword) || this.eventHandlers.getKoreanInitial(interest.topic_name).includes(keywordInitial);
            });
        }
        interestsCopy.forEach(interest => {
            const id = `${interest.topic_uid}`;
            const $label = $(`
                <label class="interest-item" for="${id}">
                <input type="checkbox" id="${id}" name="interests" value="${id}"/>
                    ${interest.topic_name}
                </label>
            `);
            $interestListWrapper.append($label);
        });
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
}
