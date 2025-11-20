// Google Analytics Integration
// Note: You need to replace 'G-XXXXXXXXXX' with your actual Measurement ID

declare global {
    interface Window {
        dataLayer: any[];
        gtag: (...args: any[]) => void;
    }
}

export const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Placeholder

export const initGA = () => {
    // Check if script is already added
    if (document.getElementById('ga-script')) return;

    // Add Google Analytics Script
    const script = document.createElement('script');
    script.id = 'ga-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
        window.dataLayer.push(args);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID);
};

export const logPageView = (path: string) => {
    if (window.gtag) {
        window.gtag('config', GA_MEASUREMENT_ID, {
            page_path: path,
        });
    }
};

export const logEvent = (category: string, action: string, label?: string) => {
    if (window.gtag) {
        window.gtag('event', action, {
            event_category: category,
            event_label: label,
        });
    }
};
