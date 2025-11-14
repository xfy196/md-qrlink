<template>
  <div class="qrcode-container">
    <qrcode-vue :value="url" :size="size" :background="background" :foreground="foreground" :level="level"
                :render-as="renderAs"/>
  </div>
</template>

<script>
import QrcodeVue from 'qrcode.vue';

export default {
  name: 'QRCodeGenerator',
  components: {
    QrcodeVue
  },
  props: {
    url: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      default: 100
    },
    background: {
      type: String,
      default: "#ffffff"
    },
    foreground: {
      type: String,
      default: "#000000"
    },
    // 'L' | 'M' | 'Q' | 'H';
    level: {
      type: String,
      default: "M"
    },
    // 'canvas' | 'svg'
    renderAs: {
      type: String,
      default: "svg"
    }
  }
};
</script>

<style scoped>
.qrcode-container {
  display: inline-block;
  margin-right: 15px;
  vertical-align: middle;
}
</style>