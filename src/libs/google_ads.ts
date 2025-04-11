// @ts-ignore
import type {googletag} from 'google-publisher-tag';

/**
 * Initializes the ad system by loading both GPT and IMA SDK scripts,
 * and setting up global GPT settings.
 *
 * @returns {Promise<void>} A promise that resolves once initialization is complete.
 */
export async function initialize(): Promise<void> {
	await AdScriptLoader.loadGPT();
	await AdScriptLoader.loadIMA();

	// Set global GPT configurations. This is called only once during initialization.
	window.googletag.cmd.push(() => {
		window.googletag.pubads().enableSingleRequest();
		window.googletag.pubads().setForceSafeFrame(true);
		window.googletag.pubads().set('page_url', window.location.href);
		window.googletag.enableServices();
	});
}

/**
 * AdScriptLoader is responsible for dynamically loading external ad scripts (GPT and IMA SDK)
 * and tracking their load status.
 */
export class AdScriptLoader {
	private static gptLoaded = false;
	private static imaLoaded = false;

	/**
	 * Loads the GPT script if it has not already been loaded.
	 *
	 * @returns {Promise<void>} A promise that resolves when the GPT script is loaded.
	 */
	static loadGPT(): Promise<void> {
		if (this.gptLoaded || (window.googletag && window.googletag.apiReady)) {
			this.gptLoaded = true;
			return Promise.resolve();
		}
		return new Promise((resolve, reject) => {
			const script = document.createElement('script');
			script.src = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
			script.async = true;
			script.onload = () => {
				this.gptLoaded = true;
				resolve();
			};
			script.onerror = () => reject(new Error('Failed to load GPT script'));
			document.head.appendChild(script);
		});
	}

	/**
	 * Loads the IMA SDK script if it has not already been loaded.
	 *
	 * @returns {Promise<void>} A promise that resolves when the IMA SDK script is loaded.
	 */
	static loadIMA(): Promise<void> {
		if (this.imaLoaded || (window.google && window.google.ima)) {
			this.imaLoaded = true;
			return Promise.resolve();
		}
		return new Promise((resolve, reject) => {
			const script = document.createElement('script');
			script.src = 'https://imasdk.googleapis.com/js/sdkloader/ima3.js';
			script.async = true;
			script.onload = () => {
				this.imaLoaded = true;
				resolve();
			};
			script.onerror = () => reject(new Error('Failed to load IMA SDK'));
			document.head.appendChild(script);
		});
	}

	/**
	 * Indicates whether the GPT script is loaded.
	 *
	 * @returns {boolean} True if GPT is ready.
	 */
	static isGPTReady(): boolean {
		return this.gptLoaded;
	}

	/**
	 * Indicates whether the IMA SDK is loaded.
	 *
	 * @returns {boolean} True if IMA is ready.
	 */
	static isIMAReady(): boolean {
		return this.imaLoaded;
	}
}

/**
 * Class to handle interstitial ads using GPT.
 */
export class InterstitialAd {
	private slotId: string;
	private slot: googletag.Slot | null = null;
	private adUnitConfig: { id: string; sizes: number[][] };

	/**
	 * @param adUnitConfig Configuration object for the ad unit (e.g., { id, sizes }).
	 * @param slotId The HTML container ID for the ad (e.g., 'gpt-interstitial-slot').
	 */
	constructor(adUnitConfig: { id: string; sizes: number[][] }, slotId: string) {
		this.adUnitConfig = adUnitConfig;
		this.slotId = slotId;
	}

	/**
	 * Ensures that the GPT script is loaded before calling any GPT methods.
	 *
	 * @returns {Promise<void>}
	 */
	private async ensureGptLoaded(): Promise<void> {
		if (!AdScriptLoader.isGPTReady()) {
			await AdScriptLoader.loadGPT();
		}
	}

	/**
	 * Defines an interstitial ad slot if it has not been defined already.
	 */
	defineSlot(): void {
		if (this.slot) return;

		window.googletag.cmd.push(() => {
			const desktopSizes: googletag.GeneralSize = this.adUnitConfig.sizes.filter(i => i[0] > 300)
			const mobileSizes: googletag.GeneralSize = this.adUnitConfig.sizes.filter(i => i[0] <= 300)
			const mapping = window.googletag.sizeMapping()
				.addSize([1024, 0], desktopSizes) // For screens wider than 1024px, allow larger sizes.
				.addSize([0, 0], mobileSizes) // For smaller screens, only use the ad size that fits.
				.build()

			// @ts-ignore
			this.slot = window.googletag
				// @ts-ignore
				.defineSlot(this.adUnitConfig.id, this.adUnitConfig.sizes, this.slotId)
				.addService(window.googletag.pubads())
				// @ts-ignore
				.defineSizeMapping(mapping);

			// Disable initial load for this slot so that we can control when to refresh it.
			window.googletag.pubads().disableInitialLoad();
		});
	}

	/**
	 * Displays the interstitial ad.
	 *
	 * @returns {Promise<void>}
	 */
	async show(): Promise<void> {
		try {
			await this.ensureGptLoaded();
			this.defineSlot();

			window.googletag.cmd.push(() => {
				window.googletag.display(this.slotId);
				window.googletag.pubads().refresh([this.slot]);
			});
		} catch (e) {
			// Log error if showing the ad fails.
			console.warn(e);
		}
	}

	/**
	 * Destroys the ad slot to hide the ad.
	 */
	hide(): void {
		if (!this.slot) return;
		window.googletag.destroySlots([this.slot]);
		this.slot = null;
	}
}

/**
 * Class to handle rewarded ads using GPT.
 */
export class RewardedAd {
	private rewardedSlot: googletag.Slot | null = null;
	private rewardPayload: any = null;
	private callback: () => void = () => {};
	private fallback: () => void = () => {};
	private adUnitConfig: { id: string };

	// Store references to event listener functions for later removal.
	private rewardedSlotReadyHandler: ((event: any) => void) | null = null;
	private rewardedSlotClosedHandler: (() => void) | null = null;
	private rewardedSlotGrantedHandler: ((event: any) => void) | null = null;
	private slotRenderEndedHandler: ((event: any) => void) | null = null;

	/**
	 * @param adUnitConfig Configuration object for the rewarded ad unit (e.g., { id: '/network_id/your_rewarded_id' }).
	 */
	constructor(adUnitConfig: { id: string }) {
		this.adUnitConfig = adUnitConfig;
	}

	/**
	 * Ensures that the GPT script is loaded.
	 *
	 * @returns {Promise<void>}
	 */
	private async ensureGptLoaded(): Promise<void> {
		if (!AdScriptLoader.isGPTReady()) {
			await AdScriptLoader.loadGPT();
		}
	}

	/**
	 * Subscribes to GPT events for rewarded ads. The event listener callbacks are stored for later removal.
	 *
	 * @param slot The rewarded ad slot.
	 */
	private subscribe(slot: googletag.Slot): void {
		// Save the handler references.
		this.rewardedSlotReadyHandler = (event: any) => {
			event.makeRewardedVisible();
		};

		this.rewardedSlotClosedHandler = () => {
			if (this.rewardPayload) {
				this.callback();
			}

			this.fallback()
			this.hide();
		};

		this.rewardedSlotGrantedHandler = (event: any) => {
			this.rewardPayload = event.payload;
			this.callback();
			this.hide();
		};

		this.slotRenderEndedHandler = (event: any) => {
			if (event.slot === slot && event.isEmpty) {
				// Handle the case when no ad is returned.
			}
		};

		window.googletag.pubads().addEventListener("rewardedSlotReady", this.rewardedSlotReadyHandler);
		window.googletag.pubads().addEventListener("rewardedSlotClosed", this.rewardedSlotClosedHandler);
		window.googletag.pubads().addEventListener("rewardedSlotGranted", this.rewardedSlotGrantedHandler);
		window.googletag.pubads().addEventListener("slotRenderEnded", this.slotRenderEndedHandler);
	}

	/**
	 * Defines the rewarded ad slot.
	 */
	defineSlot(): void {
		window.googletag.cmd.push(() => {
			this.rewardedSlot = window.googletag.defineOutOfPageSlot(
				this.adUnitConfig.id,
				window.googletag.enums.OutOfPageFormat.REWARDED
			);
			if (!this.rewardedSlot) {
				console.error('Rewarded slot was not created.');
				return;
			}

			this.rewardedSlot.addService(window.googletag.pubads());
			this.subscribe(this.rewardedSlot);

			window.googletag.pubads().enableVideoAds();
			window.googletag.pubads().refresh();

			// Display the rewarded slot.
			window.googletag.display(this.rewardedSlot);
		});
	}

	/**
	 * Shows the rewarded ad.
	 *
	 * @param callback A function to be called after the ad has been successfully viewed and reward granted.
	 * @param fallback A function to be called if ads is canceled by any reason.
	 * @returns {Promise<void>}
	 */
	async show(callback: () => void = () => {}, fallback: () => void = () => {}): Promise<void> {
		this.callback = callback;
		this.fallback = fallback;

		try {
			await this.ensureGptLoaded();

			// Ensure previous rewarded slot is destroyed before defining a new one.
			this.hide();
			this.defineSlot();
		} catch (e) {
			console.warn(e);
		}
	}

	/**
	 * Destroys the rewarded ad slot and removes all event listeners.
	 */
	hide(): void {
		if (!this.rewardedSlot) return;

		// Remove all event listeners to avoid duplicate callbacks on subsequent ad plays.
		if (this.rewardedSlotReadyHandler) {
			window.googletag.pubads().removeEventListener("rewardedSlotReady", this.rewardedSlotReadyHandler);
			this.rewardedSlotReadyHandler = null;
		}
		if (this.rewardedSlotClosedHandler) {
			window.googletag.pubads().removeEventListener("rewardedSlotClosed", this.rewardedSlotClosedHandler);
			this.rewardedSlotClosedHandler = null;
		}
		if (this.rewardedSlotGrantedHandler) {
			window.googletag.pubads().removeEventListener("rewardedSlotGranted", this.rewardedSlotGrantedHandler);
			this.rewardedSlotGrantedHandler = null;
		}
		if (this.slotRenderEndedHandler) {
			window.googletag.pubads().removeEventListener("slotRenderEnded", this.slotRenderEndedHandler);
			this.slotRenderEndedHandler = null;
		}

		window.googletag.destroySlots([this.rewardedSlot]);
		this.rewardedSlot = null;
	}
}


/**
 * Class to handle instream video ads using the IMA SDK.
 */
export class InstreamAd {
	private container: HTMLElement;
	private player: HTMLElement;
	private adTagUrl: string;

	/**
	 * @param container The HTML container element where the ad will be displayed.
	 * @param player The HTML video element in which the video ad will play.
	 * @param adTagUrl The ad tag URL provided by Google Ad Manager (VAST format).
	 *
	 * @throws Will throw an error if any of the required parameters are missing.
	 */
	constructor(container: HTMLElement, player: HTMLElement, adTagUrl: string) {
		if (!container) {
			throw new Error('A container is required for instream ads.');
		}
		if (!player) {
			throw new Error('A player element is required for instream ads.');
		}
		if (!adTagUrl) {
			throw new Error('An ad tag URL is required for instream ads.');
		}
		this.container = container;
		this.player = player;
		this.adTagUrl = adTagUrl;
	}

	/**
	 * Ensures that the IMA SDK is loaded.
	 *
	 * @returns {Promise<void>}
	 */
	private async ensureImaLoaded(): Promise<void> {
		if (!AdScriptLoader.isIMAReady()) {
			await AdScriptLoader.loadIMA();
		}
	}

	/**
	 * Starts the instream video ad process.
	 * This must be triggered by a user interaction due to mobile autoplay restrictions.
	 *
	 * @returns {Promise<void>}
	 */
	async start(): Promise<void> {
		await this.ensureImaLoaded();

		const ima = window.google?.ima;
		if (!ima) {
			console.error('IMA SDK is not loaded.');
			return;
		}

		// Create and initialize the ad display container.
		const adDisplayContainer = new ima.AdDisplayContainer(this.container, this.player);
		adDisplayContainer.initialize();

		const adsLoader = new ima.AdsLoader(adDisplayContainer);
		const adsRequest = new ima.AdsRequest();
		adsRequest.adTagUrl = this.adTagUrl;
		adsRequest.linearAdSlotWidth = this.player.clientWidth;
		adsRequest.linearAdSlotHeight = this.player.clientHeight || 250;
		adsRequest.nonLinearAdSlotWidth = this.player.clientWidth;
		adsRequest.nonLinearAdSlotHeight = 100;

		/**
		 * Callback for ad errors.
		 * Retries ad loading after 5 seconds.
		 */
		const onAdError = (adErrorEvent: any) => {
			console.error('Ad error:', adErrorEvent.getError());
			setTimeout(() => this.start(), 5000);
		};

		/**
		 * Callback when AdsManager is loaded.
		 * Initializes and starts the ad.
		 */
		const onAdsManagerLoaded = (adsManagerLoadedEvent: any) => {
			const adsManager = adsManagerLoadedEvent.getAdsManager(this.player);
			adsManager.addEventListener(ima.AdErrorEvent.Type.AD_ERROR, onAdError);
			adsManager.addEventListener(ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, () => {
				// Pause any content if necessary.
			});
			adsManager.addEventListener(ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, () => {
				// Resume content after ad ends.
				adsLoader.requestAds(adsRequest);
			});

			try {
				const width = this.player.clientWidth;
				const height = this.player.clientHeight || 250;
				adsManager.init(width, height, ima.ViewMode.NORMAL);
				adsManager.start();
			} catch (err) {
				console.error('AdsManager failed to start:', err);
			}
		};

		adsLoader.addEventListener(
			ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
			onAdsManagerLoaded,
			false
		);
		adsLoader.addEventListener(
			ima.AdErrorEvent.Type.AD_ERROR,
			onAdError,
			false
		);

		adsLoader.requestAds(adsRequest);
	}
}

// Initialize the ad system (this call can be placed in your application initialization code).
initialize()
