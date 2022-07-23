<!-- tabNav -->
<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const accept = defineProps({
  tabData: Array
})
const gotoUrl = (item)=>{
    router.push({
        path:item.path,
        query:{
            id:item.id
        }
    })
}
</script>
<template>
  <div class="tabNav">
      <ul>
          <li v-for="(item,index) in tabData" :key="index" @click="gotoUrl(item)">{{item.txt}}</li>
      </ul>
  </div>
</template>

<style lang='scss'>
.tabNav{
    width: 100%;
    ul{
        display: flex;
        align-items: center;
        justify-content: center;
        li{
            width: 100px;
            height: 30px;
            background-color: aqua;
            @include gCenter();
            margin: 0 10px;
            color: #fff;
        }
    }
}
</style>