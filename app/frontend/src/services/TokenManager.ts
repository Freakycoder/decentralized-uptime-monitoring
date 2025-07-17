class TokenManager {
    private static readonly TOKEN_KEY = 'auth_token';

    static setToken(token: string) {
        if (typeof window !== 'undefined') {
            localStorage.setItem(this.TOKEN_KEY, token);
            console.log('🔑 Token stored in localStorage');
        }
    }

    static getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(this.TOKEN_KEY);
        }
        return null;
    }

    static removeToken() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(this.TOKEN_KEY);
            console.log('🗑️ Token removed from localStorage');
        }
    }

    static hasToken(): boolean {
        return this.getToken() !== null;
    }

    static getAuthHeader(): { Authorization: string } | {} {
        const token = this.getToken();
        if (token) {
            return { Authorization: `Bearer ${token}` };
        }
        return {};
    }
}

export default TokenManager;