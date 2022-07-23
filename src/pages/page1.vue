<!-- page1 -->
<script setup>
import { onUnmounted,onMounted } from 'vue'
import { useRoute } from 'vue-router'
 import { storeToRefs } from "pinia";
import {useMainStore } from "@/store/store.js";

import ThreeJs from "../index2";

const route = useRoute()

const mainStore = useMainStore();
const {info,count} = storeToRefs(mainStore);


onMounted(() => {
  new ThreeJs()
});

// 生命周期-卸载或者隐藏
onUnmounted(() => {
})

</script>

<template>
  <div class="demo"></div>
</template>

<style lang='scss' scoped>
.page1{
  font-size: $fontSize;
  @include gSetLine();
  text-align: center;
}
</style>