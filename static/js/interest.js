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
        }
        this.init()
    }

    init(){
        this.addEventListeners();
    }

    addEventListeners() {
        this.obj.btn.interest.$.on('click', this.eventHandlers.openInterestModal.bind(this));
        this.obj.modal.btn.close.$.on('click', this.eventHandlers.closeInterestModal.bind(this));
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

    fnRenderInterest = async () => {
        this.obj.interest = await this.eventHandlers.selectInterest();

        let $search                 = this.obj.modal.txt.search.$;
        let $interestListWrapper    = this.obj.modal.interestListWrapper.$;
        
        let interestsCopy = [...this.obj.interest];
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
    }
}
