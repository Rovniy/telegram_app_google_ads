import {config} from "../config.ts";
// @ts-ignore
import type {googletag} from 'google-publisher-tag';

const INTERSTITIAL_SLOT_ID = 'gpt-interstitial-slot'

const GPT: typeof googletag = window.googletag || {cmd: []}


const checkApiAvailable = () => {
    if (GPT && GPT.apiReady) return

    throw new Error('Google Publisher Tag not ready for using')
}

const interstitial = {
    currentSlot: null,
    defineSlots() {
        const item = config.ads.test

        if (this.currentSlot) return

        GPT.cmd.push(() => {
            this.currentSlot = GPT
                .defineSlot(item.id, item.sizes, INTERSTITIAL_SLOT_ID)
                .addService(GPT.pubads())

            console.log(`Defining ad slot: ${INTERSTITIAL_SLOT_ID}`)

            GPT.pubads().disableInitialLoad()
            GPT.pubads().enableSingleRequest()
            GPT.pubads().setForceSafeFrame(true)
            GPT.pubads().set('page_url', window.location.href);
            GPT.enableServices()
        });
    },
    show() {
        try {
            checkApiAvailable()

            this.defineSlots()

            GPT.cmd.push(() => {
                GPT.display(INTERSTITIAL_SLOT_ID)
                GPT.pubads().refresh()
                console.log(`Displaying ad slot: ${INTERSTITIAL_SLOT_ID}`)
            })
        } catch (e) {
            console.warn(e)
        }
    },
    hide() {
        GPT.destroySlots([ INTERSTITIAL_SLOT_ID ])
    }
}


interface IRewardedSlot {
    addService: void
}
interface IRewarded {
    rewardPayload: any
    rewardedSlot: null | IRewardedSlot
    callback: () => void
    defineSlots: () => void
    subscribe: (slot: IRewardedSlot) => void
    show: (callback: () => void) => void
    hide: () => void
}
const rewarded : IRewarded = {
    rewardPayload: null,
    rewardedSlot: null,
    callback: () => {},
    subscribe(slot: IRewardedSlot) {
        GPT.pubads().addEventListener("rewardedSlotReady", (event: any) => {
            console.log('rewardedSlotReady');

            event.makeRewardedVisible()
        })

        GPT.pubads().addEventListener("rewardedSlotClosed", () => {
            console.log('rewardedSlotClosed');

            if (!this.rewardPayload) return

            this.hide()
        })

        GPT.pubads().addEventListener("rewardedSlotGranted", (event: any) => {
            console.log('rewardedSlotGranted');
            this.rewardPayload = event.payload;
            this.hide()
        })

        GPT.pubads().addEventListener("slotRenderEnded", (event: any) => {
            if (event.slot === slot && event.isEmpty) {
                console.log('No ad returned for rewarded ad slot.')
            }
        });
    },
    defineSlots() {
        const item = config.ads.testRewards
        let cb = null

        GPT.cmd.push(() => {
            this.rewardedSlot = GPT.defineOutOfPageSlot(
                item.id,
                GPT.enums.OutOfPageFormat.REWARDED
            )
            if (!this.rewardedSlot) {
                console.error('rewardedSlot not found')
                return
            }

            // @ts-ignore
            this.rewardedSlot.addService(GPT.pubads())

            this.subscribe(this.rewardedSlot)

            GPT.enableServices()
            GPT.pubads().enableVideoAds()
            GPT.display(this.rewardedSlot)
        })

        return cb
    },
    show(callback = () => {}) {
        this.callback = callback

        try {
            checkApiAvailable()

            this.defineSlots()

            console.log(`Displaying ad slot: REWARDED`)
        } catch (e) {
            console.warn(e)
        }
    },
    hide() {
        if (!this.rewardedSlot) return

        GPT.destroySlots([ this.rewardedSlot ])
    }
}

export default {
    interstitial,
    rewarded,
}