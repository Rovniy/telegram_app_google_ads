export {}

declare global {
    interface Window {
        googletag: typeof googletag;
        google: typeof google.ima;
        Telegram: typeof Telegram
    }
}
