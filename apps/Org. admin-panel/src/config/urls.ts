export const ECOSYSTEM_URLS = {
    PUBLIC_WEBSITE: 'http://localhost:3001',
    SUPER_ADMIN: 'http://localhost:3002',
    ORG_ADMIN: 'http://localhost:3003',
    STUDENT_APP: 'http://localhost:3004',
    WHITEBOARD: 'http://localhost:3005',
};

export const getAppUrl = (app: keyof typeof ECOSYSTEM_URLS) => ECOSYSTEM_URLS[app];
