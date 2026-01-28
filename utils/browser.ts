export const isWebView = () => {
    if (typeof window === 'undefined') return false;

    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;

    // Check for common in-app browsers
    return (
        ua.includes('Line') ||
        ua.includes('FBAN') ||
        ua.includes('FBAV') ||
        ua.includes('Instagram') ||
        ua.includes('MicroMessenger') || // WeChat
        (ua.includes('WebView') && (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('Android')))
    );
};

export const getWebViewType = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Line')) return 'LINE';
    if (ua.includes('FBAN') || ua.includes('FBAV')) return 'Facebook';
    if (ua.includes('Instagram')) return 'Instagram';
    if (ua.includes('MicroMessenger')) return 'WeChat';
    return 'WebView';
};
