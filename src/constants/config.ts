// 服务器地址配置
export const SERVER_URL = 'https://www.anteti.cn';

// API 基础地址配置
export const API_BASE_URL = process.env.NODE_ENV === 'development' ? '/api' : SERVER_URL;

// 静态资源地址配置
export const STATIC_URL = `${SERVER_URL}/static`;

// Logo 地址配置
export const LOGO_URL = `${STATIC_URL}/pictures/entity-logo.png`;
