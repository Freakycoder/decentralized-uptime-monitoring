import axios from "axios";

interface SessionResponse {
    isValid: boolean,
    userId: string,
    validatorId: string | null
}

class SessionManager {

    static async checkSessionStatus() {

        try {

            console.log('checking session status with server...');
            const response = await axios.get('http://localhsot:3001/user/session-status', {
                withCredentials: true
            })

            if (response.data.status_code === 200) {
                console.log('✅ Session is valid');
                console.log('👤 User ID:', response.data.user_id);
                console.log('🎫 Validator ID:', response.data.validator_id || null);

                return {
                    isValid: true,
                    userId: response.data.user_id,
                    validatorId: response.data.validator_id
                }
            }
            else {
                console.log('❌ Session check failed:', response.data.message);
                return {
                    isValid: false,
                    userId: null,
                    validatorId: null
                }
            }
        }
        catch (e) {
            console.log('Session check failed due to axios error:', e)
        }
    }

    static setLocalAuthState(sessionStatus: SessionResponse) {
        if (sessionStatus.isValid) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userId', sessionStatus.userId);

            if (sessionStatus.validatorId) {
                localStorage.setItem('validatorId', sessionStatus.validatorId);
                console.log('🎫 Stored validator ID:', sessionStatus.validatorId);
            }
            else {
                localStorage.removeItem('validatorId');
                console.log('removed validator ID (user is not a validator)');
            }
        } else {
            console.log('clearing localStorage due to invalid session')
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userId');
        }
    }

    static getLocalUserData(){
        return {
            isLoggedIn : localStorage.getItem('isLoggedIn'),
            userId : localStorage.getItem('userId'),
            validatorId : localStorage.getItem('validatorId')
        }
    }
}
export default SessionManager;