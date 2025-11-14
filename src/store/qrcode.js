import {defineStore} from "pinia";
import {ref} from "vue";

export const useQrCodeStore = defineStore("qrcode", () => {
    const options = ref({
        background: "#ffffff",
        foreground: "#000000",
        size: 100,
        level: "M",
        renderAs: "svg"
    })
    return {options}
}, {
    persist: true,
})