class Signup {
    constructor() {
        this.obj = {
            btn : {
                signup : {$ : $('#signup')}
            }
            , code : {value : ''}
            , modal : {
                signup : {
                    $ : $('#signup-modal-overlay')
                    , message : {$ : $('#signup-modal-message')}
                    , validation : {
                        nickname        : {isClear : false}
                        , email         : {isClear : false}
                        , code          : {isClear : false}
                        , password      : {isClear : false}
                        , passwordCheck : {isClear : false}
                    }
                    , txt  : {
                        nickname    : {$ : $('#txt-signup-modal-nickname')}
                        , email     : {$ : $('#txt-signup-modal-email')} 
                        , code      : {$ : $('#txt-signup-modal-code')}
                    }
                    , btn : {
                        sendCode    : {$ : $('#btn-send-code')}
                        , checkCode : {$ : $('#btn-check-code')}
                        , save      : {$ : $('#btn-signup-modal-save')}
                        , close     : {$ : $('#btn-signup-modal-close')}
                    }
                    , pwd : {
                        password        : {$ : $('#pwd-signup-modal-password')}
                        , passwordCheck : {$ : $('#pwd-signup-modal-password-check')}
                    }
                }
                , interest : {
                    $ : $('#interest-modal-overlay')
                }
            }
        }
        this.eventHandlers = {
            openSignupModal     : this.fnOpenSignupModal
            , closeSignupModal  : this.fnCloseSignupModal
            , showMessage       : this.fnShowMessage
            , clearMessage      : this.fnClearMessage
            , checkValidation   : this.fnCheckValidation
            , checkPassword     : this.fnCheckPassword
            , setValidation     : this.fnSetValidation
            , sendCode          : this.fnSendCode
            , checkCode         : this.fnCheckCode
            , save              : this.fnSave
            , reset             : this.fnReset
        }
        this.init()
    }

    init(){
        this.addEventListeners();
    }

    addEventListeners() {
        this.obj.btn.signup.$.on('click', this.eventHandlers.openSignupModal.bind(this));
        this.obj.modal.signup.btn.close.$.on('click', this.eventHandlers.closeSignupModal.bind(this));
        this.obj.modal.signup.txt.nickname.$.on('input', this.eventHandlers.checkValidation.bind(this));
        this.obj.modal.signup.txt.email.$.on('input', this.eventHandlers.checkValidation.bind(this));
        this.obj.modal.signup.pwd.password.$.on('input', this.eventHandlers.checkPassword.bind(this));
        this.obj.modal.signup.pwd.passwordCheck.$.on('input', this.eventHandlers.checkPassword.bind(this));
        this.obj.modal.signup.btn.sendCode.$.on('click', this.eventHandlers.sendCode.bind(this));
        this.obj.modal.signup.btn.checkCode.$.on('click', this.eventHandlers.checkCode.bind(this));
        this.obj.modal.signup.btn.save.$.on('click', this.eventHandlers.save.bind(this));
    }

    fnOpenSignupModal = () => {
        this.obj.modal.signup.$.css('display', 'flex');
    }

    fnCloseSignupModal = () => {
        this.obj.modal.signup.$.css('display', 'none');
        this.eventHandlers.reset();
    }

    fnShowMessage = (message, isGreen) => {
        if(isGreen){
            this.obj.modal.signup.message.$.addClass('green');    
        }else{
            this.obj.modal.signup.message.$.removeClass('green');
        }
        this.obj.modal.signup.message.$.text(message).addClass('visible');
    }

    fnClearMessage = () => {
        this.obj.modal.signup.message.$.text('').addClass('visible');
    }

    fnCheckValidation = async () => {
        // 닉네임 검증
        let nickname = this.obj.modal.signup.txt.nickname.$.val();
        if(!nickname.trim()){
            this.obj.modal.signup.btn.sendCode.$.prop('disabled', true);
            this.eventHandlers.setValidation.call(this, 'nickname', false);
            return
        }

        let nicknameResponse = await $.ajax({
            url: '/signup/check/nickname'
            , method: 'POST'
            , contentType: 'application/json'
            , data: JSON.stringify({nickname : nickname})
        })

        if(nicknameResponse.resultCode == 'success'){
            let isDuplicate = nicknameResponse.data;
            if(isDuplicate){
                this.obj.modal.signup.btn.sendCode.$.prop('disabled', true);
                this.eventHandlers.setValidation.call(this, 'nickname', false);
                this.eventHandlers.showMessage('중복된 닉네임이 있습니다.');
                return
            }else{
                this.eventHandlers.setValidation.call(this, 'nickname', true);
                this.eventHandlers.clearMessage();
            }
        }

        // 이메일 중복 검증 
        let email = this.obj.modal.signup.txt.email.$.val();
        if(!email.trim()){
            this.obj.modal.signup.btn.sendCode.$.prop('disabled', true);
            this.eventHandlers.setValidation.call(this, 'email', false);
            return
        }

        let emailResponse = await $.ajax({
            url: '/signup/check/email'
            , method: 'POST'
            , contentType: 'application/json'
            , data: JSON.stringify({email : email})
        })

        if(emailResponse.resultCode == 'success'){
            let isDuplicate = emailResponse.data;
            if(isDuplicate){
                this.obj.modal.signup.btn.sendCode.$.prop('disabled', true);
                this.eventHandlers.setValidation.call(this, 'email', false);
                this.eventHandlers.showMessage('중복된 이메일이 있습니다.');
                return
            }else{
                this.eventHandlers.setValidation.call(this, 'email', true);
                this.eventHandlers.clearMessage();
            }
        }
        
        this.obj.modal.signup.btn.sendCode.$.prop('disabled', false);
    }
    
    fnCheckPassword = () => {
        // 비밀번호 검증
        this.obj.modal.signup.btn.save.$.prop('disabled', true);

        let password = this.obj.modal.signup.pwd.password.$.val();
        if(!password.trim()){
            this.eventHandlers.setValidation.call(this, 'password', false);
            return
        }
        if(!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password)) {
            this.eventHandlers.showMessage('비밀번호는 대문자, 소문자, 숫자, 특수기호를 포함한 8자 이상이어야 합니다.');
            this.eventHandlers.setValidation.call(this, 'password', false);
            return;
        }else{
            this.eventHandlers.clearMessage();
            this.eventHandlers.setValidation.call(this, 'password', true);
        }

        // 비밀번호 확인 검증
        let passwordCheck = this.obj.modal.signup.pwd.passwordCheck.$.val();
        if(!passwordCheck.trim()){
            this.eventHandlers.setValidation.call(this, 'passwordCheck', false);
            return
        }
        if(passwordCheck != password){
            this.eventHandlers.showMessage('비밀번호가 일치하지 않습니다.');
            this.eventHandlers.setValidation.call(this, 'passwordCheck', false);
            return;
        }else{
            this.eventHandlers.clearMessage();
            this.eventHandlers.setValidation.call(this, 'passwordCheck', true);
            this.obj.modal.signup.btn.save.$.prop('disabled', false);
        }
    }

    fnSetValidation = (key, value) => {
        this.obj.modal.signup.validation[key].isClear = value;
    }

    fnSendCode = async () => {
        let email = this.obj.modal.signup.txt.email.$.val();
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            this.eventHandlers.showMessage('이메일 형식이 아닙니다.');
            return
        }

        this.obj.modal.signup.txt.nickname.$.prop('readonly', true);
        this.obj.modal.signup.txt.email.$.prop('readonly', true);
        this.obj.modal.signup.btn.sendCode.$.prop('disabled', true);
        this.obj.modal.signup.txt.code.$.prop('disabled', false);
        this.obj.modal.signup.btn.checkCode.$.prop('disabled', false);
        this.eventHandlers.showMessage('메일 확인 후 인증번호를 입력하세요.', true);

        let emailResponse = await $.ajax({
            url: '/signup/code'
            , method: 'POST'
            , contentType: 'application/json'
            , data: JSON.stringify({email : email})
        })

        this.obj.code.value = emailResponse.data;
    }

    fnCheckCode = () => {
        if(this.obj.modal.signup.txt.code.$.val() == this.obj.code.value){
            this.eventHandlers.setValidation.call(this, 'code', true);
            this.eventHandlers.clearMessage();

            this.obj.modal.signup.txt.code.$.prop('disabled', true);
            this.obj.modal.signup.btn.checkCode.$.prop('disabled', true);
            this.obj.modal.signup.pwd.password.$.prop('disabled', false);
            this.obj.modal.signup.pwd.passwordCheck.$.prop('disabled', false);
        }else{
            this.eventHandlers.showMessage('인증번호가 일치하지 않습니다.');
        }
    }

    fnSave = () => {
        let nicknameClear       = this.obj.modal.signup.validation.nickname.isClear;
        let emailClear          = this.obj.modal.signup.validation.email.isClear;
        let codeClear           = this.obj.modal.signup.validation.code.isClear;
        let passwordClear       = this.obj.modal.signup.validation.password.isClear;
        let passwordCheckClear  = this.obj.modal.signup.validation.passwordCheck.isClear;
        
        if(nicknameClear && emailClear && codeClear && passwordClear && passwordCheckClear){
            let params = {
                nickname    : this.obj.modal.signup.txt.nickname.$.val()
                , email     : this.obj.modal.signup.txt.email.$.val()
                , password  : this.obj.modal.signup.pwd.password.$.val()
            }
            $.ajax({
                url: '/signup/save'
                , method: 'POST'
                , contentType: 'application/json'
                , data: JSON.stringify(params)
                , success: (response) => {
                    if(response.resultCode == 'success') {
                        alert(response.resultMessage);
                        location.reload();
                    }
                }
            })
        }else{
            alert('Error just occured.');
        }
    }

    fnReset = () => {
        this.obj.modal.signup.txt.nickname.$.val('');
        this.obj.modal.signup.txt.nickname.$.prop('readonly', false);

        this.obj.modal.signup.txt.email.$.val('');
        this.obj.modal.signup.txt.email.$.prop('readonly', false);
        this.obj.modal.signup.btn.sendCode.$.prop('disabled', false);
        
        this.obj.modal.signup.txt.code.$.val('');
        
        this.obj.modal.signup.pwd.password.$.val('');
        this.obj.modal.signup.pwd.password.$.prop('disabled', true);
        this.obj.modal.signup.pwd.passwordCheck.$.val('');
        this.obj.modal.signup.pwd.passwordCheck.$.prop('disabled', true);
    }
}

class Signin {
    constructor() {
        this.obj = {
            btn : {
                signin      : {$ : $('#signin')}
                , signout   : {$ : $('#signout')}
            }
            , modal : {
                $ : $('#signin-modal-overlay')
                , message : {$ : $('#signin-modal-message')}
                , txt  : {
                    email : {$ : $('#txt-signin-modal-email')} 
                }
                , btn : {
                    signin      : {$ : $('#btn-signin-modal-signin')}
                    , close     : {$ : $('#btn-signin-modal-close')}
                }
                , pwd : {
                    password        : {$ : $('#pwd-signin-modal-password')}
                }
            }
        }
        this.eventHandlers = {
            openSigninModal     : this.fnOpenSigninModal
            , closeSigninModal  : this.fnCloseSigninModal
            , showMessage       : this.fnShowMessage
            , clearMessage      : this.fnClearMessage
            , signin            : this.fnSignin
            , signout           : this.fnSignout
            , reset             : this.fnReset
        }
        this.init()
    }

    init(){
        this.addEventListeners();
    }

    addEventListeners() {
        this.obj.btn.signin.$.on('click', this.eventHandlers.openSigninModal.bind(this));
        this.obj.btn.signout.$.on('click', this.eventHandlers.signout.bind(this));
        this.obj.modal.btn.close.$.on('click', this.eventHandlers.closeSigninModal.bind(this));
        this.obj.modal.btn.signin.$.on('click', this.eventHandlers.signin.bind(this));
        this.obj.modal.pwd.password.$.on('keydown', (e) => {
            if(e.key == 'Enter' || e.keyCode == 13){
                this.eventHandlers.signin();
            }
        })
    }

    fnOpenSigninModal = () => {
        this.obj.modal.$.css('display', 'flex');
    }

    fnCloseSigninModal = () => {
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

    fnSignin = () => {
        let email       = this.obj.modal.txt.email.$.val();
        let password    = this.obj.modal.pwd.password.$.val();

        if(!email.trim()){
            this.eventHandlers.showMessage('이메일을 입력하세요.');
            return
        }
        if(!password.trim()){
            this.eventHandlers.showMessage('비밀번호를 입력하세요.');
            return
        }

        let params = {
            email       : email
            , password  : password
        }

        $.ajax({
            url: '/signin'
            , method: 'POST'
            , contentType: 'application/json'
            , data: JSON.stringify(params)
            , success: (response) => {
                if(response.resultCode == 'success') {
                    location.reload();
                }else{
                    this.eventHandlers.showMessage(response.resultMessage);
                }
            }
        })
    }

    fnSignout = () => {
        $.post('/signout').always(() => {
            window.location.href = '/';
        });
    }

    fnReset = () => {
        this.obj.modal.txt.email.$.val('');
        this.obj.modal.pwd.password.$.val('');
    }
}