import axios from 'axios';
interface SessionResponse {
    isValid: boolean,
    userId: string,
    validatorId: string | null
}

class SessionManager {
    static async checkSessionStatus(): Promise<SessionResponse | null> {


        try {
            console.log('🔍 Checking session status with server...');
            console.log('🍪 Current browser cookies:', document.cookie || 'NONE');

            const response = await axios.get('http://127.0.0.1:3001/user/session-status', { withCredentials: true });

            console.log('📊 Session status response:', response.data);

            if (response.data.status_code === 200) {
                console.log('✅ Session is valid');
                console.log('👤 User ID:', response.data.user_id);
                console.log('🎫 Validator ID:', response.data.validator_id || null);

                return {
                    isValid: response.data.is_valid,
                    userId: response.data.user_id,
                    validatorId: response.data.validator_id
                };
            } else {
                console.log('❌ Session check failed - Status:', response.data.status_code);
                return {
                   isValid: response.data.is_valid,
                    userId: response.data.user_id,
                    validatorId: response.data.validator_id
                };
            }
        } catch (e: any) {
            console.error('❌ Session check failed due to error:', e.message);
            console.error('❌ Error response:', e.response?.data);
            console.error('❌ Error status:', e.response?.status);

            return {
                isValid: false,
                userId: '',
                validatorId: null
            };
        }
    }

    static setLocalAuthState(sessionStatus: SessionResponse) {
        if (sessionStatus.isValid) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userId', sessionStatus.userId);

            if (sessionStatus.validatorId) {
                localStorage.setItem('validatorId', sessionStatus.validatorId);
                console.log('🎫 Stored validator ID:', sessionStatus.validatorId);
            } else {
                localStorage.removeItem('validatorId');
                console.log('🗑️ Removed validator ID (user is not a validator)');
            }
        } else {
            console.log('🧹 Clearing localStorage due to invalid session');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userId');
            localStorage.removeItem('validatorId');
        }
    }

    static getLocalUserData() {
        return {
            isLoggedIn: localStorage.getItem('isLoggedIn'),
            userId: localStorage.getItem('userId'),
            validatorId: localStorage.getItem('validatorId')
        };
    }

}

export default SessionManager;