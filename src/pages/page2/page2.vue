<!-- page2 -->
<script setup>
import { onUnmounted,onMounted,ref,nextTick } from 'vue'
import { useRoute } from 'vue-router'
import ThreeJs from "./index";

let domId = ref(null);


onMounted(() => {
  new ThreeJs(domId.value)
});
onUnmounted(() => {
})

</script>

<template>
  <div class="demo" ref="domId">
  </div>
</template>

<style lang='scss' scoped>
.page2{
  font-size: 26px;
  text-align: center;
}
</style>