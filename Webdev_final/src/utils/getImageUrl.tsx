import GrayLogo from '../assets/graylogo.png';
import imgVDO from '../assets/locobackgroudewhite.png';

const BASE_URL = 'https://wd10.pupasoft.com/api';

export const getImageUrl = (
    url?: string,
    type: 'course' | 'user' | 'video' = 'course'
): string => {
    if (!url) {
    if (type === 'user') return '';
    if (type === 'video') return imgVDO;
    return GrayLogo;
    }
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return `${BASE_URL}${url}`;
    return url;
};